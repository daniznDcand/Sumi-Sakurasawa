export async function before(m, { conn, isAdmin, isBotAdmin }) {
  
  console.log(`🔍 [DEBUG] Mensaje recibido:`, {
    isGroup: m.isGroup,
    messageStubType: m.messageStubType,
    fromMe: m.fromMe,
    sender: m.sender,
    isAdmin: isAdmin,
    isBotAdmin: isBotAdmin
  })
  
  if (!m.isGroup || isAdmin || m.fromMe) return true
  
  const chat = global.db.data.chats[m.chat] || {}
  console.log(`🔍 [DEBUG] Chat config:`, chat)
  
  if (!chat.antiMencion) {
    console.log(`⚠️ [DEBUG] antiMencion desactivado`)
    return true
  }
  
  let isStatusMention = false
  
  
  if (m.messageStubType) {
    console.log(`🔍 [DEBUG] messageStubType detectado:`, m.messageStubType)
    
    
    if (m.messageStubType === 'GroupStatusMention' || 
        m.messageStubType.toString().includes('GroupStatusMention') ||
        m.messageStubType.toString().includes('StatusMention')) {
      isStatusMention = true
      console.log(`✅ [DEBUG] Detectado como mención de estado por stub type`)
    }
  }
  
  
  if (!isStatusMention && m.text) {
    const text = m.text.toLowerCase()
    const statusPatterns = [
      /\b(mi|tu|su)\s*(estado|bio|biografia|perfil|descripcion)\b/,
      /\bestado\s*(de|del)?\s*(whatsapp|wa)\b/,
      /\bver\s*(mi|tu|su)?\s*(estado|bio|perfil)\b/,
      /\b(cambiar|actualizar)\s*(estado|bio)\b/,
      /\bmostrar\s*(estado|bio)\b/
    ]
    isStatusMention = statusPatterns.some(pattern => pattern.test(text))
    if (isStatusMention) {
      console.log(`✅ [DEBUG] Detectado como mención de estado por texto`)
    }
  }
  
  if (!isStatusMention) {
    console.log(`❌ [DEBUG] No es mención de estado`)
    return true
  }
  
  const userNumber = m.sender.split('@')[0]
  
  try {
    console.log(`🎵 [ANTIMENCION] ¡DETECTADA MENCIÓN DE ESTADO! Usuario: @${userNumber}`)
    
    
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, { delete: m.key })
      console.log(`🗑️ Mensaje eliminado`)
    }
    
    
    if (isBotAdmin) {
      await conn.sendMessage(m.chat, {
        text: `💙 @${userNumber} fue eliminado por mencionar estado/bio\n🎵 ¡Miku no permite spam de estados!`,
        mentions: [m.sender]
      })
      
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      console.log(`👋 Usuario @${userNumber} EXPULSADO`)
    } else {
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${userNumber} mencionó estado pero no puedo expulsar (no soy admin)`,
        mentions: [m.sender]
      })
      console.log(`⚠️ No se pudo expulsar - bot no es admin`)
    }
    
    return false
  } catch (error) {
    console.error('❌ Error en antimencion:', error)
    return true
  }
}