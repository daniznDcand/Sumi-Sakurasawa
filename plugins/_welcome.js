import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    if (conn?.isSubBot) return true
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    const msgTs = (m?.messageTimestamp ? Number(m.messageTimestamp) : 0) * 1000
    const now = Date.now()
    if (msgTs && (now - msgTs) > 2 * 60 * 1000) return true

    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]
    
    if (chat.welcome === undefined) {
      chat.welcome = true
    }
    if (chat.welcome === false && chat.welcome !== true) {
      chat.welcome = true
    }
    
    console.log(`🔍 Estado welcome para ${m.chat}:`, chat.welcome)
    
    if (!chat.welcome) {
      console.log('❌ Welcome desactivado, saltando...')
      return true
    }

    const canalUrl = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
    const groupSize = (participants || []).length

    global.__welcomeThrottle = global.__welcomeThrottle || new Map()
    const shouldSendWelcome = (jid, user) => {
      const key = `${jid}|${user}`
      const last = global.__welcomeThrottle.get(key) || 0
      if (Date.now() - last < 10 * 60 * 1000) return false
      global.__welcomeThrottle.set(key, Date.now())
      return true
    }

    const sendSingleWelcome = async (jid, text, user, quoted) => {
      try {
        if (!shouldSendWelcome(jid, user)) return
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
            const defaultResponse = await fetch('https://server.wallpaperalchemy.com/storage/wallpapers/287/hatsune-miku-4k-anime-wallpaper.png')
            ppBuffer = await defaultResponse.buffer()
          } catch (e) {
            ppBuffer = null
          }
        }

        console.log('📤 Enviando welcome con imagen ampliada y botón de canal...')
        
        const buttons = []
        const urls = [['🎵 Ir Canal 💙', canalUrl]]
        
        await conn.sendNCarousel(jid, text, '💙 Hatsune Miku Bot', ppBuffer, buttons, null, urls, null, quoted, [user], { width: 1024, height: 1024 })

      } catch (err) {
        console.log('sendSingleWelcome error:', err)
        return await conn.reply(jid, `${text}\n\n🎵 *Ver Canal:* ${canalUrl}`, quoted, { mentions: [user] })
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
        
        const userName = await Promise.resolve(conn.getName(user)).catch(() => user.split('@')[0])
        const welcomeText = `╭━━━━━━━━━━━━━━━━━╮
┃  💙 *BIENVENID@* 💙       ┃
╰━━━━━━━━━━━━━━━━━╯

✨ Hola *@${userName}*

🎵 *Hatsune Miku Bot*
━━━━━━━━━━━━━━━━━
👥 Miembro #${groupSize}
🤖 Usa *#help* para ver comandos
🎮 Juegos, música y más
💫 ¡Disfruta tu estadía!
━━━━━━━━━━━━━━━━━`

        await sendSingleWelcome(m.chat, welcomeText, user, m)
        console.log(`✅ Welcome enviado a ${userName}`)
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
        
        const userName = await Promise.resolve(conn.getName(user)).catch(() => user.split('@')[0])
        const byeText = `╭━━━━━━━━━━━━━━━━━╮
┃  👋 *HASTA PRONTO*     ┃
╰━━━━━━━━━━━━━━━━━╯

💙 Adiós *@${userName}*

✨ Gracias por estar aquí
🎵 Siempre serás bienvenid@
💫 ¡Vuelve pronto!`

        await sendSingleWelcome(m.chat, byeText, user, m)
        console.log(`✅ Goodbye enviado a ${userName}`)
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
