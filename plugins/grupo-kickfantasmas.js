
import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants, args, command }) => {
  let member = participants.map(u => u.id)
  let sum = text ? Number(text) : member.length
  let total = 0
  let sider = []
  for (let i = 0; i < sum; i++) {
    let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
    if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) {
      if (typeof global.db.data.users[member[i]] !== 'undefined') {
        if (global.db.data.users[member[i]].whitelist == false) {
          total++
          sider.push(member[i])
        }
      } else {
        total++
        sider.push(member[i])
      }
    }
  }
  const delay = ms => new Promise(res => setTimeout(res, ms))
  if (total == 0) return conn.reply(m.chat, `👻 Este grupo es activo, no tiene fantasmas.`, m)
  await m.reply(`👻 *Eliminación de inactivos*\n\n🗒️ *Lista de fantasmas*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n_El bot eliminará a los usuarios de la lista mencionada cada 10 segundos._`, null, { mentions: sider })
  let chat = global.db.data.chats[m.chat]
  chat.welcome = false
  try {
    let users = sider.filter(u => !areJidsSameUser(u, conn.user.id))
    for (let user of users) {
      if (user.endsWith('@s.whatsapp.net') && !(participants.find(v => areJidsSameUser(v.id, user)) || { admin: true }).admin) {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        await delay(10000)
      }
    }
  } finally {
    chat.welcome = true
  }
  await conn.reply(m.chat, `✅ Proceso de eliminación finalizado.`, m)
}

handler.tags = ['grupo']
handler.command = ['kickfantasmas', 'eliminarfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler
