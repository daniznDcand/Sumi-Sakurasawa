import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants, command }) => {
  
  let member = participants.map(u => u.id)
  let sum = (!text) ? member.length : text 
  var total = 0
  var sider = []

  
  for (let i = 0; i < sum; i++) {
    let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
    if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) {
      if (typeof global.db.data.users[member[i]] !== 'undefined') {
        if (!global.db.data.users[member[i]].whitelist) {
          total++
          sider.push(member[i])
        }
      } else {
        total++
        sider.push(member[i])
      }
    }
  }

  
  const delay = time => new Promise(res => setTimeout(res, time))

  switch (command) {
    case 'fantasmas':
      if (total == 0) return conn.reply(m.chat, `${emoji} Este grupo es activo, no tiene fantasmas.`, m)
      m.reply(`${emoji} *Revisión de inactivos*\n\n${emoji2} *Lista de fantasmas*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n*📝 NOTA:*\nEsto no es 100% exacto, el bot cuenta mensajes desde que se activa.`, null, { mentions: sider })
      break

    case 'kickfantasmas':
      if (total == 0) return conn.reply(m.chat, `${emoji} Este grupo es activo, no tiene fantasmas.`, m)
      await m.reply(`${emoji} *Eliminación de inactivos*\n\n${emoji2} *Lista de fantasmas*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n_El bot eliminará a estos usuarios, uno cada 10 segundos._`, null, { mentions: sider })
      await delay(10000)
      let chat = global.db.data.chats[m.chat]
      chat.welcome = false
      try {
        for (let user of sider) {
          
          if (user.endsWith('@s.whatsapp.net') && !(participants.find(v => areJidsSameUser(v.id, user)) || { admin: true }).admin) {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            await delay(10000)
          }
        }
      } finally {
        chat.welcome = true
      }
      break
  }
}

handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler

