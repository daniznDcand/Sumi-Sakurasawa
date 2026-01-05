import fetch from 'node-fetch'


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

let handler = async (m, { conn, command, args }) => {
if (!args[0]) return replyWithChannel(conn, m.chat, `${emoji} Por favor, ingrese el Link de una página.`, m)
try {
await m.react(rwait)
replyWithChannel(conn, m.chat, `${emoji2} Buscando su información....`, m)
let ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer()
conn.sendFile(m.chat, ss, 'error.png', args[0], m)
await m.react(done)
} catch {
return conn.reply(m.chat, `${msm} Ocurrió un error.`, m)
await m.react(error)}}

handler.help = ['ssweb', 'ss']
handler.tags = ['tools']
handler.command = ['ssweb', 'ss']
handler.register = true

export default handler

