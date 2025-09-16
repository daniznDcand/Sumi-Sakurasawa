import fs from "fs"
import path from "path"

let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return m.reply('🔒 *Solo el propietario puede ejecutar diagnósticos.*')
  }

  try {
    let diagnostics = `🔧 *Diagnóstico del Sistema SubBot*\n\n`
    
    
    diagnostics += `📋 *Configuración:*\n`
    diagnostics += `• JadiBotMD: ${global.db?.data?.settings?.[conn.user.jid]?.jadibotmd ? '✅' : '❌'}\n`
    
    
    diagnostics += `\n🔗 *Conexiones:*\n`
    diagnostics += `• Total: ${global.conns.length}\n`
    diagnostics += `• Activas: ${global.conns.filter(c => c.user).length}\n`
    diagnostics += `• Con token: ${global.conns.filter(c => c.userToken).length}\n`
    
    
    const STORAGE_BASE = process.env.STORAGE_PATH || './storage'
    const SESSION_STORAGE = path.join(STORAGE_BASE, 'sessions')
    const BACKUP_STORAGE = path.join(STORAGE_BASE, 'backups')
    const LOGS_STORAGE = path.join(STORAGE_BASE, 'logs')
    
    diagnostics += `\n💾 *Almacenamiento:*\n`
    try {
      diagnostics += `• Base: ${fs.existsSync(STORAGE_BASE) ? '✅' : '❌'} (${STORAGE_BASE})\n`
      diagnostics += `• Sesiones: ${fs.existsSync(SESSION_STORAGE) ? '✅' : '❌'} (${fs.existsSync(SESSION_STORAGE) ? fs.readdirSync(SESSION_STORAGE).length : 0} archivos)\n`
      diagnostics += `• Respaldos: ${fs.existsSync(BACKUP_STORAGE) ? '✅' : '❌'} (${fs.existsSync(BACKUP_STORAGE) ? fs.readdirSync(BACKUP_STORAGE).length : 0} archivos)\n`
      diagnostics += `• Logs: ${fs.existsSync(LOGS_STORAGE) ? '✅' : '❌'} (${fs.existsSync(LOGS_STORAGE) ? fs.readdirSync(LOGS_STORAGE).length : 0} archivos)\n`
    } catch (error) {
      diagnostics += `• Error: ${error.message}\n`
    }
    
    
    diagnostics += `\n📦 *Dependencias:*\n`
    try {
      const { default: baileys } = await import('@whiskeysockets/baileys')
      diagnostics += `• Baileys: ✅ (${baileys.version || 'Versión desconocida'})\n`
    } catch {
      diagnostics += `• Baileys: ❌ No encontrado\n`
    }
    
    try {
      const qrcode = await import('qrcode')
      diagnostics += `• QRCode: ✅\n`
    } catch {
      diagnostics += `• QRCode: ❌ No encontrado\n`
    }
    
    
    const activeSubBots = global.conns.filter(c => c.user && c.userToken)
    let problematicSessions = []
    
    if (activeSubBots.length > 0) {
      diagnostics += `\n👥 *SubBots Activos:*\n`
      activeSubBots.forEach((sock, index) => {
        const token = sock.userToken.substring(0, 15) + '...'
        const reconnects = sock.reconnectAttempts || 0
        
        
        let issues = []
        if (reconnects > 10) issues.push('Muchas reconexiones')
        if (!sock.userToken) issues.push('Sin token')
        if (sock.ws && sock.ws.readyState !== 1) issues.push('Conexión inestable')
        
        if (issues.length > 0) {
          problematicSessions.push({
            id: sock.sessionPath ? require('path').basename(sock.sessionPath) : 'unknown',
            token: token,
            issues: issues
          })
        }
        
        const status = issues.length > 0 ? '⚠️' : '🟢'
        diagnostics += `${index + 1}. ${status} ${token} (${reconnects} reconexiones)\n`
        
        if (issues.length > 0) {
          diagnostics += `   ⚠️ ${issues.join(', ')}\n`
        }
      })
    }
    
    
    if (problematicSessions.length > 0) {
      diagnostics += `\n🚨 *Sesiones Problemáticas:*\n`
      problematicSessions.forEach((session, i) => {
        diagnostics += `${i + 1}. ID: ${session.id} | Token: ${session.token}\n`
        diagnostics += `   Problemas: ${session.issues.join(', ')}\n`
      })
      diagnostics += `\n💡 *Sugerencia:* Use \`.forcedelete <id>\` para eliminar sesiones problemáticas\n`
    }
    
    
    diagnostics += `\n📁 *Archivos del Sistema:*\n`
    const criticalFiles = [
      './plugins/jadibot-serbot.js',
      './plugins/jadibot-reconnect.js',
      './plugins/jadibot-stats.js',
      './handler.js'
    ]
    
    criticalFiles.forEach(file => {
      diagnostics += `• ${path.basename(file)}: ${fs.existsSync(file) ? '✅' : '❌'}\n`
    })
    
    
    diagnostics += `\n⚡ *Sistema:*\n`
    diagnostics += `• Node.js: ${process.version}\n`
    diagnostics += `• Tiempo activo: ${formatUptime(process.uptime())}\n`
    diagnostics += `• Memoria RSS: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB\n`
    diagnostics += `• Arquitectura: ${process.arch}\n`
    diagnostics += `• Plataforma: ${process.platform}\n`
    
    
    diagnostics += `\n📝 *Comandos de Gestión:*\n`
    diagnostics += `• ${usedPrefix}qr - Crear SubBot QR\n`
    diagnostics += `• ${usedPrefix}code - Crear SubBot código\n`
    diagnostics += `• ${usedPrefix}reconnect <token> - Reconectar\n`
    diagnostics += `• ${usedPrefix}deletebot - Eliminar sesión (con confirmación)\n`
    diagnostics += `• ${usedPrefix}forcedelete <id> - Eliminar forzadamente (owner)\n`
    diagnostics += `• ${usedPrefix}substats - Ver estadísticas\n`
    diagnostics += `• ${usedPrefix}diagnosis - Este diagnóstico\n`
    
    await m.reply(diagnostics)
    
  } catch (error) {
    console.error('Error en diagnóstico:', error)
    await m.reply(`❌ *Error ejecutando diagnóstico:*\n\n${error.message}`)
  }
}

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

handler.help = ['diagnosis', 'subbot-check']
handler.tags = ['jadibot']
handler.command = /^(diagnosis|subbot-check|diagnostico)$/i
handler.rowner = true

export default handler