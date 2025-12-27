const latinAmericaCodes = [
  /^(\+?51|51)\d*/,        // Perú ✅
  /^(\+?52|52)\d*/,        // México ✅
  /^(\+?53|53)\d*/,        // Cuba ✅
  /^(\+?54|54)\d*/,        // Argentina ✅
  /^(\+?55|55)\d*/,        // Brasil ✅
  /^(\+?56|56)\d*/,        // Chile ✅
  /^(\+?57|57)\d*/,        // Colombia ✅
  /^(\+?58|58)\d*/,        // Venezuela ✅
  /^(\+?591|591)\d*/,      // Bolivia ✅
  /^(\+?592|592)\d*/,      // Guyana ✅
  /^(\+?593|593)\d*/,      // Ecuador ✅
  /^(\+?594|594)\d*/,      // Guayana Francesa ✅
  /^(\+?595|595)\d*/,      // Paraguay ✅
  /^(\+?596|596)\d*/,      // Martinica ✅
  /^(\+?597|597)\d*/,      // Surinam ✅
  /^(\+?598|598)\d*/,      // Uruguay ✅
  /^(\+?599|599)\d*/,      // Antillas Neerlandesas ✅
]

const arabicSpamPatterns = [
  /^(\+?202|202)\d*/,      // Egipto
  /^(\+?20|20)\d*/,        // Egipto (código corto)
  /^(\+?212|212)\d*/,      // Marruecos  
  /^(\+?213|213)\d*/,      // Argelia
  /^(\+?216|216)\d*/,      // Túnez
  /^(\+?218|218)\d*/,      // Libia
  /^(\+?961|961)\d*/,      // Líbano
  /^(\+?962|962)\d*/,      // Jordania
  /^(\+?963|963)\d*/,      // Siria
  /^(\+?964|964)\d*/,      // Irak
  /^(\+?965|965)\d*/,      // Kuwait
  /^(\+?966|966)\d*/,      // Arabia Saudí
  /^(\+?967|967)\d*/,      // Yemen
  /^(\+?968|968)\d*/,      // Omán
  /^(\+?970|970)\d*/,      // Palestina
  /^(\+?971|971)\d*/,      // Emiratos Árabes Unidos
  /^(\+?972|972)\d*/,      // Israel
  /^(\+?973|973)\d*/,      // Baréin
  /^(\+?974|974)\d*/,      // Catar
]

const arabicCharacterPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/

function isArabicSpamNumber(phoneNumber) {
  if (!phoneNumber) return false
  
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '')
  
  
  const isLatinAmerica = latinAmericaCodes.some(pattern => pattern.test(cleanNumber))
  if (isLatinAmerica) {
    console.log(`✅ [ANTIARABES] Número latinoamericano protegido: ${cleanNumber}`)
    return false
  }
  
  
  const isArabicPattern = arabicSpamPatterns.some(pattern => pattern.test(cleanNumber))
  if (isArabicPattern) {
    console.log(`🚫 [ANTIARABES] Número árabe detectado: ${cleanNumber}`)
    return true
  }
  
 
  console.log(`✅ [ANTIARABES] Número permitido: ${cleanNumber}`)
  return false
}

function hasArabicCharacters(text) {
  return arabicCharacterPattern.test(text)
}

function isArabicSpam(phoneNumber, messageText = '') {
  console.log(`🔍 [ANTIARABES] Verificando número: ${phoneNumber}`)
  
  
  if (isArabicSpamNumber(phoneNumber)) {
    console.log(`✅ [ANTIARABES] BLOQUEADO por número árabe`)
    return true
  }
  
  
  if (messageText && hasArabicCharacters(messageText)) {
    console.log(`✅ [ANTIARABES] BLOQUEADO por caracteres árabes en mensaje`)
    return true
  }
  
  console.log(`✅ [ANTIARABES] Usuario permitido`)
  return false
}

const handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return
  
  let chat = global.db.data.chats[m.chat]
  if (!chat.antiarabes) return
  
  if (isAdmin || isOwner) return
  if (!isBotAdmin) return
  
  try {
    const senderNumber = m.sender.split('@')[0]
    const messageText = m.text || ''
    
    if (isArabicSpam(senderNumber, messageText)) {
      console.log(`🚫 Anti-Árabes: SPAM DETECTADO! Número: ${senderNumber}`)
      
      await conn.sendMessage(m.chat, { delete: m.key })
      
      const warningMsg = await conn.sendMessage(m.chat, {
        text: `🚫 *ANTI-ÁRABES ACTIVADO*\n\n` +
              `👤 *Usuario:* @${senderNumber}\n` +
              `📱 *Número:* +${senderNumber}\n` +
              `🔍 *Razón:* Número árabe o caracteres árabes detectados\n` +
              `⚡ *Acción:* Usuario expulsado\n\n` +
              `> *Este grupo está protegido contra spam internacional*`,
        mentions: [m.sender]
      })
      
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      
      setTimeout(async () => {
        try {
          await conn.sendMessage(m.chat, { delete: warningMsg.key })
        } catch (e) {}
      }, 10000)
      
      return true
    }
    
  } catch (error) {
    console.error('Error en anti-árabes:', error)
  }
  
  return false
}

handler.before = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
  return await handler(m, { conn, isAdmin, isBotAdmin, isOwner })
}

export default handler