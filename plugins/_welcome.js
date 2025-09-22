import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;
  
  
  if (m.text === 'ir_canal') {
    const canalUrl = 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
   
    await conn.sendMessage(m.chat, {
      text: canalUrl,
      contextInfo: {
        externalAdReply: {
          title: '🎵 Canal Oficial de Hatsune Miku Bot',
          body: '¡Únete ahora!',
          thumbnailUrl: 'https://files.catbox.moe/wm4w1x.jpg',
          sourceUrl: canalUrl,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })
    return false
  }
  
  const fkontak = {
    "key": {
      "participants": "0@s.whatsapp.net",
      "remoteJid": "status@broadcast",
      "fromMe": false,
      "id": "Halo"
    },
    "message": {
      "contactMessage": {
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    "participant": "0@s.whatsapp.net"
  };

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(() => 'https://files.catbox.moe/wm4w1x.jpg');
  
  let imgBuffer = null
  try {
    const resp = await fetch(pp)
    const arr = await resp.arrayBuffer()
    imgBuffer = Buffer.from(arr)
  } catch (e) {
    
    try {
      const resp = await fetch('https://files.catbox.moe/wm4w1x.jpg')
      const arr = await resp.arrayBuffer()
      imgBuffer = Buffer.from(arr)
    } catch (err) {
      imgBuffer = null
    }
  }
  let chat = global.db.data.chats[m.chat];
  

  const dev = global.dev || '© 🄿🄾🅆🄴🅁🄴🄳 (ㅎㅊDEPOOLㅊㅎ)'
  const redes = global.redes || 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
  
  let groupSize = participants.length;
  if (m.messageStubType === 27) groupSize++;
  else if (m.messageStubType === 28 || m.messageStubType === 32) groupSize--;

  if (chat.welcome && m.messageStubType === 27) {
    
    let welcomeMsg = `
👋 ¡Hola @${m.messageStubParameters[0].split('@')[0]}!

Bienvenido a *${groupMetadata.subject}* 🎉

Somos ya *${groupSize}* fanáticos de Miku que te reciben con mucha emoción.

🎤 ${global.welcom1}

Prepárate para disfrutar y compartir momentos geniales aquí con nosotros.

Para cualquier ayuda, escribe *#help*.

¡Que la música te acompañe siempre! 🎶
    `;

    const buttons = [
      ['🎵 Ver Canal', 'ir_canal'],
      ['📋 Ver Comandos', '#help']
    ]

    const templateButtons = buttons.map((btn, index) => ({
      index: index + 1,
      quickReplyButton: {
        displayText: btn[0],
        id: btn[1]
      }
    }))

    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: welcomeMsg,
      footer: '💙 ¡Nueva estrella se une! 💙',
      templateButtons: templateButtons
    }, { quoted: m })
  }

  if (chat.welcome && (m.messageStubType === 28 || m.messageStubType === 32)) {
    
    let byeMsg = `
👋 ¡Hasta luego @${m.messageStubParameters[0].split('@')[0]}!

Te extrañaremos en *${groupMetadata.subject}*.

🎤 ${global.welcom2}

Ahora somos *${groupSize}* y esperamos que regreses pronto.

La música de Miku seguirá sonando fuerte aquí para ti.

¡Cuídate y hasta el próximo concierto! 🎶✨
    `;

    const byeButtons = [
      ['🎵 Ver Canal', 'ir_canal']
    ]

    const templateButtons = byeButtons.map((btn, index) => ({
      index: index + 1,
      quickReplyButton: {
        displayText: btn[0],
        id: btn[1]
      }
    }))

    await conn.sendMessage(m.chat, {
      image: imgBuffer,
      caption: byeMsg,
      footer: '🎵 ¡Sayonara! 🎵',
      templateButtons: templateButtons
    }, { quoted: m })
  }
}

