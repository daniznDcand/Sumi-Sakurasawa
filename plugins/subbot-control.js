import chalk from 'chalk'


let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
return m.reply(`💙 El Comando *${command}* está desactivado temporalmente.`)
}

if (!globalThis.db.data.settings[conn.user.jid].serbot) {
return m.reply(`💙 La función *serbot* está desactivada.`)
}


const isSubBot = conn.isSubBot === true
if (isSubBot) {
return m.reply(`❌ Este comando solo puede ser usado por el bot principal.`)
}


if (!m.chat.endsWith('@g.us')) {
return m.reply(`❌ Este comando solo funciona en grupos.`)
}

try {
await m.reply(`🔍 *Buscando SubBots en el grupo...*\n\n🤖 Identificando SubBots activos...`)


const subBots = global.conns || []
const activeSubBots = subBots.filter(subbot => {
try {
return subbot && subbot.user && subbot.ws && subbot.ws.socket && subbot.ws.socket.readyState === 1
} catch (e) {
return false
}
})

if (activeSubBots.length === 0) {
return m.reply(`❌ No hay SubBots activos conectados.`)
}


const subBotsInGroup = []
for (const subbot of activeSubBots) {
try {

const groupMetadata = await conn.groupMetadata(m.chat)
const participants = groupMetadata.participants.map(p => p.id)
const subbotJid = subbot.user.jid

if (participants.includes(subbotJid)) {
subBotsInGroup.push({
jid: subbotJid,
name: subbot.user.name || subbot.user.verifiedName || subbotJid.split('@')[0],
socket: subbot
})
}
} catch (e) {
console.log('Error verificando SubBot en grupo:', e.message)
}
}

if (subBotsInGroup.length === 0) {
return m.reply(`❌ No hay SubBots en este grupo.\n\n📊 SubBots activos totales: ${activeSubBots.length}`)
}


let message = `🤖 *SubBots encontrados en el grupo:*\n\n`
subBotsInGroup.forEach((subbot, index) => {
message += `${index + 1}. 📱 ${subbot.name}\n   👤 ${subbot.jid}\n\n`
})

message += `💡 *Para apagar un SubBot específico usa:*\n\`${usedPrefix}apagarsubbot <número>\`\n\n`
message += `💡 *Para apagar todos los SubBots del grupo usa:*\n\`${usedPrefix}apagarsubbot todos\``

await conn.reply(m.chat, message, m)


global.lastSubBotsInGroup = subBotsInGroup
global.lastSubBotsChat = m.chat

} catch (error) {
console.error('Error buscando SubBots:', error)
return m.reply(`❌ Error al buscar SubBots: ${error.message}`)
}
}


let apagarHandler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
return m.reply(`💙 El Comando *${command}* está desactivado temporalmente.`)
}


const isSubBot = conn.isSubBot === true
if (isSubBot) {
return m.reply(`❌ Este comando solo puede ser usado por el bot principal.`)
}


if (!m.chat.endsWith('@g.us')) {
return m.reply(`❌ Este comando solo funciona en grupos.`)
}


if (!global.lastSubBotsInGroup || !global.lastSubBotsChat || global.lastSubBotsChat !== m.chat) {
return m.reply(`❌ Primero usa \`${usedPrefix}subbots\` para identificar los SubBots en este grupo.`)
}

const target = args[0]?.toLowerCase()
if (!target) {
return m.reply(`💡 *Uso del comando*\n\n\`${usedPrefix}apagarsubbot <número>\` - Apagar SubBot específico\n\`${usedPrefix}apagarsubbot todos\` - Apagar todos los SubBots\n\n📋 *SubBots disponibles:* ${global.lastSubBotsInGroup.length}`)
}

try {
const subBotsInGroup = global.lastSubBotsInGroup

if (target === 'todos') {
await m.reply(`🔄 *Apagando todos los SubBots...*\n\n🤖 Desconectando ${subBotsInGroup.length} SubBots del grupo...`)

let disconnected = 0
for (const subbot of subBotsInGroup) {
try {
if (subbot.socket.ws && subbot.socket.ws.socket) {
subbot.socket.ws.socket.close()
}
const index = global.conns.indexOf(subbot.socket)
if (index > -1) {
global.conns.splice(index, 1)
}
disconnected++
console.log(chalk.blue(`🤖 SubBot ${subbot.jid} desconectado del grupo ${m.chat}`))
} catch (e) {
console.log(`Error apagando SubBot ${subbot.jid}:`, e.message)
}
}

await conn.reply(m.chat, `✅ *SubBots apagados*\n\n🤖 ${disconnected} SubBots se desconectaron correctamente.\n📱 Permanecen en el grupo pero no responderán comandos.\n🔧 El bot principal sigue funcionando normalmente.`, m)

} else {
const index = parseInt(target) - 1
if (isNaN(index) || index < 0 || index >= subBotsInGroup.length) {
return m.reply(`❌ Número inválido. Usa un número del 1 al ${subBotsInGroup.length}.`)
}

const subbot = subBotsInGroup[index]
await m.reply(`🔄 *Apagando SubBot...*\n\n🤖 Desconectando a ${subbot.name} del grupo...`)

try {
if (subbot.socket.ws && subbot.socket.ws.socket) {
subbot.socket.ws.socket.close()
}
const socketIndex = global.conns.indexOf(subbot.socket)
if (socketIndex > -1) {
global.conns.splice(socketIndex, 1)
}
console.log(chalk.blue(`🤖 SubBot ${subbot.jid} desconectado del grupo ${m.chat}`))

await conn.reply(m.chat, `✅ *SubBot apagado*\n\n🤖 ${subbot.name} se desconectó correctamente.\n📱 Permanece en el grupo pero no responderá comandos.\n🔧 El bot principal sigue funcionando normalmente.`, m)

} catch (e) {
console.error('Error apagando SubBot:', e)
return m.reply(`❌ Error al apagar el SubBot: ${e.message}`)
}
}

} catch (error) {
console.error('Error en apagarsubbot:', error)
return m.reply(`❌ Error: ${error.message}`)
}
}


handler.help = ['subbots']
handler.tags = ['serbot']
handler.command = ['subbots']

apagarHandler.help = ['apagarsubbot']
apagarHandler.tags = ['serbot']
apagarHandler.command = ['apagarsubbot']

export { handler as subbotsHandler, apagarHandler }
export default handler
