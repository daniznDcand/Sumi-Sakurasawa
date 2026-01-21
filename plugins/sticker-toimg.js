import { webp2png } from '../lib/webp2mp4.js'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    const notStickerMessage = `✳️ Debes citar un sticker para convertir a imagen.`
    const q = m.quoted || m
    const mime = q.mediaType || ''
    if (!/sticker/.test(mime)) return m.reply(notStickerMessage)
    
    try {
        const media = await q.download()
        if (!media || media.length < 100) return m.reply('❌ Error al descargar el sticker.')
        
        let out = await webp2png(media).catch(_ => null)
        if (!out || out.length === 0) {
           
            out = await sticker(media, { pack: 'Miku', author: 'Bot' }).catch(_ => null)
        }
        
        if (!out || out.length === 0) return m.reply('❌ No se pudo convertir el sticker.')
        
        await conn.sendFile(m.chat, out, 'sticker.png', null, m)
        await m.react('✅')
    } catch (error) {
        console.error('Error en toimg:', error)
        return m.reply('❌ Error al convertir el sticker a imagen.')
    }
}

handler.help = ['toimg (reply)']
handler.tags = ['sticker']
handler.command = ['toimg', 'img', 'jpg']

export default handler

