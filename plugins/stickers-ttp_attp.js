import { sticker } from '../lib/sticker.js'
import fetch from 'node-fetch'
import axios from 'axios'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!text) {
        if (m.quoted && m.quoted.text) {
            text = m.quoted.text
        } else {
            return m.reply(`💙 Por Favor, Ingresa Un Texto Para Realizar Tu Sticker.`)
        }
    }

    let teks = encodeURI(text)
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}

    
    if (!global.packsticker) {
      const botname = global.botname || '💙HATSUNE MIKU💙'
      const fecha = new Date().toLocaleDateString('es-ES')
      const tiempo = new Date().toLocaleTimeString('es-ES')
      const nombre = m.pushName || 'Anónimo'
      
      global.packsticker = `💙━━━✦✧✦━━━💙
🎤 Usuario: ${nombre}
🤖 Bot: ${botname}
📅 Fecha: ${fecha}
⏰ Hora: ${tiempo}
💙━━━✦✧✦━━━💙`
    }

    if (!global.packsticker2) {
      const dev = global.dev || 'Miku Development'
      global.packsticker2 = `
💙━━━✦✧✦━━━💙

${dev}
`
    }

    let texto1 = packstickers.text1 || global.packsticker
    let texto2 = packstickers.text2 || global.packsticker2

    if (command == 'attp') {
        let stiker = await sticker(null, `https://api.fgmods.xyz/api/maker/attp?text=${teks}&apikey=dylux`, texto1, texto2)
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true)
    }

    if (command == 'ttp') {
        let stiker = await sticker(null, `https://api.fgmods.xyz/api/maker/ttp?text=${teks}&apikey=dylux`, texto1, texto2)
        conn.sendFile(m.chat, stiker, 'sticker.webp', '', m, true)
    }
}

handler.tags = ['sticker']
handler.help = ['ttp', 'attp']
handler.command = ['ttp', 'attp']

export default handler

