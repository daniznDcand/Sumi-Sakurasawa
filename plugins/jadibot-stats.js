import fs from "fs"
import path from "path"

// Configuración de almacenamiento
const STORAGE_BASE = process.env.STORAGE_PATH || './storage'
const SESSION_STORAGE = path.join(STORAGE_BASE, 'sessions')
const BACKUP_STORAGE = path.join(STORAGE_BASE, 'backups')
const LOGS_STORAGE = path.join(STORAGE_BASE, 'logs')

let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return m.reply('🔒 *Solo el propietario puede ver las estadísticas del sistema de SubBots.*')
  }

  try {
    // Estadísticas básicas
    const totalConnections = global.conns.length
    const activeConnections = global.conns.filter(conn => conn.user).length
    const tokensActive = global.conns.filter(conn => conn.userToken).length
    
    // Información del sistema
    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()
    const uptimeFormatted = formatUptime(uptime)
    
    // Información de almacenamiento
    let storageInfo = 'No disponible'
    let sessionCount = 0
    let backupCount = 0
    let logCount = 0
    
    try {
      if (fs.existsSync(SESSION_STORAGE)) {
        sessionCount = fs.readdirSync(SESSION_STORAGE).length
      }
      if (fs.existsSync(BACKUP_STORAGE)) {
        backupCount = fs.readdirSync(BACKUP_STORAGE).length
      }
      if (fs.existsSync(LOGS_STORAGE)) {
        logCount = fs.readdirSync(LOGS_STORAGE).length
      }
      storageInfo = `📁 Sesiones: ${sessionCount}\n📦 Respaldos: ${backupCount}\n📋 Logs: ${logCount}`
    } catch (error) {
      storageInfo = `Error: ${error.message}`
    }
    
    // SubBots activos con detalles
    let activeSubBots = ''
    const activeSocks = global.conns.filter(conn => conn.user && conn.userToken)
    
    if (activeSocks.length > 0) {
      activeSocks.forEach((sock, index) => {
        const token = sock.userToken ? sock.userToken.substring(0, 15) + '...' : 'Sin token'
        const userName = sock.user?.name || 'Anónimo'
        const reconnects = sock.reconnectAttempts || 0
        const lastActivity = sock.lastActivity ? formatTimeDiff(Date.now() - sock.lastActivity) : 'Desconocido'
        
        activeSubBots += `\n${index + 1}. 👤 ${userName}\n   🔑 ${token}\n   🔄 Reconexiones: ${reconnects}\n   ⏱️ Actividad: ${lastActivity}\n`
      })
    } else {
      activeSubBots = '\n_No hay SubBots activos_'
    }
    
    // Memoria formateada
    const memoryFormatted = `RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)}MB\nHeap: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB/${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`
    
    const statsMessage = `🤖 *Estadísticas del Sistema SubBot*\n\n` +
      `📊 *Conexiones:*\n` +
      `• Total: ${totalConnections}\n` +
      `• Activas: ${activeConnections}\n` +
      `• Con Token: ${tokensActive}\n\n` +
      
      `⚡ *Sistema:*\n` +
      `• Tiempo activo: ${uptimeFormatted}\n` +
      `• Memoria: ${memoryFormatted}\n\n` +
      
      `💾 *Almacenamiento del Servidor:*\n${storageInfo}\n\n` +
      
      `👥 *SubBots Activos:*${activeSubBots}\n\n` +
      
      `📝 *Comandos disponibles:*\n` +
      `• ${usedPrefix}subbots - Ver SubBots\n` +
      `• ${usedPrefix}qr - Crear SubBot QR\n` +
      `• ${usedPrefix}code - Crear SubBot código\n` +
      `• ${usedPrefix}reconnect <token> - Reconectar\n` +
      `• ${usedPrefix}stopsubbots - Detener todos\n\n` +
      
      `_Sistema de almacenamiento persistente activo 🟢_`

    await m.reply(statsMessage)
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    await m.reply(`❌ *Error obteniendo estadísticas:*\n\n${error.message}`)
  }
}

// Función para formatear tiempo de actividad
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  let result = ''
  if (days > 0) result += `${days}d `
  if (hours > 0) result += `${hours}h `
  if (minutes > 0) result += `${minutes}m `
  result += `${secs}s`
  
  return result
}

// Función para formatear diferencia de tiempo
function formatTimeDiff(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `hace ${days}d`
  if (hours > 0) return `hace ${hours}h`
  if (minutes > 0) return `hace ${minutes}m`
  return `hace ${seconds}s`
}

handler.help = ['substats', 'subbots-stats']
handler.tags = ['jadibot']
handler.command = /^(substats|subbots-stats|jadibot-stats)$/i
handler.rowner = true

export default handler