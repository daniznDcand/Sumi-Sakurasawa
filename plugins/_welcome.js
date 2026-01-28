import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]

   
    if (!('welcome' in chat)) chat.welcome = true

    console.log(`🔍 Estado welcome para ${m.chat}:`, chat.welcome)

    if (chat.welcome === false) {
      console.log('❌ Welcome desactivado, saltando...')
      return true
    }

    const groupSize = (participants || []).length

    const sendSingleWelcome = async (jid, text, user, quoted) => {
      try {
        let ppUrl = null
        let userName = user
        
        try {
          ppUrl = await conn.profilePictureUrl(user, 'image').catch(() => null)
        } catch (e) {
          console.log('Error obteniendo foto de perfil:', e)
        }

        if (!ppUrl) {
          ppUrl = 'https://server.wallpaperalchemy.com/storage/wallpapers/287/hatsune-miku-4k-anime-wallpaper.png'
        }

        console.log('📤 Enviando welcome con imagen descargada...')

        
        let imagePath = null
        try {
          const response = await fetch(ppUrl)
          const buffer = await response.buffer()
          const tmpDir = './tmp'
          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true })
          }
          imagePath = path.join(tmpDir, `welcome_${user}_${Date.now()}.jpg`)
          fs.writeFileSync(imagePath, buffer)
          console.log('✅ Imagen descargada a:', imagePath)
        } catch (error) {
          console.error('Error descargando imagen:', error)
          
          
          let defaultImage = 'https://server.wallpaperaccess.com/cyberpunk/2077/4/wp-content/uploads/2023/01/28/wallpaperaccess_16742947356-872-874-6409-9.jpg'
          
          if (imagePath && fs.existsSync(imagePath)) {
            await conn.sendMessage(jid, {
              image: { url: imagePath },
              caption: text
            })
          } else {
            await conn.sendMessage(jid, { text })
          }
        }

        
        if (imagePath && fs.existsSync(imagePath)) {
          await conn.sendMessage(jid, {
            image: { url: imagePath },
            caption: text,
            contextInfo: {
              mentionedJid: [user],
              forwardingScore: 1,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: global.ch.ch1,
                newsletterName: '💙 HATSUNE MIKU CHANNEL💙',
                serverMessageId: -1
              }
            }
          }, { quoted })
          
          setTimeout(() => {
            try {
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath)
                console.log('🗑️ Archivo temporal eliminado:', imagePath)
              }
            } catch (cleanupError) {
              console.log('❌ Error eliminando archivo temporal:', cleanupError)
            }
          }, 5000)
        } else {
          
          await conn.reply(jid, text, quoted, { mentions: [user] })
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
        
        try {
          const userObj = global.db.data.users[user]
          const userName = userObj?.name || mentionTag

          const welcomeText = `💙*HATSUNE MIKU*💙

🌸*¡NUEVO MIEMBRO EN EL ESCENARIO!*🌸
〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜
💙 ¡Hola ${mentionTag}! 💙
🎵 Te unes a *${groupMetadata?.subject || 'el grupo'}*
🤑 Ahora somos *${groupSize}* vocaloids
🤩 Usa *.menu* para descubrir la magia
🎤 ¡Prepárate para cantar con nosotros!
〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜

🌸*Hatsune Miku*💙
💙*La Voz que Conecta Mundos*💙`

          await sendSingleWelcome(m.chat, welcomeText, user, m)
          console.log(`✅ Welcome enviado a ${userName}`)
        } catch (error) {
          console.log('Error obteniendo nombre de usuario:', error)
          const fallbackText = `👋 ¡Hola ${mentionTag}! 🎵

💙 Bienvenido a *${groupMetadata?.subject || 'el grupo'}*
🌱 Ahora somos *${groupSize}* miembros
🎵 Usa *.menu* para ver comandos`
          
          await sendSingleWelcome(m.chat, fallbackText, user, m)
          console.log(`✅ Welcome enviado a ${mentionTag}`)
        }
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
        
        try {
          const userObj = global.db.data.users[user]
          const userName = userObj?.name || mentionTag

          const byeText = `💙*HATSUNE MIKU*💙

🌸*¡HASTA PRONTO, ARTISTA!*🌸
〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜
💙 Adiós ${mentionTag}! 💙
🎶 Gracias por cantar con nosotros
🎤 Te esperamos en nuestro próximo concierto
🎵 ¡Vuelve pronto a la música virtual!
💙 Siempre serás bienvenido aquí 🎵
〜〜〜〜〜〜〜〜〜〜〜〜〜〜〜

💙*Hatsune Miku*💙
💙*La Voz que Conecta Mundos*💙`

          await sendSingleWelcome(m.chat, byeText, user, m)
          console.log(`✅ Goodbye enviado a ${userName}`)
        } catch (error) {
          console.log('Error obteniendo nombre de usuario:', error)
          const fallbackText = `👋 ¡Hasta luego ${mentionTag}! 💙

😢 Te extrañaremos en *${groupMetadata?.subject || 'el grupo'}*
🎵 ¡Vuelve pronto!`
          
          await sendSingleWelcome(m.chat, fallbackText, user, m)
          console.log(`✅ Goodbye enviado a ${mentionTag}`)
        }
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