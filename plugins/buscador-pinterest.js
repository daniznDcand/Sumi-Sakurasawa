import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';
import cheerio from 'cheerio';

async function sendAlbumMessage(jid, medias, options = {}) {
    if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`);
    if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 imágenes para un álbum");

    const caption = options.text || options.caption || "";
    const delay = !isNaN(options.delay) ? options.delay : 500;
    delete options.text;
    delete options.caption;
    delete options.delay;

    const album = baileys.generateWAMessageFromContent(
        jid,
        { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
        {}
    );

    await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id });

    for (let i = 0; i < medias.length; i++) {
        const { type, data } = medias[i];
        const img = await baileys.generateWAMessage(
            album.key.remoteJid,
            { [type]: data, ...(i === 0 ? { caption } : {}) },
            { upload: conn.waUploadToServer }
        );
        img.message.messageContextInfo = {
            messageAssociation: { associationType: 1, parentMessageKey: album.key },
        };
        await conn.relayMessage(img.key.remoteJid, img.message, { messageId: img.key.id });
        await baileys.delay(delay);
    }
    return album;
}


async function scrapePinterest(query) {
    try {
        const url = `https://es.pinterest.com/search/pins/?q=${encodeURIComponent(query)}&rs=typed`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        const html = await response.text();
        const $ = cheerio.load(html);
        
        const images = [];
        
        
        const scriptData = $('script[id="__PWS_DATA__"]').html();
        if (scriptData) {
            try {
                const data = JSON.parse(scriptData);
                const pins = data?.resourceResponses?.[0]?.response?.data?.results || [];
                
                for (const pin of pins.slice(0, 10)) {
                    const imageUrl = pin?.images?.orig?.url || pin?.images?.original?.url;
                    if (imageUrl) {
                        images.push({
                            url: imageUrl,
                            title: pin.title || pin.description || '',
                            pinner: pin.board?.name || pin.pinner?.username || 'Unknown'
                        });
                    }
                }
            } catch (e) {
                console.log('Error parsing JSON data:', e.message);
            }
        }
        
        
        if (images.length === 0) {
            $('img[src*="pinimg.com"]').each((i, elem) => {
                const src = $(elem).attr('src');
                if (src && src.includes('236x') && images.length < 10) {
                    
                    const highResUrl = src.replace('/236x/', '/736x/').replace('/564x/', '/736x/');
                    images.push({
                        url: highResUrl,
                        title: $(elem).attr('alt') || '',
                        pinner: 'Pinterest'
                    });
                }
            });
        }
        
        return images;
    } catch (error) {
        console.error('Error scraping Pinterest:', error);
        return [];
    }
}

const pinterest = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*💙 Uso Correcto: ${usedPrefix + command} Hatsune Miku*`, m, global.rcanal);
    
    const icons = global.icons || null;

    await m.react('⏳');
    conn.reply(m.chat, '💙 *Buscando imágenes en Pinterest...*', m, {
        contextInfo: {
            externalAdReply: {
                mediaUrl: null,
                mediaType: 1,
                showAdAttribution: true,
                title: packname,
                body: wm,
                previewType: 0,
                thumbnail: icons,
                sourceUrl: channel
            }
        }
    });

    try {
        const images = await scrapePinterest(text);
        
        if (!images || images.length < 2) {
            return conn.reply(m.chat, '💙 No se encontraron suficientes imágenes. Intenta con otra búsqueda.', m, global.rcanal);
        }

        const medias = images.map(img => ({ type: "image", data: { url: img.url } }));
        const caption = `💙 *Resultados de Pinterest para:* ${text}\n\n` + 
            images.slice(0, 5).map((img, i) => `${i + 1}. ${img.title || 'Sin título'}`).join('\n');

        await sendAlbumMessage(m.chat, medias.slice(0, 6), { caption, quoted: m });
        await m.react('✅');
        
    } catch (error) {
        console.error('Error en Pinterest scraper:', error);
        await m.react('❌');
        conn.reply(m.chat, '💙 Hubo un error al buscar en Pinterest. Intenta más tarde.', m, global.rcanal);
    }
};

pinterest.help = ['pinterest <query>'];
pinterest.tags = ['buscador', 'descargas'];
pinterest.command = /^(pinterest|pin)$/i;
pinterest.register = true;

export default pinterest;

