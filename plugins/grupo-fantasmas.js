import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = ms => new Promise(res => setTimeout(res, ms))

var handler = async (m, { conn, text, participants, args, command }) => {

let member = participants.map(u => u.id)
if(!text) {
var sum = member.length
} else {
var sum = text} 
var total = 0
var sider = []
for (let i = 0; i < sum; i++) {
let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) { 
if (typeof global.db.data.users[member[i]] !== 'undefined'){
if (global.db.data.users[member[i]].whitelist == false){
total++
sider.push(member[i])}
}else {
total++
sider.push(member[i])}}}
if(total == 0) return conn.reply(m.chat, `${emoji} Este grupo es activo, no tiene fantasmas.`, m)

if (text !== 'eliminar') {
const listMsg = `${emoji} *${command === 'fantasmas' ? 'Revisión' : 'Eliminación'} de inactivos*\n\n${emoji2} *Lista de fantasmas*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n⚠️ *Total: ${total} usuarios*\n\n${command === 'fantasmas' ? '📝 *NOTA:* Esto no es al 100% acertado, el bot inicia el conteo de mensajes a partir de que se active en este número\n\n' : ''}💡 Para eliminarlos, presiona el botón de abajo:`

const buttons = [{
name: 'quick_reply',
buttonParamsJson: JSON.stringify({
display_text: '🗑️ Eliminar Inactivos',
id: `${m.prefix || '.'}${command} eliminar`
})
}]

return await conn.sendButton(m.chat, listMsg, '💙 Hatsune Miku Bot', null, buttons, m, { mentions: sider })
}

await m.reply(`👻 *ELIMINANDO USUARIOS FANTASMAS* 👻\n\n⏳ _Iniciando proceso de eliminación..._\n_Cada eliminación tiene una pausa de 3 segundos._\n\n📋 Usuarios a eliminar: ${total}`, null, { mentions: sider })

let chat = global.db.data.chats[m.chat]
let originalWelcome = chat.welcome
chat.welcome = false

let eliminated = 0
let errors = 0

try {
for (let user of sider) {
if (!user.endsWith('@s.whatsapp.net')) continue

let participant = participants.find(v => areJidsSameUser(v.id, user))
if (!participant) continue

if (participant.admin === 'admin' || participant.admin === 'superadmin') {
await conn.reply(m.chat, `⚠️ No se puede eliminar a @${user.split('@')[0]} (es administrador)`, m, { mentions: [user] })
continue
}

try {
await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
eliminated++
await conn.reply(m.chat, `✅ Usuario @${user.split('@')[0]} eliminado exitosamente`, m, { mentions: [user] })
await delay(3000)
} catch (e) {
errors++
console.error(`❌ Error eliminando ${user}:`, e)
await conn.reply(m.chat, `❌ No se pudo eliminar a @${user.split('@')[0]}`, m, { mentions: [user] })
}
}
} finally {
chat.welcome = originalWelcome
}

await conn.reply(m.chat, `🏁 **PROCESO COMPLETADO**\n\n✅ Usuarios eliminados: ${eliminated}\n❌ Errores: ${errors}\n👻 Total procesados: ${total}`, m)

}
handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler

