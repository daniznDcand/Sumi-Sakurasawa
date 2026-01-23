import fetch from 'node-fetch'


async function replyWithChannel(conn, chat, text, quoted = null) {
  try {
    
    await conn.reply(chat, `${text}\n\n🎵 *Canal Oficial:* ${global.miku}`, quoted);
  } catch (error) {
    console.log('Error al enviar el mensaje:', error.message);
    
    conn.reply(chat, `${text}\n\n🎵 *Canal Oficial:* ${global.miku}`, quoted);
  }
}

let handler = async (m, { conn, command, args }) => {
    conn.reply(m.chat, `${emoji} Por favor, ingrese el Link de una página.`, m, global.miku);
try {
await m.react(rwait)
conn.reply(m.chat, `${emoji2} Buscando su información....`, m, global.miku);
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

