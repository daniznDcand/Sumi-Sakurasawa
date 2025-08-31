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

let rtx = "*💎✧ ┈ Hatsune Miku - Virtual Diva Bot ┈ ✧💎*\n\n🎤 Conexión Sub-Bot Modo QR\n\n✨ Con otro celular o PC escanea este QR para convertirte en un *Sub-Bot* de Miku.\n\n🎵 El código QR expira en 30 segundos..."

let rtx2 = "*💎✧ ┈ Hatsune Miku - Virtual Diva Bot ┈ ✧💎*\n\n🎤 Conexión Sub-Bot Modo Código\n\n✨ Usa este código para convertirte en un *Sub-Bot* de Miku.\n\n🎵 Abre WhatsApp → Dispositivos Vinculados → Vincular Dispositivo → Vincular con número de teléfono"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const mikuJBOptions = {}


if (!global.conns || typeof global.conns.delete !== 'function') global.conns = new Map()
if (!global.connStatus || typeof global.connStatus.delete !== 'function') global.connStatus = new Map()
if (!global.reconnectAttempts || typeof global.reconnectAttempts.delete !== 'function') global.reconnectAttempts = new Map()

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {

    
    if (/^(verbots|subbots|botsconectados)$/i.test(command)) {
        const subbots = Array.from(global.conns.values()).filter(conn => 
            conn && conn.user && conn.ws && conn.ws.socket && 
            conn.ws.socket.readyState === ws.OPEN && conn.isInit
        )
        if (subbots.length === 0) {
            return m.reply('🎵 No hay subbots activos en este momento.')
        }

        let txt = '*💎 SUB-BOTS CONECTADOS:*\n\n';
        subbots.forEach((bot, i) => {
            const nombre = bot.user.name || 'Sub-Bot';
            const jid = bot.user.jid || 'Desconocido';
            const numero = jid.replace(/[^0-9]/g, '');
            txt += `*${i+1}.* ${nombre}\n└ wa.me/${numero}\n\n`;
        });
        return m.reply(txt);
    }

    
    if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
        return m.reply(`💎 El comando *${command}* está temporalmente deshabilitado por Miku.`)
    }
    
    
    let time = global.db.data.users[m.sender].Subs + 120000
    if (new Date - global.db.data.users[m.sender].Subs < 120000) {
        return conn.reply(m.chat, `🎤 Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot* con Miku.`, m)
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
            return m.reply(`🎵 Ya tienes una conexión activa con Miku. Usa *${usedPrefix}stop* para cerrar la sesión anterior.`)
        } else {
            
            global.conns.delete(id)
            global.connStatus.delete(id)
            global.reconnectAttempts.delete(id)
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

handler.help = ['qr', 'code', 'verbots', 'subbots', 'botsconectados']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'verbots', 'subbots', 'botsconectados']
export default handler 

export async function mikuJadiBot(options) {
    let { pathMikuJadiBot, m, conn, args, usedPrefix, command, userId } = options
    
    
    if (command === 'code') {
        command = 'qr'; 
        args.unshift('code')
    }
    
    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : 
                 args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
    
    let txtCode, codeBot, txtQR, pairingAttempts = 0
    
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
        if (args[0] && args[0] != undefined) {
            const credsData = JSON.parse(Buffer.from(args[0], "base64").toString("utf-8"))
            fs.writeFileSync(pathCreds, JSON.stringify(credsData, null, '\t'))
            console.log(`🎵 Credenciales cargadas para ${userId}`)
        }
    } catch (error) {
        console.error(`🎵 Error procesando credenciales para ${userId}:`, error)
        conn.reply(m.chat, `💎 Formato de credenciales inválido. Usa: ${usedPrefix + command} code`, m)
        return
    }

    const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
    exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
        const drmer = Buffer.from(drm1 + drm2, `base64`)

        try {
            let { version, isLatest } = await fetchLatestBaileysVersion()
            console.log(`🎵 Usando Baileys versión ${version} (${isLatest ? 'Última' : 'No es la última'})`)
            
            const msgRetryCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 })
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
                markOnlineOnConnect: false, 
                emitOwnEvents: false,
                getMessage: async (key) => ({ conversation: 'Hatsune Miku SubBot' }),
                shouldSyncHistoryMessage: msg => false, 
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage)
                    if (requiresPatch) {
                        message = { viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: {} }, ...message } } }
                    }
                    return message
                },
               
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: undefined,
                keepAliveIntervalMs: 10000,
                
                shouldIgnoreJid: jid => jid.endsWith('@broadcast') || jid.includes('status'),
            }

            let sock = makeWASocket(connectionOptions)
            sock.isInit = false
            sock.userId = userId
            sock.isSubBot = true
            sock.connectionRetries = 0
            sock.maxRetries = 3 
            sock.lastHeartbeat = Date.now()
            
            global.connStatus.set(userId, 'connecting')

            let isInit = true
            let connectionTimeout = null
            let heartbeatInterval = null
            let qrTimeout = null

            
            const startHeartbeat = () => {
                if (heartbeatInterval) clearInterval(heartbeatInterval)
                heartbeatInterval = setInterval(async () => {
                    if (sock && sock.ws && sock.ws.socket && sock.ws.socket.readyState === ws.OPEN) {
                        try {
                            await sock.sendPresenceUpdate('available')
                            sock.lastHeartbeat = Date.now()
                        } catch (error) {
                            console.log(`🎵 Heartbeat error for ${userId}:`, error.message)
                            
                            if (Date.now() - sock.lastHeartbeat > 90000) {
                                console.log(`🎵 Heartbeat timeout, desconectando ${userId}`)
                                await endSession('heartbeat_timeout')
                            }
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

           
            const endSession = async (reason = 'unknown') => {
                console.log(`🎵 Terminando sesión ${userId} - Razón: ${reason}`)
                
                
                stopHeartbeat()
                if (connectionTimeout) clearTimeout(connectionTimeout)
                if (qrTimeout) clearTimeout(qrTimeout)
                
                try {
                    
                    if (sock && sock.ws && sock.ws.socket) {
                        sock.ws.close()
                    }
                } catch (e) {
                    console.log(`🎵 Error cerrando websocket ${userId}:`, e.message)
                }
                
                
                try {
                    sock.ev.removeAllListeners()
                } catch (e) {
                    console.log(`🎵 Error removiendo listeners ${userId}:`, e.message)
                }
                
                
                global.conns.delete(userId)
                global.connStatus.delete(userId)
                global.reconnectAttempts.delete(userId)
                
                
                if (reason !== 'manual_disconnect' && m?.chat) {
                    try {
                        await conn.sendMessage(m.chat, {
                            text: `🎵 Tu Sub-Bot se desconectó del concierto de Miku.\n\n💫 Razón: ${reason}\n\n🎤 Usa *${usedPrefix}qr* o *${usedPrefix}code* para reconectar.`,
                            mentions: [m.sender]
                        }, { quoted: m })
                    } catch (e) {}
                }
                
                return true
            }

            
            async function connectionUpdate(update) {
                const { connection, lastDisconnect, isNewLogin, qr } = update
                
                
                if (connectionTimeout) {
                    clearTimeout(connectionTimeout)
                    connectionTimeout = null
                }
                
                if (isNewLogin) sock.isInit = false
                
                
                if (qr && !mcode) {
                    try {
                        if (m?.chat) {
                            
                            if (txtQR && txtQR.key) {
                                try { await conn.sendMessage(m.sender, { delete: txtQR.key }) } catch {}
                            }
                            
                            txtQR = await conn.sendMessage(m.chat, { 
                                image: await qrcode.toBuffer(qr, { 
                                    scale: 8, 
                                    margin: 2,
                                    color: { dark: '#000000', light: '#FFFFFF' }
                                }), 
                                caption: rtx.trim()
                            }, { quoted: m })
                            
                            console.log(`🎵 QR generado para ${userId}`)
                            
                            
                            if (qrTimeout) clearTimeout(qrTimeout)
                            qrTimeout = setTimeout(async () => {
                                if (txtQR && txtQR.key) {
                                    try { await conn.sendMessage(m.sender, { delete: txtQR.key }) } catch {}
                                }
                            }, 45000)
                        }
                        return
                    } catch (error) {
                        console.error(`🎵 Error generando QR para ${userId}:`, error)
                        return
                    }
                } 
                
              
                if (qr && mcode) {
                    try {
                        pairingAttempts++
                        if (pairingAttempts > 3) {
                            console.log(`🎵 Demasiados intentos de emparejamiento para ${userId}`)
                            await endSession('too_many_pairing_attempts')
                            return
                        }
                        
                        let phoneNumber = m.sender.split('@')[0]
                        let secret = await sock.requestPairingCode(phoneNumber)
                        secret = secret?.match(/.{1,4}/g)?.join("-")
                        
                        if (!secret) {
                            throw new Error('No se pudo generar el código de emparejamiento')
                        }
                        
                       
                        if (txtCode && txtCode.key) {
                            try { await conn.sendMessage(m.sender, { delete: txtCode.key }) } catch {}
                        }
                        if (codeBot && codeBot.key) {
                            try { await conn.sendMessage(m.sender, { delete: codeBot.key }) } catch {}
                        }
                        
                        txtCode = await conn.sendMessage(m.chat, { text: rtx2 }, { quoted: m })
                        await delay(2000) 
                        
                        codeBot = await conn.sendMessage(m.chat, {
                            text: `🎵 *CÓDIGO DE EMPAREJAMIENTO:*\n\n\`\`\`${secret}\`\`\`\n\n💫 Este código expira en 60 segundos\n🎤 Úsalo rápidamente en WhatsApp`
                        }, { quoted: m })
                        
                        console.log(chalk.cyan(`🎵 Código de emparejamiento Miku (${userId}): ${secret}`))
                        
                        
                        setTimeout(async () => {
                            if (txtCode && txtCode.key) {
                                try { await conn.sendMessage(m.sender, { delete: txtCode.key }) } catch {}
                            }
                            if (codeBot && codeBot.key) {
                                try { await conn.sendMessage(m.sender, { delete: codeBot.key }) } catch {}
                            }
                        }, 60000)
                        
                    } catch (error) {
                        console.error(`🎵 Error generando código para ${userId}:`, error)
                        if (m?.chat) {
                            await conn.sendMessage(m.chat, {
                                text: `❌ Error al generar código de emparejamiento:\n${error.message}`,
                                mentions: [m.sender]
                            }, { quoted: m })
                        }
                        await endSession('pairing_code_error')
                        return
                    }
                }

                const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
                
                
                if (connection === 'close') {
                    global.connStatus.set(userId, 'disconnected')
                    stopHeartbeat()
                    console.log(`🎵 Conexión cerrada para ${userId} - Código: ${reason}`)
                    
                    const shouldReconnect = [428, 408, 515, 503].includes(reason)
                    const currentRetries = global.reconnectAttempts.get(userId) || 0
                    
                    if (shouldReconnect && currentRetries < sock.maxRetries) {
                        console.log(`🎵 Intentando reconectar ${userId} (${currentRetries + 1}/${sock.maxRetries})`)
                        global.reconnectAttempts.set(userId, currentRetries + 1)
                        setTimeout(async () => {
                            try {
                                await creloadHandler(true)
                            } catch (error) {
                                console.error(`🎵 Error en reconexión de ${userId}:`, error)
                                await endSession('reconnection_failed')
                            }
                        }, Math.min(10000 * (currentRetries + 1), 60000)) 
                        return
                    }
                    
                    
                    switch (reason) {
                        case 440: 
                            console.log(chalk.bold.magenta(`💎 Sesión duplicada detectada para ${userId}`))
                            if (m?.chat) {
                                await conn.sendMessage(m.chat, {
                                    text: '🎤 *SESIÓN DUPLICADA DETECTADA*\n\n💫 Otra sesión está usando tu número\n🎵 Cierra la sesión duplicada para continuar',
                                    mentions: [m.sender]
                                }, { quoted: m })
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
                        case 503: 
                            console.log(chalk.bold.yellow(`🎵 Servidor WhatsApp temporalmente no disponible para ${userId}`))
                            break
                        default:
                            console.log(chalk.bold.red(`🎵 Desconexión inesperada para ${userId}: ${reason}`))
                    }
                    
                    await endSession(`connection_closed_${reason}`)
                }
                
                
                if (connection === 'connecting') {
                    global.connStatus.set(userId, 'connecting')
                    console.log(`🎵 Conectando ${userId}...`)
                    connectionTimeout = setTimeout(async () => {
                        console.log(`🎵 Timeout de conexión para ${userId}`)
                        await endSession('connection_timeout')
                    }, 90000) 
                }
                
               
                if (global.db.data == null) loadDatabase()
                if (connection === 'open') {
                    global.connStatus.set(userId, 'connected')
                    global.reconnectAttempts.delete(userId)
                    pairingAttempts = 0 
                    
                    if (!global.db.data?.users) loadDatabase()
                    
                    let userName = sock.authState.creds.me?.name || `Fan de Miku ${userId}`
                    let userJid = sock.authState.creds.me?.jid || `${userId}@s.whatsapp.net`
                    
                    console.log(chalk.bold.cyan(`🎤 ${userName} (${userId}) ¡Conectado al concierto de Miku!`))
                    
                    sock.isInit = true
                    global.conns.set(userId, sock)
                    startHeartbeat()
                    
                    
                    try {
                        await joinChannels(sock)
                    } catch (error) {
                        console.log(`🎵 Error uniéndose a canales para ${userId}:`, error.message)
                    }
                    
                    
                    if (txtQR && txtQR.key) {
                        try { await conn.sendMessage(m.sender, { delete: txtQR.key }) } catch {}
                    }
                    if (txtCode && txtCode.key) {
                        try { await conn.sendMessage(m.sender, { delete: txtCode.key }) } catch {}
                    }
                    if (codeBot && codeBot.key) {
                        try { await conn.sendMessage(m.sender, { delete: codeBot.key }) } catch {}
                    }
                    
                    
                    if (m?.chat) {
                        await conn.sendMessage(m.chat, {
                            text: args[0] ? 
                                `🎵 @${m.sender.split('@')[0]}, ya estás conectado al concierto de Miku como Sub-Bot!\n\n💎 Usuario: ${userName}\n🎤 Estado: Activo y leyendo mensajes...` : 
                                `💎 @${m.sender.split('@')[0]}, ¡Bienvenido al concierto digital de Hatsune Miku!\n\n🎵 Tu Sub-Bot está activo y funcionando correctamente.`, 
                            mentions: [m.sender]
                        }, { quoted: m })
                    }
                }
            }

            
            const healthCheck = setInterval(async () => {
                if (!sock || !sock.user || !sock.ws || !sock.ws.socket || 
                    sock.ws.socket.readyState !== ws.OPEN || !sock.isInit) {
                    console.log(`🎵 Conexión no saludable detectada para ${userId}`)
                    clearInterval(healthCheck)
                    await endSession('health_check_failed')
                }
            }, 120000) 

            
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
                    try { 
                        sock.ws.close() 
                    } catch { }
                    
                    sock.ev.removeAllListeners()
                    sock = makeWASocket(connectionOptions, { chats: oldChats })
                    sock.userId = userId
                    sock.isSubBot = true
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
            
            await creloadHandler(false)
            
        } catch (error) {
            console.error(`🎵 Error crítico en mikuJadiBot para ${userId}:`, error)
            if (m?.chat) {
                await conn.sendMessage(m.chat, {
                    text: `❌ Error crítico al inicializar Sub-Bot:\n${error.message}\n\nIntenta nuevamente en unos minutos.`,
                    mentions: [m.sender]
                }, { quoted: m })
            }
        }
    })
}


export function cleanupDeadConnections() {
    if (!global.conns || typeof global.conns.delete !== 'function') {
        global.conns = new Map()
    }
    if (!global.connStatus || typeof global.connStatus.delete !== 'function') {
        global.connStatus = new Map()
    }
    
    let cleaned = 0
    for (const [userId, conn] of global.conns.entries()) {
        if (!conn || !conn.ws || !conn.ws.socket || 
            conn.ws.socket.readyState !== ws.OPEN || !conn.isInit) {
            console.log(`🎵 Limpiando conexión muerta: ${userId}`)
            global.conns.delete(userId)
            global.connStatus.delete(userId)
            global.reconnectAttempts.delete(userId)
            cleaned++
        }
    }
    
    if (cleaned > 0) {
        console.log(`🎵 Se limpiaron ${cleaned} conexiones muertas`)
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
    if (!global.ch || typeof global.ch !== 'object') return
    
    for (const channelId of Object.values(global.ch)) {
        try {
            await conn.newsletterFollow(channelId)
            console.log(`🎵 SubBot unido al canal: ${channelId}`)
        } catch (error) {
            console.log(`🎵 Error uniéndose al canal ${channelId}:`, error.message)
        }
    }
}


export async function stopSubBot(userId) {
    if (!global.conns || !global.conns.has(userId)) {
        return false
    }
    
    const conn = global.conns.get(userId)
    
    try {
        console.log(`🎵 Deteniendo SubBot ${userId} manualmente...`)
        
        
        if (conn.ws && conn.ws.socket) {
            conn.ws.close()
        }
        
        
        conn.ev.removeAllListeners()
        
        
        global.conns.delete(userId)
        global.connStatus.delete(userId)
        global.reconnectAttempts.delete(userId)
        
        console.log(`🎵 SubBot ${userId} detenido exitosamente`)
        return true
        
    } catch (error) {
        console.error(`🎵 Error deteniendo SubBot ${userId}:`, error)
        return false
    }
}
