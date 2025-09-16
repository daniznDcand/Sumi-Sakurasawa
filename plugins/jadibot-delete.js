import fs from "fs"
import path from "path"


const STORAGE_BASE = process.env.STORAGE_PATH || './storage'
const SESSION_STORAGE = path.join(STORAGE_BASE, 'sessions')
const BACKUP_STORAGE = path.join(STORAGE_BASE, 'backups')
const LOGS_STORAGE = path.join(STORAGE_BASE, 'logs')

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  try {
    
    if (!global.db?.data?.settings?.[conn.user.jid]?.jadibotmd) {
      return m.reply(`💙 El comando ${command} está desactivado temporalmente.`)
    }

    let targetUser = m.sender
    let targetId = targetUser.split('@')[0]
    
  
    if (isOwner && args[0]) {
      if (args[0].includes('@')) {
        targetUser = args[0].replace('@', '') + '@s.whatsapp.net'
        targetId = args[0].replace('@', '')
      } else {
        targetId = args[0]
        targetUser = args[0] + '@s.whatsapp.net'
      }
    }

    const sessionPath = path.join(SESSION_STORAGE, targetId)
    const sessionExists = fs.existsSync(sessionPath)
    
    
    const activeConnection = global.conns.find(conn => 
      conn.user && (
        conn.user.jid === targetUser || 
        conn.sessionPath === sessionPath ||
        (conn.userToken && conn.userToken.includes(targetId))
      )
    )

    if (!sessionExists && !activeConnection) {
      return m.reply(`❌ *No se encontró sesión*\n\nNo hay sesión activa o almacenada para el usuario: \`+${targetId}\`\n\n_No hay nada que eliminar._`)
    }

    let confirmMessage = `⚠️ *Confirmar eliminación de sesión*\n\n`
    confirmMessage += `👤 *Usuario:* +${targetId}\n`
    confirmMessage += `📁 *Sesión:* ${sessionExists ? '✅ Encontrada' : '❌ No encontrada'}\n`
    confirmMessage += `🔗 *Conexión activa:* ${activeConnection ? '✅ Conectado' : '❌ Desconectado'}\n\n`
    
    if (activeConnection) {
      confirmMessage += `🔌 *Estado de conexión:*\n`
      confirmMessage += `• Token: ${activeConnection.userToken ? activeConnection.userToken.substring(0, 15) + '...' : 'Sin token'}\n`
      confirmMessage += `• Reconexiones: ${activeConnection.reconnectAttempts || 0}\n`
      confirmMessage += `• Usuario: ${activeConnection.user?.name || 'Anónimo'}\n\n`
    }
    
    confirmMessage += `*⚠️ ADVERTENCIA:*\n`
    confirmMessage += `• Se eliminará completamente la sesión\n`
    confirmMessage += `• Se desconectará el SubBot si está activo\n`
    confirmMessage += `• Se eliminarán respaldos asociados\n`
    confirmMessage += `• Será necesario vincular nuevamente con QR/código\n\n`
    confirmMessage += `*Responda con:*\n`
    confirmMessage += `• \`si\` o \`confirmar\` para eliminar\n`
    confirmMessage += `• Cualquier otra cosa para cancelar\n\n`
    confirmMessage += `_⏱️ Tiempo límite: 30 segundos_`

    const confirmMsg = await m.reply(confirmMessage)
    
    
    const confirmation = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 30000) 
      
      const listener = (msg) => {
        if (msg.sender === m.sender && msg.chat === m.chat) {
          const text = msg.text?.toLowerCase().trim()
          if (text === 'si' || text === 'sí' || text === 'confirmar' || text === 'yes') {
            clearTimeout(timeout)
            conn.ev.off('messages.upsert', listener)
            resolve(true)
          } else if (text === 'no' || text === 'cancelar' || text === 'cancel') {
            clearTimeout(timeout)
            conn.ev.off('messages.upsert', listener)
            resolve(false)
          }
        }
      }
      
      conn.ev.on('messages.upsert', ({ messages }) => {
        const msg = messages[0]
        if (msg?.message) {
          listener({
            sender: msg.key.remoteJid,
            chat: msg.key.remoteJid,
            text: msg.message.conversation || msg.message.extendedTextMessage?.text
          })
        }
      })
    })

    if (confirmation === null) {
      return m.reply(`⏰ *Tiempo agotado*\n\nOperación cancelada. La sesión no fue eliminada.`)
    }
    
    if (!confirmation) {
      return m.reply(`❌ *Operación cancelada*\n\nLa sesión no fue eliminada.`)
    }

    
    await m.reply(`🔄 *Eliminando sesión...*\n\nProcesando eliminación para +${targetId}`)
    
    let results = {
      connectionClosed: false,
      sessionDeleted: false,
      backupsDeleted: 0,
      logsDeleted: false,
      errors: []
    }

    try {
      
      if (activeConnection) {
        try {
         
          activeConnection.persistentReconnect = false
          activeConnection.maxReconnectAttempts = 0
          
          
          if (activeConnection.ws && activeConnection.ws.readyState === 1) {
            activeConnection.ws.close()
          }
          
          
          activeConnection.ev.removeAllListeners()
          
          
          const connIndex = global.conns.indexOf(activeConnection)
          if (connIndex >= 0) {
            global.conns.splice(connIndex, 1)
          }
          
          results.connectionClosed = true
          console.log(`✅ Conexión cerrada para +${targetId}`)
          
        } catch (error) {
          results.errors.push(`Error cerrando conexión: ${error.message}`)
          console.error(`❌ Error cerrando conexión:`, error)
        }
      }

      
      if (sessionExists) {
        try {
          await fs.promises.rm(sessionPath, { recursive: true, force: true })
          results.sessionDeleted = true
          console.log(`✅ Sesión eliminada: ${sessionPath}`)
        } catch (error) {
          results.errors.push(`Error eliminando sesión: ${error.message}`)
          console.error(`❌ Error eliminando sesión:`, error)
        }
      }

      
      if (fs.existsSync(BACKUP_STORAGE)) {
        try {
          const backups = fs.readdirSync(BACKUP_STORAGE)
            .filter(file => file.includes(targetId))
          
          for (const backup of backups) {
            const backupPath = path.join(BACKUP_STORAGE, backup)
            await fs.promises.rm(backupPath, { recursive: true, force: true })
            results.backupsDeleted++
          }
          
          if (results.backupsDeleted > 0) {
            console.log(`✅ ${results.backupsDeleted} respaldos eliminados`)
          }
        } catch (error) {
          results.errors.push(`Error eliminando respaldos: ${error.message}`)
          console.error(`❌ Error eliminando respaldos:`, error)
        }
      }

      
      if (fs.existsSync(LOGS_STORAGE)) {
        try {
          const logFile = path.join(LOGS_STORAGE, `subbot_${targetId}.log`)
          if (fs.existsSync(logFile)) {
            
            const timestamp = new Date().toISOString()
            const finalEntry = `[${timestamp}] [INFO] SESSION_DELETED - Sesión eliminada por comando ${command}\n`
            fs.appendFileSync(logFile, finalEntry, 'utf8')
            results.logsDeleted = true
          }
        } catch (error) {
          results.errors.push(`Error procesando logs: ${error.message}`)
        }
      }

      
      let resultMessage = `✅ *Sesión eliminada exitosamente*\n\n`
      resultMessage += `👤 *Usuario:* +${targetId}\n\n`
      resultMessage += `📊 *Resultados:*\n`
      resultMessage += `• Conexión cerrada: ${results.connectionClosed ? '✅' : '❌'}\n`
      resultMessage += `• Sesión eliminada: ${results.sessionDeleted ? '✅' : '❌'}\n`
      resultMessage += `• Respaldos eliminados: ${results.backupsDeleted}\n`
      resultMessage += `• Logs actualizados: ${results.logsDeleted ? '✅' : '❌'}\n`
      
      if (results.errors.length > 0) {
        resultMessage += `\n⚠️ *Advertencias:*\n`
        results.errors.forEach((error, index) => {
          resultMessage += `${index + 1}. ${error}\n`
        })
      }
      
      resultMessage += `\n💡 *Próximos pasos:*\n`
      resultMessage += `• Use \`.qr\` para crear nueva sesión con QR\n`
      resultMessage += `• Use \`.code\` para crear nueva sesión con código\n`
      resultMessage += `• La nueva sesión generará un token diferente`

      await m.reply(resultMessage)

    } catch (error) {
      console.error('Error crítico eliminando sesión:', error)
      await m.reply(`❌ *Error crítico*\n\nNo se pudo completar la eliminación.\n\n*Error:* ${error.message}\n\n_Contacte al administrador si persiste el problema._`)
    }

  } catch (error) {
    console.error('Error en comando deletebot:', error)
    await m.reply(`❌ *Error del sistema*\n\n${error.message}`)
  }
}

handler.help = ['deletebot', 'deletesesion', 'delsession']
handler.tags = ['jadibot']
handler.command = /^(deletebot|deletesesion|delsession|borrarbot|eliminarbot)$/i
handler.register = true

export default handler