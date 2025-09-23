const regexPatterns = {
  whatsappGroup: /(?:https?:\/\/)?(?:www\.)?chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/gi,
  whatsappChannel: /(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([0-9A-Za-z]+)/gi,
  waMe: /(?:https?:\/\/)?(?:www\.)?wa\.me\/(?:qr\/|join\/)?([0-9A-Za-z+/=_-]+)/gi,
  genericLink: /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9][\w\-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s]*)?/gi,
  customDomains: [
    /carmecita\.by/gi,
    /t\.me\//gi,
    /discord\.gg\//gi
  ]
}


function detectLinks(text) {
  console.log('🔍 [ANTILINK] ======== INICIO DETECCIÓN ========')
  console.log('🔍 [ANTILINK] Texto a analizar:', `"${text}"`)
  console.log('🔍 [ANTILINK] Longitud:', text.length)
  
  const results = {
    whatsappGroup: false,
    whatsappChannel: false,
    waMe: false,
    genericLink: false,
    customDomain: false,
    foundLinks: []
  }
  
  
  const groupMatches = text.match(regexPatterns.whatsappGroup)
  if (groupMatches) {
    console.log('✅ [ANTILINK] GRUPO WhatsApp detectado:', groupMatches)
    results.whatsappGroup = true
    results.foundLinks.push(...groupMatches)
  }
  
  
  const channelMatches = text.match(regexPatterns.whatsappChannel)
  if (channelMatches) {
    console.log('✅ [ANTILINK] CANAL WhatsApp detectado:', channelMatches)
    results.whatsappChannel = true
    results.foundLinks.push(...channelMatches)
  }
  
  
  const waMeMatches = text.match(regexPatterns.waMe)
  if (waMeMatches) {
    console.log('✅ [ANTILINK] WA.ME detectado:', waMeMatches)
    results.waMe = true
    results.foundLinks.push(...waMeMatches)
  }
  
  
  const genericMatches = text.match(regexPatterns.genericLink)
  if (genericMatches) {
    console.log('✅ [ANTILINK] Enlaces genéricos detectados:', genericMatches)
    results.genericLink = true
    results.foundLinks.push(...genericMatches)
  }
  
  
  for (const customRegex of regexPatterns.customDomains) {
    const customMatches = text.match(customRegex)
    if (customMatches) {
      console.log('✅ [ANTILINK] Dominio personalizado detectado:', customMatches)
      results.customDomain = true
      results.foundLinks.push(...customMatches)
    }
  }
  
  console.log('🔍 [ANTILINK] Resultados finales:', results)
  console.log('🔍 [ANTILINK] ======== FIN DETECCIÓN ========')
  
  return results
}

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  try {
    console.log('📨 [ANTILINK] ======== PROCESANDO MENSAJE ========')
    
    
    if (!m) {
      console.log('❌ [ANTILINK] Mensaje nulo, saltando')
      return true
    }
    
    if (!m.text || m.text.trim() === '') {
      console.log('❌ [ANTILINK] Sin texto, saltando')
      return true
    }
    
    if (m.isBaileys && m.fromMe) {
      console.log('❌ [ANTILINK] Mensaje del bot, saltando')
      return true
    }
    
    if (!m.isGroup) {
      console.log('❌ [ANTILINK] No es grupo, saltando')
      return true
    }
    
    const userNumber = m.sender.split('@')[0]
    console.log(`🧚‍♂️ [ANTILINK] Usuario: ${userNumber}`)
    console.log(`📊 [ANTILINK] Mensaje: "${m.text.substring(0, 150)}${m.text.length > 150 ? '...' : ''}"`)
    console.log(`👨‍🦰 [ANTILINK] Es admin: ${isAdmin}`)
    console.log(`📊 [ANTILINK] Bot es admin: ${isBotAdmin}`)
    
    
    if (!isBotAdmin) {
      console.log('⚠️ [ANTILINK] BOT NO ES ADMINISTRADOR - No puede eliminar usuarios')
      console.log('⚠️ [ANTILINK] El antilink está deshabilitado hasta que el bot sea admin')
      return true
    }
    
   
    if (!global.db) {
      console.log('🔧 [ANTILINK] Inicializando base de datos global')
      global.db = { data: { chats: {} } }
    }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) {
      console.log('🔧 [ANTILINK] Inicializando configuración del chat')
      global.db.data.chats[m.chat] = {}
    }
    
    const chat = global.db.data.chats[m.chat]
    console.log(`💙 [ANTILINK] Config - antiLink: ${chat.antiLink}, antiLink2: ${chat.antiLink2}`)
    
    
    const linkDetection = detectLinks(m.text)
    
   
    if (chat.antiLink) {
      console.log('🔧 [ANTILINK] Modo básico activado - verificando grupos/canales')
      
      const foundProhibitedLink = linkDetection.whatsappGroup || linkDetection.whatsappChannel || linkDetection.waMe
      
      if (foundProhibitedLink) {
        console.log(`💢 [ANTILINK] ENLACE PROHIBIDO detectado por usuario ${userNumber}`)
        
        if (isAdmin) {
          console.log('👑 [ANTILINK] Usuario es administrador - enlace permitido')
          return true
        }
        
        
        if (linkDetection.whatsappGroup) {
          try {
            const groupInviteCode = await conn.groupInviteCode(m.chat)
            const thisGroupLink = `https://chat.whatsapp.com/${groupInviteCode}`
            
            if (m.text.includes(groupInviteCode)) {
              console.log('✅ [ANTILINK] Es el enlace del mismo grupo - permitido')
              return true
            }
          } catch (error) {
            console.error('❌ [ANTILINK] Error obteniendo código del grupo:', error)
          }
        }
        
       
        console.log(`🚫 [ANTILINK] EJECUTANDO ELIMINACIÓN de usuario ${userNumber}`)
        
        try {
          
          await conn.reply(
            m.chat,
            `💙 ¡Ara ara! @${userNumber} ha sido expulsado del escenario virtual por enviar enlaces de WhatsApp! 💙🎤\n\n🎵 ¡En el mundo de Miku no permitimos enlaces de grupos/canales!`,
            m,
            { mentions: [m.sender] }
          )
          
          
          await conn.sendMessage(m.chat, { delete: m.key })
          console.log('✅ [ANTILINK] Mensaje eliminado')
          
          
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
          console.log(`✅ [ANTILINK] Usuario ${userNumber} expulsado exitosamente`)
          
        } catch (error) {
          console.error('❌ [ANTILINK] Error durante la expulsión:', error)
        }
        
        return false 
      }
    }
    
    
    if (chat.antiLink2) {
      console.log('🔧 [ANTILINK] Modo completo activado - verificando todos los enlaces')
      
      const foundAnyLink = linkDetection.genericLink || linkDetection.customDomain
      
      if (foundAnyLink) {
        console.log(`🚨 [ANTILINK2] ENLACE GENÉRICO detectado por usuario ${userNumber}`)
        
        if (isAdmin) {
          console.log('💢 [ANTILINK2] Usuario es administrador - enlace permitido')
          return true
        }
        
        
        if (chat.antiLink && (linkDetection.whatsappGroup || linkDetection.whatsappChannel || linkDetection.waMe)) {
          console.log('⏭️ [ANTILINK2] Ya procesado por antiLink básico - saltando')
          return false
        }
        
        
        console.log(`🚫 [ANTILINK2] EJECUTANDO ELIMINACIÓN de usuario ${userNumber}`)
        
        try {
          
          await conn.reply(
            m.chat,
            `💙 ¡Ara ara! @${userNumber} ha sido expulsado del escenario virtual por enviar enlaces prohibidos! 💙🎤\n\n🎵 ¡En el mundo de Miku no permitimos enlaces de ningún tipo!`,
            m,
            { mentions: [m.sender] }
          )
          
          
          await conn.sendMessage(m.chat, { delete: m.key })
          console.log('✅ [ANTILINK2] Mensaje eliminado')
          
         
          await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
          console.log(`✅ [ANTILINK2] Usuario ${userNumber} expulsado exitosamente`)
          
        } catch (error) {
          console.error('❌ [ANTILINK2] Error durante la expulsión:', error)
        }
        
        return false 
      }
    }
    
    console.log('✅ [ANTILINK] Mensaje limpio - no se detectaron enlaces prohibidos')
    console.log('📨 [ANTILINK] ======== FIN PROCESAMIENTO ========')
    return true
    
  } catch (error) {
    console.error('💥 [ANTILINK] ERROR CRÍTICO:', error)
    console.error('💥 [ANTILINK] Stack trace:', error.stack)
    return true
  }
}

