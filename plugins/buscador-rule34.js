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
    if (!text) return m.reply(`🔞 *Uso:* ${usedPrefix}${command} <tag>\n\n📝 *Ejemplo:* ${usedPrefix}${command} miku hatsune`)
    
   
    if (!m.chat.endsWith('@g.us')) {
        return m.reply('❌ Este comando solo funciona en grupos.')
    }
    
    const isNsfw = global.db.data.chats[m.chat]?.nsfw || false
    if (!isNsfw) {
        return m.reply('❌ Este grupo no permite contenido NSFW.\n\n💡 Un administrador puede activarlo con:\n`.enable nsfw`')
    }
    
    try {
        await m.react('⏳')
        
        
        const apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(text)}&limit=20&json=1`
        
        const response = await fetch(apiUrl)
        const contentType = response.headers.get('content-type')
        
        let data
        if (contentType && contentType.includes('application/json')) {
            data = await response.json()
        } else {
           
            const text = await response.text()
            return m.reply('❌ Error en el formato de respuesta de la API. Intenta más tarde.')
        }
        
        if (!data || (Array.isArray(data) && data.length === 0)) {
            return m.reply('❌ No se encontraron resultados para ese tag.')
        }
        
        
        if (!Array.isArray(data)) {
            data = data.posts || data.data || []
        }
        
        if (!Array.isArray(data) || data.length === 0) {
            return m.reply('❌ No se encontraron resultados para ese tag.')
        }
        
        
        const validImages = data.filter(post => 
            post.file_url && 
            (post.file_url.endsWith('.jpg') || post.file_url.endsWith('.png') || post.file_url.endsWith('.jpeg'))
        ).slice(0, 5)
        
        if (validImages.length === 0) {
            return m.reply('❌ No se encontraron imágenes válidas.')
        }
        
        const imageBuffers = []
        
        for (const post of validImages) {
            try {
                const imgResponse = await fetch(post.file_url)
                const buffer = await imgResponse.buffer()
                imageBuffers.push(buffer)
            } catch (imgError) {
                console.log('Error descargando imagen:', imgError)
            }
        }
        
        if (imageBuffers.length === 0) {
            return m.reply('❌ No se pudieron descargar las imágenes.')
        }
        
        const caption = `🔞 *Rule34 Search*\n\n📛 *Tag:* ${text}\n🔭 *Resultados:* ${imageBuffers.length} imágenes\n⚠️ *Contenido +18*\n\n💙 *Hatsune Miku Bot*`
        
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
        console.error('Error en rule34 search:', error)
        await m.react('❌')
        return m.reply('❌ Error al buscar imágenes. Intenta con otro tag.')
    }
}

handler.help = ['rule34 <tag>']
handler.tags = ['search', 'images', 'nsfw']
handler.command = ['rule34', 'r34', 'rule']

export default handler
