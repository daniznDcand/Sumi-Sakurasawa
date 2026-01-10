import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  try {
    
    if (!m.isGroup) return true
    if (!m.messageStubType) return true

    const msgTs = (m?.messageTimestamp ? Number(m.messageTimestamp) : 0) * 1000
    const now = Date.now()
    if (msgTs && (now - msgTs) > 2 * 60 * 1000) return true

    const chat = global.getChat ? global.getChat(m.chat) : (global.db && global.db.data && global.db.data.chats && global.db.data.chats[m.chat]) || {}
    
    if (chat.welcome === undefined) {
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
      
      if (Date.now() - last < 30 * 1000) return false
      global.__welcomeThrottle.set(key, Date.now())
      return true
    }

    const sendSingleWelcome = async (jid, text, user, quoted) => {
      try {
        if (!shouldSendWelcome(jid, user)) return
        
        if (!conn || !conn.user) {
          console.log('⚠️ Conexión no disponible, saltando welcome')
          return
        }
        
        let ppBuffer = null
        try {
         
          const defaultResponse = await fetch('https://server.wallpaperalchemy.com/storage/wallpapers/287/hatsune-miku-4k-anime-wallpaper.png')
          ppBuffer = await defaultResponse.buffer()
        } catch (e) {
          ppBuffer = null
        }

        console.log('📤 Enviando welcome...')
        
        try {
          const buttons = []
          const urls = [['🎵 Ir Canal 💙', canalUrl]]
          const title = conn?.isSubBot ? (conn.user?.name || 'SubBot') : '💙 Hatsune Miku Bot'
          await conn.sendNCarousel(jid, text, title, ppBuffer, buttons, null, urls, null, quoted, [user], { width: 1024, height: 1024 })
        } catch (carouselError) {
          console.log('Error con carousel, usando reply simple:', carouselError.message)
          
          await conn.reply(jid, `${text}\n\n🎵 *Ver Canal:* ${canalUrl}`, quoted, { mentions: [user] })
        }

      } catch (err) {
        console.log('sendSingleWelcome error:', err)
       
        try {
          await conn.sendMessage(jid, { text: `${text}\n\n🎵 *Ver Canal:* ${canalUrl}` })
        } catch (finalError) {
          console.log('Error final enviando welcome:', finalError.message)
        }
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

        
        let welcomeText = `╭━━━━━━━━━━━━━━━━━╮
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
        if (conn?.isSubBot) {
          try {
            const sessionId = (conn.user?.jid || '').split('@')[0]
            const cfgPath = path.join(process.cwd(), `${global.jadi}`, sessionId, 'assets', 'config.json')
            if (fs.existsSync(cfgPath)) {
              const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
              if (cfg && cfg.welcomeText) welcomeText = cfg.welcomeText.replace(/\$user/g, `@${userName}`)
            }
          } catch (e) { console.log('Error leyendo config welcome de subbot:', e.message) }
        }

        await sendSingleWelcome(m.chat, welcomeText, user, m)
        console.log(`✅ Welcome enviado a ${userName}`)
        
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
