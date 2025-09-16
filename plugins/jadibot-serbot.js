const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let rtx = "*🌱💙 Hatsune – Miku – Bot 🌱💙 *\\n\\n💙 Conexión Sub-Bot Modo QR\\n\\n💙 Con otro celular o en la PC escanea este QR para convertirte en un Sub-Bot PERSISTENTE.\\n\\n`1` » Haga clic en los tres puntos, luego en 'Vincular un dispositivo'.\\n\\n`2` » Escanee el código QR que aparece aquí.\\n\\n🌱 *MEJORADO:* Sesión persistente con reconexión automática hasta 10 intentos."
let rtx2 = "*🌱💙 Hatsune – Miku – Bot 🌱💙 *\\n\\n💙 Conexión Sub-Bot Modo Código\\n\\n💙 Usa este Código para convertirte en un Sub-Bot PERSISTENTE.\\n\\n`1` » Haga clic en los tres puntos, luego en 'Vincular un dispositivo'.\\n\\n`2` » Presione 'Vincular con código', ingrese el código que aparecerá abajo.\\n\\n🌱 *MEJORADO:* Sesión persistente con reconexión automática hasta 10 intentos."

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!globalThis.db?.data?.settings?.[conn.user.jid]?.jadibotmd) {
    return m.reply(`💙 El Comando ${command} está desactivado temporalmente.`)
  }
  
  let user = global.db.data.users[m.sender]
  if (!user.Subs) user.Subs = 0
  
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = (who.split('@')[0])
  let pathMikuJadiBot = path.join(`./${'jadi'}/`, id)
  let pathCreds = path.join(pathMikuJadiBot, "creds.json")

  
  if (command == "deletebot" || command == "deletesesion" || command == "deletesession") {
    try {
      if (!fs.existsSync(pathMikuJadiBot)) {
        return m.reply(`❌ No tienes una sesión activa para eliminar.`)
      }
      
      
      const existingConn = global.conns.find(c => c.user?.jid?.includes(id))
      if (existingConn) {
        try {
          existingConn.ws.close()
          existingConn.ev.removeAllListeners()
        } catch (error) {
          
        }
        
        global.conns = global.conns.filter(c => c !== existingConn)
      }
      
      
      fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
      
      await m.reply(`✅ *Sesión eliminada exitosamente*\n\n📱 Número: +${id}\n🗑️ Archivos de sesión eliminados\n🔄 Ahora puedes crear una nueva sesión`)
      
    } catch (error) {
      console.error('Error eliminando sesión:', error)
      await m.reply(`❌ Error al eliminar la sesión: ${error.message}`)
    }
    return
  }
  
  let time = user.Subs + 15000
  if (new Date - user.Subs < 15000) {
    return conn.reply(m.chat, `⏱️ Espere ${msToTime(time - new Date())} antes de usar el comando.`, m)
  }

  if (command == "qr") {
    if (fs.existsSync(pathMikuJadiBot)) {
      fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
    }
    fs.mkdirSync(pathMikuJadiBot, { recursive: true })
    args?.[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
    let args2 = ["--session", `./jadi/${id}`, "--pairing-code", "--phone", "+"]
    await mikuJadiBot(pathMikuJadiBot, m, conn, args2, usedPrefix, command)
  }

  if (command == "code") {
    if (fs.existsSync(pathMikuJadiBot)) {
      fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
    }
    fs.mkdirSync(pathMikuJadiBot, { recursive: true })
    args?.[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
    let args2 = ["--session", `./jadi/${id}`, "--pairing-code", "--phone", "+"]
    await mikuJadiBot(pathMikuJadiBot, m, conn, args2, usedPrefix, command)
  }
  
  user.Subs = new Date * 1
}

const mikuJadiBot = async (pathMikuJadiBot, m, conn, args, usedPrefix, command) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let mcode = command == "code"
  let txtQR, txtCode, codeBot
  let reconnectAttempts = 0
  const maxReconnectAttempts = 10
  
  try {
    if (!Array.isArray(args)) args = []
    
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache({ stdTTL: 600, checkperiod: 120 })
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathMikuJadiBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
      msgRetry,
      msgRetryCache,
      browser: mcode ? Browsers.macOS("Safari") : Browsers.ubuntu("Chrome"),
      version: version,
      generateHighQualityLinkPreview: true,
      keepAliveIntervalMs: 15000,
      markOnlineOnConnect: true,
      syncFullHistory: false,
      fireInitQueries: false,
      shouldSyncHistoryMessage: () => false,
      connectTimeoutMs: 120000,
      defaultQueryTimeoutMs: 120000,
      emitOwnEvents: false,
      qrTimeout: 300000,
      retryRequestDelayMs: 3000,
      maxMsgRetryCount: 8,
      pairingCodeTimeout: 300000,
      transactionOpts: {
        maxCommitRetries: 15,
        delayBetweenTriesMs: 5000
      },
      getMessage: async (key) => {
        if (store) {
          const msg = await store.loadMessage(key.remoteJid, key.id)
          return msg?.message || undefined
        }
        return undefined
      }
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    sock.reconnectAttempts = 0
    sock.maxReconnectAttempts = maxReconnectAttempts
    sock.lastActivity = Date.now()
    let isInit = true

    
    const attemptReconnect = async () => {
      if (sock.reconnectAttempts < sock.maxReconnectAttempts) {
        sock.reconnectAttempts++
        console.log(chalk.yellow(`🔄 Intento de reconexión ${sock.reconnectAttempts}/${sock.maxReconnectAttempts} para ${path.basename(pathMikuJadiBot)}`))
        
        
        await new Promise(resolve => setTimeout(resolve, 5000 * sock.reconnectAttempts))
        
        try {
          
          sock = makeWASocket(connectionOptions)
          sock.reconnectAttempts = reconnectAttempts
          sock.maxReconnectAttempts = maxReconnectAttempts
          sock.lastActivity = Date.now()
          
          
          await creloadHandler(false)
          return true
        } catch (error) {
          console.error(`Error en reconexión: ${error.message}`)
          return false
        }
      }
      return false
    }

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !mcode) {
        txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 45000)
        }
        return
      }
      
      if (qr && mcode) {
        let phoneNumber = (m && m.sender) ? m.sender.split('@')[0] : ''
        
        try {
          
          let secret
          let attempts = 0
          const maxAttempts = 3
          
          while (!secret && attempts < maxAttempts) {
            try {
              secret = await sock.requestPairingCode(phoneNumber)
              if (secret) {
                secret = secret?.match(/.{1,4}/g)?.join("-") || secret
                break
              }
            } catch (err) {
              attempts++
              console.log(`Intento ${attempts} de generar código...`)
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000))
              }
            }
          }
          
          if (secret && m && conn) {
            txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
            codeBot = await m.reply(`🔑 *Código de vinculación:*\n\n\`${secret}\`\n\n⏰ *Válido por 5 minutos*\n💡 Usa este código en WhatsApp > Dispositivos vinculados > Vincular con código`)
            console.log(chalk.green(`📱 Código generado para ${phoneNumber}: ${secret}`))
          }
        } catch (error) {
          console.error('Error generando código:', error)
          if (m && conn) {
            await m.reply(`❌ Error generando código de vinculación. Intente con .qr como alternativa.\n\n*Posibles soluciones:*\n• Verifique su conexión a internet\n• Intente nuevamente en unos segundos\n• Use el comando .qr`)
          }
        }
      }
      
      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 45000)
      }
      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }) }, 45000)
      }

      const endSesion = async (loaded) => {
        if (!loaded) {
          try {
            sock.ws.close()
          } catch (error) {
            // Ignorar error
          }
          sock.ev.removeAllListeners()
          let i = global.conns.indexOf(sock)
          if (i < 0) return
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (connection === 'close') {
        console.log(chalk.yellow(`🔌 Conexión cerrada para ${path.basename(pathMikuJadiBot)}. Código: ${reason}`))
        
        
        const shouldReconnect = [
          428,  
          408, 
          440, 
          515, 
          500, 
          502, 
          503, 
          429  
        ].includes(reason)
        
        if (shouldReconnect && sock.reconnectAttempts < sock.maxReconnectAttempts) {
          console.log(chalk.cyan(`📣 Preparando reconexión automática...`))
          const reconnected = await attemptReconnect()
          if (!reconnected) {
            console.log(chalk.red(`❌ Falló la reconexión automática para ${path.basename(pathMikuJadiBot)}`))
            await endSesion(false)
          }
        } else if (reason === 401) {
          
          console.log(chalk.red(`🗑️ Sesión inválida, eliminando archivos para ${path.basename(pathMikuJadiBot)}`))
          try { 
            fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
          } catch (error) { 
            console.error(`Error eliminando sesión: ${error.message}`)
          }
          await endSesion(false)
        } else {
          console.log(chalk.gray(`⚠️ Cerrando sesión sin reconexión. Código: ${reason}`))
          await endSesion(false)
        }
      }

      if (connection == `open`) {
        sock.isInit = true
        sock.reconnectAttempts = 0 
        sock.lastActivity = Date.now()
        
        
        if (!global.conns.find(c => c.user?.jid === sock.user?.jid)) {
          global.conns.push(sock)
        }
        
        let userName = sock.authState.creds.me?.name || 'SubBot'
        let userJid = sock.authState.creds.me?.jid || `${path.basename(pathMikuJadiBot)}@s.whatsapp.net`
        
        console.log(chalk.bold.green(`✅ SubBot conectado exitosamente:`))
        console.log(chalk.cyan(`   � Usuario: ${userName}`))
        console.log(chalk.cyan(`   📱 Número: +${path.basename(pathMikuJadiBot)}`))
        console.log(chalk.cyan(`   🆔 JID: ${userJid}`))
        console.log(chalk.cyan(`   🕒 Hora: ${new Date().toLocaleString()}`))
        
        await conn.sendMessage(m.chat, { 
          text: `✅ *SubBot conectado exitosamente* 🤖\n\n` +
                `👤 *Usuario:* ${userName}\n` +
                `📱 *Número:* +${path.basename(pathMikuJadiBot)}\n` +
                `🕒 *Conectado:* ${new Date().toLocaleString()}\n` +
                `🔄 *Reconexiones automáticas:* Activadas\n` +
                `⚡ *Estado:* Sesión persistente activada\n\n` +
                `🔥 *Ahora puede usar comandos desde este dispositivo*`
        }, { quoted: m })
        
        
        setInterval(() => {
          if (sock && sock.user) {
            sock.lastActivity = Date.now()
          }
        }, 30000)
      }
    }

    const creloadHandler = async (print) => {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler.default
        if (print) console.log(chalk.redBright('🔄 Actualizando handler.js'))
      } catch (e) {
        console.error('Error cargando handler:', e)
      }
      
      
      if (!isInit) {
        try {
          sock.ev.off("messages.upsert", sock.handler)
          sock.ev.off("connection.update", sock.connectionUpdate)
          sock.ev.off("creds.update", sock.credsUpdate)
        } catch (error) {
          
        }
      }
      
      
      if (handler && handler.handler && typeof handler.handler === 'function') {
        sock.handler = handler.handler.bind(sock)
      } else {
        console.error('Handler no válido, usando función vacía')
        sock.handler = () => {}
      }
      
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds
      
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      
      isInit = false
      return true
    }

    await creloadHandler(false)

  } catch (error) {
    console.error('Error en mikuJadiBot:', error)
    if (m && conn) {
      await m.reply(`❌ Error: ${error.message}`)
    }
  }
}

function msToTime(duration) {
  let milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return hours + "h " + minutes + "m " + seconds + "s"
}

handler.help = ['qr', 'code', 'deletebot', 'deletesesion']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'deletebot', 'deletesesion', 'deletesession']

export default handler