import axios from 'axios'
import { sticker } from '../lib/sticker.js'

const fetchStickerVideo = async (text) => {
    const response = await axios.get(`https://velyn.mom/api/maker/bratgif`, {
        params: { text },
        responseType: 'arraybuffer'
    })
    if (!response.data) throw new Error('Error al obtener el video de la API.')
    return response.data
}

let handler = async (m, { conn, text }) => {
    if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else if (!text) {
        return conn.sendMessage(m.chat, {
            text: '💙 Por favor, responde a un mensaje o ingresa un texto para crear el Sticker.'
        }, { quoted: m })
    }

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

    try {
        const videoBuffer = await fetchStickerVideo(text)
        const stickerBuffer = await sticker(videoBuffer, null, texto1, texto2)
        await conn.sendMessage(m.chat, {
            sticker: stickerBuffer
        }, { quoted: m })
    } catch (e) {
        await conn.sendMessage(m.chat, {
            text: `⚠ Ocurrió un error: ${e.message}`
        }, { quoted: m })
    }
}

handler.help = ['bratvid <texto>']
handler.tags = ['sticker']
handler.command = ['bratvid', 'bratv']

export default handler

