import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true
    if (m._welcProcessed) return true
    m._welcProcessed = true

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]
    if (chat.welcome === undefined) chat.welcome = true
    if (!chat.welcome) return true

    const canalUrl = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
    const groupSize = (participants || []).length

    const sendSingleWelcome = async (jid, text, user, quoted) => {
      try {
        let ppBuffer = null
        try {
          const ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => null)
          if (ppUrl) {
            const response = await fetch(ppUrl)
            ppBuffer = await response.buffer()
          }
        } catch (e) {
          console.log('Error obteniendo foto de perfil:', e)
        }

        if (!ppBuffer) {
          try {
            const defaultResponse = await fetch('https://i.pinimg.com/736x/30/42/b8/3042b89ced13fefda4e75e3bc6dc2a57.jpg')
            ppBuffer = await defaultResponse.buffer()
          } catch (e) {
            ppBuffer = null
          }
        }

        console.log('📤 Enviando welcome con imagen y botón de canal...')
        
        const buttons = [];
        const urls = [['🎵 Ver Canal', canalUrl]];
        
        await conn.sendNCarousel(jid, text, '💙 Hatsune Miku Bot', ppBuffer, buttons, null, urls, null, quoted, [user])

      } catch (err) {
        console.log('sendSingleWelcome error:', err)
        return await conn.reply(jid, `${text}\n\n🎵 *Ver Canal:* ${canalUrl}`, quoted, { mentions: [user] })
      }
    }

    if (m.messageStubType === 27) {
      if (!m.messageStubParameters || !m.messageStubParameters[0]) return true
      
      const user = m.messageStubParameters[0]
      const userName = user.split('@')[0]
      const welcomeText = `👋 ¡Hola @${userName}!

🎉 Bienvenido a *${groupMetadata?.subject || 'el grupo'}*

🎤 Somos ya *${groupSize}* fanáticos de Miku
que te reciben con mucha emoción.

💙 ${global.welcom1 || 'La música nos une'}

✨ Prepárate para disfrutar y compartir
momentos geniales aquí con nosotros.

📝 Para cualquier ayuda, escribe *#help*

🎶 ¡Que la música te acompañe siempre!

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💙 Únete a nuestro canal oficial para más
contenido exclusivo de Hatsune Miku 🎵`

      await sendSingleWelcome(m.chat, welcomeText, user, m)
      console.log('✅ Welcome enviado con botón de canal')
      return true
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      if (!m.messageStubParameters || !m.messageStubParameters[0]) return true
      
      const user = m.messageStubParameters[0]
      const userName = user.split('@')[0]
      const byeText = `👋 ¡Hasta luego @${userName}!

😢 Te extrañaremos en 
*${groupMetadata?.subject || 'el grupo'}*

🎤 ${global.welcom2 || 'Gracias por haber sido parte de nuestra comunidad'}

🎵 La música de Miku seguirá sonando
fuerte aquí para ti.

✨ ¡Cuídate y hasta el próximo concierto!

━━━━━━━━━━━━━━━━━━━━━━━━━━━
💙 Síguenos en nuestro canal oficial 🎵`

      await sendSingleWelcome(m.chat, byeText, user, m)
      console.log('✅ Goodbye enviado con botón de canal')
      return true
    }

    return true
  } catch (e) {
    console.error('plugins/_welcome error', e)
    return true
  }
}
