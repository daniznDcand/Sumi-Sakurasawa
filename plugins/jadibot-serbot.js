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

let rtx = "*💎✧ ┈ Hatsune Miku - Virtual Diva Bot ┈ ✧💎*\n\n🎤 Conexión Sub-Bot Modo QR\n\n✨ Con otro celular o PC escanea este QR para convertirte en un *Sub-Bot* de Miku.\n\n🎵 `[...]"

let rtx2 = "*💎✧ ┈ Hatsune Miku - Virtual Diva Bot ┈ ✧💎*\n\n🎤 Conexión Sub-Bot Modo Código\n\n✨ Usa este código para convertirte en un *Sub-Bot* de Miku.\n\n🎵 `1` » Toca los[...]"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mikuJBOptions = {}

if (!global.conns || typeof global.conns.delete !== 'function') global.conns = new Map()
if (!global.connStatus || typeof global.connStatus.delete !== 'function') global.connStatus = new Map()
if (!global.reconnectAttempts || typeof global.reconnectAttempts.delete !== 'function') global.reconnectAttempts = new Map()

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`💎 El comando *${command}* está temporalmente deshabilitado por Miku.`, m, rcanal)
    }
    
    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date - global.db.data.users[m.sender].Subs < 120000) {
        return conn.reply(m.chat, `🎤 Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot* con Miku.`, m, rcanal)
    }

    const activeSubBots = Array.from(global.conns.values()).filter(conn => 
        conn && conn.user && conn.ws && conn.ws.socket && 
        conn.ws.socket.readyState === ws.OPEN && conn.isInit
    )

    if (activeSubBots.length >= 20) {
        return m.reply(`🎵 No hay espacios disponibles en el concierto de *Sub-Bots* de Miku. (${activeSubBots.length}/20)`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    let pathMikuJadiBot = path.join(`./${jadi}/`, id)

    if (global.conns.has(id)) {
        const existingConn = global.conns.get(id)
        if (existingConn && existingConn.ws && existingConn.ws.socket && 
            existingConn.ws.socket.readyState === ws.OPEN) {
            return m.reply(`🎵 Ya tienes una conexión activa con Miku. Cierra la sesión anterior primero.`)
        } else {
            global.conns.delete(id)
            global.connStatus.delete(id)
        }
    }
    
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
    mikuJBOptions.userId = id
    
    mikuJadiBot(mikuJBOptions)
    global.db.data.users[m.sender].Subs = new Date * 1
} 

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function mikuJadiBot(options) {
    let { pathMikuJadiBot, m, conn, args, usedPrefix, command, userId } = options
    
    if (command === 'code') {
        command = 'qr'; 
        args.unshift('code')
    }
    
    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
    let txtCode, codeBot, txtQR
    
    if (mcode) {
        args[0] = args[0].replace(/^--code$|^code$/, "").trim()
        if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
        if (args[0] == "") args[0] = undefined
    }
    
    const pathCreds = path.join(pathMikuJadiBot, "creds.json")
    if (!fs.existsSync(pathMikuJadiBot)){
        fs.mkdirSync(pathMikuJadiBot, { recursive: true })
    }

    try {
        args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
    } catch {
        conn.reply(m.chat, `💎 Usa correctamente el comando » ${usedPrefix + command} code`, m, rcanal)
        return
    }

    const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
    exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
        const drmer = Buffer.from(drm1 + drm2, `base64`)

        let { version, isLatest } = await fetchLatestBaileysVersion()
        
        const msgRetryCache = new NodeCache({ stdTTL: 3600 })
        const msgRetry = (MessageRetryMap) => { }
        const { state, saveState, saveCreds } = await useMultiFileAuthState(pathMikuJadiBot)

        const connectionOptions = {
            logger: pino({ level: "fatal" }),
            printQRInTerminal: false,
            auth: { 
                creds: state.creds, 
                keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) 
            },
            msgRetry,
            msgRetryCache,
            browser: mcode ? Browsers.macOS("Chrome") : Browsers.macOS("Desktop"),
            version: version,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            markOnlineOnConnect: true,
            emitOwnEvents: false,
            getMessage: async (key) => ({ conversation: 'Miku Bot Message' })
        };

        let sock = makeWASocket(connectionOptions)
        sock.isInit = false
        sock.userId = userId
        sock.isSubBot = true
        sock.connectionRetries = 0
        sock.maxRetries = 5
        
        global.connStatus.set(userId, 'connecting')

        let isInit = true
        let connectionTimeout = null
        let heartbeatInterval = null

        const startHeartbeat = () => {
            if (heartbeatInterval) clearInterval(heartbeatInterval)
            heartbeatInterval = setInterval(async () => {
                if (sock && sock.ws && sock.ws.socket && sock.ws.socket.readyState === ws.OPEN) {
                    try {
                        await sock.sendPresenceUpdate('available')
                    } catch (error) {
                        console.log(`🎵 Heartbeat error for ${userId}:`, error.message)
                    }
                }
            }, 30000) 
        }

        const stopHeartbeat = () => {
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval)
                heartbeatInterval = null
            }
        }

        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            
            if (connectionTimeout) {
                clearTimeout(connectionTimeout)
                connectionTimeout = null
            }
            
            if (isNewLogin) sock.isInit = false
            
            if (qr && !mcode) {
                if (m?.chat) {
                    txtQR = await conn.sendMessage(m.chat, { 
                        image: await qrcode.toBuffer(qr, { scale: 8 }), 
                        caption: rtx.trim()
                    }, { quoted: m})
                } else {
                    return 
                }
                if (txtQR && txtQR.key) {
                    setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
                }
                return
            } 
            
            if (qr && mcode) {
                try {
                    let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
                    secret = secret.match(/.{1,4}/g)?.join("-")
                    
                    txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
                    await delay(1000)
                    codeBot = await conn.sendMessage(m.chat, {
                        text: `\`\`\`${secret}\`\`\``
                    }, { quoted: m })
                    
                    console.log(chalk.cyan(`🎵 Código de emparejamiento Miku (${userId}): ${secret}`))
                    
                    if (txtCode && txtCode.key) {
                        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 45000)
                    }
                    if (codeBot && codeBot.key) {
                        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 60000)
                    }
                } catch (error) {
                    console.error(`🎵 Error generando código para ${userId}:`, error)
                }
            }

            const endSession = async (reason = 'unknown') => {
                console.log(`🎵 Terminando sesión ${userId} - Razón: ${reason}`)
                stopHeartbeat()
                try {
                    if (sock.ws && sock.ws.socket) {
                        sock.ws.close()
                    }
                } catch (e) {}
                sock.ev.removeAllListeners()
                if (!global.conns || typeof global.conns.delete !== 'function') global.conns = new Map()
                if (!global.connStatus || typeof global.connStatus.delete !== 'function') global.connStatus = new Map()
                if (!global.reconnectAttempts || typeof global.reconnectAttempts.delete !== 'function') global.reconnectAttempts = new Map()
                global.conns.delete(userId)
                global.connStatus.delete(userId)
                global.reconnectAttempts.delete(userId)
                return true
            }

            const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
            
            if (connection === 'close') {
                global.connStatus.set(userId, 'disconnected')
                stopHeartbeat()
                console.log(`🎵 Conexión cerrada para ${userId} - Código: ${reason}`)
                const shouldReconnect = [428, 408, 515].includes(reason)
                const currentRetries = global.reconnectAttempts.get(userId) || 0
                if (shouldReconnect && currentRetries < sock.maxRetries) {
                    console.log(`🎵 Intentando reconectar ${userId} (${currentRetries + 1}/${sock.maxRetries})`)
                    global.reconnectAttempts.set(userId, currentRetries + 1)
                    setTimeout(async () => {
                        try {
                            await creloadHandler(true)
                        } catch (error) {
                            console.error(`🎵 Error en reconexión de ${userId}:`, error)
                            endSession('reconnection_failed')
                        }
                    }, Math.min(5000 * (currentRetries + 1), 30000)) 
                    return
                }
                switch (reason) {
                    case 440: 
                        console.log(chalk.bold.magenta(`💎 Sesión duplicada detectada para ${userId}`))
                        try {
                            if (options.fromCommand && m?.chat) {
                                await conn.sendMessage(m.chat, {
                                    text: '🎤 *SESIÓN DUPLICADA DETECTADA*\n\n💫 Cierra la sesión duplicada para continuar\n\n♪ Reconéctate si persisten los problemas ♪',
                                    mentions: [m.sender]
                                }, { quoted: m })
                            }
                        } catch (error) {
                            console.error(`🎵 Error notificando duplicación a ${userId}`)
                        }
                        break
                    case 401:
                    case 405:
                        console.log(chalk.bold.red(`🎼 Credenciales inválidas para ${userId}`))
                        if (fs.existsSync(pathMikuJadiBot)) {
                            fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
                        }
                        break
                    case 403:
                        console.log(chalk.bold.red(`⚠️ Cuenta suspendida: ${userId}`))
                        if (fs.existsSync(pathMikuJadiBot)) {
                            fs.rmSync(pathMikuJadiBot, { recursive: true, force: true })
                        }
                        break
                    case 500:
                        console.log(chalk.bold.red(`🎶 Error interno del servidor para ${userId}`))
                        break
                }
                endSession(`connection_closed_${reason}`)
            }
            
            if (connection === 'connecting') {
                global.connStatus.set(userId, 'connecting')
                console.log(`🎵 Conectando ${userId}...`)
                connectionTimeout = setTimeout(() => {
                    console.log(`🎵 Timeout de conexión para ${userId}`)
                    endSession('connection_timeout')
                }, 60000) 
            }
            
            if (global.db.data == null) loadDatabase()
            if (connection === 'open') {
                global.connStatus.set(userId, 'connected')
                global.reconnectAttempts.delete(userId) 
                if (!global.db.data?.users) loadDatabase()
                let userName = sock.authState.creds.me?.name || `Fan de Miku ${userId}`
                let userJid = sock.authState.creds.me?.jid || `${userId}@s.whatsapp.net`
                console.log(chalk.bold.cyan(`🎤 ${userName} (${userId}) ¡Conectado al concierto de Miku!`))
                sock.isInit = true
                if (!global.conns || typeof global.conns.set !== 'function') global.conns = new Map()
                global.conns.set(userId, sock)
                startHeartbeat()
                await joinChannels(sock)
                if (m?.chat) {
                    await conn.sendMessage(m.chat, {
                        text: args[0] ? 
                            `🎵 @${m.sender.split('@')[0]}, ya estás conectado al concierto de Miku, leyendo mensajes...` : 
                            `💎 @${m.sender.split('@')[0]}, ¡Bienvenido al concierto digital de Hatsune Miku!`, 
                        mentions: [m.sender]
                    }, { quoted: m })
                }
            }
        }

        const healthCheck = setInterval(async () => {
            if (!sock.user || !sock.ws || !sock.ws.socket || sock.ws.socket.readyState !== ws.OPEN) {
                console.log(`🎵 Conexión no saludable detectada para ${userId}`)
                clearInterval(healthCheck)
                stopHeartbeat()
                try { 
                    if (sock.ws && sock.ws.socket) sock.ws.close() 
                } catch (e) { }
                sock.ev.removeAllListeners()
                if (!global.conns || typeof global.conns.delete !== 'function') global.conns = new Map()
                if (!global.connStatus || typeof global.connStatus.delete !== 'function') global.connStatus = new Map()
                global.conns.delete(userId)
                global.connStatus.delete(userId)
            }
        }, 60000)

        let handler = await import('../handler.js')
        let creloadHandler = async function (restatConn) {
            try {
                const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(Handler || {}).length) handler = Handler
            } catch (e) {
                console.error(`🎵 Error en Miku Handler para ${userId}: `, e)
            }
            if (restatConn) {
                const oldChats = sock.chats
                try { sock.ws.close() } catch { }
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                sock.userId = userId
                sock.isSubBot = true
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

export function cleanupDeadConnections() {
 
    if (!global.conns || typeof global.conns.delete !== 'function') {
        global.conns = new Map()
    }
    if (!global.connStatus || typeof global.connStatus.delete !== 'function') {
        global.connStatus = new Map()
    }
    for (const [userId, conn] of global.conns.entries()) {
        if (!conn || !conn.ws || !conn.ws.socket || conn.ws.socket.readyState !== ws.OPEN) {
            console.log(`🎵 Limpiando conexión muerta: ${userId}`)
            global.conns.delete(userId)
            global.connStatus.delete(userId)
        }
    }
}

setInterval(cleanupDeadConnections, 300000)

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
