import { createHash } from 'crypto'

let handler = async (m, { conn, text, args, usedPrefix }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.chat
    let name = await conn.getName(who)
    let name2 = conn.getName(m.sender)
    
    let str = `💙 \`${name2}\` está disfrutando de la noche como Hatsune Miku 🌙`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/ah9HIHe4FVMAAAPo/yu-yu-hakusho-yusuke.mp4'
        let pp2 = 'https://media.tenor.com/05u1G7_UlLcAAAPo/anime-love.mp4'
        let pp3 = 'https://media.tenor.com/rSikhIOYLT0AAAPo/ashita-no-joe-joe-and-yoko.mp4'
        let pp4 = 'https://media.tenor.com/QnDm_uKmsuUAAAPo/anime-aestheic.mp4'
        let pp5 = 'https://media.tenor.com/a6veu7PbQP4AAAPo/sailor-moon-tuxedo-mask.mp4'
        let pp6 = 'https://media.tenor.com/cFDLXGy_Ll8AAAPo/anime-anko.mp4'
        let pp7 = 'https://media.tenor.com/e_BH9GYpQfQAAAPo/yofukashi-no-uta-anime.mp4'
        let pp8 = 'https://media.tenor.com/e_BH9GYpQfQAAAPo/yofukashi-no-uta-anime.mp4'
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        let mentions = [who]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions: who ? [who] : [] }, { quoted: m })
    } else {
        conn.reply(m.chat, str, m, { mentions: [who] })
    }
}

handler.command = /^(dawn|night|noche|oscuro)$/i
handler.tags = ['anime']
handler.help = ['night']

export default handler
