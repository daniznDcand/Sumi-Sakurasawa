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
await m.reply(`🔍 *Analizando SubBots...*\n\n🤖 Buscando SubBots activos en el grupo...`)


const subBots = global.conns || []
const activeSubBots = subBots.filter(subbot => {
try {
return subbot && subbot.user && subbot.ws && subbot.ws.socket && subbot.ws.socket.readyState === 1
} catch (e) {
return false
}
})


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
socket: subbot,
status: '🟢 Activo',
connection: 'Conectado',
lastSeen: new Date().toLocaleString()
})
}
} catch (e) {
console.log('Error verificando SubBot en grupo:', e.message)
}
}


let message = `🤖 *INFORME COMPLETO DE SUBBOTS*\n\n`

if (subBotsInGroup.length === 0) {
message += `❌ *No hay SubBots activos en este grupo*\n\n`
message += `📊 *Estadísticas globales:*\n`
message += `• SubBots totales conectados: ${activeSubBots.length}\n`
message += `• SubBots en este grupo: 0\n`
message += `• Estado del sistema: ${activeSubBots.length > 0 ? '🟢 Operativo' : '🔴 Inactivo'}\n\n`
message += `💡 *Para conectar un SubBot usa:* \`${usedPrefix}code\``
} else {
message += `📊 *Resumen del grupo:*\n`
message += `• SubBots activos en este grupo: ${subBotsInGroup.length}\n`
message += `• SubBots totales conectados: ${activeSubBots.length}\n`
message += `• Porcentaje del grupo: ${Math.round((subBotsInGroup.length / activeSubBots.length) * 100)}%\n\n`

message += `🤖 *Lista detallada de SubBots:*\n\n`
subBotsInGroup.forEach((subbot, index) => {
message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
message += `📱 *SubBot #${index + 1}*\n`
message += `🦍 *Nombre:* ${subbot.name}\n`
message += `🆔 *JID:* ${subbot.jid}\n`
message += `😎 *Estado:* ${subbot.status}\n`
message += `🔌 *Conexión:* ${subbot.connection}\n`
message += `🕐 *Última actividad:* ${subbot.lastSeen}\n`
message += `💡 *Control:* Usa \`${usedPrefix}offsubbot ${index + 1}\` para apagar\n\n`
})

message += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
message += `🎮 *Comandos de control:*\n`
message += `• \`${usedPrefix}offsubbot <número>\` - Apagar SubBot específico\n`
message += `• \`${usedPrefix}offsubbot todos\` - Apagar todos los SubBots\n\n`
message += `⚠️ *Nota:* Los SubBots apagados permanecerán en el grupo pero no responderán comandos.`
}


global.lastSubBotsInGroup = subBotsInGroup
global.lastSubBotsChat = m.chat

await conn.reply(m.chat, message, m)

} catch (error) {
console.error('Error analizando SubBots:', error)
return m.reply(`❌ Error al analizar SubBots: ${error.message}`)
}
}

handler.help = ['verbots']
handler.tags = ['serbot']
handler.command = ['verbots']

export default handler
