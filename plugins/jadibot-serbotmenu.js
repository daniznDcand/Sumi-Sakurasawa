const handler = async (m, { conn, usedPrefix, command, args }) => {
  
  if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
    return m.reply(`💙 El comando *${command}* está desactivado temporalmente.`)
  }
  
  
  let time = global.db.data.users[m.sender].Subs + 120000
  if (new Date - global.db.data.users[m.sender].Subs < 120000) {
    return conn.reply(m.chat, `⏱️ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
  }
  
  
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== 3).map((conn) => conn)])]
  const subBotsCount = subBots.length
  if (subBotsCount === 20) {
    return m.reply(`💙 No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }

  
  const buttons = [
    ['📱 Código SMS', 'serbot_code'],
    ['📄 Código QR', 'serbot_qr']
  ]

  const text = `🤖 *CREAR SUB-BOT PERSISTENTE* 🤖

🌟 *¡Conviértete en un Sub-Bot de Hatsune Miku!*

*Selecciona tu método de vinculación preferido:*

📱 **Código SMS**
• Recibes un código de 8 dígitos
• Lo ingresas en WhatsApp Web/Desktop
• Más rápido y directo

📄 **Código QR** 
• Escaneas un código QR
• Desde otro dispositivo móvil
• Método tradicional

🔒 **Características de tu SubBot:**
✅ Sesión persistente (24/7)
✅ Reconexión automática
✅ Todos los comandos disponibles
✅ Resistente a desconexiones
✅ Monitoreo de salud automático

📊 *SubBots activos:* ${subBotsCount}/20

💡 *Tip:* El SubBot mantendrá tu sesión activa incluso si tu dispositivo principal se desconecta.`

  const footer = '🤖 Sistema de SubBots - Hatsune Miku Bot'
  const serBotGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

  try {
    return await conn.sendNCarousel(m.chat, text, footer, serBotGif, buttons, null, null, null, m)
  } catch (error) {
    
    const buttonMessage = {
      text: text,
      footer: footer,
      templateButtons: buttons.map((btn, index) => ({
        index: index + 1,
        quickReplyButton: {
          displayText: btn[0],
          id: btn[1]
        }
      })),
      image: { url: serBotGif }
    }
    return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }
}


handler.before = async function (m, { conn, usedPrefix }) {
  if (!m.message) return false
  
  
  let buttonId = null
  
  if (m.message.templateButtonReplyMessage) {
    buttonId = m.message.templateButtonReplyMessage.selectedId
  }
  if (m.message.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId
  }
  if (m.message.listResponseMessage) {
    buttonId = m.message.listResponseMessage.singleSelectReply?.selectedRowId
  }
  if (m.message.interactiveResponseMessage) {
    try {
      const paramsJson = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson
      if (paramsJson) {
        const params = JSON.parse(paramsJson)
        buttonId = params.id
      }
    } catch (e) {
      
    }
  }
  
  
  if (buttonId && buttonId.startsWith('serbot_')) {
    console.log('🤖 SERBOT BUTTON DETECTED:', buttonId)
    
    try {
      if (buttonId === 'serbot_code') {
        
        const { mikuJadiBot } = await import('./jadibot-serbot.js')
        const pathMikuJadiBot = `./jadi/${m.sender.split('@')[0]}`
        const fs = await import('fs')
        
        if (!fs.existsSync(pathMikuJadiBot)) {
          fs.mkdirSync(pathMikuJadiBot, { recursive: true })
        }
        
        const options = {
          pathMikuJadiBot,
          m,
          conn,
          args: ['code'],
          usedPrefix: '.',
          command: 'code',
          fromCommand: true
        }
        
        await mikuJadiBot(options)
        global.db.data.users[m.sender].Subs = new Date() * 1
        return true
        
      } else if (buttonId === 'serbot_qr') {
        
        const { mikuJadiBot } = await import('./jadibot-serbot.js')
        const pathMikuJadiBot = `./jadi/${m.sender.split('@')[0]}`
        const fs = await import('fs')
        
        if (!fs.existsSync(pathMikuJadiBot)) {
          fs.mkdirSync(pathMikuJadiBot, { recursive: true })
        }
        
        const options = {
          pathMikuJadiBot,
          m,
          conn,
          args: [],
          usedPrefix: '.',
          command: 'qr',
          fromCommand: true
        }
        
        await mikuJadiBot(options)
        global.db.data.users[m.sender].Subs = new Date() * 1
        return true
      }
    } catch (error) {
      console.log('❌ Error processing serbot button:', error)
      await conn.reply(m.chat, `❌ Error procesando comando de SubBot: ${error.message}`, m)
    }
  }
  
  return false
}

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100)
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  
  const h = (hours < 10) ? '0' + hours : hours
  const m = (minutes < 10) ? '0' + minutes : minutes
  const s = (seconds < 10) ? '0' + seconds : seconds
  
  return `${h}h ${m}m ${s}s`
}

handler.help = ['serbot', 'subbot', 'jadibot']
handler.tags = ['serbot']
handler.command = /^(serbot|subbot|jadibot)$/i

export default handler