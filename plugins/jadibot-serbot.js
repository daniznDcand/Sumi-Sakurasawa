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



function cleanPhoneNumber(phone) {
  if (!phone) return null
  
  
  let cleaned = phone.replace(/[^0-9]/g, '')
  
  
  if (cleaned.length < 10) return null
  

  const countryCodes = ['1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374', '375', '376', '377', '378', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '850', '852', '853', '855', '856', '880', '886', '960', '961', '962', '963', '964', '965', '966', '967', '968', '970', '971', '972', '973', '974', '975', '976', '977', '992', '993', '994', '995', '996', '998']
  
  
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    console.log(`📱 Número limpiado: ${phone} -> ${cleaned}`)
    return cleaned
  }
  
  return null
}


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


function cleanPhoneNumber(phone) {
  if (!phone) return null
  
  
  let cleaned = phone.replace(/[^0-9]/g, '')
  
  
  if (cleaned.length < 10) return null
  
  
  
  
  const countryCodes = ['1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374', '375', '376', '377', '378', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '850', '852', '853', '855', '856', '880', '886', '960', '961', '962', '963', '964', '965', '966', '967', '968', '970', '971', '972', '973', '974', '975', '976', '977', '992', '993', '994', '995', '996', '998']
  
  
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    console.log(`📱 Número limpiado: ${phone} -> ${cleaned}`)
    return cleaned
  }
  
  return null
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

keepAliveIntervalMs: 30000,  
markOnlineOnConnect: true,
syncFullHistory: false,
fireInitQueries: false,
shouldSyncHistoryMessage: () => false,
connectTimeoutMs: 300000,     
defaultQueryTimeoutMs: 300000, 
emitOwnEvents: false,
qrTimeout: 900000,            
retryRequestDelayMs: 5000,    
maxMsgRetryCount: 20,         
pairingCodeTimeout: 900000,   

transactionOpts: {
maxCommitRetries: 30,         
delayBetweenTriesMs: 5000     
},

options: {
chatsCache: true,
reconnectMode: 'on-connection-lost',
reconnectDelay: 10000,        
maxReconnectAttempts: 999,    
backoffMaxDelay: 300000,      
backoffMultiplier: 1.5,       
},

getMessage: async (key) => {
if (store) {
const msg = await store.loadMessage(key.remoteJid, key.id)
return msg?.message || undefined
}
return undefined
},

cacheVersion: 1,
treatCiphertextMessagesAsReal: true,
linkPreviewImageThumbnailWidth: 192,
transactionTimeout: 60000,    
waWebSocketUrl: undefined,    
connectCooldownMs: 5000       
};

let sock = makeWASocket(connectionOptions)
sock.isInit = false
sock.well = false  
sock.reconnectAttempts = 0
sock.maxReconnectAttempts = 50  
sock.lastActivity = Date.now()
sock.sessionStartTime = sessionStartTime
sock.subreloadHandler = (reload) => creloadHandler(reload)

sock.isAlive = true
sock.heartbeatInterval = null
sock.sessionPersistence = true
sock.autoReconnect = true
sock.lastHeartbeat = Date.now()
sock.maxInactiveTime = 3600000  
sock.healthCheckInterval = 60000  


function isSocketReady(s) {
  try {
    return !!(s && s.ws && s.ws.socket && s.ws.socket.readyState === ws.OPEN)
  } catch (e) {
    return false
  }
}


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

  
    try {
      sock._reconnectNotified = sock._reconnectNotified || false
      const notifyTo = (m && m.sender) ? m.sender : `${path.basename(pathMikuJadiBot)}@s.whatsapp.net`
      if (!sock._reconnectNotified && options.fromCommand && shouldNotifyUser(notifyTo) && isSocketReady(conn)) {
        try {
          await conn.sendMessage(notifyTo, { text: `🔄 Reconectando SubBot +${path.basename(pathMikuJadiBot)}... Intento ${sock.reconnectAttempts}/${sock.maxReconnectAttempts}\n⏰ *Tiempo de sesión:* ${msToTime(Date.now() - sock.sessionStartTime)}\n🔒 *Sesión persistente activada*` }, { quoted: m }).catch(() => {})
          sock._reconnectNotified = true
        } catch (e) {
          
        }
      }
    } catch (e) {
      console.error('Error intentando notificar reconexión:', e?.message || e)
    }


const baseWait = 15000  
const maxWait = 10 * 60 * 1000  
const exponentialBackoff = Math.min(maxWait, baseWait * Math.pow(1.5, Math.min(sock.reconnectAttempts - 1, 10)))
console.log(chalk.blue(`⏳ Esperando ${Math.round(exponentialBackoff/1000)}s antes de reconectar...`))
await new Promise(resolve => setTimeout(resolve, exponentialBackoff))

try {

try {
  if (sock.heartbeatInterval) {
    clearInterval(sock.heartbeatInterval)
    sock.heartbeatInterval = null
  }
  sock.ev.removeAllListeners()
  if (sock.ws && typeof sock.ws.close === 'function') {
    sock.ws.close()
  }
 
  await new Promise(resolve => setTimeout(resolve, 3000))
} catch (e) {
  console.log('Error cerrando conexión anterior:', e.message)
}


const reconnectOptions = {
  ...connectionOptions,
  connectTimeoutMs: 360000,     
  defaultQueryTimeoutMs: 360000, 
  keepAliveIntervalMs: 45000,   
  retryRequestDelayMs: 3000,    
  maxMsgRetryCount: 25,         
  qrTimeout: 1200000,           
  pairingCodeTimeout: 1200000,  
  options: {
    ...connectionOptions.options,
    reconnectDelay: 15000,      
    maxReconnectAttempts: 999,  
    backoffMaxDelay: 600000,    
  }
}

sock = makeWASocket(reconnectOptions)
sock.reconnectAttempts = reconnectAttempts
sock.maxReconnectAttempts = 50 
sock.lastActivity = Date.now()
sock.sessionStartTime = sessionStartTime
sock.isInit = false
sock.well = false  
sock.isAlive = true
sock.sessionPersistence = true
sock.autoReconnect = true
sock.lastHeartbeat = Date.now()


sock.prefix = global.prefix || '#'
sock.chats = sock.chats || {}
sock.contacts = sock.contacts || {}
sock.blocklist = sock.blocklist || []

console.log(chalk.cyan('🔄 SubBot socket recreado con configuración ultra-persistente'))


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
  for (let i = 0; i < 10; i++) {  
    try {
      const H = await import(`../handler.js?update=${Date.now()}`)
      if (H && H.handler && typeof H.handler === 'function') {
        handlerModule = H
        console.log(chalk.green('✅ Handler recargado exitosamente'))
        break
      }
    } catch (e) {
      console.log(`Intento ${i+1}/10 de recargar handler falló`)
      await new Promise(r => setTimeout(r, 3000)) 
    }
  }
}

if (handlerModule && handlerModule.handler && typeof handlerModule.handler === 'function') {
  sock.handler = handlerModule.handler.bind(sock)
  try { sock.ev.removeAllListeners('messages.upsert') } catch (e) {}
  sock.ev.on('messages.upsert', sock.handler)
  console.log(chalk.green('✅ Handler reconfigurado en reconexión'))
}

console.log(chalk.green(`✅ Reconexión ${sock.reconnectAttempts} completada exitosamente - Sesión ultra-persistente activada`))
return true
} catch (error) {
console.error(chalk.red(`❌ Error en reconexión ${sock.reconnectAttempts}: ${error.message}`))

const errorWait = Math.min(60000, 10000 * sock.reconnectAttempts)
await new Promise(resolve => setTimeout(resolve, errorWait))
return false
}
}
console.log(chalk.red(`❌ Máximo de reconexiones alcanzado (${sock.maxReconnectAttempts}) - Sesión será terminada`))
return false
}

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false


if (qr && !mcode) {
  if (m?.chat) {
    try {
      txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
    } catch (e) {
      console.error('Error enviando QR al usuario:', e?.message || e)
      return
    }
  } else {
    return
  }
  if (txtQR && txtQR.key) {
    setTimeout(async () => {
      try {
        await conn.sendMessage(m.sender, { delete: txtQR.key })
      } catch (e) {
        
      }
    }, 45000)
  }
return
} 


if (qr && mcode) {
let phoneNumber = (m && m.sender) ? m.sender.split('@')[0] : ''

try {
let secret
let attempts = 0
const maxAttempts = 5


phoneNumber = cleanPhoneNumber(phoneNumber)
if (!phoneNumber || phoneNumber.length < 10) {
  await m.reply(`❌ Error: Número de teléfono inválido. Use el comando desde su número de WhatsApp registrado.\n\n*Número detectado:* +${(m && m.sender) ? m.sender.split('@')[0] : 'desconocido'}\n*Número limpiado:* ${phoneNumber || 'inválido'}\n\n*Nota:* Si su número incluye espacios o caracteres especiales, el sistema los eliminará automáticamente.`)
  return
}

console.log(chalk.cyan(`📱 Generando código para número limpiado: +${phoneNumber}`))

while (!secret && attempts < maxAttempts) {
try {

if (attempts > 0) {
  await new Promise(resolve => setTimeout(resolve, 3000))
}

console.log(chalk.cyan(`🔄 Intento ${attempts + 1}/${maxAttempts} de generar código para +${phoneNumber}`))
secret = await sock.requestPairingCode(phoneNumber)

if (secret && secret.length >= 6) {
secret = secret?.match(/.{1,4}/g)?.join("-") || secret
console.log(chalk.green(`✅ Código generado exitosamente: ${secret}`))
break
} else {
console.log(chalk.yellow(`⚠️ Código inválido recibido: ${secret}`))
secret = null
}
} catch (err) {
attempts++
console.log(chalk.red(`❌ Error en intento ${attempts}: ${err.message}`))
if (attempts < maxAttempts) {
console.log(`🔄 Reintentando en 3 segundos...`)
}
}
attempts++
}

  if (secret && m && conn) {
    try {
      txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
    } catch (e) {
      console.error('Error enviando mensaje de código (rtx2):', e?.message || e)
    }

    try {
      codeBot = await conn.sendMessage(m.chat, { text: secret }, { quoted: m })
    } catch (e) {
      console.error('Error enviando secret al chat:', e?.message || e)
    }

    try {
      await conn.sendMessage(m.chat, {
        text: `⏰ *Código válido por 30 segundos*\n\n💡 *Instrucciones:*\n` +
          `1️⃣ Abre WhatsApp en tu dispositivo\n` +
          `2️⃣ Ve a *Dispositivos vinculados*\n` +
          `3️⃣ Toca *Vincular con código*\n` +
          `4️⃣ Copia y pega: \`${secret}\`\n\n` +
          `🤖 *Una vez conectado, podrás usar todos los comandos*`
      }, { quoted: m })
    } catch (e) {
      console.error('Error enviando instrucciones de código:', e?.message || e)
    }

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
  setTimeout(async () => {
    try {
      await conn.sendMessage(m.sender, { delete: txtCode.key })
    } catch (e) {}
  }, 45000)
}
if (codeBot && codeBot.key) {
  setTimeout(async () => {
    try {
      await conn.sendMessage(m.sender, { delete: codeBot.key })
    } catch (e) {}
  }, 45000)
}

let _ending = false
const endSesion = async (loaded) => {
  if (_ending) return
  _ending = true
  try {
    console.log(chalk.yellow(`🔚 Finalizando sesión para +${path.basename(pathMikuJadiBot)}, loaded: ${loaded}`))
    
    if (!loaded) {
      
      try { 
        if (sock._saveCredsInterval) { 
          clearInterval(sock._saveCredsInterval); 
          sock._saveCredsInterval = null 
        } 
      } catch (e) {}
      
      try { 
        if (sock._keepAliveInterval) { 
          clearInterval(sock._keepAliveInterval); 
          sock._keepAliveInterval = null 
        } 
      } catch (e) {}
      
      try { 
        if (sock._inactivityMonitor) { 
          clearInterval(sock._inactivityMonitor); 
          sock._inactivityMonitor = null 
        } 
      } catch (e) {}
      
      try { 
        if (sock._presenceInterval) { 
          clearInterval(sock._presenceInterval); 
          sock._presenceInterval = null 
        } 
      } catch (e) {}
      
      
      try { 
        if (sock.ws && typeof sock.ws.close === 'function') {
          sock.ws.close()
        }
      } catch (e) {
        console.log('Error cerrando WebSocket:', e.message)
      }
      
      
      try { 
        sock.ev.removeAllListeners() 
      } catch (e) {
        console.log('Error removiendo listeners:', e.message)
      }
      
      
      try {
        let i = global.conns.findIndex(c => c.user?.jid === sock.user?.jid)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
          console.log(chalk.blue(`🗑️ SubBot removido de global.conns (posición ${i})`))
        }
      } catch (e) {
        console.log('Error removiendo de global.conns:', e.message)
      }
      
      
      try {
        sock.chats = null
        sock.contacts = null
        sock.blocklist = null
        sock.handler = null
        sock.connectionUpdate = null
        sock.credsUpdate = null
      } catch (e) {}
      
      console.log(chalk.green(`✅ Sesión +${path.basename(pathMikuJadiBot)} finalizada correctamente`))
    }
  } catch (error) {
    console.error(`❌ Error durante finalización de sesión: ${error.message}`)
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
429,  
404,  
422,  
403,  
425,  
426,  
].includes(reason)


const criticalReconnect = [428, 440, 515].includes(reason)
if (criticalReconnect && sock.maxReconnectAttempts < 15) {
  sock.maxReconnectAttempts = 15
  console.log(chalk.cyan(`🔄 Aumentando intentos de reconexión a ${sock.maxReconnectAttempts} por código crítico ${reason}`))
}

if (shouldReconnect && sock.reconnectAttempts < sock.maxReconnectAttempts) {
console.log(chalk.cyan(`📣 Preparando reconexión automática para código ${reason}...`))
const reconnected = await attemptReconnect()
if (!reconnected) {
console.log(chalk.red(`❌ Falló la reconexión automática para +${path.basename(pathMikuJadiBot)}`))
await endSesion(false)
}
} else if (reason === 401) {
  
  console.log(chalk.red(`🗑️ Sesión expirada (401), eliminando archivos para +${path.basename(pathMikuJadiBot)}`))
  try {
    fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
    
    const recipient = (m && m.sender) ? m.sender : `${path.basename(pathMikuJadiBot)}@s.whatsapp.net`
    try {
      sock._notifiedExpired = sock._notifiedExpired || false
      if (options.fromCommand && !sock._notifiedExpired && shouldNotifyUser(recipient)) {
        await conn.sendMessage(recipient, {
          text: '*🔄 SESIÓN EXPIRADA*\n\n> La sesión del SubBot ha expirado y debe ser revinculada.\n> Use .qr o .code para crear una nueva sesión.\n> *Sus datos están seguros y se mantendrán.*'
        }, { quoted: m || null }).catch(() => {})
        sock._notifiedExpired = true
      }
    } catch (e) {
      console.error('Error notificando expiración:', e.message)
    }
  } catch (error) {
    console.error(`Error eliminando sesión: ${error.message}`)
  }
  await endSesion(false)
} else if (reason === 405) {
  
  console.log(chalk.orange(`🔄 Método no permitido (405), reintentando con configuración conservadora...`))
  if (sock.reconnectAttempts < 5) {
    await new Promise(resolve => setTimeout(resolve, 30000)) 
    const reconnected = await attemptReconnect()
    if (!reconnected) await endSesion(false)
  } else {
    console.log(chalk.red(`❌ Demasiados intentos 405, eliminando sesión`))
    try { fs.rmSync(pathMikuJadiBot, { recursive: true, force: true }) } catch (e) {}
    await endSesion(false)
  }
} else {
console.log(chalk.gray(`⚠️ Cerrando sesión sin reconexión. Código: ${reason}, Intentos: ${sock.reconnectAttempts}/${sock.maxReconnectAttempts}`))
await endSesion(false)
}
}

if (connection == `open`) {
sock.isInit = true
sock.well = false  
sock.reconnectAttempts = 0 
sock.lastActivity = Date.now()


try { sock._reconnectNotified = false } catch (e) {}



try {
  if (typeof saveCreds === 'function') {
    if (!sock._saveCredsInterval) {
      sock._saveCredsInterval = setInterval(() => {
        try { 
          saveCreds()
          console.log(chalk.blue(`💾 Credenciales guardadas para +${path.basename(pathMikuJadiBot)}`))
        } catch (e) {
          console.error(`Error guardando credenciales: ${e.message}`)
        }
      }, 1000 * 60 * 2)  
    }
    
    
    try {
      saveCreds()
      console.log(chalk.green(`💾 Credenciales guardadas inmediatamente para +${path.basename(pathMikuJadiBot)}`))
    } catch (e) {
      console.error(`Error en guardado inmediato: ${e.message}`)
    }
  }
} catch (e) {
  console.error('Error configurando guardado de credenciales:', e.message)
}



try {
  if (!sock._keepAliveInterval) {
    sock._keepAliveInterval = setInterval(async () => {
      try {
        if (isSocketReady(sock)) {
          
          
          
          if (typeof sock.updatePresence === 'function') {
            await sock.updatePresence('available').catch(() => {})
          }
          
          
          if (typeof sock.ws?.ping === 'function') {
            sock.ws.ping().catch(() => {})
          }
          
          
          if (typeof sock.sendPresenceUpdate === 'function') {
            await sock.sendPresenceUpdate('available').catch(() => {})
          }
          
          
          sock.lastActivity = Date.now()
          sock.lastHeartbeat = Date.now()
          
          
          const now = Date.now()
          if (!sock._lastHealthLog || (now - sock._lastHealthLog) > 3 * 60 * 1000) {  // Cada 3 minutos
            const uptime = msToTime(now - sock.sessionStartTime)
            const totalConns = global.conns.filter(c => c && c.user && isSocketReady(c)).length
            console.log(chalk.green(`💚 SubBot +${path.basename(pathMikuJadiBot)} - Uptime: ${uptime}, Reconexiones: ${sock.reconnectAttempts}, Total activos: ${totalConns}`))
            sock._lastHealthLog = now
          }
          
          
          const timeSinceLastHeartbeat = now - (sock.lastHeartbeat || now)
          if (timeSinceLastHeartbeat > 120000) {  
            console.log(chalk.yellow(`⚠️ Heartbeat retrasado para +${path.basename(pathMikuJadiBot)}: ${Math.round(timeSinceLastHeartbeat/1000)}s`))
          }
          
        } else {
          console.log(chalk.yellow(`⚠️ Socket no listo para +${path.basename(pathMikuJadiBot)}, estado: ${sock?.ws?.socket?.readyState}`))
          
         
          if (sock.autoReconnect && sock.reconnectAttempts < sock.maxReconnectAttempts) {
            console.log(chalk.cyan(`🔄 Iniciando reconexión automática por socket no listo...`))
            setTimeout(() => attemptReconnect(), 5000)
          }
        }
      } catch (e) {
        console.error(`Error en keep-alive para +${path.basename(pathMikuJadiBot)}:`, e.message)
      }
    }, 20000)  
  }
} catch (e) {
  console.error('Error configurando keep-alive:', e.message)
}


try {
  if (!sock._inactivityMonitor) {
    sock._inactivityMonitor = setInterval(() => {
      try {
        const now = Date.now()
        const inactiveTime = now - (sock.lastActivity || now)
        
       
        if (inactiveTime > sock.maxInactiveTime) {
          console.log(chalk.yellow(`⏰ SubBot +${path.basename(pathMikuJadiBot)} inactivo por ${msToTime(inactiveTime)}, reactivando...`))
          
          if (isSocketReady(sock)) {
            
            sock.updatePresence('available').catch(() => {})
            if (typeof sock.sendPresenceUpdate === 'function') {
              sock.sendPresenceUpdate('available').catch(() => {})
            }
            sock.lastActivity = now
          } else {
            console.log(chalk.red(`❌ Socket no responde después de inactividad, iniciando reconexión...`))
            if (sock.autoReconnect) {
              setTimeout(() => attemptReconnect(), 2000)
            }
          }
        }
        
        
        const sessionTime = now - sock.sessionStartTime
        if (sessionTime > 24 * 60 * 60 * 1000) {  
          console.log(chalk.blue(`🎉 SubBot +${path.basename(pathMikuJadiBot)} llevando ${msToTime(sessionTime)} activo - Sesión ultra-persistente funcionando!`))
        }
        
      } catch (e) {
        console.error('Error en monitor de inactividad:', e.message)
      }
    }, 2 * 60 * 1000)  
  }
} catch (e) {
  console.error('Error configurando monitor de inactividad:', e.message)
}


try {
  if (!sock.heartbeatInterval) {
    sock.heartbeatInterval = setInterval(() => {
      try {
        if (sock.isAlive && isSocketReady(sock)) {
          sock.lastHeartbeat = Date.now()
          
          
          if (typeof sock.query === 'function') {
            sock.query({
              tag: 'iq',
              attrs: { type: 'get', xmlns: 'urn:xmpp:ping' }
            }).catch(() => {})
          }
          
        } else {
          const timeSinceLastHeartbeat = Date.now() - (sock.lastHeartbeat || 0)
          if (timeSinceLastHeartbeat > 300000) {  
            console.log(chalk.red(`💔 Heartbeat perdido para +${path.basename(pathMikuJadiBot)}, marcando para reconexión...`))
            sock.isAlive = false
            if (sock.autoReconnect) {
              setTimeout(() => attemptReconnect(), 1000)
            }
          }
        }
      } catch (e) {
        console.error('Error en heartbeat personalizado:', e.message)
      }
    }, 60000)  
  }
} catch (e) {
  console.error('Error configurando heartbeat personalizado:', e.message)
}


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
    handlerListeners: (() => {
      try {
        if (typeof sock.ev.listenerCount === 'function') return sock.ev.listenerCount('messages.upsert')
        if (typeof sock.ev.listeners === 'function') return sock.ev.listeners('messages.upsert').length
      } catch (e) {
        console.error('Error obteniendo listenerCount:', e.message)
      }
      return 0
    })()
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

  try {
    const openRecipient = m?.chat || ((sock.user && sock.user.jid) ? sock.user.jid : null)
    sock._notifiedOpen = sock._notifiedOpen || false
    if (options.fromCommand && !sock._notifiedOpen && openRecipient && shouldNotifyUser(openRecipient)) {
      try {
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
        sock._notifiedOpen = true
      } catch (e) {
        console.error('Error enviando notificación de SubBot abierto:', e?.message || e)
      }
    } else {
      console.log('Notificando apertura omitida para evitar spam o por cooldown')
    }
  } catch (e) {
    console.error('Error preparando notificación de apertura:', e?.message || e)
  }


setInterval(() => {
if (sock && sock.user) {
sock.lastActivity = Date.now()
}
}, 30000)
}
}



setInterval(async () => {
const currentTime = Date.now()
const cleanupThreshold = 5 * 60 * 1000 

try {
 
  const isValidSocket = sock && 
                       sock.user && 
                       sock.user.jid && 
                       isSocketReady(sock) &&
                       (currentTime - (sock.lastActivity || 0)) < cleanupThreshold

  if (!isValidSocket) {
    const inactiveTime = sock?.lastActivity ? currentTime - sock.lastActivity : 'desconocido'
    console.log(chalk.red(`🧹 Limpiando SubBot inválido +${path.basename(pathMikuJadiBot)} - Inactivo: ${typeof inactiveTime === 'number' ? msToTime(inactiveTime) : inactiveTime}`))
    
    
    try { 
      if (sock?.ws && typeof sock.ws.close === 'function') {
        sock.ws.close()
      }
    } catch (e) {}
    
    try { sock.ev.removeAllListeners() } catch (e) {}
    
   
    const indices = []
    global.conns.forEach((conn, index) => {
      if (!conn || !conn.user || !isSocketReady(conn) || 
          (sock.user && conn.user.jid === sock.user.jid)) {
        indices.push(index)
      }
    })
    
    
    indices.reverse().forEach(i => {
      if (global.conns[i]) {
        console.log(chalk.blue(`🗑️ Removiendo conexión inválida en índice ${i}`))
        delete global.conns[i]
        global.conns.splice(i, 1)
      }
    })
  }
} catch (error) {
  console.error(`Error en monitor de limpieza: ${error.message}`)
}
}, 2 * 60 * 1000) 

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




  
  try {
    if (!sock._presenceInterval) {
      sock._presenceInterval = setInterval(() => {
        try {
          if (isSocketReady(sock) && typeof sock.updatePresence === 'function') {
            sock.updatePresence('available').catch(() => {})
          }
        } catch (e) {}
      }, 30 * 1000)
    }
  } catch (e) {}
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
