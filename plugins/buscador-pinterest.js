import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

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

async function searchPinterestAPI(query) {
    try {
        const url = `https://rest.alyabotpe.xyz/search/pinterest?query=${encodeURIComponent(query)}&key=Duarte-zz12`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !Array.isArray(data)) {
            console.log('API Response:', data);
            return [];
        }

        return data.slice(0, 10).map(item => ({
            url: item.image || item.url || item.media_url,
            title: item.title || item.description || '',
            pinner: item.source || item.author || 'Pinterest'
        })).filter(item => item.url);
        
    } catch (error) {
        console.error('Error calling Pinterest API:', error);
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
        const images = await searchPinterestAPI(text);
        
        if (!images || images.length === 0) {
            return conn.reply(m.chat, '💙 No se encontraron imágenes. Intenta con otra búsqueda.', m, global.rcanal);
        }
        
        if (images.length === 1) {
           
            try {
                await conn.sendMessage(m.chat, { 
                    image: { url: images[0].url },
                    caption: `💙 *Resultado de Pinterest para:* ${text}\n\n📌 ${images[0].title || 'Sin título'}`
                }, { quoted: m });
                await m.react('✅');
                return;
            } catch (e) {
                console.error('Error sending single image:', e);
            }
        }
        
        const medias = images.map(img => ({ type: "image", data: { url: img.url } }));
        const caption = `💙 *Resultados de Pinterest para:* ${text}\n\n` + 
            images.slice(0, 5).map((img, i) => `${i + 1}. ${img.title || 'Sin título'}`).join('\n');

        await sendAlbumMessage(m.chat, medias.slice(0, 6), { caption, quoted: m });
        await m.react('✅');
        
    } catch (error) {
        console.error('Error en Pinterest API:', error);
        await m.react('❌');
        conn.reply(m.chat, '💙 Hubo un error al buscar en Pinterest. Intenta más tarde.', m, global.rcanal);
    }
};

pinterest.help = ['pinterest <query>'];
pinterest.tags = ['buscador', 'descargas'];
pinterest.command = /^(pinterest|pin)$/i;
pinterest.register = true;

export default pinterest;

