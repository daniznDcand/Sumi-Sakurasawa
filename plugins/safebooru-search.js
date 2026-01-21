import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`💙 *Uso:* ${usedPrefix}${command} <tag>\n\n📝 *Ejemplo:* ${usedPrefix}${command} miku hatsune`)
    
    try {
        await m.react('⏳')
        
        
        const apiUrl = `https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=${encodeURIComponent(text)}&limit=10&json=1`
        
        const response = await fetch(apiUrl)
        const data = await response.json()
        
        if (!data || data.length === 0) {
            return m.reply('❌ No se encontraron resultados para ese tag.')
        }
        
        
        const images = data.slice(0, 3)
        let sent = 0
        
        for (const post of images) {
            try {
                const imageUrl = `https://safebooru.org/images/${post.directory}/${post.image}`
                
                
                const imgResponse = await fetch(imageUrl)
                const buffer = await imgResponse.buffer()
                
                
                const caption = `🎌 *Safebooru Search*\n\n📛 *Tag:* ${text}\n👁️ *ID:* ${post.id}\n📊 *Score:* ${post.score || 0}\n🎨 *Artist:* ${post.author || 'Unknown'}\n\n💙 *Hatsune Miku Bot*`
                
                await conn.sendMessage(m.chat, {
                    image: buffer,
                    caption: caption
                }, { quoted: m })
                
                sent++
                await new Promise(resolve => setTimeout(resolve, 1000))
            } catch (imgError) {
                console.log('Error enviando imagen:', imgError)
            }
        }
        
        if (sent === 0) {
            return m.reply('❌ No se pudieron enviar las imágenes.')
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
