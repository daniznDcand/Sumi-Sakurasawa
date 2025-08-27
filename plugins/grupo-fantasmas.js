import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants, command }) => {
  let member = participants.map(u => u.id)
  let sum = (!text) ? member.length : text
  var total = 0
  var sider = []

  for (let i = 0; i < sum; i++) {
    let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
    let isAdmin = users?.admin === 'admin' || users?.admin === 'superadmin' || users?.isAdmin || users?.isSuperAdmin || false
  
    if (
      member[i].endsWith('@s.whatsapp.net') &&
      (typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) &&
      !isAdmin
    ) {
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

  const emoji = '👻'
  const emoji2 = '🗒️'

  switch (command) {
    case 'fantasmas':
      if (total == 0) return conn.reply(m.chat, `${emoji} Este grupo es activo, no tiene fantasmas.`, m)
      
      await conn.reply(
        m.chat,
        `${emoji} *Revisión de inactivos*\n\n${emoji2} *Lista de fantasmas*\n${sider.map(v => '@' + v.split('@')[0]).join('\n')}\n\n*📝 NOTA:*\nEsto no es 100% exacto, el bot cuenta mensajes registrados por él, no cuenta los mensajes antiguos ni los enviados antes de que se añadiera el bot.`,
        m,
        { mentions: sider }
      )
      break

    case 'kickfantasmas':
      if (total == 0) return conn.reply(m.chat, `${emoji} Este grupo es activo, no tiene fantasmas.`, m)
      await conn.reply(
        m.chat,
        `${emoji} *Eliminación de inactivos*\n\n${emoji2} *Lista de fantasmas*\n${sider.map(v => '@' + v.split('@')[0]).join('\n')}\n\n_El bot eliminará a estos usuarios, uno cada 10 segundos..._`,
        m,
        { mentions: sider }
      )
      await delay(10000)
      let chat = global.db.data.chats[m.chat]
      chat.welcome = false
      try {
        for (let user of sider) {
          let participant = participants.find(p => p.id === user)
          let isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin' || participant?.isAdmin || participant?.isSuperAdmin || false
          if (typeof user === 'string' && user.endsWith('@s.whatsapp.net') && !isAdmin) {
            try {
              await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
              await delay(10000)
            } catch (e) {
              console.log(`Error eliminando a ${user}:`, e)
            }
          } else {
            console.log(`No se puede eliminar a admin o usuario inválido: ${user}`)
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

export default handler
