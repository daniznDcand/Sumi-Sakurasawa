const DAY = 24 * 60 * 60 * 1000

function getUserRecord(jid) {
  return global?.db?.data?.users?.[jid] || null
}

function isWhitelisted(user) {
  if (!user) return false
  return !!(user.whitelist || user.vip || user.premium)
}

function getIsAdmin(participant) {
  return participant?.admin === 'admin' ||
         participant?.admin === 'superadmin' ||
         participant?.isAdmin ||
         participant?.isSuperAdmin ||
         false
}

function getBotJid(conn) {
  return conn?.user?.jid || conn?.user?.id || ''
}

function getLastActive(user, chatId, jid) {
  if (!user) return 0
  const candidates = [
    user.lastChat, user.lastchat,
    user.lastseen, user.lastSeen,
    user.lastmsg, user.lastMessage,
    user.last, user.seen,
    user.time, user.lm, user.lmsg,
    user.lastactivity
  ].filter(v => typeof v === 'number' && isFinite(v))
  const perChatActivity = global?.db?.data?.chats?.[chatId]?.activity?.[jid]
  if (typeof perChatActivity === 'number' && isFinite(perChatActivity)) {
    candidates.push(perChatActivity)
  }
  if (candidates.length === 0) return 0
  return Math.max(...candidates)
}

function getMessageCount(user) {
  if (!user) return 0
  const cands = [user.chat, user.msg, user.msgs, user.messages, user.mcount]
    .filter(v => typeof v === 'number' && isFinite(v))
  if (cands.length === 0) return 0
  return Math.max(...cands)
}

function isInactive(user, chatId, jid, now, thresholdMs) {
  if (!user) return true
  const last = getLastActive(user, chatId, jid)
  const msgs = getMessageCount(user)
  const tooOld = last === 0 || (now - last) >= thresholdMs
  const noMsgs = !msgs || msgs <= 0
  return tooOld || noMsgs
}

const delay = ms => new Promise(res => setTimeout(res, ms))

var handler = async (m, { conn, text, participants }) => {
  if (!m.isGroup) return
  const groupId = m.chat
  const now = Date.now()
  const days = Number.isFinite(parseInt(text)) && parseInt(text) > 0 ? parseInt(text) : 14
  const thresholdMs = days * DAY
  const botJid = getBotJid(conn)

  const memberJids = (participants || []).map(p => p.id).filter(Boolean)

  let ghosts = []
  for (const jid of memberJids) {
    if (!jid.endsWith('@s.whatsapp.net')) continue
    const p = participants.find(u => u.id === jid)
    const admin = getIsAdmin(p)
    if (admin) continue
    if (botJid && jid === botJid) continue

    const user = getUserRecord(jid)
    if (isWhitelisted(user)) continue

    if (isInactive(user, groupId, jid, now, thresholdMs)) {
      ghosts.push(jid)
    }
  }

  if (ghosts.length === 0) {
    return conn.reply(m.chat, `👻 Este grupo es activo, no hay fantasmas para eliminar (umbral ${days} día(s)).`, m)
  }

  await conn.reply(
    m.chat,
    `👻 Eliminación de inactivos (${days} día(s))\n\n🗒️ Lista de fantasmas (${ghosts.length})\n${ghosts.map(v => '@' + v.split('@')[0]).join('\n')}\n\nEl bot comenzará a eliminar, uno cada 10 segundos...`,
    m,
    { mentions: ghosts }
  )

  const chat = global.db?.data?.chats?.[groupId]
  let prevWelcome
  if (chat) {
    prevWelcome = chat.welcome
    chat.welcome = false
  }

  try {
    for (const jid of ghosts) {
      const p = participants.find(u => u.id === jid)
      const admin = getIsAdmin(p)
      if (admin) continue
      try {
        await conn.groupParticipantsUpdate(groupId, [jid], 'remove')
      } catch (e) {
        console.log(`Error eliminando a ${jid}:`, e)
      }
      await delay(10000) 
    }
  } finally {
    if (chat) chat.welcome = prevWelcome ?? true
  }

  await conn.reply(m.chat, `✅ Proceso de eliminación finalizado.`, m)
}

handler.tags = ['grupo']
handler.command = ['kickfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
