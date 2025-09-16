import fs from "fs"
import path from "path"


const STORAGE_BASE = process.env.STORAGE_PATH || './storage'
const SESSION_STORAGE = path.join(STORAGE_BASE, 'sessions')
const BACKUP_STORAGE = path.join(STORAGE_BASE, 'backups')
const LOGS_STORAGE = path.join(STORAGE_BASE, 'logs')

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return m.reply('🔒 *Solo el propietario puede forzar la eliminación de sesiones.*')
  }

  if (!args[0]) {
    return m.reply(`💙 *Uso del comando:*\n\n> ${usedPrefix + command} <número|all>\n\n*Ejemplos:*\n> ${usedPrefix + command} 1234567890\n> ${usedPrefix + command} all\n\n_Elimina sesiones sin confirmación._`)
  }

  try {
    const target = args[0].toLowerCase()
    
    if (target === 'all' || target === 'todos') {
      
      await m.reply(`🔥 *Eliminando TODAS las sesiones...*\n\n⚠️ Esto cerrará todos los SubBots activos`)
      
      let results = {
        connectionsKilled: 0,
        sessionsDeleted: 0,
        backupsDeleted: 0,
        errors: []
      }

      try {
       
        if (global.conns && global.conns.length > 0) {
          const activeConns = [...global.conns].filter(conn => conn.user)
          for (const conn of activeConns) {
            try {
              conn.persistentReconnect = false
              conn.maxReconnectAttempts = 0
              if (conn.ws) conn.ws.close()
              conn.ev.removeAllListeners()
              results.connectionsKilled++
            } catch (error) {
              results.errors.push(`Error cerrando conexión: ${error.message}`)
            }
          }
          global.conns = global.conns.filter(conn => !conn.user)
        }

        
        if (fs.existsSync(SESSION_STORAGE)) {
          const sessions = fs.readdirSync(SESSION_STORAGE)
          for (const session of sessions) {
            try {
              const sessionPath = path.join(SESSION_STORAGE, session)
              await fs.promises.rm(sessionPath, { recursive: true, force: true })
              results.sessionsDeleted++
            } catch (error) {
              results.errors.push(`Error eliminando ${session}: ${error.message}`)
            }
          }
        }

       
        if (fs.existsSync(BACKUP_STORAGE)) {
          const backups = fs.readdirSync(BACKUP_STORAGE)
          for (const backup of backups) {
            try {
              const backupPath = path.join(BACKUP_STORAGE, backup)
              await fs.promises.rm(backupPath, { recursive: true, force: true })
              results.backupsDeleted++
            } catch (error) {
              results.errors.push(`Error eliminando respaldo ${backup}: ${error.message}`)
            }
          }
        }

        let resultMsg = `🔥 *Eliminación masiva completada*\n\n`
        resultMsg += `📊 *Resultados:*\n`
        resultMsg += `• Conexiones cerradas: ${results.connectionsKilled}\n`
        resultMsg += `• Sesiones eliminadas: ${results.sessionsDeleted}\n`
        resultMsg += `• Respaldos eliminados: ${results.backupsDeleted}\n`
        
        if (results.errors.length > 0) {
          resultMsg += `\n⚠️ *Errores (${results.errors.length}):*\n`
          results.errors.slice(0, 5).forEach((error, i) => {
            resultMsg += `${i + 1}. ${error}\n`
          })
          if (results.errors.length > 5) {
            resultMsg += `... y ${results.errors.length - 5} errores más\n`
          }
        }
        
        resultMsg += `\n✅ *Sistema limpio* - Todos los SubBots eliminados`
        await m.reply(resultMsg)

      } catch (error) {
        await m.reply(`❌ *Error en eliminación masiva:* ${error.message}`)
      }

    } else {
     
      const targetId = target.replace('@', '')
      const sessionPath = path.join(SESSION_STORAGE, targetId)
      
      await m.reply(`🔥 *Eliminando sesión forzadamente...*\n\n👤 Usuario: +${targetId}`)
      
      let results = {
        connectionClosed: false,
        sessionDeleted: false,
        backupsDeleted: 0,
        errors: []
      }

      
      const activeConn = global.conns.find(conn => 
        conn.user && (
          conn.user.jid.includes(targetId) || 
          conn.sessionPath === sessionPath ||
          (conn.userToken && conn.userToken.includes(targetId))
        )
      )

      if (activeConn) {
        try {
          activeConn.persistentReconnect = false
          activeConn.maxReconnectAttempts = 0
          if (activeConn.ws) activeConn.ws.close()
          activeConn.ev.removeAllListeners()
          
          const connIndex = global.conns.indexOf(activeConn)
          if (connIndex >= 0) global.conns.splice(connIndex, 1)
          
          results.connectionClosed = true
        } catch (error) {
          results.errors.push(`Error cerrando conexión: ${error.message}`)
        }
      }

      
      if (fs.existsSync(sessionPath)) {
        try {
          await fs.promises.rm(sessionPath, { recursive: true, force: true })
          results.sessionDeleted = true
        } catch (error) {
          results.errors.push(`Error eliminando sesión: ${error.message}`)
        }
      }

     
      if (fs.existsSync(BACKUP_STORAGE)) {
        try {
          const backups = fs.readdirSync(BACKUP_STORAGE).filter(file => file.includes(targetId))
          for (const backup of backups) {
            await fs.promises.rm(path.join(BACKUP_STORAGE, backup), { recursive: true, force: true })
            results.backupsDeleted++
          }
        } catch (error) {
          results.errors.push(`Error eliminando respaldos: ${error.message}`)
        }
      }

      let resultMsg = `🔥 *Eliminación forzada completada*\n\n`
      resultMsg += `👤 *Usuario:* +${targetId}\n\n`
      resultMsg += `📊 *Resultados:*\n`
      resultMsg += `• Conexión cerrada: ${results.connectionClosed ? '✅' : '❌'}\n`
      resultMsg += `• Sesión eliminada: ${results.sessionDeleted ? '✅' : '❌'}\n`
      resultMsg += `• Respaldos eliminados: ${results.backupsDeleted}\n`
      
      if (results.errors.length > 0) {
        resultMsg += `\n⚠️ *Errores:*\n`
        results.errors.forEach((error, i) => {
          resultMsg += `${i + 1}. ${error}\n`
        })
      }
      
      await m.reply(resultMsg)
    }

  } catch (error) {
    console.error('Error en forcedelete:', error)
    await m.reply(`❌ *Error del sistema:* ${error.message}`)
  }
}

handler.help = ['forcedelete', 'killsession']
handler.tags = ['jadibot']
handler.command = /^(forcedelete|killsession|forzarborrar|matarsesion)$/i
handler.rowner = true

export default handler