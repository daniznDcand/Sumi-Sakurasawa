import fs from 'fs'
import path from 'path'
import chalk from 'chalk'


function isSocketReady(s) {
  try {
    if (!s) return false
    const hasWebSocket = s.ws && s.ws.socket
    const isOpen = hasWebSocket && s.ws.socket.readyState === 1 
    const hasUser = s.user && s.user.jid
    const hasAuthState = s.authState && s.authState.creds
    const isConnected = s.connectionStatus === 'open' || isOpen
    return hasWebSocket && isOpen && hasUser && hasAuthState && isConnected
  } catch (e) {
    return false
  }
}


function cleanPhoneNumber(phone) {
  if (!phone) return null
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    return cleaned
  }
  return null
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  try {
    const userPhone = cleanPhoneNumber(m.sender)
    
    if (!global.conns || global.conns.length === 0) {
      return m.reply(`❌ *No hay SubBots activos*\n\n📱 No tienes ningún SubBot conectado actualmente.\n\n💡 *Usa:* ${usedPrefix}qr para crear un SubBot`)
    }

    
    const userConnections = global.conns.filter(c => 
      c && c.user && isSocketReady(c) && 
      c.user.jid && cleanPhoneNumber(c.user.jid) === userPhone
    )

    if (userConnections.length === 0) {
      return m.reply(`❌ *No tienes SubBots activos*\n\n📱 No se encontraron SubBots asociados a tu número.\n\n💡 *Usa:* ${usedPrefix}qr para crear un SubBot`)
    }

    
    if (args[0]) {
      const targetPhone = cleanPhoneNumber(args[0])
      if (!targetPhone) {
        return m.reply(`❌ *Número inválido*\n\n📱 El número proporcionado no es válido.\n\n💡 *Ejemplo:* ${usedPrefix}${command} +51988514570`)
      }

      const targetConnection = global.conns.find(c => 
        c && c.user && cleanPhoneNumber(c.user.jid) === targetPhone
      )

      if (!targetConnection) {
        return m.reply(`❌ *SubBot no encontrado*\n\n📱 No se encontró un SubBot con el número +${targetPhone}\n\n💡 *Usa:* ${usedPrefix}bots para ver SubBots activos`)
      }

      
      if (!isOwner && cleanPhoneNumber(targetConnection.user.jid) !== userPhone) {
        return m.reply(`🚫 *Sin permisos*\n\n❌ Solo puedes eliminar tus propios SubBots.\n\n💡 *Usa:* ${usedPrefix}bots para ver tus SubBots`)
      }

      
      await deleteSubBot(targetConnection, targetPhone, m, conn, usedPrefix)
      return
    }

    
    if (userConnections.length === 1) {
      const phoneToDelete = cleanPhoneNumber(userConnections[0].user.jid)
      await deleteSubBot(userConnections[0], phoneToDelete, m, conn, usedPrefix)
      return
    }

    
    let botsList = `🤖 *Tus SubBots Activos*\n\n`
    botsList += `📱 Tienes ${userConnections.length} SubBot(s) conectado(s):\n\n`
    
    userConnections.forEach((bot, index) => {
      const botPhone = cleanPhoneNumber(bot.user.jid)
      const uptime = bot.sessionStartTime ? 
        msToTime(Date.now() - bot.sessionStartTime) : 'Desconocido'
      const reconnects = bot.reconnectAttempts || 0
      
      botsList += `${index + 1}. 📞 +${botPhone}\n`
      botsList += `   ⏰ Uptime: ${uptime}\n`
      botsList += `   🔄 Reconexiones: ${reconnects}\n`
      botsList += `   💾 Estado: ${isSocketReady(bot) ? '🟢 Activo' : '🔴 Inactivo'}\n\n`
    })
    
    botsList += `💡 *Para eliminar un SubBot específico:*\n`
    botsList += `${usedPrefix}${command} +número\n\n`
    botsList += `🗑️ *Para eliminar TODOS tus SubBots:*\n`
    botsList += `${usedPrefix}${command} all`

    if (args[0] === 'all') {
      
      let deletedCount = 0
      for (const bot of userConnections) {
        const phoneToDelete = cleanPhoneNumber(bot.user.jid)
        await deleteSubBot(bot, phoneToDelete, null, null, null, true) 
        deletedCount++
      }
      
      return m.reply(`✅ *SubBots eliminados*\n\n🗑️ Se eliminaron ${deletedCount} SubBot(s) exitosamente.\n📁 Las sesiones han sido borradas del servidor.\n\n💡 *Usa:* ${usedPrefix}qr para crear un nuevo SubBot`)
    }

    m.reply(botsList)

  } catch (error) {
    console.error('Error en deletebot:', error)
    m.reply(`❌ *Error interno*\n\n⚠️ Ocurrió un error al procesar la solicitud.\n💡 Intenta nuevamente en unos momentos.`)
  }
}


async function deleteSubBot(bot, phoneNumber, m, conn, usedPrefix, silent = false) {
  try {
    console.log(chalk.red(`🗑️ Eliminando SubBot +${phoneNumber}...`))
    
    
    if (bot._keepAliveInterval) {
      clearInterval(bot._keepAliveInterval)
      bot._keepAliveInterval = null
    }
    if (bot._saveCredsInterval) {
      clearInterval(bot._saveCredsInterval)
      bot._saveCredsInterval = null
    }
    if (bot._inactivityMonitor) {
      clearInterval(bot._inactivityMonitor)
      bot._inactivityMonitor = null
    }
    if (bot.heartbeatInterval) {
      clearInterval(bot.heartbeatInterval)
      bot.heartbeatInterval = null
    }
    if (bot._presenceInterval) {
      clearInterval(bot._presenceInterval)
      bot._presenceInterval = null
    }

   
    try {
      if (bot.ws && typeof bot.ws.close === 'function') {
        bot.ws.close()
      }
    } catch (e) {
      console.error('Error cerrando WebSocket:', e.message)
    }

    
    try {
      if (bot.ev && typeof bot.ev.removeAllListeners === 'function') {
        bot.ev.removeAllListeners()
      }
    } catch (e) {
      console.error('Error removiendo listeners:', e.message)
    }

    
    const connectionIndex = global.conns.findIndex(c => 
      c && c.user && cleanPhoneNumber(c.user.jid) === phoneNumber
    )
    
    if (connectionIndex !== -1) {
      global.conns.splice(connectionIndex, 1)
      console.log(chalk.blue(`🗑️ SubBot +${phoneNumber} removido de global.conns`))
    }

   
    const sessionPath = path.join(process.cwd(), 'MikuJadiBot', phoneNumber)
    if (fs.existsSync(sessionPath)) {
      try {
        fs.rmSync(sessionPath, { recursive: true, force: true })
        console.log(chalk.blue(`📁 Sesión +${phoneNumber} eliminada del servidor`))
      } catch (e) {
        console.error('Error eliminando sesión:', e.message)
      }
    }

    if (!silent && m) {
      const activeConnections = global.conns.filter(c => c && c.user && isSocketReady(c)).length
      
      await m.reply(`✅ *SubBot eliminado exitosamente*\n\n🗑️ SubBot +${phoneNumber} desconectado\n📁 Sesión eliminada del servidor\n📊 SubBots activos restantes: ${activeConnections}\n\n💡 *Usa:* ${usedPrefix}qr para crear un nuevo SubBot`)
    }

    console.log(chalk.green(`✅ SubBot +${phoneNumber} eliminado completamente`))
    
  } catch (error) {
    console.error(`Error eliminando SubBot +${phoneNumber}:`, error)
    if (!silent && m) {
      m.reply(`⚠️ Error eliminando SubBot +${phoneNumber}: ${error.message}`)
    }
  }
}


function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
  seconds = Math.floor((duration / 1000) % 60),
  minutes = Math.floor((duration / (1000 * 60)) % 60),
  hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = (hours < 10) ? '0' + hours : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

handler.help = ['deletebot', 'deletesesion', 'stopbot']
handler.tags = ['serbot']
handler.command = ['deletebot', 'deletesesion', 'stopbot', 'delbot']
handler.register = false

export default handler