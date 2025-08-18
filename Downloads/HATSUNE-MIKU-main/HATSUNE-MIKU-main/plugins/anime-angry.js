/* 
🎤💙 Código creado por Brauliovh3 
✧ https://github.com/Brauliovh3/HATSUNE-MIKU.git 
💙 Hatsune Miku Bot - Virtual Concert Experience 🎵✨
*/

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `💙 \`${name2}\` está mostrando su lado más molesto con \`${name || who}\` en el escenario virtual 😤` 
        : `💙 \`${name2}\` está expresando su sentimiento en el concierto virtual 😤`
    
    if (m.isGroup) {
        let pp = 'https://files.catbox.moe/9fmjzk.mp4'
        let pp2 = 'https://litter.catbox.moe/2zkou4u399196qwm.mp4'
        let pp3 = 'https://litter.catbox.moe/88kat648a7baqkj2.mp4'
        let pp4 = 'https://files.catbox.moe/kg3fti.mp4'
        let pp5 = 'https://files.catbox.moe/vpb0rg.mp4'
        let pp6 = 'https://files.catbox.moe/7eltxa.mp4'
        let pp7 = 'https://litter.catbox.moe/gcoa1d2ztc3y3ap9.mp4'
        let pp8 = 'https://litter.catbox.moe/vcj8gb5c1ptcwjyl.mp4'
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]
        
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, ptt: true, mentions: [who] }, { quoted: m })
    }
}

handler.help = ['angry']
handler.tags = ['anime']
handler.command = ['angry', 'enojado','molesto', 'enojada', 'molesta']
handler.group = true

export default handler




