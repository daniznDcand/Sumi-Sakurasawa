import fs from "fs"
import path from "path"
import { mikuJadiBot } from './jadibot-serbot.js'

// Usar el mismo sistema de almacenamiento
const STORAGE_BASE = process.env.STORAGE_PATH || './storage'
const SESSION_STORAGE = path.join(STORAGE_BASE, 'sessions')

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db?.data?.settings?.[conn.user.jid]?.jadibotmd) {
    return m.reply(`💙 El comando ${command} está desactivado temporalmente.`)
  }

  if (!args[0]) {
    return m.reply(`💙 *Uso del comando:*\n\n> ${usedPrefix + command} <token>\n\n*Ejemplo:*\n> ${usedPrefix + command} SUBBOT_ABC123DEF456\n\n_Use su token personal de SubBot para reconectar._`)
  }

  const token = args[0].trim()
  
  // Validar formato del token
  if (!token.startsWith('SUBBOT_') || token.length < 15) {
    return m.reply(`❌ *Token inválido*\n\nEl token debe:\n• Empezar con "SUBBOT_"\n• Tener al menos 15 caracteres\n\n_Verifique que haya copiado el token completo._`)
  }

  let user = global.db.data.users[m.sender]
  if (!user.Subs) user.Subs = 0
  
  // Cooldown de 15 segundos para reconexión
  let time = user.Subs + 15000
  if (new Date - user.Subs < 15000) {
    return conn.reply(m.chat, `⏱️ Espere ${msToTime(time - new Date())} antes de reconectar.`, m)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = (who.split('@')[0])
  let pathMikuJadiBot = path.join(SESSION_STORAGE, id)
  let pathToken = path.join(pathMikuJadiBot, "token.json")
  
  // Verificar si existe token almacenado y si coincide
  if (fs.existsSync(pathToken)) {
    try {
      const tokenData = JSON.parse(fs.readFileSync(pathToken, 'utf8'))
      if (tokenData.token !== token) {
        return m.reply(`❌ *Token incorrecto*\n\nEl token proporcionado no coincide con el registrado para este usuario.\n\n_Verifique el token o solicite uno nuevo._`)
      }
      
      // Actualizar datos del token para reconexión
      tokenData.lastActivity = Date.now()
      tokenData.reconnects = (tokenData.reconnects || 0) + 1
      fs.writeFileSync(pathToken, JSON.stringify(tokenData, null, 2), 'utf8')
      
    } catch (error) {
      return m.reply(`❌ *Error del sistema*\n\nNo se pudo verificar el token. Intente más tarde.\n\n_Error: ${error.message}_`)
    }
  } else {
    return m.reply(`❌ *No hay sesión registrada*\n\nNo se encontró una sesión previa para este token.\n\n_Use el comando ${usedPrefix}qr o ${usedPrefix}code para crear una nueva sesión._`)
  }

  // Verificar si ya hay una conexión activa
  const existingConn = global.conns.find(conn => 
    conn.user && conn.userToken === token
  )
  
  if (existingConn) {
    return m.reply(`⚠️ *SubBot ya conectado*\n\nYa existe una conexión activa con este token.\n\n_Si no puede acceder, espere unos minutos y reintente._`)
  }

  await m.reply(`🔄 *Reconectando SubBot...*\n\nUsando token: \`${token.substring(0, 15)}...\`\n📁 *Almacenamiento del servidor:* Activo\n\n_Por favor espere mientras se establece la conexión._`)

  try {
    // Configurar opciones para reconexión
    const mikuJBOptions = {
      pathMikuJadiBot: pathMikuJadiBot,
      m: m,
      conn: conn,
      args: [],
      usedPrefix: usedPrefix,
      command: 'qr',
      fromCommand: true,
      userToken: token,
      isReconnect: true
    }

    await mikuJadiBot(mikuJBOptions)
    user.Subs = new Date * 1
    
  } catch (error) {
    console.error(`Error en reconexión: ${error.message}`)
    await m.reply(`❌ *Error de reconexión*\n\nNo se pudo reconectar el SubBot.\n\n_Error: ${error.message}_\n\nIntente nuevamente en unos minutos.`)
  }
}

handler.help = ['reconnect']
handler.tags = ['serbot']
handler.command = ['reconnect', 'token', 'reconectar']

export default handler

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