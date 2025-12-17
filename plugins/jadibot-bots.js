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
    if (!global.conns || global.conns.length === 0) {
      return m.reply(`❌ *No hay SubBots activos*\n\n🤖 Actualmente no hay ningún SubBot conectado al servidor.\n\n💡 *Comando:* \`${usedPrefix}serbot\` para crear un SubBot`)
    }

    
    const activeConnections = global.conns.filter(c => {
      try {
        return c && c.user && c.user.jid && c.ws && c.ws.socket && c.ws.socket.readyState === 1
      } catch (e) {
        return false
      }
    })
    const inactiveConnections = global.conns.filter(c => {
      try {
        return c && c.user && c.user.jid && (!c.ws || !c.ws.socket || c.ws.socket.readyState !== 1)
      } catch (e) {
        return false
      }
    })
    const totalBots = activeConnections.length + inactiveConnections.length
    
    if (totalBots === 0) {
      return m.reply(`❌ *No hay SubBots válidos*\n\n🤖 No se encontraron SubBots con información válida.\n\n💡 *Comando:* \`${usedPrefix}serbot\` para crear un SubBot`)
    }

    console.log(chalk.blue(`📊 Generando estado de SubBots...`))

   
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    const userPhone = cleanPhoneNumber(m.sender)
    
    
    const userActiveConnections = activeConnections.filter(c => {
      try {
        return c && c.user && c.user.jid && cleanPhoneNumber(c.user.jid) === userPhone
      } catch (e) {
        return false
      }
    })
    const userInactiveConnections = inactiveConnections.filter(c => {
      try {
        return c && c.user && c.user.jid && cleanPhoneNumber(c.user.jid) === userPhone
      } catch (e) {
        return false
      }
    })

    
    let statusText = `🤖 *SUBBOTS*\n\n`
    statusText += `📊 Total: *${totalBots}*\n`
    statusText += `✅ Activos: *${activeConnections.length}*\n`
    statusText += `❌ Inactivos: *${inactiveConnections.length}*\n\n`

    const list = (args[0] === 'all' && isOwner) ? activeConnections : userActiveConnections
    if (list.length > 0) {
      statusText += `📋 ${args[0] === 'all' && isOwner ? '*SubBots activos (global):*' : '*Tus SubBots activos:*'}\n`
      list.slice(0, 10).forEach((bot, index) => {
        const botPhone = cleanPhoneNumber(bot.user?.jid) || 'Desconocido'
        statusText += `${index + 1}. wa.me/${botPhone}\n`
      })
      if (list.length > 10) statusText += `... y ${list.length - 10} más\n`
      statusText += `\n`
    } else {
      statusText += `📋 No hay SubBots activos para mostrar.\n\n`
    }

    statusText += `💡 \`${usedPrefix}bots\` | \`${usedPrefix}bots all\` (owner) | \`${usedPrefix}deletebot\`\n`
    statusText += `⏰ ${new Date().toLocaleString('es-ES')}`

    
    const mikuImagePath = path.join(process.cwd(), 'src', 'miku-bots.jpg')
    const catalogoImagePath = path.join(process.cwd(), 'src', 'catalogo.jpg')
    
    let imagePath = null
    if (fs.existsSync(mikuImagePath)) {
      imagePath = mikuImagePath
    } else if (fs.existsSync(catalogoImagePath)) {
      imagePath = catalogoImagePath
    }

    if (imagePath) {
      try {
        await conn.sendFile(m.chat, imagePath, 'subbots-status.jpg', statusText, m)
        console.log(chalk.green(`✅ Estado de SubBots enviado con imagen`))
      } catch (e) {
        console.error('Error enviando imagen:', e.message)
        await m.reply(statusText)
      }
    } else {
      await m.reply(statusText)
      console.log(chalk.green(`✅ Estado de SubBots enviado (solo texto)`))
    }

  } catch (error) {
    console.error('Error en comando bots:', error)
    
    
    const activeConnections = global.conns?.filter(c => c && c.user && isSocketReady(c)) || []
    const totalBots = global.conns?.filter(c => c && c.user).length || 0
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    
    let fallbackText = `🤖 *ESTADO DE SUBBOTS*\n\n`
    fallbackText += `📊 Activos: ${activeConnections.length} | Total: ${totalBots}\n`
    fallbackText += `💾 Memoria: ${memUsage}MB\n\n`
    fallbackText += `⚠️ Error generando reporte completo\n`
    fallbackText += `💡 Comando: \`${usedPrefix}qr\` para crear SubBot`
    
    m.reply(fallbackText)
  }
}


function msToTime(duration) {
  var seconds = Math.floor((duration / 1000) % 60),
  minutes = Math.floor((duration / (1000 * 60)) % 60),
  hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
  days = Math.floor(duration / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds}s`
}

handler.help = ['bots', 'listbots', 'subbots']
handler.tags = ['serbot']
handler.command = ['bots', 'listbots', 'subbots', 'jadibot']
handler.register = false

export default handler