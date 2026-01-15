import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]

    if (chat.welcome === undefined) chat.welcome = true
    if (chat.welcome === false && chat.welcome !== true) chat.welcome = true

    console.log(`🔍 Estado welcome para ${m.chat}:`, chat.welcome)

    if (!chat.welcome) {
      console.log('❌ Welcome desactivado, saltando...')
      return true
    }

    const groupSize = (participants || []).length

    const sendSingleWelcome = async (jid, text, user, quoted) => {
      try {
        let ppUrl = null
        try {
          ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => null)
        } catch (e) {
          console.log('Error obteniendo foto de perfil:', e)
        }

        if (!ppUrl) {
          ppUrl = 'https://server.wallpaperalchemy.com/storage/wallpapers/287/hatsune-miku-4k-anime-wallpaper.png'
        }

        console.log('📤 Enviando welcome con imagen...')

        
        try {
          await conn.sendMessage(jid, {
            image: { url: ppUrl },
            caption: text,
            mentions: [user],
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: global.ch.ch1,
                newsletterName: '💙 HATSUNE MIKU CHANNEL💙',
                serverMessageId: -1
              }
            }
          }, { quoted })
        } catch (imageError) {
          console.log('Error con imagen directa, usando fallback:', imageError.message)
          
          
          await conn.sendMessage(jid, {
            text: text,
            contextInfo: {
              mentionedJid: [user],
              forwardingScore: 1,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: global.ch.ch1,
                newsletterName: '💙 HATSUNE MIKU CHANNEL💙',
                serverMessageId: -1
              },
              externalAdReply: {
                title: '🎵 Hatsune Miku Bot 🎵',
                body: `💙 Bienvenido al mundo virtual • ${groupSize} miembros 💙`,
                thumbnailUrl: ppUrl,
                renderLargerThumbnail: true,
                previewType: 0
              }
            }
          }, { quoted })
        }

      } catch (err) {
        console.log('sendSingleWelcome error:', err)
        return await conn.reply(jid, text, quoted, { mentions: [user] })
      }
    }

    if (m.messageStubType === 27) {
      console.log('🎉 Nuevo usuario detectado (tipo 27)')

      const users = m.messageStubParameters || []
      if (users.length === 0) {
        console.log('⚠️ No hay usuarios en messageStubParameters')
        return true
      }

      for (const user of users) {
        if (!user) continue

        const mentionTag = '@' + user.replace(/@.+/, '')

        const welcomeText = `🎵 *¡BIENVENIDO AL MUNDO DE HATSUNE MIKU!* 🎵

💌 ¡Hola ${mentionTag}! 💙
💮 Te unes a *${groupMetadata?.subject || 'el grupo'}*
🎶 Ahora somos *${groupSize}* miembros
🎵 Usa *.menu* para ver comandos
🎤 ¡Disfruta la música virtual!
💙 ¡Cantemos juntos! 🎵

🎵 *Hatsune Miku Bot* 🎵
💙 *La Diva Virtual del Futuro* 💙`

        await sendSingleWelcome(m.chat, welcomeText, user, m)
        console.log(`✅ Welcome enviado a ${mentionTag}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return true
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      console.log(`👋 Usuario salió (tipo ${m.messageStubType})`)

      const users = m.messageStubParameters || []
      if (users.length === 0) return true

      for (const user of users) {
        if (!user) continue

        const mentionTag = '@' + user.replace(/@.+/, '')

        const byeText = `🎵*HASTA PRONTO! DEl MUNDO DE HATSUNE MIKU*🎵

💙 Adiós ${mentionTag}! 💙
🎶 Gracias por cantar con nosotros
🎤 Te esperamos en nuestro próximo concierto
🎵 ¡Vuelve pronto a la música virtual!
💙 Siempre serás bienvenido aquí 🎵

🎵 *Hatsune Miku* 🎵
💙 *La Diva Virtual del Futuro* 💙`

        await sendSingleWelcome(m.chat, byeText, user, m)
        console.log(`✅ Goodbye enviado a ${mentionTag}`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      return true
    }

    return true

  } catch (e) {
    console.error('plugins/_welcome error', e)
    return true
  }
}