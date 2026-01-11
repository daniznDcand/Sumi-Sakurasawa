/* 
🎤💙 Código creado por Brauliovh3 
 https://github.com/Brauliovh3/HATSUNE-MIKU.git 
💙 Hatsune Miku Bot - Virtual Concert Experience 🎵✨
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `💙 \`${name2}\` está derramando lágrimas por \`${name || who}\` en el concierto virtual 😢` 
        : `💙 \`${name2}\` está llorando en el mundo virtual de Miku 😢`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/fmB1LPfUc5AAAAPo/waaa.mp4'
        let pp2 = 'https://media.tenor.com/CJEm2aPh9ckAAAPo/kh%C3%B3c.mp4'
        let pp3 = 'https://media.tenor.com/VO2in_SxlvAAAAPo/sad-taiga-aisaka.mp4'
        let pp4 = 'https://media.tenor.com/PYOMyiz9VckAAAPo/sad-anime-boy-crying.mp4'
        let pp5 = 'https://media.tenor.com/JxIgPl3glLIAAAPo/demon-slayer-kimetsu-no-yaiba-mugen-train.mp4'
        let pp6 = 'https://media.tenor.com/IV2kNBcN3r0AAAPo/subaru-breakdown.mp4'
        let pp7 = 'https://media.tenor.com/pWN680lA4LoAAAPo/sigma.mp4'
        let pp8 = 'https://media.tenor.com/EVR8bvVLB2EAAAPo/chainsaw-man-pochita.mp4'
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['cry']
handler.tags = ['anime']
handler.command = ['cry', 'llorar', 'lagrimas']
handler.group = true
handler.register = true;
export default handler

