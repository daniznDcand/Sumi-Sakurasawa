import { toAudio } from '../lib/converter.js'


async function replyWithChannel(conn, chat, text, quoted = null) {
  try {
    const buttons = []
    const urls = [['🎵 Canal Oficial 💙', 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o']]
    
    await conn.sendNCarousel(chat, text, '💙 Hatsune Miku Bot', null, buttons, null, urls, null, quoted);
  } catch (error) {
    console.log('Error con botones, usando reply simple:', error.message);
    conn.reply(chat, `${text}\n\n🎵 *Canal Oficial:* https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o`, quoted);
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
let q = m.quoted || m
let mime = (q.msg || q).mimetype || ''
if (!m.quoted) return replyWithChannel(conn, m.chat,  `${emoji} Etiqueta el *Video o Audio* que desea convertir en documento.`, m)
if(!text) return conn.reply(m.chat, `${emoji2} Ingresa el nombre para guardar el documento.`, m)
if (!/audio|video/.test(mime)) return replyWithChannel(conn, m.chat,  `${emoji} Etiqueta el *Video o Audio* que desea convertir en documento.`, m)
let media = await q.download?.()
if (!media) throw m.react('✖️')
await m.react('🕓')
if (/video/.test(mime)) {
return conn.sendMessage(m.chat, { document: media, mimetype: 'video/mp4', fileName: `${text}.mp4`}, {quoted: m}).then(_ => m.react('✅'))
} else if (/audio/.test(mime)) {
return conn.sendMessage(m.chat, { document: media, mimetype: 'audio/mpeg', fileName: `${text}.mp3`}, {quoted: m}).then(_ => m.react('✅'))}
}
handler.help = ['document *<audio/video>*']
handler.tags = ['tools']
handler.command = ['toducument', 'todoc']
handler.register = true

export default handler

