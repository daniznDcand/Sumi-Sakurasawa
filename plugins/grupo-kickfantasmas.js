
import { areJidsSameUser } from '@whiskeysockets/baileys'

var handler = async (m, { conn, text, participants, args, command }) => {
const handler = async (m, { conn, participants, groupMetadata, isAdmin, isBotAdmin }) => {
  if (!isBotAdmin) throw 'El bot no es admin.'
  
  let users = []
  let now = +new Date
  let threshold = 1000 * 60 * 60 * 24 * 7 
  for (let user of participants) {
    if (user.admin) continue 
    let data = global.db.data.users[user.id] || {}
    let lastSeen = data.lastseen || data.lastSeen || 0
    if (now - lastSeen > threshold) {
      users.push(user.id)
    }
  }
  if (!users.length) throw 'No se encontraron fantasmas para eliminar.'
  let failed = []
  for (let user of users) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    } catch (e) {
      failed.push(user)
    }
  }
  if (failed.length) m.reply('No se pudo eliminar a: ' + failed.join(', '))
}

  const getValidJid = (input) => {
    if (typeof input !== 'string') return null;
    if (input.endsWith('@s.whatsapp.net') || input.endsWith('@lid')) return input;
    
    let p = participants.find(u => (u.name && u.name.trim().toLowerCase() === input.trim().toLowerCase()) || (u.notify && u.notify.trim().toLowerCase() === input.trim().toLowerCase()));
    return p ? p.id : null;
  };
  const delay = ms => new Promise(res => setTimeout(res, ms))
  if (total == 0) return conn.reply(m.chat, `👻 Este grupo es activo, no tiene fantasmas.`, m)
  await m.reply(`👻 *Eliminación de inactivos*\n\n🗒️ *Lista de fantasmas*\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n_El bot eliminará a los usuarios de la lista mencionada cada 10 segundos._`, null, { mentions: sider })
  let chat = global.db.data.chats[m.chat]
  chat.welcome = false
  try {
    let users = sider.filter(u => !areJidsSameUser(u, conn.user.id))
    for (let user of users) {
      let validJid = getValidJid(user) || user;
      let participant = participants.find(v => areJidsSameUser(v.id, validJid) || v.id === validJid);
      const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
      if (validJid && !isAdmin) {
        try {
          await conn.groupParticipantsUpdate(m.chat, [validJid], 'remove');
          await delay(10000);
        } catch (e) {
          console.log(`Error eliminando a ${validJid}:`, e);
          await conn.reply(m.chat, `❌ No se pudo eliminar a @${validJid.split('@')[0]}: ${e?.message || e}`, m, { mentions: [validJid] });
        }
      } else if (isAdmin) {
        await conn.reply(m.chat, `⚠️ No se puede eliminar a @${validJid.split('@')[0]} (es admin)`, m, { mentions: [validJid] });
      } else {
        await conn.reply(m.chat, `❌ No se pudo identificar a @${user} como usuario válido.`, m, { mentions: [user] });
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
handler.fail = null

export default handler
