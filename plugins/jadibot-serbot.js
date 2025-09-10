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

  let pathMikuJadiBot = path.join(`./${'jadi'}/`, id)
  if (!fs.existsSync(pathMikuJadiBot)){
    fs.mkdirSync(pathMikuJadiBot, { recursive: true })
  }

  
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
  
  if (!fs.existsSync(pathMikuJadiBot)){
    fs.mkdirSync(pathMikuJadiBot, { recursive: true })
  }


  if (userToken) {
    fs.writeFileSync(pathToken, JSON.stringify({ 
      token: userToken, 
      created: Date.now(),
      userId: m.sender,
      reconnects: 0
    }), 'utf8')
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
     
      keepAliveIntervalMs: 60000, 
      markOnlineOnConnect: false,
      syncFullHistory: false,
      fireInitQueries: true,
      shouldSyncHistoryMessage: () => false
    };

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    sock.userToken = userToken
    sock.isReconnecting = isReconnecting
    sock.reconnectAttempts = 0
    sock.maxReconnectAttempts = 5
    sock.reconnectInterval = 5000 
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      
      const attemptReconnect = async () => {
        if (sock.reconnectAttempts < sock.maxReconnectAttempts) {
          sock.reconnectAttempts++
          console.log(chalk.yellow(`🔄 Intento de reconexión ${sock.reconnectAttempts}/${sock.maxReconnectAttempts} para +${path.basename(pathMikuJadiBot)}`))
          
          setTimeout(async () => {
            try {
              await creloadHandler(true)
            } catch (error) {
              console.error(`❌ Error en reconexión: ${error.message}`)
              if (sock.reconnectAttempts >= sock.maxReconnectAttempts) {
                console.log(chalk.red(`❌ Máximo de intentos alcanzado para +${path.basename(pathMikuJadiBot)}`))
                await endSesion(false)
              } else {
                attemptReconnect()
              }
            }
          }, sock.reconnectInterval * sock.reconnectAttempts) 
        } else {
          console.log(chalk.red(`❌ Demasiados intentos de reconexión para +${path.basename(pathMikuJadiBot)}, cerrando sesión`))
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
        
        try {
          if (sock.ws.socket && sock.ws.socket.readyState === ws.CLOSED) {
            console.log(chalk.yellow(`💓 Heartbeat detectó conexión cerrada para +${path.basename(pathMikuJadiBot)}, intentando reconectar...`))
            await creloadHandler(true).catch(console.error)
          }
        } catch (error) {
          console.error(`❌ Error en heartbeat: ${error.message}`)
        }
      }
    }, 30000) 

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
        sock.maxReconnectAttempts = 5
        sock.reconnectInterval = 5000
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
    const jadiDir = `./${'jadi'}/`
    if (!fs.existsSync(jadiDir)) return
    
    const sessions = fs.readdirSync(jadiDir)
    const currentTime = Date.now()
    const maxInactiveTime = 24 * 60 * 60 * 1000 
    
    for (const session of sessions) {
      const sessionPath = path.join(jadiDir, session)
      const tokenPath = path.join(sessionPath, "token.json")
      
      if (fs.existsSync(tokenPath)) {
        try {
          const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
          const lastActivity = tokenData.lastActivity || tokenData.created
          
          if (currentTime - lastActivity > maxInactiveTime) {
            console.log(chalk.yellow(`🧹 Limpiando sesión inactiva: ${session}`))
            fs.rmSync(sessionPath, { recursive: true, force: true })
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
