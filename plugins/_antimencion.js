export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m.isGroup || !m.text || isAdmin || m.fromMe) return true
  

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiMencion) return true
  

  const text = m.text.toLowerCase()
  const statusPatterns = [
    /\b(mi|tu|su)\s*(estado|bio|biografia|perfil|descripcion)\b/,
    /\bestado\s*(de|del)?\s*(whatsapp|wa)\b/,
    /\bver\s*(mi|tu|su)?\s*(estado|bio|perfil)\b/,
    /\b(cambiar|actualizar)\s*(estado|bio)\b/,
    /\bmostrar\s*(estado|bio)\b/
  ]
  
  const hasStatusMention = statusPatterns.some(pattern => pattern.test(text))
  if (!hasStatusMention) return true
  
  const userNumber = m.sender.split('@')[0]
  
  try {
    
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: m.key })
    }
    
    
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, {
        text: `💙 @${userNumber} fue eliminado por mencionar estado/bio\n🎵 ¡Miku no permite spam de estados!`,
        mentions: [m.sender]
      })
      
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    } else {
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${userNumber} mencionó estado pero no puedo expulsar (no soy admin)`,
        mentions: [m.sender]
      })
    }
    
    return false
  } catch (error) {
    console.error('Error en antimencion:', error)
    return true
  }
}