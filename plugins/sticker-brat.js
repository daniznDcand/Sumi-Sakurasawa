import { sticker } from '../lib/sticker.js'
import axios from 'axios'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetchSticker = async (text, attempt = 1) => {
    try {
        const response = await axios.get(`https://api.nekorinn.my.id/maker/brat-v2`, {
            params: { text },
            responseType: 'arraybuffer',
        })
        return response.data
    } catch (error) {
        if (error.response?.status === 429 && attempt <= 3) {
            const retryAfter = error.response.headers['retry-after'] || 5
            await delay(retryAfter * 1000)
            return fetchSticker(text, attempt + 1)
        }
        throw error
    }
}

let handler = async (m, { conn, text }) => {
    if (m.quoted && m.quoted.text) {
        text = m.quoted.text
    } else if (!text) {
        return conn.sendMessage(m.chat, {
            text: `💙 Por favor, responde a un mensaje o ingresa un texto para crear el Sticker.`,
        }, { quoted: m })
    }

    try {
        const buffer = await fetchSticker(text)
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

        console.log('🔍 sticker-brat - texto1:', texto1)
        console.log('🔍 sticker-brat - texto2:', texto2)
        console.log('🔍 sticker-brat - global.packsticker:', global.packsticker)
        console.log('🔍 sticker-brat - global.packsticker2:', global.packsticker2)

        let stiker = await sticker(buffer, false, texto1, texto2)

        if (stiker) {
            return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
        } else {
            throw new Error("💙 No se pudo generar el sticker.")
        }
    } catch (error) {
        return conn.sendMessage(m.chat, {
            text: `⚠︎ Ocurrió un error: ${error.message}`,
        }, { quoted: m })
    }
}

handler.command = ['brat']
handler.tags = ['sticker']
handler.help = ['brat *<texto>*']

export default handler

