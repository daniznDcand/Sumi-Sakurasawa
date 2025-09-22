import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    
    if (!m.messageStubType || !m.isGroup) return true

    
    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]
    if (chat.welcome === undefined) chat.welcome = true
    if (!chat.welcome) return true

    
    const canalUrl = global.redes || 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
    const channelId = global.canalIdM?.[0] || '120363315369913363@newsletter'
    const channelName = global.canalNombreM?.[0] || '💙HATSUNE MIKU CHANNEL💙'

    
    const groupSize = (participants || []).length

    
    const sendWelcomeAi = async (jid, title, body, text, thumbnailUrl, sourceUrl, quoted) => {
      try {
        return await conn.sendMessage(jid, {
          text: text,
          contextInfo: {
            mentionedJid: await conn.parseMention(text),
            forwardedNewsletterMessageInfo: {
              newsletterJid: channelId,
              newsletterName: channelName,
              serverMessageId: 100
            },
            externalAdReply: {
              title: title,
              body: body,
              mediaType: 1,
              previewType: 0,
              renderLargerThumbnail: true,
              thumbnailUrl: thumbnailUrl,
              sourceUrl: sourceUrl,
              showAdAttribution: true
            }
          }
        }, { quoted })
      } catch (err) {
        console.log('sendWelcomeAi error:', err)
        
        return await conn.reply(jid, text, quoted, global.rcanal)
      }
    }

    
    if (m.messageStubType === 27) {
      if (!m.messageStubParameters || !m.messageStubParameters[0]) return true
      
      const user = m.messageStubParameters[0]
      const userName = user.split('@')[0]
      const welcomeText = `👋 ¡Hola @${userName}!

🎉 Bienvenido a *${groupMetadata?.subject || 'el grupo'}*

🎤 Somos ya *${groupSize}* fanáticos de Miku que te reciben con mucha emoción.

💙 ${global.welcom1 || 'La música nos une'}

✨ Prepárate para disfrutar y compartir momentos geniales aquí con nosotros.

📝 Para cualquier ayuda, escribe *#help*

🎶 ¡Que la música te acompañe siempre!`

      
      let ppUrl = 'https://i.pinimg.com/736x/30/42/b8/3042b89ced13fefda4e75e3bc6dc2a57.jpg'
      try {
        ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => ppUrl)
      } catch (e) {
        console.log('Profile picture fetch failed:', e)
      }

      await sendWelcomeAi(
        m.chat,
        '🎵 ¡Nuevo miembro en el grupo!',
        `${userName} se unió al grupo`,
        welcomeText,
        ppUrl,
        canalUrl,
        m
      )

      console.log('✅ Welcome message sent with channel button')
      return true
    }

  // MEMBER LEFT (stub type 28 or 32)
    if (m.messageStubType === 28 || m.messageStubType === 32) {
      if (!m.messageStubParameters || !m.messageStubParameters[0]) return true
      
      const user = m.messageStubParameters[0]
      const userName = user.split('@')[0]
      const byeText = `👋 ¡Hasta luego @${userName}!

😢 Te extrañaremos en *${groupMetadata?.subject || 'el grupo'}*

🎤 ${global.welcom2 || 'Gracias por haber sido parte de nuestra comunidad'}

🎵 La música de Miku seguirá sonando fuerte aquí para ti.

✨ ¡Cuídate y hasta el próximo concierto!`

      
      let ppUrl = 'https://i.pinimg.com/736x/30/42/b8/3042b89ced13fefda4e75e3bc6dc2a57.jpg'
      try {
        ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => ppUrl)
      } catch (e) {
        console.log('Profile picture fetch failed:', e)
      }

      await sendWelcomeAi(
        m.chat,
        '👋 Miembro se despide',
        `${userName} dejó el grupo`,
        byeText,
        ppUrl,
        canalUrl,
        m
      )

      console.log('✅ Goodbye message sent with channel button')
      return true
    }

    return true
  } catch (e) {
    console.error('plugins/_welcome error', e)
    return true
  }
}

