
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

handler.tags = ['grupo']
handler.command = ['kickfantasmas', 'eliminarfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler
