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
        ? `💙 \`${name2}\` está bailando en el concierto virtual con \`${name || who}\` como Miku ` 
        : `💙 \`${name2}\` está bailando en el escenario virtual como Hatsune Miku `
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/TxflfpxQNgcAAAPo/happy-dance.mp4'
        let pp2 = 'https://media.tenor.com/EV17KKTqY2EAAAPo/evangelion-neon-genesis-evangelion.mp4'
        let pp3 = 'https://media.tenor.com/H6VeJuNhLJkAAAPo/anime-girl-dance.mp4'
        let pp4 = 'https://media.tenor.com/6DxJzu87RocAAAPo/cute-girls.mp4'
        let pp5 = 'https://media.tenor.com/LNVNahJyrI0AAAPo/aharen-dance.mp4'
        let pp6 = 'https://media.tenor.com/YwP5km8TjY8AAAPo/anime-dance-neon-genesis-evangelion.mp4'
        let pp7 = 'https://media.tenor.com/t8Za-8GSW-0AAAPo/dandadan-headbang.mp4'
        let pp8 = 'https://media.tenor.com/NYa3Fij29kQAAAPo/skill-issue-chika-dance.mp4'
        
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['dance']
handler.tags = ['anime']
handler.command = ['dance', 'bailar','dancing']
handler.group = true
handler.register = true;
export default handler

