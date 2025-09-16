import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = ms => new Promise(res => setTimeout(res, ms))

const handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!isBotAdmin) throw 'El bot no es admin.'
  let now = +new Date
  let threshold = 1000 * 60 * 60 * 24 * 7 
  let ghosts = []
  for (let user of participants) {
    if (user.admin) continue
    let data = global.db.data.users[user.id] || {}
    let lastSeen = data.lastseen || data.lastSeen || 0
    if (now - lastSeen > threshold) ghosts.push(user.id)
  }
  if (!ghosts.length) return conn.reply(m.chat, `👻 Este grupo es activo, no tiene fantasmas.`, m)
  await m.reply(`👻 *Eliminación de inactivos*\n\n🗒️ *Lista de fantasmas*\n${ghosts.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n_El bot eliminará a los usuarios de la lista mencionada cada 10 segundos._`, null, { mentions: ghosts })
  let chat = global.db.data.chats[m.chat]
  chat.welcome = false
  try {
    for (let user of ghosts) {
      let participant = participants.find(v => areJidsSameUser(v.id, user) || v.id === user)
      const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin')
      if (!isAdmin) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
          await delay(10000)
        } catch (e) {
          await conn.reply(m.chat, `❌ No se pudo eliminar a @${user.split('@')[0]}: ${e?.message || e}`, m, { mentions: [user] })
        }
      } else {
        await conn.reply(m.chat, `⚠️ No se puede eliminar a @${user.split('@')[0]} (es admin)`, m, { mentions: [user] })
      }
    }
  } finally {
    chat.welcome = true
  }
  await conn.reply(m.chat, `✅ Proceso de eliminación finalizado.`, m)
}

handler.tags = ['group']
handler.command = /^(kickfantasmas|eliminarfantasmas)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true


export default handler
