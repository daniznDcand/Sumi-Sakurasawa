export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m.isGroup || isAdmin || m.fromMe) return true
  
  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.antiMencion) return true
  
 
  if (m.messageStubType === 'GroupStatusMention') {
    const userNumber = m.sender.split('@')[0]
    
    try {
      if (isBotAdmin) {
        await conn.sendMessage(m.chat, { delete: m.key })
      }
      
      if (isBotAdmin) {
        await conn.sendMessage(m.chat, {
          text: `💙 @${userNumber} fue eliminado por mencionar estado\n🎵 ¡Miku no permite spam de estados!`,
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
      console.error('Error antimencion:', error)
      return true
    }
  }
  
  return true
}