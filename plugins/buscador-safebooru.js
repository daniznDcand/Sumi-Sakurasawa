import fetch from 'node-fetch'
import FormData from 'form-data'
import baileys from '@whiskeysockets/baileys'

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

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`💙 *Uso:* ${usedPrefix}${command} <tag>\n\n📝 *Ejemplo:* ${usedPrefix}${command} miku hatsune`)
    
    try {
        await m.react('⏳')
        
        
        const apiUrl = `https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(text)}&limit=15&json=1`
        
        const response = await fetch(apiUrl)
        const data = await response.json()
        
        if (!data || data.length === 0) {
            return m.reply('❌ No se encontraron resultados para ese tag.')
        }
        
        
        
        const images = data.slice(0, 5)
        const imageBuffers = []
        
        for (const post of images) {
            try {
                const imageUrl = `https://safebooru.org/images/${post.directory}/${post.image}`
                const imgResponse = await fetch(imageUrl)
                const buffer = await imgResponse.buffer()
                imageBuffers.push(buffer)
            } catch (imgError) {
                console.log('Error descargando imagen:', imgError)
            }
        }
        
        if (imageBuffers.length === 0) {
            return m.reply('❌ No se pudieron descargar las imágenes.')
        }
        
        
        const caption = `🎌 *Safebooru Search*\n\n📛 *Tag:* ${text}\n🔭 *Resultados:* ${imageBuffers.length} imágenes\n\n💙 *Hatsune Miku Bot*`
        
        if (imageBuffers.length === 0) {
            return m.reply('❌ No se pudieron descargar las imágenes.')
        }
        
        if (imageBuffers.length === 1) {
            await conn.sendMessage(m.chat, {
                image: imageBuffers[0],
                caption: caption
            }, { quoted: m })
        } else {
           
            const images = imageBuffers.map(buffer => ({ type: "image", data: buffer }))
            await sendAlbumMessage(m.chat, images, { caption, quoted: m })
        }
        
        await m.react('✅')
        
    } catch (error) {
        console.error('Error en safebooru search:', error)
        await m.react('❌')
        return m.reply('❌ Error al buscar imágenes. Intenta con otro tag.')
    }
}

handler.help = ['safebooru <tag>']
handler.tags = ['search', 'images']
handler.command = ['safebooru', 'sb', 'animeimg']

export default handler
