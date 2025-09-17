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
let rtx = "*🌱💙 Hatsune – Miku – Bot 🌱💙*\n\n💙 Conexión Sub-Bot Modo QR\n\n💙 Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* PERSISTENTE.\n\n`1` » Haga clic en los tres puntos, luego en 'Vincular un dispositivo'.\n\n`2` » Escanee el código QR que aparece aquí.\n\n🌱 *MEJORADO:* Sesión persistente con reconexión automática hasta 10 intentos."
let rtx2 = "*🌱💙 Hatsune – Miku – Bot 🌱💙*\n\n💙 Conexión Sub-Bot Modo Código\n\n💙 Usa este Código para convertirte en un *Sub-Bot* PERSISTENTE.\n\n`1` » Haga clic en los tres puntos, luego en 'Vincular un dispositivo'.\n\n`2` » Presione 'Vincular con código', ingrese el código que aparecerá abajo.\n\n🌱 *MEJORADO:* Sesión persistente con reconexión automática hasta 10 intentos."

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mikuJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []


const NOTIFY_COOLDOWN = 10 * 60 * 1000 
function shouldNotifyUser(jid) {
  try {
    if (!global.db || !global.db.data) return true
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[jid]) global.db.data.users[jid] = {}
    const last = global.db.data.users[jid].subBotLastNotify || 0
    if (Date.now() - last > NOTIFY_COOLDOWN) {
      global.db.data.users[jid].subBotLastNotify = Date.now()
      return true
    }
    return false
  } catch (e) {
    console.error('Error en shouldNotifyUser:', e)
    return true
  }
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
return m.reply(`💙 El Comando *${command}* está desactivado temporalmente.`)
}
let time = global.db.data.users[m.sender].Subs + 120000
if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `⏱️ Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount === 20) {
return m.reply(`💙 No se han encontrado espacios para *Sub-Bots* disponibles.`)
}
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathMikuJadiBot = path.join(`./${'jadi'}/`, id)
if (!fs.existsSync(pathMikuJadiBot)){
fs.mkdirSync(pathMikuJadiBot, { recursive: true })
}
mikuJBOptions.pathMikuJadiBot = pathMikuJadiBot
mikuJBOptions.m = m
mikuJBOptions.conn = conn
mikuJBOptions.args = args
mikuJBOptions.usedPrefix = usedPrefix
mikuJBOptions.command = command
mikuJBOptions.fromCommand = true
mikuJadiBot(mikuJBOptions)
global.db.data.users[m.sender].Subs = new Date * 1
} 
handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function mikuJadiBot(options) {
let { pathMikuJadiBot, m, conn, args, usedPrefix, command } = options
if (command === 'code') {
command = 'qr'; 
args.unshift('code')}
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
let reconnectAttempts = 0
const maxReconnectAttempts = 10
let sessionStartTime = Date.now()

if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathMikuJadiBot, "creds.json")
if (!fs.existsSync(pathMikuJadiBot)){
fs.mkdirSync(pathMikuJadiBot, { recursive: true })}
try {
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
} catch {
conn.reply(m.chat, `💙 Use correctamente el comando » ${usedPrefix + command} code`, m)
return
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)

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
};

let sock = makeWASocket(connectionOptions)
sock.isInit = false
sock.well = false  
sock.reconnectAttempts = 0
sock.maxReconnectAttempts = maxReconnectAttempts
sock.lastActivity = Date.now()
sock.sessionStartTime = sessionStartTime
sock.subreloadHandler = (reload) => creloadHandler(reload)


sock.prefix = global.prefix || '#'
sock.chats = sock.chats || {}
sock.contacts = sock.contacts || {}
sock.blocklist = sock.blocklist || []

console.log('🔧 SubBot socket creado con propiedades básicas')
let isInit = true


const attemptReconnect = async () => {
if (sock.reconnectAttempts < sock.maxReconnectAttempts) {
sock.reconnectAttempts++
console.log(chalk.yellow(`🔄 Intento de reconexión ${sock.reconnectAttempts}/${sock.maxReconnectAttempts} para +${path.basename(pathMikuJadiBot)}`))


await new Promise(resolve => setTimeout(resolve, 5000 * sock.reconnectAttempts))

try {

try {
sock.ev.removeAllListeners()
sock.ws.close()
} catch (e) {

}


sock = makeWASocket(connectionOptions)
sock.reconnectAttempts = reconnectAttempts
sock.maxReconnectAttempts = maxReconnectAttempts
sock.lastActivity = Date.now()
sock.sessionStartTime = sessionStartTime
sock.isInit = false
sock.well = false  


sock.prefix = global.prefix || '#'
sock.chats = sock.chats || {}
sock.contacts = sock.contacts || {}
sock.blocklist = sock.blocklist || []

console.log('🔄 SubBot socket recreado en reconexión con propiedades')


sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)



console.log('🔍 Reconexión - Verificando handler:', {
  handlerModule: !!handlerModule,
  hasHandler: !!(handlerModule && handlerModule.handler),
  handlerType: typeof (handlerModule && handlerModule.handler)
})


if (!(handlerModule && handlerModule.handler && typeof handlerModule.handler === 'function')) {
  for (let i = 0; i < 3; i++) {
    try {
      const H = await import(`../handler.js?update=${Date.now()}`)
      if (H && H.handler && typeof H.handler === 'function') {
        handlerModule = H
        break
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
}

if (handlerModule && handlerModule.handler && typeof handlerModule.handler === 'function') {
  sock.handler = handlerModule.handler.bind(sock)
  try { sock.ev.removeAllListeners('messages.upsert') } catch (e) {}
  sock.ev.on("messages.upsert", sock.handler)
  console.log('✅ Handler reconfigurado en reconexión')
}

return true
} catch (error) {
console.error(`❌ Error en reconexión: ${error.message}`)
return false
}
}
return false
}

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false


if (qr && !mcode) {
if (m?.chat) {
txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
} else {
return 
}
if (txtQR && txtQR.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 45000)
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
console.log(`🔄 Intento ${attempts} de generar código...`)
if (attempts < maxAttempts) {
await new Promise(resolve => setTimeout(resolve, 2000))
}
}
}

if (secret && m && conn) {

txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })


codeBot = await conn.sendMessage(m.chat, {text: secret}, { quoted: m })


await conn.sendMessage(m.chat, {
text: `⏰ *Código válido por 5 minutos*\n\n💡 *Instrucciones:*\n` +
      `1️⃣ Abre WhatsApp en tu dispositivo\n` +
      `2️⃣ Ve a *Dispositivos vinculados*\n` +
      `3️⃣ Toca *Vincular con código*\n` +
      `4️⃣ Copia y pega: \`${secret}\`\n\n` +
      `🤖 *Una vez conectado, podrás usar todos los comandos*`
}, { quoted: m })

console.log(chalk.green(`📱 Código generado para +${phoneNumber}: ${secret}`))
}
} catch (error) {
console.error('❌ Error generando código:', error)
if (m && conn) {
await m.reply(`❌ Error generando código de vinculación. Intente con .qr como alternativa.\n\n*Posibles soluciones:*\n• Verifique su conexión a internet\n• Intente nuevamente en unos segundos\n• Use el comando .qr`)
}
}
}


if (txtCode && txtCode.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 45000)
}
if (codeBot && codeBot.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 45000)
}

let _ending = false
const endSesion = async (loaded) => {
  if (_ending) return
  _ending = true
  try {
    if (!loaded) {
      try { sock.ws.close() } catch {}
      try { sock.ev.removeAllListeners() } catch {}
      let i = global.conns.indexOf(sock)
      if (i >= 0) {
        delete global.conns[i]
        global.conns.splice(i, 1)
      }
    }
  } finally {
    _ending = false
  }
}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
console.log(chalk.yellow(`🔌 Conexión cerrada para +${path.basename(pathMikuJadiBot)}. Código: ${reason}`))


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
console.log(chalk.red(`❌ Falló la reconexión automática para +${path.basename(pathMikuJadiBot)}`))
await endSesion(false)
}
} else if (reason === 401 || reason === 405) {

  console.log(chalk.red(`🗑️ Sesión inválida, eliminando archivos para +${path.basename(pathMikuJadiBot)}`))
  try {
    fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
    
    const recipient = (m && m.sender) ? m.sender : `${path.basename(pathMikuJadiBot)}@s.whatsapp.net`
    if (options.fromCommand && shouldNotifyUser(recipient)) {
      await conn.sendMessage(recipient, {
        text: '*SESIÓN EXPIRADA*\n\n> *Vuelva a conectarse para crear una nueva sesión*'
      }, { quoted: m || null }).catch(() => {})
    }
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
sock.well = false  
sock.reconnectAttempts = 0 
sock.lastActivity = Date.now()


try {
if (!sock.prefix) sock.prefix = global.prefix
if (sock.user && sock.authState?.creds?.me) {
sock.user.jid = sock.authState.creds.me.jid || sock.user.jid
sock.user.name = sock.authState.creds.me.name || sock.user.name || 'SubBot'
}


sock.user = sock.user || {}
sock.chats = sock.chats || {}
sock.contacts = sock.contacts || {}


sock.sendMessage = sock.sendMessage.bind(sock)
sock.updatePresence = sock.updatePresence.bind(sock) 
sock.presenceSubscribe = sock.presenceSubscribe.bind(sock)

console.log('🔧 Propiedades básicas del SubBot configuradas')
} catch (error) {
console.log('⚙️ Error configurando propiedades básicas:', error.message)
}


try {
console.log('🔍 Configurando handler para SubBot recién conectado...')
const handlerModule = await import('../handler.js')
if (handlerModule && handlerModule.handler && typeof handlerModule.handler === 'function') {

  const originalHandler = handlerModule.handler.bind(sock)
  sock.handler = async (chatUpdate) => {
    try {
      console.log('📨 SubBot procesando mensaje:', {
        messages: chatUpdate?.messages?.length || 0,
        messageTypes: chatUpdate?.messages?.map(m => Object.keys(m.message || {})) || [],
        fromSender: chatUpdate?.messages?.[0]?.key?.fromMe ? 'SubBot' : 'Usuario'
      })
      return await originalHandler(chatUpdate)
    } catch (error) {
      console.error('❌ Error en handler de SubBot:', error.message)
      console.error('Stack:', error.stack)
    }
  }

 
  try { sock.ev.removeAllListeners('messages.upsert') } catch (e) {}
  sock.ev.on("messages.upsert", sock.handler)
  console.log('✅ Handler configurado exitosamente para SubBot')
  console.log('🤖 SubBot está listo para procesar comandos')


setTimeout(() => {
  console.log('📣 Verificando estado del SubBot:', {
    isInit: sock.isInit,
    hasUser: !!sock.user,
    hasHandler: !!sock.handler,
    userId: sock.user?.id,
    handlerListeners: sock.ev.listenerCount('messages.upsert')
  })
}, 2000)

} else {
console.error('⚠️ Error: Handler no válido para SubBot')
console.log('Handler module keys:', Object.keys(handlerModule || {}))
}
} catch (error) {
console.error('❌ Error configurando handler para SubBot:', error.message)
}

if (!global.conns.find(c => c.user?.jid === sock.user?.jid)) {
global.conns.push(sock)
}


const sessionDuration = Date.now() - sock.sessionStartTime
const durationFormatted = msToTime(sessionDuration)

let userName = sock.user.name || 'SubBot'
let userJid = sock.user.jid || `${path.basename(pathMikuJadiBot)}@s.whatsapp.net`


console.log(chalk.bold.green(`✅ SubBot conectado exitosamente:`))
console.log(chalk.cyan(`   👤 Usuario: ${userName}`))
console.log(chalk.cyan(`   📱 Número: +${path.basename(pathMikuJadiBot)}`))
console.log(chalk.cyan(`   🆔 JID: ${userJid}`))
console.log(chalk.cyan(`   🕒 Conectado: ${new Date().toLocaleString()}`))
console.log(chalk.cyan(`   ⏱️ Duración sesión: ${durationFormatted}`))
console.log(chalk.cyan(`   🔄 Reconexiones: ${sock.reconnectAttempts}/${sock.maxReconnectAttempts}`))


await joinChannels(sock)

await conn.sendMessage(m.chat, { 
text: `✅ *SubBot conectado exitosamente* 🤖\n\n` +
      `👤 *Usuario:* ${userName}\n` +
      `📱 *Número:* +${path.basename(pathMikuJadiBot)}\n` +
      `🕒 *Conectado:* ${new Date().toLocaleString()}\n` +
      `⏱️ *Duración sesión:* ${durationFormatted}\n` +
      `🔄 *Reconexiones automáticas:* Activadas (${sock.maxReconnectAttempts} máx)\n` +
      `⚡ *Estado:* Sesión persistente activada\n` +
      `🔥 *Total SubBots activos:* ${global.conns.length}\n\n` +
      `🎯 *Ahora puede usar comandos desde este dispositivo*`
}, { quoted: m })


setInterval(() => {
if (sock && sock.user) {
sock.lastActivity = Date.now()
}
}, 30000)
}
}


setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {      
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)

let handlerModule = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Handler && Handler.handler && typeof Handler.handler === 'function') {
handlerModule = Handler
console.log('✅ Handler cargado correctamente')
} else {
console.error('⚠️ Handler no válido o no encontrado')
console.log('Handler keys:', Object.keys(Handler || {}))
return false
}
} catch (e) {
console.error('⚠️ Error cargando handler: ', e)
return false
}

if (restatConn) {
const oldChats = sock.chats
try { sock.ws.close() } catch { }
sock.ev.removeAllListeners()
sock = makeWASocket(connectionOptions, { chats: oldChats })


sock.isInit = true
sock.well = false
sock.prefix = global.prefix || '#'
sock.chats = oldChats || {}
sock.contacts = sock.contacts || {}
sock.blocklist = sock.blocklist || []

console.log('🔄 SubBot socket recreado en creloadHandler con propiedades')
isInit = true
}

if (!isInit) {
try {
sock.ev.off("messages.upsert", sock.handler)
sock.ev.off("connection.update", sock.connectionUpdate)
sock.ev.off('creds.update', sock.credsUpdate)
} catch (e) {

}
}



console.log('🔍 Verificando handler:', {
  handlerModule: !!handlerModule,
  hasHandler: !!(handlerModule && handlerModule.handler),
  handlerType: typeof (handlerModule && handlerModule.handler)
})


if (handlerModule && handlerModule.handler && typeof handlerModule.handler === 'function') {
  try { sock.ev.removeAllListeners('messages.upsert') } catch (e) {}
  sock.handler = handlerModule.handler.bind(sock)
  sock.ev.on("messages.upsert", sock.handler)
  console.log('✅ Handler configurado correctamente para SubBot (creloadHandler)')
} else {
  console.error('⚠️ Handler no disponible en creloadHandler, continuará sin procesar comandos hasta que se recargue')
}

sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)
isInit = false
return true
}


await creloadHandler(false)
})
}

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
