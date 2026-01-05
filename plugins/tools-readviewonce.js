let { downloadContentFromMessage } = (await import('@whiskeysockets/baileys'));


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

let handler = async (m, { conn }) => {
if (!m.quoted) return replyWithChannel(conn, m.chat, `💙 Responde a una imagen ViewOnce.`, m)
if (!m?.quoted || !m?.quoted?.viewOnce) return replyWithChannel(conn, m.chat, `💙 Responde a una imagen ViewOnce.`, m)
let buffer = await m.quoted.download(false);
if (/videoMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.mp4', m.quoted.caption || '', m)
} else if (/imageMessage/.test(m.quoted.mtype)) {
return conn.sendFile(m.chat, buffer, 'media.jpg', m.quoted?.caption || '', m)
}}
handler.help = ['ver']
handler.tags = ['tools']
handler.command = ['readviewonce', 'read', 'readvo'] 
handler.register = true 

export default handler

