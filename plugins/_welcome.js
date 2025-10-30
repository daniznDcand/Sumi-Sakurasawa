import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    console.log('🔍 Evento detectado:', {
      messageStubType: m.messageStubType,
      isGroup: m.isGroup,
      chat: m.chat,
      processed: m._welcProcessed
    })
    
    if (!m.messageStubType || !m.isGroup) return true
    if (m._welcProcessed) return true
    m._welcProcessed = true

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]
    
    // Asegurar que welcome esté activado por defecto
    if (chat.welcome === undefined) {
      chat.welcome = true
    }
    
    console.log(`🔍 Estado welcome para ${m.chat}:`, chat.welcome)
    
    // Solo saltar si está explícitamente desactivado
    if (chat.welcome === false) {
      console.log('❌ Welcome desactivado, saltando...')
      return true
    }

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
      console.log('👋 Procesando entrada de usuario...')
      if (!m.messageStubParameters || !m.messageStubParameters[0]) {
        console.log('❌ No hay parámetros de usuario')
        return true
      }
      
      const user = m.messageStubParameters[0]
      const userName = user.split('@')[0]
      console.log(`👤 Usuario que entra: ${userName}`)
      
      const welcomeText = `👋 ¡Hola @${userName}!

🎉Bienvenido a *${groupMetadata?.subject || 'el grupo'}*

🎤Somos *${groupSize}* miembros

💙${global.welcom1 || 'La música nos une'}

📝Ayuda: *#help*

🎵Únete a nuestro canal oficial`

      console.log('📤 Enviando mensaje de bienvenida...')
      await sendSingleWelcome(m.chat, welcomeText, user, m)
      console.log('✅ Welcome enviado con botón de canal')
      return true
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      console.log('👋 Procesando salida de usuario...')
      if (!m.messageStubParameters || !m.messageStubParameters[0]) {
        console.log('❌ No hay parámetros de usuario para salida')
        return true
      }
      
      const user = m.messageStubParameters[0]
      const userName = user.split('@')[0]
      console.log(`🚪 Usuario que sale: ${userName}`)
      
      const byeText = `👋 ¡Hasta luego @${userName}!

😢Te extrañaremos en *${groupMetadata?.subject || 'el grupo'}*

🎤${global.welcom2 || 'Gracias por ser parte de la comunidad'}

💙Síguenos en nuestro canal oficial🎵`

      console.log('📤 Enviando mensaje de despedida...')
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
