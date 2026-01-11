/* 
🎤💙 Código creado por Brauliovh3 
✧ https://github.com/Brauliovh3/HATSUNE-MIKU.git 
💙 Hatsune Miku Bot - Virtual Concert Experience 🎵✨
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null)
    let name = who ? (await conn.getName(who)) || who.replace('@s.whatsapp.net', '') : null
    let name2 = m.pushName || (await conn.getName(m.sender)) || m.sender.split('@')[0]

    let str = who
        ? `🎤💙 \`${name2}\` le dio un lamidita juguetona a \`${name}\` en el concierto virtual ✨😋🎵` 
        : `🎤💙 \`${name2}\` está siendo travieso/a en el mundo virtual de Miku ✨😋💫`
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/HaFDVtk05hIAAAPo/lick.mp4'
        let pp2 = 'https://media.tenor.com/S5I9g4dPRn4AAAPo/omamori-himari-manga.mp4'
        let pp3 = 'https://media.tenor.com/d0CunrDQsJ4AAAPo/licks-face-anime-anime.mp4'
        let pp4 = 'https://media.tenor.com/iPI6QifO4UYAAAPo/zero-two-and-hiro.mp4'
        let pp5 = 'https://media.tenor.com/Ja6awViaQkUAAAPo/anime-lick.mp4'
        let pp6 = 'https://media.tenor.com/5mLXTXTj6nEAAAPo/hakaba-kitaro-kitaro.mp4'
        let pp7 = 'https://media.tenor.com/gtyeOa6SBKAAAAPo/inaba-lick.mp4'
        let pp8 = 'https://media.tenor.com/HFq7SWJ6fBsAAAPo/urushi-yaotome-cat.mp4'
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: who ? [who] : [] }, { quoted: m })
    }
}

handler.help = ['lick']
handler.tags = ['anime']
handler.command = ['lick', 'lamer']
handler.group = true
handler.register = true;
export default handler
