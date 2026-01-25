import chalk from 'chalk'


let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) {
return m.reply(`💙 El Comando *${command}* está desactivado temporalmente.`)
}

if (!globalThis.db.data.settings[conn.user.jid].serbot) {
return m.reply(`💙 La función *serbot* está desactivada.`)
}


const isSubBot = conn.isSubBot === true
if (!isSubBot) {
return m.reply(`❌ Este comando solo puede ser usado por un SubBot.`)
}

try {

const currentChat = m.chat


if (!currentChat.endsWith('@g.us')) {
return m.reply(`❌ Este comando solo funciona en grupos.`)
}

await m.reply(`🔄 *Saliendo del grupo...*\n\n🤖 El SubBot está abandonando el grupo...`)


await conn.groupLeave(currentChat)

console.log(chalk.blue(`🤖 SubBot ${conn.user.jid} salió del grupo ${currentChat}`))


if (global.conn && global.conn.user) {
try {
await global.conn.sendMessage(currentChat, {
text: `✅ *SubBot desconectado*\n\n🤖 El SubBot ha salido del grupo correctamente.\n📱 El bot principal seguirá funcionando normalmente.`
}, { quoted: m })
} catch (e) {
console.log('No se pudo notificar al bot principal:', e.message)
}
}

} catch (error) {
console.error('Error al salir del grupo:', error)
return m.reply(`❌ Error al salir del grupo: ${error.message}`)
}
}

handler.help = ['salir']
handler.tags = ['serbot']
handler.command = ['salir']

export default handler
