/* 
🎤💙 Codígo creado por Brauliovh3
 https://github.com/Brauliovh3/HATSUNE-MIKU.git 
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `\`${name2}\` se acurrucó con \`${name || who}\` en el mundo virtual ꒰ঌ(˶ˆᗜˆ˵)໒꒱ 💙` 
        : `\`${name2}\` se acurrucó en el concierto virtual ꒰ঌ(˶ˆᗜˆ˵)໒꒱ 🎵`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/c2SMIhi33DMAAAPo/cuddle-bed-hug.mp4'
        let pp2 = 'https://media.tenor.com/c2SMIhi33DMAAAPo/cuddle-bed-hug.mp4'
        let pp3 = 'https://media.tenor.com/P54lVoy1FxkAAAPo/kuzu-no-honkai-hug.mp4'
        let pp4 = 'https://media.tenor.com/SAL_XAuyuJAAAAPo/cute-anime.mp4'
        let pp5 = 'https://media.tenor.com/bLttPccI_I4AAAPo/cuddle-anime.mp4'
        let pp6 = 'https://media.tenor.com/vpE7LGJcq2gAAAPo/val-ally-anime.mp4'
        let pp7 = 'https://media.tenor.com/sGrFJCNL1_8AAAPo/anime-sevendeadlysins.mp4'
        let pp8 = 'https://media.tenor.com/XrbHCaTCRw0AAAPo/himeno-chainsaw-man.mp4'

        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['cuddle']
handler.tags = ['anime']
handler.command = ['cuddle', 'acurrucarse', 'acurrucarseconmigo']
handler.group = true
handler.register = true;
export default handler

