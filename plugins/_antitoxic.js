
console.log('🛡️ [ANTITOXIC] Plugin cargado - Sistema de moderación activado')


const toxicWords = {
 
  basic: [
    'puto', 'puta', 'cabron', 'cabrón', 'pendejo', 'pendeja',
    'idiota', 'estupido', 'estúpido', 'imbecil', 'imbécil',
    'mierda', 'joder', 'coño', 'cono', 'carajo', 'verga',
    'chingar', 'chinga', 'pinche', 'culero', 'culera',
    'marica', 'maricon', 'maricón', 'gay', 'joto', 'pargo','pinga',
    'chobolo dow'
  ],
  
  
  severe: [
    'hijo de puta', 'hijueputa', 'la concha de tu madre',
    'vete a la mierda', 'chupa pija', 'come mierda',
    'malparido', 'malparida', 'gonorrea', 'hp',
    'hdp', 'hdspm', 'ptm', 'ctm','zarnoso','sarnoso','sarnosa'
  ],
  
  
  discriminatory: [
    'negro', 'negra', 'indio', 'india', 'chino', 'china',
    'sudaca', 'sudaco', 'pocho', 'pocha', 'gringo', 'gringa'
  ],
  
  
  inappropriate: [
    'matar', 'morir', 'suicidio', 'suicidate', 'matate',
    'droga', 'cocaina', 'marihuana', 'mota', 'porro'
  ]
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9\s]/g, '') 
    .replace(/\s+/g, ' ') 
    .trim()
}


function detectToxicContent(text) {
  console.log('🔍 [ANTITOXIC] ======== INICIO ANÁLISIS ========')
  console.log('🔍 [ANTITOXIC] Texto original:', `"${text}"`)
  
  const normalizedText = normalizeText(text)
  console.log('🔍 [ANTITOXIC] Texto normalizado:', `"${normalizedText}"`)
  
  const detection = {
    isToxic: false,
    severity: 'none', 
    foundWords: [],
    category: ''
  }
  
  
  for (const word of toxicWords.severe) {
    const normalizedWord = normalizeText(word)
    if (normalizedText.includes(normalizedWord)) {
      console.log(`🚨 [ANTITOXIC] PALABRA SEVERA detectada: "${word}"`)
      detection.isToxic = true
      detection.severity = 'severe'
      detection.foundWords.push(word)
      detection.category = 'Lenguaje extremadamente ofensivo'
    }
  }
  
  
  if (!detection.isToxic) {
    for (const word of toxicWords.discriminatory) {
      const normalizedWord = normalizeText(word)
      if (normalizedText.includes(normalizedWord)) {
        console.log(`🚫 [ANTITOXIC] PALABRA DISCRIMINATORIA detectada: "${word}"`)
        detection.isToxic = true
        detection.severity = 'discriminatory'
        detection.foundWords.push(word)
        detection.category = 'Lenguaje discriminatorio'
      }
    }
  }
  
  
  if (!detection.isToxic) {
    for (const word of toxicWords.inappropriate) {
      const normalizedWord = normalizeText(word)
      if (normalizedText.includes(normalizedWord)) {
        console.log(`⚠️ [ANTITOXIC] CONTENIDO INAPROPIADO detectado: "${word}"`)
        detection.isToxic = true
        detection.severity = 'inappropriate'
        detection.foundWords.push(word)
        detection.category = 'Contenido inapropiado'
      }
    }
  }
  
  
  if (!detection.isToxic) {
    for (const word of toxicWords.basic) {
      const normalizedWord = normalizeText(word)
      if (normalizedText.includes(normalizedWord)) {
        console.log(`🔸 [ANTITOXIC] PALABRA BÁSICA detectada: "${word}"`)
        detection.isToxic = true
        detection.severity = 'basic'
        detection.foundWords.push(word)
        detection.category = 'Lenguaje ofensivo'
      }
    }
  }
  
  console.log('🔍 [ANTITOXIC] Resultado final:', detection)
  console.log('🔍 [ANTITOXIC] ======== FIN ANÁLISIS ========')
  
  return detection
}


function getToxicMessage(userNumber, severity) {
  const messages = {
    basic: `💙 ¡Ara ara! @${userNumber} ha sido advertido por usar lenguaje inapropiado! 💙🎤\n\n🎵 ¡En el mundo de Miku mantenemos un ambiente respetuoso!`,
    
    severe: `💙 ¡Ara ara! @${userNumber} ha sido expulsado del escenario virtual por lenguaje extremadamente ofensivo! 💙🎤\n\n🎵 ¡En el mundo de Miku no toleramos este tipo de comportamiento!`,
    
    discriminatory: `💙 ¡Ara ara! @${userNumber} ha sido expulsado del escenario virtual por lenguaje discriminatorio! 💙🎤\n\n🎵 ¡En el mundo de Miku respetamos a todas las personas!`,
    
    inappropriate: `💙 ¡Ara ara! @${userNumber} ha sido advertido por contenido inapropiado! 💙🎤\n\n🎵 ¡En el mundo de Miku mantenemos conversaciones positivas!`
  }
  
  return messages[severity] || messages.basic
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  try {
    console.log('🛡️ [ANTITOXIC] ======== PROCESANDO MENSAJE ========')
    
    
    if (!m) {
      console.log('❌ [ANTITOXIC] Mensaje nulo, saltando')
      return true
    }
    
    if (!m.text || m.text.trim() === '') {
      console.log('❌ [ANTITOXIC] Sin texto, saltando')
      return true
    }
    
    if (m.isBaileys && m.fromMe) {
      console.log('❌ [ANTITOXIC] Mensaje del bot, saltando')
      return true
    }
    
    if (!m.isGroup) {
      console.log('❌ [ANTITOXIC] No es grupo, saltando')
      return true
    }
    
    
    const userNumber = m.sender.split('@')[0]
    console.log(`👤 [ANTITOXIC] Usuario: ${userNumber}`)
    console.log(`📝 [ANTITOXIC] Mensaje: "${m.text.substring(0, 100)}${m.text.length > 100 ? '...' : ''}"`)
    console.log(`👑 [ANTITOXIC] Es admin: ${isAdmin}`)
    console.log(`🤖 [ANTITOXIC] Bot es admin: ${isBotAdmin}`)
    
    
    if (!isBotAdmin) {
      console.log('⚠️ [ANTITOXIC] Bot no es administrador - solo modo advertencia')
    }
    
    
    if (!global.db) {
      console.log('🔧 [ANTITOXIC] Inicializando base de datos global')
      global.db = { data: { chats: {} } }
    }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) {
      console.log('🔧 [ANTITOXIC] Inicializando configuración del chat')
      global.db.data.chats[m.chat] = { antiToxic: false }
    }
    
    const chat = global.db.data.chats[m.chat]
    
    
    if (chat.antitoxic === undefined) {
      chat.antitoxic = false  
      console.log('🔧 [ANTITOXIC] Configurado como desactivado por defecto')
    }
    
    console.log(`🛡️ [ANTITOXIC] Estado: ${chat.antitoxic ? 'ACTIVADO' : 'DESACTIVADO'}`)
    
    
    if (!chat.antitoxic) {
      console.log('⏭️ [ANTITOXIC] Sistema desactivado para este chat')
      return true
    }
    
    
    if (isAdmin) {
      console.log('👑 [ANTITOXIC] Usuario es administrador - inmunidad activa')
      return true
    }
    
    
    const toxicDetection = detectToxicContent(m.text)
    
    if (toxicDetection.isToxic) {
      console.log(`🚨 [ANTITOXIC] CONTENIDO TÓXICO DETECTADO por usuario ${userNumber}`)
      console.log(`🚨 [ANTITOXIC] Severidad: ${toxicDetection.severity}`)
      console.log(`🚨 [ANTITOXIC] Categoría: ${toxicDetection.category}`)
      
      try {
        
        if (isBotAdmin) {
          await conn.sendMessage(m.chat, { delete: m.key })
          console.log('✅ [ANTITOXIC] Mensaje tóxico eliminado')
        }
        
        
        const warningMessage = getToxicMessage(userNumber, toxicDetection.severity)
        await conn.reply(m.chat, warningMessage, m, { mentions: [m.sender] })
        
        
        if (isBotAdmin && (toxicDetection.severity === 'severe' || toxicDetection.severity === 'discriminatory')) {
          
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
          console.log(`✅ [ANTITOXIC] Usuario ${userNumber} expulsado por ${toxicDetection.severity}`)
        } else {
          
          console.log(`⚠️ [ANTITOXIC] Usuario ${userNumber} advertido por ${toxicDetection.severity}`)
        }
        
        return false 
        
      } catch (error) {
        console.error('❌ [ANTITOXIC] Error durante la moderación:', error)
      }
    }
    
    console.log('✅ [ANTITOXIC] Mensaje limpio - no se detectó contenido tóxico')
    console.log('🛡️ [ANTITOXIC] ======== FIN PROCESAMIENTO ========')
    return true
    
  } catch (error) {
    console.error('💥 [ANTITOXIC] ERROR CRÍTICO:', error)
    console.error('💥 [ANTITOXIC] Stack trace:', error.stack)
    return true 
  }
}