import { WAMessageStubType } from '@whiskeysockets/baileys'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isROwner, isOwner }) => {
    let user = global.db.data.users[m.sender]
    
    
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD && m.messageStubParameters[0] === conn.user.jid.split('@')[0]) {
        
        const welcomeVideo = 'https://imgur.com/a/FV272cF' 
        
        
        const welcomeMessage = `🎵 *¡HATSUNE MIKU HA LLEGADO!* 🎵

✨ *¡Hola a todos!* Soy Hatsune Miku, tu asistente virtual favorita.

💙 *Características:*
- Sistema de RPG y economía
- Juegos y entretenimiento
- Stickers personalizados
- Descarga de música y videos
- Y mucho más!

📌 *Comandos disponibles:*
- !menu - Muestra el menú de comandos
- !ayuda - Muestra la ayuda
- !reg - Regístrate para empezar

👨‍💻 *Creador:* DEPOOL
📱 *WhatsApp:* +51988514570 (Solo consultas importantes)

¡Disfruta de tu estadía en el grupo! 💙`

        
        await conn.sendMessage(m.key.remoteJid, {
            video: { url: welcomeVideo },
            caption: welcomeMessage,
            gifPlayback: false,
            mentions: [m.sender]
        }, { quoted: m })
        
        
        try {
            let sticker = await (await fetch('https://i.imgur.com/example.png')).buffer() // Reemplaza con tu sticker
            await conn.sendMessage(m.key.remoteJid, { sticker: sticker }, { quoted: m })
        } catch (e) {
            console.log('Error al enviar sticker:', e)
        }
    }
}

handler.tags = ['group']
handler.event = 'group-participants-update'
handler.command = /^(join|entrar|welcome)$/i

export default handler