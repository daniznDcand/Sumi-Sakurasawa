const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'


const STORAGE_BASE = process.env.STORAGE_PATH || './storage'
const SESSION_STORAGE = path.join(STORAGE_BASE, 'sessions')
const BACKUP_STORAGE = path.join(STORAGE_BASE, 'backups')
const LOGS_STORAGE = path.join(STORAGE_BASE, 'logs')


if (!fs.existsSync(STORAGE_BASE)) fs.mkdirSync(STORAGE_BASE, { recursive: true })
if (!fs.existsSync(SESSION_STORAGE)) fs.mkdirSync(SESSION_STORAGE, { recursive: true })
if (!fs.existsSync(BACKUP_STORAGE)) fs.mkdirSync(BACKUP_STORAGE, { recursive: true })
if (!fs.existsSync(LOGS_STORAGE)) fs.mkdirSync(LOGS_STORAGE, { recursive: true })


function logSubBotActivity(token, event, details = '', level = 'INFO') {
  try {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] [${level}] ${token} - ${event}: ${details}\n`
    const logFile = path.join(LOGS_STORAGE, `subbot_${token.split('_')[1] || 'unknown'}.log`)
    
    fs.appendFileSync(logFile, logEntry, 'utf8')
    console.log(`[SubBot-${token.substring(0, 15)}...] ${event}: ${details}`)
    
    
    const stats = fs.statSync(logFile)
    if (stats.size > 2 * 1024 * 1024) {
      const lines = fs.readFileSync(logFile, 'utf8').split('\n')
      const reducedLog = lines.slice(-2000).join('\n')
      fs.writeFileSync(logFile, reducedLog, 'utf8')
    }
  } catch (error) {
    console.error('Error escribiendo log de SubBot:', error)
  }
}


function getConnectionStats() {
  const stats = {
    totalConnections: global.conns.length,
    activeConnections: global.conns.filter(conn => conn.user).length,
    tokensActive: global.conns.filter(conn => conn.userToken).map(conn => conn.userToken.substring(0, 15) + '...'),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  }
  
  
  const currentHour = new Date().getHours()
  if (!global.lastStatsHour || global.lastStatsHour !== currentHour) {
    global.lastStatsHour = currentHour
    logSubBotActivity('SYSTEM', 'CONNECTION_STATS', JSON.stringify(stats), 'INFO')
  }
  
  return stats
}

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

let rtx = "*🌱💙 Hatsune – Miku – Bot 🌱💙 *\n\n💙 Conexión Sub-Bot Modo QR\n\n💙 Con otro celular o en la PC escanea este QR para convertirte en un Sub-Bot Temporal.\n\n`1` » Haga clic en los tres puntos, luego en 'Vincular un dispositivo'.\n\n`2` » Escanee el código QR que aparece aquí.\n\n🌱 Recuerda que el Sub-Bot es temporal y se cerrará si cierras WhatsApp o desvinculas el dispositivo."
let rtx2 = "*🌱💙 Hatsune – Miku – Bot 🌱💙 *\n\n💙 Conexión Sub-Bot Modo Código\n\n💙 Usa este Código para convertirte en un Sub-Bot Temporal.\n\n`1` » Haga clic en los tres puntos, luego en 'Vincular un dispositivo'.\n\n`2` » Presione 'Vincular con código', ingrese el siguiente código:\n\n🌱 Recuerda que el Sub-Bot es temporal y se cerrará si cierras WhatsApp o desvinculas el dispositivo."

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mikuJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!globalThis.db?.data?.settings?.[conn.user.jid]?.jadibotmd) {
    return m.reply(`💙 El Comando ${command} está desactivado temporalmente.`)
  }
  
  
  let user = global.db.data.users[m.sender]
  if (!user.Subs) user.Subs = 0
  if (!user.subBotToken) user.subBotToken = null
  if (!user.subBotConnected) user.subBotConnected = false
  if (!user.subBotLastConnect) user.subBotLastConnect = 0
  if (!user.subBotReconnects) user.subBotReconnects = 0
  
  
  let time = user.Subs + 30000
  if (new Date - user.Subs < 30000) return conn.reply(m.chat, `⏱️ Debes esperar ${msToTime(time - new Date())} para volver a vincular un Sub-Bot.`, m)

  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length
  if (subBotsCount === 20) {
    return m.reply(`🚫 No se han encontrado espacios para Sub-Bots disponibles.`)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = (who.split('@')[0])

  // Usar almacenamiento del servidor optimizado
  let pathMikuJadiBot = path.join(SESSION_STORAGE, id)
  if (!fs.existsSync(pathMikuJadiBot)){
    fs.mkdirSync(pathMikuJadiBot, { recursive: true })
  }

  // Crear backup de sesión si existe
  await backupSession(id)

  
  if (!user.subBotToken) {
    user.subBotToken = generateSubBotToken(id)
  }

  mikuJBOptions.pathMikuJadiBot = pathMikuJadiBot
  mikuJBOptions.m = m
  mikuJBOptions.conn = conn
  mikuJBOptions.args = args
  mikuJBOptions.usedPrefix = usedPrefix
  mikuJBOptions.command = command
  mikuJBOptions.fromCommand = true
  mikuJBOptions.userToken = user.subBotToken

  await mikuJadiBot(mikuJBOptions)

  user.Subs = new Date * 1
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function mikuJadiBot(options) {
  
  let { pathMikuJadiBot, m, conn, args, usedPrefix, command, userToken } = options || {}

  if (command === 'code') {
    command = 'qr';
    if (!Array.isArray(args)) args = []
    args.unshift('code')
  }
  const mcode = args && (args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false)

  let txtCode, codeBot, txtQR
  let isReconnecting = false

  if (mcode) {
    args[0] = args[0]?.replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] == "") args[0] = undefined
  }

  const pathCreds = path.join(pathMikuJadiBot, "creds.json")
  const pathToken = path.join(pathMikuJadiBot, "token.json")
  const pathMeta = path.join(pathMikuJadiBot, "metadata.json")
  const pathConnectionLog = path.join(LOGS_STORAGE, `${path.basename(pathMikuJadiBot)}.log`)
  
  if (!fs.existsSync(pathMikuJadiBot)){
    fs.mkdirSync(pathMikuJadiBot, { recursive: true })
  }

  
  const sessionMetadata = {
    userId: m.sender,
    created: Date.now(),
    lastAccess: Date.now(),
    reconnects: 0,
    totalUptime: 0,
    version: '2.0',
    persistent: true
  }
  
  fs.writeFileSync(pathMeta, JSON.stringify(sessionMetadata, null, 2))


  if (userToken) {
    const tokenData = {
      token: userToken, 
      created: Date.now(),
      userId: m.sender,
      reconnects: 0,
      lastActivity: Date.now(),
      persistent: true,
      serverStorage: true,
      backupPath: path.join(BACKUP_STORAGE, `${path.basename(pathMikuJadiBot)}.backup`)
    }
    fs.writeFileSync(pathToken, JSON.stringify(tokenData, null, 2), 'utf8')
    
    
    logConnection(path.basename(pathMikuJadiBot), 'TOKEN_CREATED', { userToken, userId: m.sender })
  }

  
  if (fs.existsSync(pathCreds)) {
    try {
      const credsData = JSON.parse(fs.readFileSync(pathCreds, 'utf8'))
      if (credsData && credsData.me) {
        isReconnecting = true
        console.log(`🔄 Detectada sesión existente para +${path.basename(pathMikuJadiBot)}, intentando reconectar...`)
      }
    } catch (error) {
      console.log(`⚠️ Error leyendo credenciales existentes: ${error.message}`)
    }
  }

  try {
    args?.[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    if (m && conn) conn.reply(m.chat, `⛔ Use correctamente el comando » ${usedPrefix + command} code`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, `base64`)

    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathMikuJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
      msgRetry,
      msgRetryCache,
      browser: mcode ? Browsers.macOS("Chrome") : Browsers.macOS("Desktop"),
      version: version,
      generateHighQualityLinkPreview: true,
      keepAliveIntervalMs: 20000,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      fireInitQueries: true,
      shouldSyncHistoryMessage: () => false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      emitOwnEvents: false,
      qrTimeout: 60000,
      retryRequestDelayMs: 2000,
      maxMsgRetryCount: 5
    };

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    sock.userToken = userToken
    sock.isReconnecting = isReconnecting
    sock.reconnectAttempts = 0
    sock.maxReconnectAttempts = 50
    sock.reconnectInterval = 10000
    sock.lastHeartbeat = Date.now()
    sock.connectionRetryDelay = 5000
    sock.persistentReconnect = true
    sock.sessionPath = pathMikuJadiBot
    sock.backupPath = path.join(BACKUP_STORAGE, `${path.basename(pathMikuJadiBot)}.backup`)
    sock.logPath = pathConnectionLog 
    
   
    if (userToken) {
      logSubBotActivity(userToken, 'CONNECTION_START', `Iniciando conexión desde ${pathMikuJadiBot}`)
    }
    
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      
      const attemptReconnect = async () => {
        if (sock.persistentReconnect && sock.reconnectAttempts < sock.maxReconnectAttempts) {
          sock.reconnectAttempts++
          const delay = Math.min(sock.reconnectInterval * Math.pow(2, sock.reconnectAttempts - 1), 300000)
          console.log(chalk.yellow(`🔄 Intento de reconexión ${sock.reconnectAttempts}/${sock.maxReconnectAttempts} para +${path.basename(pathMikuJadiBot)} (delay: ${delay/1000}s)`))
          
          
          if (sock.userToken) {
            logSubBotActivity(sock.userToken, 'RECONNECT_ATTEMPT', `Intento ${sock.reconnectAttempts}/${sock.maxReconnectAttempts}, delay: ${delay/1000}s`, 'WARN')
          }
          
          setTimeout(async () => {
            try {
              await backupSession(path.basename(pathMikuJadiBot))
              if (sock.userToken) {
                logSubBotActivity(sock.userToken, 'BACKUP_CREATED', 'Respaldo creado antes de reconexión')
              }
              await creloadHandler(true)
            } catch (error) {
              console.error(`❌ Error en reconexión: ${error.message}`)
              if (sock.userToken) {
                logSubBotActivity(sock.userToken, 'RECONNECT_ERROR', `${error.message} (intento ${sock.reconnectAttempts})`, 'ERROR')
              }
              if (sock.reconnectAttempts >= sock.maxReconnectAttempts) {
                console.log(chalk.red(`❌ Máximo de intentos alcanzado para +${path.basename(pathMikuJadiBot)}, manteniendo token para reconexión manual`))
                if (sock.userToken) {
                  logSubBotActivity(sock.userToken, 'MAX_RECONNECTS_REACHED', 'Conexión suspendida, token preservado para reconexión manual', 'ERROR')
                }
                sock.persistentReconnect = false
                await endSesion(false)
              } else {
                attemptReconnect()
              }
            }
          }, delay)
        } else if (!sock.persistentReconnect) {
          console.log(chalk.red(`🔄 Reconexión deshabilitada para +${path.basename(pathMikuJadiBot)}, mantener token para reconexión manual`))
          await endSesion(false)
        }
      }

      if (qr && !mcode && !sock.isReconnecting) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
        } else {
          return
        }
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
        }
        return
      }
      if (qr && mcode && !sock.isReconnecting) {
        let phoneNumber = (m && m.sender) ? m.sender.split('@')[0] : '';
        let secret = await sock.requestPairingCode(phoneNumber)
        secret = secret?.match(/.{1,4}/g)?.join("-")
        if (m && conn) {
          txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
          codeBot = await m.reply(secret || '')
        }
        console.log(secret)
      }
      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
      }
      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
      }

      const endSesion = async (loaded) => {
        if (!loaded) {
          try {
            sock.ws.close()
          } catch {}
          sock.ev.removeAllListeners()
          let i = global.conns.indexOf(sock)
          if (i < 0) return
          delete global.conns[i]
          global.conns.splice(i, 1)
          
          
          if (m?.sender && global.db?.data?.users?.[m.sender]) {
            global.db.data.users[m.sender].subBotConnected = false
          }
        }
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (connection === 'close') {
        if (reason === 428) {
          console.log(chalk.bold.cyanBright(`\n[💙] La conexión (+${path.basename(pathMikuJadiBot)}) fue cerrada inesperadamente. Intentando reconectar...\n`))
          await attemptReconnect()
        }
        else if (reason === 408) {
          console.log(chalk.bold.cyanBright(`\n[💙] La conexión (+${path.basename(pathMikuJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...\n`))
          await attemptReconnect()
        }
        else if (reason === 440) {
          console.log(chalk.bold.cyanBright(`\n[💙] La conexión (+${path.basename(pathMikuJadiBot)}) fue reemplazada por otra sesión activa.\n`))
          try {
            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathMikuJadiBot)}@s.whatsapp.net`, {text : '*🔄 SESIÓN REEMPLAZADA*\n\n> *Se detectó una nueva sesión activa. Cierre la sesión duplicada para continuar.*'}, { quoted: m }) : null
          } catch (error) {
            console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${path.basename(pathMikuJadiBot)}`))
          }
          await endSesion(false)
        }
        else if (reason == 405 || reason == 401) {
          console.log(chalk.bold.cyanBright(`\n[💙] La sesión (+${path.basename(pathMikuJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n`))
          try {
            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathMikuJadiBot)}@s.whatsapp.net`, {text : '*⚠️ SESIÓN EXPIRADA*\n\n> *Sus credenciales han expirado. Use su token para reconectar:*\n> `' + (sock.userToken || 'Token no disponible') + '`'}, { quoted: m }) : null
          } catch (error) {
            console.error(chalk.bold.yellow(`Error 405 no se pudo enviar mensaje a: +${path.basename(pathMikuJadiBot)}`))
          }
          
          await endSesion(false)
        }
        else if (reason === 500) {
          console.log(chalk.bold.cyanBright(`\n[💙] Conexión perdida en la sesión (+${path.basename(pathMikuJadiBot)}). Intentando reconectar...\n`))
          await attemptReconnect()
        }
        else if (reason === 515) {
          console.log(chalk.bold.cyanBright(`\n[💙] Reinicio automático para la sesión (+${path.basename(pathMikuJadiBot)}).\n`))
          await attemptReconnect()
        }
        else if (reason === 403) {
          console.log(chalk.bold.cyanBright(`\n[💙] Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathMikuJadiBot)}).\n`))
          fs.rmdirSync(pathMikuJadiBot, { recursive: true })
          await endSesion(false)
        }
      }

      if (global.db?.data == null) loadDatabase()
      if (connection == `open`) {
        if (!global.db.data?.users) loadDatabase()
        await joinChannels(conn)
        let userName, userJid
        userName = sock.authState.creds.me?.name || 'Anónimo'
        userJid = sock.authState.creds.me?.jid || `${path.basename(pathMikuJadiBot)}@s.whatsapp.net`
        console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathMikuJadiBot)}) conectado exitosamente. [Hatsune Miku Bot]\n│\n❒⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺⸺❒`))
        sock.isInit = true
        sock.reconnectAttempts = 0 
        global.conns.push(sock)
        
        
        if (sock.userToken) {
          logSubBotActivity(sock.userToken, 'CONNECTION_SUCCESS', `Usuario: ${userName}, JID: ${userJid}`, 'INFO')
          
          const stats = getConnectionStats()
          logSubBotActivity(sock.userToken, 'CONNECTION_STATS', `Total: ${stats.totalConnections}, Activas: ${stats.activeConnections}`, 'INFO')
        }
        
        if (m?.sender && global.db?.data?.users?.[m.sender]) {
          global.db.data.users[m.sender].subBotConnected = true
          global.db.data.users[m.sender].subBotLastConnect = Date.now()
        }
        
       
        if (m?.chat && conn && (!sock.isReconnecting || sock.reconnectAttempts === 0)) {
          const welcomeMessage = args?.[0] ? 
            `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : 
            sock.isReconnecting ? 
              `@${m.sender.split('@')[0]}, reconectado exitosamente 🔄` :
              `@${m.sender.split('@')[0]}, bienvenido al sistema de Sub-Bots 💙\n\n*Token de reconexión:* \`${sock.userToken || 'No disponible'}\`\n\n> _Guarda este token para reconectar automáticamente en el futuro._`
          
          await conn.sendMessage(
            m.chat,
            { text: welcomeMessage },
            { quoted: m }
          )
        }
      }
    }

    
    setInterval(async () => {
      if (!sock.user) {
        console.log(chalk.yellow(`⚠️ Usuario no encontrado para +${path.basename(pathMikuJadiBot)}, limpiando conexión...`))
        try { sock.ws.close() } catch (e) { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i < 0) return
        delete global.conns[i]
        global.conns.splice(i, 1)
        
        if (m?.sender && global.db?.data?.users?.[m.sender]) {
          global.db.data.users[m.sender].subBotConnected = false
        }
      } else {
        sock.lastHeartbeat = Date.now()
        try {
          if (sock.ws.socket && sock.ws.socket.readyState === ws.CLOSED) {
            console.log(chalk.yellow(`💓 Heartbeat detectó conexión cerrada para +${path.basename(pathMikuJadiBot)}, intentando reconectar...`))
            await creloadHandler(true).catch(console.error)
          }
          
          if (fs.existsSync(pathToken)) {
            const updatedTokenData = {
              token: sock.userToken, 
              created: Date.now(),
              userId: m.sender,
              reconnects: sock.reconnectAttempts,
              lastActivity: Date.now(),
              persistent: true,
              serverStorage: true,
              totalUptime: sock.totalUptime || 0,
              backupPath: sock.backupPath
            }
            fs.writeFileSync(pathToken, JSON.stringify(updatedTokenData, null, 2), 'utf8')
            
            
            if (fs.existsSync(pathMeta)) {
              const metadata = JSON.parse(fs.readFileSync(pathMeta, 'utf8'))
              metadata.lastAccess = Date.now()
              metadata.reconnects = sock.reconnectAttempts
              metadata.totalUptime = (metadata.totalUptime || 0) + 15000
              fs.writeFileSync(pathMeta, JSON.stringify(metadata, null, 2))
            }
          }
        } catch (error) {
          console.error(`❌ Error en heartbeat: ${error.message}`)
          if (sock.persistentReconnect) {
            console.log(chalk.yellow(`🔄 Heartbeat error, intentando reconectar...`))
            await attemptReconnect()
          }
        }
      }
    }, 15000) 

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('⚠️ Nuevo error: ', e)
      }
      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        sock.userToken = userToken
        sock.isReconnecting = true
        sock.reconnectAttempts = (sock.reconnectAttempts || 0)
        sock.maxReconnectAttempts = 50
        sock.reconnectInterval = 10000
        sock.persistentReconnect = true
        sock.lastHeartbeat = Date.now()
        isInit = true
      }
      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      isInit = false
      return true
    }
    creloadHandler(false)
  })
}


function generateSubBotToken(userId) {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  const hash = Buffer.from(`${userId}-${timestamp}-${random}`).toString('base64')
  return `SUBBOT_${hash.replace(/[+/=]/g, '').substring(0, 20)}`
}


function validateSubBotToken(token, userId) {
  if (!token || !token.startsWith('SUBBOT_')) return false
  
  try {
    const pathMikuJadiBot = path.join(`./${'jadi'}/`, userId)
    const pathToken = path.join(pathMikuJadiBot, "token.json")
    
    if (fs.existsSync(pathToken)) {
      const tokenData = JSON.parse(fs.readFileSync(pathToken, 'utf8'))
      return tokenData.token === token && tokenData.userId === `${userId}@s.whatsapp.net`
    }
  } catch (error) {
    console.error(`Error validando token: ${error.message}`)
  }
  
  return false
}


async function cleanupInactiveSessions() {
  try {
    const sessions = fs.readdirSync(SESSION_STORAGE)
    const currentTime = Date.now()
    const maxInactiveTime = 14 * 24 * 60 * 60 * 1000 
    
    for (const session of sessions) {
      const sessionPath = path.join(SESSION_STORAGE, session)
      const tokenPath = path.join(sessionPath, "token.json")
      const metaPath = path.join(sessionPath, "metadata.json")
      
      if (fs.existsSync(tokenPath)) {
        try {
          const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
          const lastActivity = tokenData.lastActivity || tokenData.created
          
          if (currentTime - lastActivity > maxInactiveTime) {
            console.log(chalk.yellow(`🧹 Limpiando sesión inactiva después de 14 días: ${session}`))
            
            
            await backupSession(session, true)
            
            
            fs.rmSync(sessionPath, { recursive: true, force: true })
            
            
            logConnection(session, 'SESSION_CLEANUP', { reason: 'inactive', days: 14 })
          }
        } catch (error) {
          console.error(`Error procesando sesión ${session}: ${error.message}`)
        }
      }
    }
  } catch (error) {
    console.error(`Error en limpieza de sesiones: ${error.message}`)
  }
}


setInterval(cleanupInactiveSessions, 60 * 60 * 1000)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}


async function backupSession(sessionId, isFinal = false) {
  try {
    const sessionPath = path.join(SESSION_STORAGE, sessionId)
    const backupPath = path.join(BACKUP_STORAGE, `${sessionId}${isFinal ? '_final' : ''}_${Date.now()}.backup`)
    
    if (fs.existsSync(sessionPath)) {
      
      const backupData = {
        sessionId,
        timestamp: Date.now(),
        isFinal,
        files: {}
      }
      
      const files = ['creds.json', 'token.json', 'metadata.json']
      for (const file of files) {
        const filePath = path.join(sessionPath, file)
        if (fs.existsSync(filePath)) {
          backupData.files[file] = fs.readFileSync(filePath, 'utf8')
        }
      }
      
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2))
      console.log(chalk.green(`💾 Backup creado: ${path.basename(backupPath)}`))
      
     
      cleanupOldBackups(sessionId)
    }
  } catch (error) {
    console.error(`Error creando backup para ${sessionId}: ${error.message}`)
  }
}


function cleanupOldBackups(sessionId) {
  try {
    const backups = fs.readdirSync(BACKUP_STORAGE)
      .filter(file => file.startsWith(sessionId) && file.endsWith('.backup'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_STORAGE, file),
        time: fs.statSync(path.join(BACKUP_STORAGE, file)).mtime
      }))
      .sort((a, b) => b.time - a.time)
    
    
    if (backups.length > 5) {
      for (let i = 5; i < backups.length; i++) {
        fs.unlinkSync(backups[i].path)
      }
    }
  } catch (error) {
    console.error(`Error limpiando backups: ${error.message}`)
  }
}


function logConnection(sessionId, event, data = {}) {
  try {
    const logPath = path.join(LOGS_STORAGE, `${sessionId}.log`)
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      sessionId,
      ...data
    }
    
    const logLine = JSON.stringify(logEntry) + '\n'
    fs.appendFileSync(logPath, logLine)
    
    
    cleanupLogs(logPath)
  } catch (error) {
    console.error(`Error escribiendo log: ${error.message}`)
  }
}


function cleanupLogs(logPath) {
  try {
    if (fs.existsSync(logPath)) {
      const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean)
      if (lines.length > 1000) {
        const recentLines = lines.slice(-1000)
        fs.writeFileSync(logPath, recentLines.join('\n') + '\n')
      }
    }
  } catch (error) {
    console.error(`Error limpiando logs: ${error.message}`)
  }
}


async function restoreFromBackup(sessionId) {
  try {
    const backups = fs.readdirSync(BACKUP_STORAGE)
      .filter(file => file.startsWith(sessionId) && file.endsWith('.backup'))
      .sort((a, b) => {
        const timeA = parseInt(a.split('_').pop().replace('.backup', ''))
        const timeB = parseInt(b.split('_').pop().replace('.backup', ''))
        return timeB - timeA
      })
    
    if (backups.length > 0) {
      const latestBackup = path.join(BACKUP_STORAGE, backups[0])
      const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'))
      const sessionPath = path.join(SESSION_STORAGE, sessionId)
      
      if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath, { recursive: true })
      }
      
      
      for (const [fileName, content] of Object.entries(backupData.files)) {
        fs.writeFileSync(path.join(sessionPath, fileName), content)
      }
      
      console.log(chalk.green(`🔄 Sesión restaurada desde backup: ${sessionId}`))
      logConnection(sessionId, 'SESSION_RESTORED', { backupFile: backups[0] })
      return true
    }
  } catch (error) {
    console.error(`Error restaurando backup para ${sessionId}: ${error.message}`)
  }
  return false
}
