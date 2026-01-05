import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"
import "./lib/cache.js"

const { proto } = (await import("@whiskeysockets/baileys")).default
const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

let processedButtonMessages = new Map()
const messageCache = new Map()

const getMessageCache = (key) => messageCache.get(key)
const setMessageCache = (key, value) => {
    messageCache.set(key, value)
    setTimeout(() => messageCache.delete(key), 10000) 
}

export async function handler(chatUpdate) {
    
    const messageId = chatUpdate?.messages?.[0]?.key?.id
    if (messageId && getMessageCache(messageId)) return
    
    if (messageId) {
        setMessageCache(messageId, true)
    }

    this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate) {
return
}
this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m) {
return
}

const messageKey = m.key?.id
if (messageKey && (m.message?.buttonsResponseMessage || m.message?.templateButtonReplyMessage)) {
  const now = Date.now()
  const lastProcessed = processedButtonMessages.get(messageKey)

  if (lastProcessed && (now - lastProcessed) < 2000) { 
    return
  }

  processedButtonMessages.set(messageKey, now)

  setTimeout(() => {
    processedButtonMessages.delete(messageKey)
  }, 5000) 
}

if (global.db.data == null) await global.loadDatabase()
  const getUserSafe = (jid) => {
    try {
      if (typeof global.getUser === 'function') return global.getUser(jid)
      if (!global.db) global.db = { data: { users: {}, chats: {}, settings: {} } }
      if (!global.db.data.users) global.db.data.users = {}
      if (!global.db.data.users[jid]) global.db.data.users[jid] = { name: '', exp: 0, coin: 0, bank: 0, level: 0, health: 100, genre: '', birth: '', marry: '', description: '', packstickers: null, premium: false, premiumTime: 0, banned: false, bannedReason: '', commands: 0, afk: -1, afkReason: '', warn: 0, registered: false, Subs: 0 }
      return global.db.data.users[jid]
    } catch (e) {
      return {}
    }
  }
  const getChatSafe = (jid) => {
    try {
      if (typeof global.getChat === 'function') return global.getChat(jid)
      if (!global.db) global.db = { data: { users: {}, chats: {}, settings: {} } }
      if (!global.db.data.chats) global.db.data.chats = {}
      if (!global.db.data.chats[jid]) global.db.data.chats[jid] = { isBanned: false, isMute: false, welcome: false, sWelcome: '', sBye: '', detect: true, primaryBot: null, modoadmin: false, antiLink: true, nsfw: false, economy: true, gacha: true }
      return global.db.data.chats[jid]
    } catch (e) {
      return {}
    }
  }
try {
  m = smsg(this, m) || m
  if (!m) {
  return
  }
  m.exp = 0
  try {
  let user = getUserSafe(m.sender)
  let chat = getChatSafe(m.chat)
  if (global.botCache) global.botCache.cacheUser(m.sender, user, 300000)
  if (global.botCache) global.botCache.cacheChat(m.chat, chat, 300000)
  const settings = global.db.data.settings[this.user.jid]
  if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
  if (settings) {
  if (!("self" in settings)) settings.self = false
  if (!("jadibotmd" in settings)) settings.jadibotmd = true
  } else global.db.data.settings[this.user.jid] = {
  self: false,
  jadibotmd: true
  }} catch (e) {
  console.error(e)
  }
if (typeof m.text !== "string") m.text = ""
const user = global.getUser(m.sender)
try {
const actual = user.name || ""
const nuevo = m.pushName || await this.getName(m.sender)
if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
user.name = nuevo
}} catch {}
const chat = global.getChat(m.chat)
const settings = global.db.data.settings[this.user.jid]  
const isROwner = [...global.owner.map((number) => Array.isArray(number) ? number[0] : number)].map(v => String(v).replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)
const isOwner = isROwner || m.fromMe
const isPrems = isROwner || global.prems.map(v => String(v).replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender) || user.premium == true
const isOwners = [this.user.jid, ...global.owner.map((number) => (Array.isArray(number) ? number[0] : number) + "@s.whatsapp.net")].includes(m.sender)
if (opts["queque"] && m.text && !(isPrems)) {
const queque = this.msgqueque, time = 1000 * 1
const previousID = queque[queque.length - 1]
queque.push(m.id || m.key.id)
setInterval(async function () {
if (queque.indexOf(previousID) === -1) clearInterval(this)
await delay(time)
}, time)
}
 
if (m.isBaileys) return
m.exp += Math.ceil(Math.random() * 10)
let usedPrefix
const groupMetadata = m.isGroup ? { ...(conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}), ...(((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants) && { participants: ((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants || []).map(p => ({ ...p, id: p.jid, jid: p.jid, lid: p.lid })) }) } : {}
const participants = ((m.isGroup ? groupMetadata.participants : []) || []).map(participant => ({ id: participant.jid, jid: participant.jid, lid: participant.lid, admin: participant.admin }))
const userGroup = (m.isGroup ? participants.find((u) => conn.decodeJid(u.jid) === m.sender) : {}) || {}
const botGroup = (m.isGroup ? participants.find((u) => conn.decodeJid(u.jid) == this.user.jid) : {}) || {}
const isRAdmin = userGroup?.admin == "superadmin" || false
const isAdmin = isRAdmin || userGroup?.admin == "admin" || false
const isBotAdmin = botGroup?.admin || false

const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin) continue
if (plugin.disabled) continue


if (m.isGroup && chat?.isBanned && !isROwner) {
  const allowWhileBanned = new Set([
    'grupo-banchat.js',
    'grupo-unbanchat.js'
  ])
  if (!allowWhileBanned.has(name)) continue
}

const __filename = join(___dirname, name)
if (typeof plugin.all === "function") {
try {
await plugin.all.call(this, m, {
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
})
} catch (err) {
console.error(err)
}}
if (!opts["restrict"])
if (plugin.tags && plugin.tags.includes("admin")) {
continue
}
const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
const pluginPrefix = plugin.customPrefix || conn.prefix || global.prefix
const match = (pluginPrefix instanceof RegExp ?
[[pluginPrefix.exec(m.text), pluginPrefix]] :
Array.isArray(pluginPrefix) ?
pluginPrefix.map(prefix => {
const regex = prefix instanceof RegExp ?
prefix : new RegExp(strRegex(prefix))
return [regex.exec(m.text), regex]
}) : typeof pluginPrefix === "string" ?
[[new RegExp(strRegex(pluginPrefix)).exec(m.text), new RegExp(strRegex(pluginPrefix))]] :
[[[], new RegExp]]).find(prefix => prefix[1])
if (typeof plugin.before === "function") {
if (await plugin.before.call(this, m, {
  match,
  conn: this,
  participants,
  groupMetadata,
  userGroup,
  botGroup,
  isROwner,
  isOwner,
  isRAdmin,
  isAdmin,
  isBotAdmin,
  isPrems,
  chatUpdate,
  __dirname: ___dirname,
  __filename,
  user,
  chat,
  settings
})) {
  continue
  }
}
if (typeof plugin !== "function") {
continue
}
if ((usedPrefix = (match[0] || "")[0])) {
const noPrefix = m.text.replace(usedPrefix, "")
let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
args = args || []
let _args = noPrefix.trim().split(" ").slice(1)
let text = _args.join(" ")
command = (command || "").toLowerCase()
const fail = plugin.fail || global.dfail

const isAccept = plugin.command instanceof RegExp ?
plugin.command.test(command) :
Array.isArray(plugin.command) ?
plugin.command.some(cmd => cmd instanceof RegExp ?
cmd.test(command) : cmd === command) :
typeof plugin.command === "string" ?
plugin.command === command : false
global.comando = command

if (!isOwners && settings.self) return
if ((m.id.startsWith("NJX-") || (m.id.startsWith("BAE5") && m.id.length === 16) || (m.id.startsWith("B24E") && m.id.length === 20))) return

if (chat.primaryBot && chat.primaryBot !== this.user.jid) {
  const primaryBotConn = global.conns.find(conn => conn.user.jid === chat.primaryBot && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED)
  const participants = m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
  const primaryBotInGroup = participants.some(p => p.jid === chat.primaryBot)
  if (primaryBotConn && primaryBotInGroup || chat.primaryBot === this.user.jid) {
    throw !1
  } else {
    chat.primaryBot = null
  }
} else {
}

if (!isAccept) continue
m.plugin = name
if (isAccept) {
user.commands = (user.commands || 0) + 1
try {
if (!global.db.data.stats) global.db.data.stats = {}
if (!global.db.data.stats[name]) global.db.data.stats[name] = { total: 0 }
if (typeof global.db.data.stats[name].total !== 'number') global.db.data.stats[name].total = 0
global.db.data.stats[name].total += 1

if (!global.db.data.statsByBot) global.db.data.statsByBot = {}
const botId = this.user?.jid || 'unknown'
if (!global.db.data.statsByBot[botId]) global.db.data.statsByBot[botId] = {}
if (!global.db.data.statsByBot[botId][name]) global.db.data.statsByBot[botId][name] = { total: 0 }
if (typeof global.db.data.statsByBot[botId][name].total !== 'number') global.db.data.statsByBot[botId][name].total = 0
global.db.data.statsByBot[botId][name].total += 1
} catch (e) {
}
}
if (chat) {
  const botId = this.user.jid
  const primaryBotId = chat.primaryBot
if (name !== "group-banchat.js" && chat?.isBanned && !isROwner) {
if (!primaryBotId || primaryBotId === botId) {
const aviso = `💙 El bot *${global.botname}* está desactivado en este grupo\n\n> 🌱 Un *administrador* puede activarlo con el comando:\n> » *${usedPrefix}bot on*`.trim()
await m.reply(aviso)
return
}}
if (m.text && user.banned && !isROwner) {
const mensaje = `💙 Estas baneado/a, no puedes usar comandos en este bot!\n\n> ● *Razón ›* ${user.bannedReason}\n\n> ● Si este Bot es cuenta oficial y tienes evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`.trim()
if (!primaryBotId || primaryBotId === botId) {
m.reply(mensaje)
return
}}}

const adminMode = chat.modoadmin || false
const isCommand = plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || pluginPrefix || m.text.slice(0, 1) === pluginPrefix || plugin.command


if (adminMode && m.isGroup && !isOwner && !isAdmin) {
  
  return false
}

if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
fail("owner", m, this)
continue
}
if (plugin.rowner && !isROwner) {
fail("rowner", m, this)
continue
}
if (plugin.owner && !isOwner) {
fail("owner", m, this)
continue
}
if (plugin.premium && !isPrems) {
fail("premium", m, this)
continue
}
if (plugin.group && !m.isGroup) {
fail("group", m, this)
continue
} else if (plugin.botAdmin && !isBotAdmin) {
fail("botAdmin", m, this)
continue
} else if (plugin.admin && !isAdmin) {
fail("admin", m, this)
continue
}
if (plugin.register && !user.registered) {
  
  async function replyWithChannel(conn, chat, text, quoted = null) {
    try {
      const buttons = []
      const urls = [['🎵 Canal Oficial 💙', 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o']]
      
      await conn.sendNCarousel(chat, text, '💙 Hatsune Miku Bot', null, buttons, null, urls, null, quoted);
    } catch (error) {
      console.log('Error con botones, usando reply simple:', error.message);
      conn.reply(chat, `${text}\n\n🎵 *Canal Oficial:* https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o`, quoted);
    }
  }

  const restrictedMsg = `╭─「 🎵 *MIKU BOT* 🎵 」─╮
┃ 🚫 *¡ACCESO RESTRINGIDO!* 🚫
┃╰────────────────╯

🌸 *📝 REGISTRO REQUERIDO* 🌸

💙 *Este comando requiere registro para usarlo*

🎯 *Usa este comando para registrarte:*
${usedPrefix}reg nombre.edad

📝 *Ejemplo práctico:*
${usedPrefix}reg ${m.name || 'MikuFan'}.18

👓 *¿Qué obtienes al registrarte?*
🌱 • Cebollines para comprar en la tienda
⭐ • Experiencia y niveles
🎟️ • Tickets exclusivos
🎤 • Acceso a todos los comandos

🌱 *¡Únete a la familia Miku!*
📢 Canal oficial: https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o

╰─「 💙 *¡Regístrate para desbloquear!* 💙 」─╯

💫 *Escribe ${usedPrefix}reg para comenzar tu aventura* 💫`

  await replyWithChannel(this, m.chat, restrictedMsg, m)
  continue
}
if (plugin.private && m.isGroup) {
fail("private", m, this)
continue
}
m.isCommand = true
m.exp += plugin.exp ? parseInt(plugin.exp) : 10
let extra = {
match,
usedPrefix,
noPrefix,
_args,
args,
command,
text,
conn: this,
participants,
groupMetadata,
userGroup,
botGroup,
isROwner,
isOwner,
isRAdmin,
isAdmin,
isBotAdmin,
isPrems,
chatUpdate,
__dirname: ___dirname,
__filename,
user,
chat,
settings
}
try {
await plugin.call(this, m, extra)
} catch (err) {
m.error = err
console.error(err)
} finally {
if (typeof plugin.after === "function") {
try {
await plugin.after.call(this, m, extra)
} catch (err) {
console.error(err)
}}}}}} catch (err) {
console.error(err)
} finally {
if (opts["queque"] && m.text) {
const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
if (quequeIndex !== -1)
this.msgqueque.splice(quequeIndex, 1)
}
let user, stats = global.db.data.stats
if (m) {
if (m.sender) {
  const usr = global.getUser(m.sender)
  usr.exp += m.exp
}}
try {
if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
} catch (err) {
console.warn(err)
console.log(m.message)
}}}

global.dfail = (type, m, conn) => {
const msg = {
rowner: `💙 El comando *${comando}* solo puede ser usado por los creadores del bot.`, 
owner: `💙 El comando *${comando}* solo puede ser usado por los desarrolladores del bot.`, 
mods: `💙 El comando *${comando}* solo puede ser usado por los moderadores del bot.`, 
premium: `💙 El comando *${comando}* solo puede ser usado por los usuarios premium.`, 
group: `💙 El comando *${comando}* solo puede ser usado en grupos.`,
private: `💙 El comando *${comando}* solo puede ser usado al chat privado del bot.`,
admin: `💙 El comando *${comando}* solo puede ser usado por los administradores del grupo.`, 
botAdmin: `💙 Para ejecutar el comando *${comando}* debo ser administrador del grupo.`,
restrict: `💙 Esta caracteristica está desactivada.`
}[type]
if (msg) return conn.reply(m.chat, msg, m, global.rcanal).then(_ => m.react('✖️'))
}
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
unwatchFile(file)
console.log(chalk.cyanBright("💙 Se actualizo 'handler.js'"))
if (global.reloadHandler) console.log(await global.reloadHandler())
})