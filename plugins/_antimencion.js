const statusKeywords = [
  'estado',
  'mi estado',
  'tu estado',
  'bio',
  'mi bio',
  'tu bio',
  'biografia',
  'biografía',
  'mi biografia',
  'tu biografia',
  'tu biografía',
  'descripcion',
  'descripción',
  'mi descripcion',
  'tu descripcion',
  'tu descripción',
  'perfil',
  'mi perfil',
  'tu perfil',
  'informacion',
  'información',
  'mi informacion',
  'tu informacion',
  'tu información',
  'acerca de',
  'sobre ti',
  'ver mi estado',
  'mostrar mi bio'
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
    
    if (!m || (m.isBaileys && m.fromMe) || !m.isGroup) return true

    
    const chat = global.getChat ? global.getChat(m.chat) : (global.db && global.db.data && global.db.data.chats && global.db.data.chats[m.chat]) || { antiMencion: false }
    if (chat.antiMencion === undefined) chat.antiMencion = false
    if (!chat.antiMencion) return true
    if (chat.antiMencionAction === undefined) chat.antiMencionAction = 'kick' 

    
    function extractRelevantText(msg) {
      const parts = []
      if (msg.text) parts.push(msg.text)
      if (msg.caption) parts.push(msg.caption)
      if (msg.quoted) {
        const q = msg.quoted
        if (q.text) parts.push(q.text)
        if (q.caption) parts.push(q.caption)
        if (q.message && q.message.conversation) parts.push(q.message.conversation)
        if (q.message && q.message.extendedTextMessage && q.message.extendedTextMessage.text) parts.push(q.message.extendedTextMessage.text)
      }
      return parts.join(' ').trim()
    }

    const content = extractRelevantText(m)
    if (!content) return true

    const mentionsStatus = containsStatusMention(content)
    if (!mentionsStatus) return true

    const userNumber = m.sender.split('@')[0]
    if (isAdmin) {
      console.log(`💙 [ANTIMENCION] Usuario admin ${userNumber} mencionó estado/bio pero se ignoró por ser admin`)
      return true
    }

    console.log(`💙 [ANTIMENCION] Usuario ${userNumber} mencionó estado/bio - acción: ${chat.antiMencionAction}`)

    try {
      
      if (isBotAdmin) {
        await conn.sendMessage(m.chat, { delete: m.key })
      }

      if (chat.antiMencionAction === 'kick') {
       
        if (isBotAdmin) {
          const warningMessage = `💙 ¡Ara ara! @${userNumber} ha sido eliminado del grupo por mencionar estado/bio. \n\n🎵 ¡En el mundo de Miku no se permiten menciones de estados!`
          await conn.reply(m.chat, warningMessage, m, { mentions: [m.sender] })
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        } else {
          const warningMessage = `⚠️ @${userNumber} mencionó estado/bio. No puedo expulsar porque no soy admin; el mensaje fue eliminado si fue posible.`
          await conn.reply(m.chat, warningMessage, m, { mentions: [m.sender] })
        }
      } else {
        
        const warningMessage = `⚠️ @${userNumber} mencionó su estado/bio; el mensaje fue eliminado.`
        await conn.reply(m.chat, warningMessage, m, { mentions: [m.sender] })
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
