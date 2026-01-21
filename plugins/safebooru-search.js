import fetch from 'node-fetch'
import FormData from 'form-data'

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
        
        
        if (imageBuffers.length === 1) {
            await conn.sendMessage(m.chat, {
                image: imageBuffers[0],
                caption: caption
            }, { quoted: m })
        } else {
           
            const message = {
                image: imageBuffers[0],
                caption: caption
            }
            
            
            for (let i = 1; i < imageBuffers.length; i++) {
                message[`image${i + 1}`] = imageBuffers[i]
            }
            
            await conn.sendMessage(m.chat, message, { quoted: m })
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
