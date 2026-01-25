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
    
    const allConnections = global.conns || []
    const activeConnections = allConnections.filter(c => {
      try {
       
        if (!c || !c.user || !c.user.jid) return false
        if (!c.ws || !c.ws.socket) return false
        if (c.ws.socket.readyState !== 1) return false 
        if (c.connectionStatus === 'close') return false
        return true
      } catch (e) {
        return false
      }
    })
    
    const inactiveConnections = allConnections.filter(c => {
      try {
        return c && c.user && c.user.jid && (!c.ws || !c.ws.socket || c.ws.socket.readyState !== 1)
      } catch (e) {
        return false
      }
    })
    
    const totalBots = activeConnections.length + inactiveConnections.length
    
    if (totalBots === 0) {
      return m.reply(`❌ *No hay SubBots activos*\n\n🤖 Actualmente no hay ningún SubBot conectado al servidor.\n\n💡 *Comando:* \`${usedPrefix}serbot\` para crear un SubBot`)
    }

    
    if (activeConnections.length !== global._lastActiveCount) {
      console.log(chalk.blue(`📊 SubBots activos: ${activeConnections.length}/${totalBots} totales`))
      global._lastActiveCount = activeConnections.length
    }
    
    const memUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    const userPhone = cleanPhoneNumber(m.sender)
    
    const userActiveConnections = activeConnections.filter(c => {
      try {
        return c && c.user && c.user.jid && cleanPhoneNumber(c.user.jid) === userPhone
      } catch (e) {
        return false
      }
    })
    
   
    let subBotsInGroup = []
    if (m.chat.endsWith('@g.us')) {
      try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participants = groupMetadata.participants.map(p => p.id)
        
        for (const subbot of activeConnections) {
          const subbotJid = subbot.user.jid
          if (participants.includes(subbotJid)) {
            subBotsInGroup.push({
              jid: subbotJid,
              name: subbot.user.name || subbot.user.verifiedName || subbotJid.split('@')[0],
              status: '🟢 Activo',
              connection: 'Conectado',
              lastSeen: new Date().toLocaleString(),
              phone: cleanPhoneNumber(subbotJid)
            })
          }
        }
      } catch (e) {
        console.log('Error verificando SubBots en grupo:', e.message)
      }
    }
    
    
    let statusText = `🤖 *INFORME COMPLETO DE SUBBOTS*\n\n`
    
    
    statusText += `📊 *Resumen del sistema:*\n`
    statusText += `• SubBots activos: ${activeConnections.length}\n`
    statusText += `• SubBots inactivos: ${inactiveConnections.length}\n`
    statusText += `• SubBots totales: ${totalBots}\n`
    statusText += `• Memoria usada: ${memUsage}MB\n`
    statusText += `• Tus SubBots activos: ${userActiveConnections.length}\n\n`

    
    if (subBotsInGroup.length > 0) {
      statusText += `📊 *SubBots en este grupo:*\n`
      statusText += `• SubBots activos en grupo: ${subBotsInGroup.length}\n`
      statusText += `• Porcentaje del grupo: ${Math.round((subBotsInGroup.length / activeConnections.length) * 100)}%\n\n`

      statusText += `🤖 *SubBots en este grupo:*\n\n`
      subBotsInGroup.forEach((subbot, index) => {
        statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        statusText += `📱 *SubBot #${index + 1}*\n`
        statusText += `👤 *Nombre:* ${subbot.name}\n`
        statusText += `📞 *Teléfono:* wa.me/${subbot.phone}\n`
        statusText += `🆔 *JID:* ${subbot.jid}\n`
        statusText += `🟢 *Estado:* ${subbot.status}\n`
        statusText += `🔌 *Conexión:* ${subbot.connection}\n`
        statusText += `🕐 *Última actividad:* ${subbot.lastSeen}\n`
        statusText += `💡 *Control:* Usa \`${usedPrefix}offsubbot ${index + 1}\` para apagar\n\n`
      })
    }

   
    if (userActiveConnections.length > 0) {
      statusText += `🤖 *Tus SubBots activos:*\n\n`
      userActiveConnections.slice(0, 10).forEach((bot, index) => {
        const botPhone = cleanPhoneNumber(bot.user?.jid) || 'Desconocido'
        const botName = bot.user?.name || bot.user?.verifiedName || 'Sin nombre'
        statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        statusText += `📱 *SubBot #${index + 1}*\n`
        statusText += `👤 *Nombre:* ${botName}\n`
        statusText += `📞 *Teléfono:* wa.me/${botPhone}\n`
        statusText += `🆔 *JID:* ${bot.user?.jid}\n`
        statusText += `� *Estado:* 🟢 Activo\n`
        statusText += `🔌 *Conexión:* Conectada\n\n`
      })
      if (userActiveConnections.length > 10) statusText += `... y ${userActiveConnections.length - 10} más\n\n`
    }

   
    if (isOwner && activeConnections.length > 0) {
      statusText += `🤖 *Todos los SubBots del servidor:*\n\n`
      activeConnections.slice(0, 10).forEach((bot, index) => {
        const botPhone = cleanPhoneNumber(bot.user?.jid) || 'Desconocido'
        const botName = bot.user?.name || bot.user?.verifiedName || 'Sin nombre'
        statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        statusText += `📱 *SubBot #${index + 1}*\n`
        statusText += `👤 *Nombre:* ${botName}\n`
        statusText += `📞 *Teléfono:* wa.me/${botPhone}\n`
        statusText += `🆔 *JID:* ${bot.user?.jid}\n`
        statusText += `🟢 *Estado:* 🟢 Activo\n`
        statusText += `🔌 *Conexión:* Conectada\n\n`
      })
      if (activeConnections.length > 10) statusText += `... y ${activeConnections.length - 10} SubBots más\n\n`
    }

    
    statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    statusText += `🎮 *Comandos de control:*\n`
    statusText += `• \`${usedPrefix}offsubbot <número>\` - Apagar SubBot específico\n`
    statusText += `• \`${usedPrefix}offsubbot todos\` - Apagar todos los SubBots\n`
    statusText += `• \`${usedPrefix}serbot\` - Crear nuevo SubBot\n\n`
    statusText += `⚠️ *Nota:* Los SubBots apagados permanecerán en el grupo pero no responderán comandos.\n\n`
    statusText += `⏰ ${new Date().toLocaleString('es-ES')}`

    await m.reply(statusText)
    
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