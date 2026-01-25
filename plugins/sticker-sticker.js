import { sticker } from '../lib/sticker.js'
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'


let handler = async (m, { conn, args }) => {
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
let stiker = false
try {
let q = m.quoted ? m.quoted : m
let mime = (q.msg || q).mimetype || ''
let txt = args.join(' ')

if (/webp|image|video/g.test(mime) && q.download) {
if (/video/.test(mime) && (q.msg || q).seconds > 16)
return conn.reply(m.chat, '💙 El video no puede durar más de *15 segundos* para crear un sticker virtual perfecto ✨', m, global.miku)
let buffer = await q.download()
await m.react('🎤')

let marca = txt ? txt.split(/[\u2022|]/).map(part => part.trim()) : [texto1, texto2]
stiker = await sticker(buffer, false, marca[0], marca[1])
} else if (args[0] && isUrl(args[0])) {
let buffer = await sticker(false, args[0], texto1, texto2)
stiker = buffer
} else {
return conn.reply(m.chat, '💙 Por favor, envía una *imagen* o *video* para crear un hermoso sticker virtual ✨', m, global.miku)
}} catch (e) {
await conn.reply(m.chat, '💫 ¡Gomen! Ocurrió un error en el escenario virtual: ' + e.message + ' ✨', m, global.miku)
await m.react('🎵')
} finally {
if (stiker) {
conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
await m.react('💙')
}}}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']
handler.register = true

export default handler

const isUrl = (text) => {
return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
}

