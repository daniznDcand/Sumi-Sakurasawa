import MessageType from '@whiskeysockets/baileys'
import fetch from 'node-fetch'
import { sticker } from '../lib/sticker.js'
import fs from "fs"

const fetchJson = (url, options) => new Promise(async (resolve, reject) => {
    fetch(url, options)
    .then(response => response.json())
    .then(json => {
        resolve(json)
    })
    .catch((err) => {
        reject(err)
    })
})

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`📌 Ejemplo: *${usedPrefix + command}* 😎+🤑`)
    
    let [emoji, emoji2] = text.split`+`
    let anu = await fetchJson(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji)}_${encodeURIComponent(emoji2)}`)

    for (let res of anu.results) {
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
        
        let stiker = await sticker(false, res.url, texto1, texto2)
        conn.sendFile(m.chat, stiker, null, { asSticker: true }, m)
    }
}

handler.help = ['emojimix *<emoji+emoji>*']
handler.tags = ['sticker']
handler.command = ['emojimix'] 
handler.register = true 

export default handler;
