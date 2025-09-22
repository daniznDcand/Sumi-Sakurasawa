import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return true;
  
  
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  
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
  
  if (chat.welcome === undefined) chat.welcome = true

  const dev = global.dev || '© 🄿🄾🅆🄴🅁🄴🄳 (ㅎㅊDEPOOLㅊㅎ)'
  const redes = global.redes || 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
  
  let groupSize = participants.length;
  if (m.messageStubType === 27) groupSize++;
  else if (m.messageStubType === 28 || m.messageStubType === 32) groupSize--;

  
  if (m.messageStubType === 27) {
    
    
    if (!m.messageStubParameters || !m.messageStubParameters[0]) {
      console.log('Warning: messageStubParameters no disponible para welcome')
      return true
    }
    
    let welcomeMsg = `
👋 ¡Hola @${m.messageStubParameters[0].split('@')[0]}!

Bienvenido a *${groupMetadata.subject}* 🎉

Somos ya *${groupSize}* fanáticos de Miku que te reciben con mucha emoción.

🎤 ${global.welcom1 || 'La música nos une'}

Prepárate para disfrutar y compartir momentos geniales aquí con nosotros.

Para cualquier ayuda, escribe *#help*.

¡Que la música te acompañe siempre! 🎶
    `;

    const canalUrl = 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'

    try {
      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: welcomeMsg,
        contextInfo: {
          externalAdReply: {
            title: '🎵 Ver Canal Oficial',
            body: '💙 Toca aquí para unirte al canal 💙',
            thumbnailUrl: 'https://files.catbox.moe/wm4w1x.jpg',
            sourceUrl: canalUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
      console.log('✅ Mensaje de bienvenida enviado correctamente')
    } catch (error) {
      console.log('❌ Error enviando bienvenida:', error)
      
      try {
        await conn.sendMessage(m.chat, {
          text: `${welcomeMsg}\n\n🎵 *Canal Oficial:*\n${canalUrl}`,
          mentions: [m.messageStubParameters[0]]
        }, { quoted: m })
        console.log('✅ Mensaje de bienvenida enviado como fallback')
      } catch (fallbackError) {
        console.log('❌ Error en fallback de bienvenida:', fallbackError)
      }
    }
  }

  
  if (m.messageStubType === 28 || m.messageStubType === 32) {
    
    
    if (!m.messageStubParameters || !m.messageStubParameters[0]) {
      console.log('Warning: messageStubParameters no disponible para despedida')
      return true
    }
    
    let byeMsg = `
👋 ¡Hasta luego @${m.messageStubParameters[0].split('@')[0]}!

Te extrañaremos en *${groupMetadata.subject}*.

🎤 ${global.welcom2 || 'Gracias por haber sido parte de nuestra comunidad'}

Ahora somos *${groupSize}* y esperamos que regreses pronto.

La música de Miku seguirá sonando fuerte aquí para ti.

¡Cuídate y hasta el próximo concierto! 🎶✨
    `;

    const canalUrl = 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'

    try {
      await conn.sendMessage(m.chat, {
        image: imgBuffer,
        caption: byeMsg,
        contextInfo: {
          externalAdReply: {
            title: '🎵 Seguir Canal',
            body: '💙 Toca aquí para seguir el canal 💙',
            thumbnailUrl: 'https://files.catbox.moe/wm4w1x.jpg',
            sourceUrl: canalUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
      console.log('✅ Mensaje de despedida enviado correctamente')
    } catch (error) {
      console.log('❌ Error enviando despedida:', error)
      
      try {
        await conn.sendMessage(m.chat, {
          text: `${byeMsg}\n\n🎵 *Canal Oficial:*\n${canalUrl}`,
          mentions: [m.messageStubParameters[0]]
        }, { quoted: m })
        console.log('✅ Mensaje de despedida enviado como fallback')
      } catch (fallbackError) {
        console.log('❌ Error en fallback de despedida:', fallbackError)
      }
    }
  }
}

