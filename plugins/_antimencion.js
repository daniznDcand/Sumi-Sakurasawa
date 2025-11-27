const statusKeywords = [
  'estado',
  'bio',
  'biografia',
  'biografía',
  'descripcion',
  'descripción',
  'perfil',
  'informacion',
  'información',
  'acerca de',
  'sobre ti',
  'tu estado',
  'tu bio',
  'tu biografia',
  'tu biografía',
  'tu descripcion',
  'tu descripción',
  'tu perfil',
  'tu informacion',
  'tu información'
]

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function containsStatusMention(text) {
  const normalizedText = normalizeText(text)
  return statusKeywords.some(keyword =>
    normalizedText.includes(normalizeText(keyword))
  )
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m || !m.text || m.text.trim() === '' || (m.isBaileys && m.fromMe) || !m.isGroup) {
      return true
    }
    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = { antiMencion: false }
    const chat = global.db.data.chats[m.chat]
    if (chat.antiMencion === undefined) {
      chat.antiMencion = false
    }
    if (!chat.antiMencion) {
      return true
    }
    const mentionsStatus = containsStatusMention(m.text)
    if (!mentionsStatus) {
      return true
    }
    const userNumber = m.sender.split('@')[0]
    if (isAdmin) {
      console.log(`💙 [ANTIMENCION] Usuario admin ${userNumber} mencionó estado/bio pero se ignoró por ser admin`)
      return true
    }
    console.log(`💙 [ANTIMENCION] Usuario ${userNumber} mencionó estado/bio - expulsando automáticamente`)
    try {
      if (isBotAdmin) {
        await conn.sendMessage(m.chat, { delete: m.key })
      }
      const warningMessage = `💙 ¡Ara ara! @${userNumber} ha sido eliminado del grupo por mencionar estado/bio! 💙🎤\n\n🎵 ¡En el mundo de Miku no se permiten menciones de estados!`
      await conn.reply(m.chat, warningMessage, m, { mentions: [m.sender] })
      if (isBotAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      }
      return false
    } catch (error) {
      console.error('❌ [ANTIMENCION] Error durante moderación:', error)
    }
    return true
  } catch (error) {
    console.error('💥 [ANTIMENCION] ERROR CRÍTICO:', error)
    return true
  }
}
