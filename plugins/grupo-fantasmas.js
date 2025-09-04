const DAY = 24 * 60 * 60 * 1000
const delay = ms => new Promise(res => setTimeout(res, ms))

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

  return conn?.user?.id || conn?.user?.jid || ''
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

var handler = async (m, { conn, text, participants, command }) => {
  if (!m.isGroup) return

  const now = Date.now()
  const chatId = m.chat
  const botJid = getBotJid(conn)

  
  let days = parseInt((text || '').trim(), 10)
  if (!Number.isFinite(days) || days <= 0) days = 14
  const thresholdMs = days * DAY

  const memberJids = (participants || []).map(p => p.id).filter(Boolean)
  let ghosts = []

  
  for (const jid of memberJids) {
    if (!jid.endsWith('@s.whatsapp.net')) continue
    if (botJid && jid === botJid) continue

    const p = participants.find(u => u.id === jid)
    if (getIsAdmin(p)) continue

    const user = getUserRecord(jid)
    if (isWhitelisted(user)) continue

    if (isInactive(user, chatId, jid, now, thresholdMs)) {
      ghosts.push({
        jid,
        last: getLastActive(user, chatId, jid) || 0,
        msgs: getMessageCount(user) || 0
      })
    }
  }

  
  ghosts.sort((a, b) => (a.last || 0) - (b.last || 0))

  const emoji = '👻'
  const emoji2 = '🗒️'

  if (command === 'fantasmas') {
    if (ghosts.length === 0) {
      return conn.reply(m.chat, `${emoji} Este grupo es activo, no tiene fantasmas (umbral ${days} día(s)).`, m)
    }

    const mentions = ghosts.map(g => g.jid)
    const list = ghosts.map(g => {
      const tag = '@' + g.jid.split('@')[0]
      const lastStr = g.last ? new Date(g.last).toLocaleDateString() : '—'
      return `${tag} • msgs:${g.msgs} • last:${lastStr}`
    }).join('\n')

    return conn.reply(
      m.chat,
      `${emoji} Revisión de inactivos (${days} día(s))\n\n${emoji2} Lista de fantasmas (${ghosts.length})\n${list}\n\n📝 NOTA:\nLa detección se basa en la base de datos del bot (última actividad y conteo de mensajes).`,
      m,
      { mentions }
    )
  }

  if (command === 'kickfantasmas') {
    if (ghosts.length === 0) {
      return conn.reply(m.chat, `${emoji} Este grupo es activo, no hay fantasmas para eliminar (umbral ${days} día(s)).`, m)
    }

    const mentions = ghosts.map(g => g.jid)
    await conn.reply(
      m.chat,
      `${emoji} Eliminación de inactivos (${days} día(s))\n\n${emoji2} Lista de fantasmas (${ghosts.length})\n${ghosts.map(g => '@' + g.jid.split('@')[0]).join('\n')}\n\nEl bot comenzará a eliminar, uno cada 10 segundos...`,
      m,
      { mentions }
    )

    const chat = global.db?.data?.chats?.[chatId]
    let prevWelcome
    if (chat) {
      prevWelcome = chat.welcome
      chat.welcome = false
    }

    try {
      for (const g of ghosts) {
        const p = participants.find(u => u.id === g.jid)
        if (getIsAdmin(p)) continue
        try {
          await conn.groupParticipantsUpdate(chatId, [g.jid], 'remove')
        } catch (e) {
          console.log(`Error eliminando a ${g.jid}:`, e)
        }
        await delay(10000) 
      }
    } finally {
      if (chat) chat.welcome = prevWelcome ?? true
    }

    return conn.reply(m.chat, `✅ Proceso de eliminación finalizado.`, m)
  }
}

handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
