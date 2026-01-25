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
    
 
    if (m.chat.endsWith('@g.us')) {
      try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participants = groupMetadata.participants.map(p => p.id)
        
        let subBotsInGroup = []
        for (const subbot of activeConnections) {
          const subbotJid = subbot.user.jid
          if (participants.includes(subbotJid)) {
            subBotsInGroup.push({
              jid: subbotJid,
              name: subbot.user.name || subbot.user.verifiedName || subbotJid.split('@')[0],
              status: '🟢 Activo',
              connection: 'Conectado',
              lastSeen: new Date().toLocaleString()
            })
          }
        }
      } catch (e) {
        console.log('Error verificando SubBots en grupo:', e.message)
      }
    }

    
    let statusText = `🤖 *INFORME COMPLETO DE SUBBOTS*\n\n`

    if (args[0] === 'all' && isOwner) {
      
      statusText += `📊 *Resumen global:*\n`
      statusText += `• SubBots activos: ${activeConnections.length}\n`
      statusText += `• SubBots inactivos: ${inactiveConnections.length}\n`
      statusText += `• SubBots totales: ${totalBots}\n`
      statusText += `• Memoria usada: ${memUsage}MB\n\n`

      statusText += `🤖 *Lista global de SubBots:*\n\n`
      activeConnections.slice(0, 10).forEach((bot, index) => {
        const botPhone = cleanPhoneNumber(bot.user?.jid) || 'Desconocido'
        const botName = bot.user?.name || bot.user?.verifiedName || 'Sin nombre'
        statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        statusText += `📱 *SubBot #${index + 1}*\n`
        statusText += `👤 *Nombre:* ${botName}\n`
        statusText += `📞 *Teléfono:* wa.me/${botPhone}\n`
        statusText += `🆔 *JID:* ${bot.user?.jid}\n`
        statusText += `🟢 *Estado:* 🟢 Activo\n`
        statusText += `🔌 *Conexión:* Conectado\n\n`
      })
      if (activeConnections.length > 10) statusText += `... y ${activeConnections.length - 10} SubBots más\n\n`
    } else if (subBotsInGroup.length > 0) {
     
      statusText += `📊 *Resumen del grupo:*\n`
      statusText += `• SubBots activos en este grupo: ${subBotsInGroup.length}\n`
      statusText += `• SubBots totales conectados: ${activeConnections.length}\n`
      statusText += `• Porcentaje del grupo: ${Math.round((subBotsInGroup.length / activeConnections.length) * 100)}%\n\n`

      statusText += `🤖 *SubBots en este grupo:*\n\n`
      subBotsInGroup.forEach((subbot, index) => {
        statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
        statusText += `📱 *SubBot #${index + 1}*\n`
        statusText += `👤 *Nombre:* ${subbot.name}\n`
        statusText += `🆔 *JID:* ${subbot.jid}\n`
        statusText += `🟢 *Estado:* ${subbot.status}\n`
        statusText += `🔌 *Conexión:* ${subbot.connection}\n`
        statusText += `🕐 *Última actividad:* ${subbot.lastSeen}\n`
        statusText += `💡 *Control:* Usa \`${usedPrefix}offsubbot ${index + 1}\` para apagar\n\n`
      })

      statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      statusText += `🎮 *Comandos de control:*\n`
      statusText += `• \`${usedPrefix}offsubbot <número>\` - Apagar SubBot específico\n`
      statusText += `• \`${usedPrefix}offsubbot todos\` - Apagar todos los SubBots\n\n`
      statusText += `⚠️ *Nota:* Los SubBots apagados permanecerán en el grupo pero no responderán comandos.\n\n`
    } else {
      
      statusText += `📊 *Resumen general:*\n`
      statusText += `• SubBots activos: ${activeConnections.length}\n`
      statusText += `• SubBots inactivos: ${inactiveConnections.length}\n`
      statusText += `• SubBots totales: ${totalBots}\n`
      statusText += `• Memoria usada: ${memUsage}MB\n\n`

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
          statusText += `🟢 *Estado:* 🟢 Activo\n\n`
        })
        if (userActiveConnections.length > 10) statusText += `... y ${userActiveConnections.length - 10} más\n\n`
      } else {
        statusText += `📋 No tienes SubBots activos.\n\n`
      }
    }

    statusText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    statusText += `💡 *Comandos disponibles:*\n`
    statusText += `• \`${usedPrefix}bots\` - Ver tus SubBots\n`
    if (isOwner) statusText += `• \`${usedPrefix}bots all\` - Ver todos los SubBots (owner)\n`
    statusText += `• \`${usedPrefix}verbots\` - Ver SubBots del grupo\n`
    statusText += `• \`${usedPrefix}serbot\` - Crear nuevo SubBot\n\n`
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