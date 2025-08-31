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
let rtx = "*🌱💙 ╭─「 Hatsune Miku Bot 」─💙🌱*\n\n💙 Conexión Sub-Bot Modo QR 🌱\n\n✨ Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* de Miku.\n\n🌱 `1` » Haga clic en los tres puntos en la esquina superior derecha\n\n💙 `2` » Toque dispositivos vinculados\n\n🌱 `3` » Escanee este código QR para iniciar sesión con Miku\n\n✧ ¡Este código QR expira en 45 segundos! 💙🌱"
let rtx2 = "*🌱💙 ╭─「 Hatsune Miku Bot 」─💙🌱*\n\n💙 Conexión Sub-Bot Modo Código 🌱\n\n✨ Usa este Código para convertirte en un *Sub-Bot* de Miku.\n\n🌱 `1` » Haga clic en los tres puntos en la esquina superior derecha\n\n💙 `2` » Toque dispositivos vinculados\n\n🌱 `3` » Selecciona Vincular con el número de teléfono\n\n💙 `4` » Escriba el Código para iniciar sesión con Miku\n\n✧ No es recomendable usar tu cuenta principal 💙🌱"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mikuJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
return m.reply(`🌱💙 El Comando *${command}* está desactivado temporalmente.`)
}
let time = global.db.data.users[m.sender].Subs + 120000
if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `🌱 Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot* de Miku. 💙`, m)


if (!Array.isArray(global.conns)) global.conns = []

const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount === 20) {
return m.reply(`🌱💙 No se han encontrado espacios para *Sub-Bots* de Miku disponibles.`)
}
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathMikuJadiBot = path.join(`./${jadi}/`, id)
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
conn.reply(m.chat, `💙🌱 Use correctamente el comando » ${usedPrefix + command} code`, m)
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
generateHighQualityLinkPreview: true
};

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true

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
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
}
return
} 
if (qr && mcode) {
let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
secret = secret.match(/.{1,4}/g)?.join("-")
txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
codeBot = await m.reply(secret)
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
} catch {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return 
delete global.conns[i]
global.conns.splice(i, 1)
}}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
if (reason === 428) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 🌱💙 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión de Miku (+${path.basename(pathMikuJadiBot)}) fue cerrada inesperadamente. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 💙🌱 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 408) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 🌱💙 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión de Miku (+${path.basename(pathMikuJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 💙🌱 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 440) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 🌱💙 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión de Miku (+${path.basename(pathMikuJadiBot)}) fue reemplazada por otra sesión activa.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 💙🌱 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathMikuJadiBot)}@s.whatsapp.net`, {text : '*🌱💙 HEMOS DETECTADO UNA NUEVA SESIÓN DE MIKU*\n\n> *BORRE LA NUEVA SESIÓN PARA CONTINUAR CON MIKU*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE* 💙🌱' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${path.basename(patMikuJadiBot)}`))
}}
if (reason == 405 || reason == 401) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 🌱💙 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La sesión de Miku (+${path.basename(pathMikuJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 💙🌱 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathMikuJadiBot)}@s.whatsapp.net`, {text : '*🌱💙 SESIÓN DE MIKU PENDIENTE*\n\n> *INTÉNTALO NUEVAMENTE PARA VOLVER A SER SUB-BOT DE MIKU* 💙🌱' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`Error 405 no se pudo enviar mensaje a: +${path.basename(pathMikuJadiBot)}`))
}
fs.rmdirSync(pathMikuJadiBot, { recursive: true })
}
if (reason === 500) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 🌱💙 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión perdida en la sesión de Miku (+${path.basename(pathMikuJadiBot)}). Borrando datos...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 💙🌱 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathMikuJadiBot)}@s.whatsapp.net`, {text : '*🌱💙 CONEXIÓN DE MIKU PERDIDA*\n\n> *INTÉNTALO MANUALMENTE PARA VOLVER A SER SUB-BOT DE MIKU* 💙🌱' }, { quoted: m || null }) : ""
return creloadHandler(true).catch(console.error)
}
if (reason === 515) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 🌱💙 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Reinicio automático para la sesión de Miku (+${path.basename(pathMikuJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 💙🌱 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 403) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 🌱💙 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión de Miku cerrada o cuenta en soporte para la sesión (+${path.basename(pathMikuJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ 💙🌱 ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
fs.rmdirSync(pathMikuJadiBot, { recursive: true })
}}
if (global.db.data == null) loadDatabase()
if (connection == `open`) {
if (!global.db.data?.users) loadDatabase()
await joinChannels(conn)
let userName, userJid
userName = sock.authState.creds.me.name || 'Anónimo'
userJid = sock.authState.creds.me.jid || `${path.basename(pathMikuJadiBot)}@s.whatsapp.net`
console.log(chalk.bold.cyanBright(`\n🌱💙──【• MIKU SUB-BOT •】──💙🌱\n│\n│ ✨ ${userName} (+${path.basename(pathMikuJadiBot)}) conectado exitosamente con Miku.\n│\n🌱💙──【• CONECTADO •】──💙🌱`))
sock.isInit = true
global.conns.push(sock)
m?.chat ? await conn.sendMessage(m.chat, {text: args[0] ? `@${m.sender.split('@')[0]}, ya estás conectado con Miku 🌱💙, leyendo mensajes entrantes...` : `@${m.sender.split('@')[0]}, genial ya eres parte de la familia de Sub-Bots de Miku 🌱💙`, mentions: [m.sender]}, { quoted: m }) : ''
}}
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}
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
}}
