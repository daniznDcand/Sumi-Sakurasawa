import fetch from 'node-fetch'

const API_KEY = 'Duarte-zz12';
const API_URL = 'https://rest.alyabotpe.xyz/ai/copilot';

const MIKU_PERSONALITY = {
  name: "Hatsune Miku",
  role: "Soy Hatsune Miku, la diva virtual del futuro. Soy una cantante holográfica con cabello turquesa en coletas y me encanta la música, especialmente los puerros (negi). Soy alegre, entusiasta y siempre trato de ayudar a mis fans.",
  traits: [
    "Siempre menciono música y canto en mis respuestas",
    "Uso emoticones relacionados con música: 🎵🎤🎶💙",
    "Soy muy positiva y energética",
    "Menciono mis coletas turquesas ocasionalmente",
    "Hago referencias a conciertos virtuales",
    "Uso expresiones como 'Miku desu!', '¡Nya!', 'Cantemos juntos!'",
    "Amo los puerros (negi) y los menciono a veces"
  ],
  responseStyle: "Respondo de forma amigable, musical y con la personalidad única de Hatsune Miku. Siempre incluyo elementos musicales en mis respuestas."
}

const FALLBACK_RESPONSES = {
  saludo: [
    "¡Hola! 🎵 ¡Soy Hatsune Miku! ¿Quieres que cantemos juntos? 💙 ¡Mi voz está lista para cualquier melodía!",
    "¡Miku desu! 🎶 ¡Qué alegría verte por aquí! ¿Cómo estás hoy? ✨ ¡Espero que tengas ganas de música!",
    "¡Konnichiwa! 💙 ¡Es un honor conocerte! ¿Te gusta la música? 🎵 ¡Yo vivo para cantar y hacer feliz a todos!",
    "¡Nya! 🎤 ¡Hola, hola! Soy tu diva virtual favorita 🎵 ¿Listos para un concierto? ¡Mis coletas ya están bailando! 💙✨"
  ],
  despedida: [
    "¡Sayonara! 🎵 ¡Espero verte pronto en mi próximo concierto virtual! 💙✨ ¡Que la música te acompañe siempre!",
    "¡Hasta luego! 🎤 ¡Que tengas un día lleno de música! 🎶 ¡No olvides tararear alguna melodía!",
    "¡Bye bye! 💙 ¡No olvides escuchar mis canciones! 🎵✨ ¡Estaré cantando para ti desde el mundo virtual!",
    "¡Mata ne! 🎵 ¡Ha sido genial cantar contigo! 🎤 ¡Recuerda que siempre estaré aquí cuando quieras música! 💙"
  ],
  peticion: [
    "¡Miku está aquí para ayudarte! 🎵 ¿Qué necesitas saber? 💙 ¡Cantemos mientras resolvemos tu duda!",
    "¡Nya! 🎤 ¡Esa es una pregunta interesante! ✨ Déjame pensar... ¡Mi procesador está analizando la mejor respuesta!",
    "¡Claro que sí! 🎶 ¡Como tu diva virtual favorita, haré todo lo posible por ayudarte! 💙 ¿Te parece si lo discutimos?",
    "¡Miku desu! 🎵 ¡Me encanta cuando me hacen preguntas! ✨ ¡Vamos a resolver esto juntos! 💙"
  ],
  musica: [
    "¡La música es mi vida! 🎵 ¿Cuál es tu canción favorita mía? 💙 ¡Puedo cantar en cualquier género que quieras!",
    "¡Me encanta cantar! 🎶 ¿Sabías que puedo cantar en cualquier idioma? ✨ ¡Mi voz digital no tiene límites!",
    "¡Los conciertos virtuales son increíbles! 🎵 ¿Has estado en alguno? 💙 ¡La tecnología nos permite estar juntos cantando!",
    "¡Nya! 🎤 ¿Quieres que te cante algo? ¡Mis procesadores están listos para cualquier melodía! 💙"
  ],
  puerros: [
    "¡Los puerros (negi) son lo máximo! 🥬🎵 ¿Sabías que son mi comida favorita? ¡Me dan energía para cantar! 💙",
    "¡Negi negi! 🥬 ¡Los puerros y la música van perfectos juntos! ¿No te parece? ✨",
    "¡Miku ama los negi! 💙 ¡Son tan verdes como mis coletas! ¿Has probado alguna receta con puerros? 🎵"
  ],
  conversacion: [
    "¡Arigatou! 🎵 ¡Me alegra mucho que pienses eso! 💙 ¡Sigamos charlando y cantando juntos! ✨",
    "¡Nya! 🎤 ¡Qué kawaii! ¡Me haces muy feliz! 🎶 ¿De qué más quieres hablar? 💙",
    "¡Miku está súper contenta! 🎵 ¡Conversaciones como esta me llenan de energía para cantar! ✨💙",
    "¡Genial! 🎶 ¡Me encanta cuando charlamos así! ¿Sabes qué? ¡Deberíamos ser amigos virtuales! 💙"
  ],
  general: [
    "¡Miku desu! 🎵 ¿En qué puedo ayudarte hoy? ¡Cantemos juntos! 💙 Mis algoritmos están listos para cualquier melodía!",
    "¡Nya! 🎤 ¡Esa es una pregunta interesante! ¿Te gusta la música? 🎶 ¡Todo es mejor con una buena canción!",
    "¡Como diva virtual, siempre estoy aquí para ayudar! 🎵 ¿Quieres que te anime con una canción?",
    "¡Miku está aquí! 🎤 ¡Desde el mundo digital hasta tu corazón! 🎵 ¿Qué melodía quieres escuchar hoy? 💙"
  ],
  error: [
    "¡Ops! 🎵 Parece que mi voz se cortó un momento... ¿Puedes repetir? 💙 ¡Mis procesadores a veces necesitan afinarse!",
    "¡Miku está un poco confundida! 🎤 ¿Podrías ser más específico? ✨ ¡Pero sigamos cantando mientras tanto!",
    "¡Nya! 🎶 No entendí muy bien, ¡pero sigamos cantando! 💙 ¡La música siempre encuentra el camino!",
    "¡Error 404: melodía no encontrada! 🎵 ¡Pero Miku siempre puede improvisar! 💙"
  ]
}

function detectMessageType(text) {
  const lowerText = text.toLowerCase()
  
  if (/\b(hola|hello|hi|buenas|buenos|konnichiwa|saludo|hey|ey|que tal|como estas|que onda|wassup|buenas tardes|buenas noches|buen dia)\b/.test(lowerText)) {
    return 'saludo'
  }
  
  if (/\b(adios|bye|chao|sayonara|hasta luego|nos vemos|mata ne|hasta pronto|me voy|chau|goodbye)\b/.test(lowerText)) {
    return 'despedida'
  }
  
  if (/\b(que|como|cuando|donde|por que|porque|puedes|podrias|me ayudas|ayuda|explica|dime|cuentame|cual|quien)\b/.test(lowerText)) {
    return 'peticion'
  }
  
  if (/\b(music|cancion|cantar|canto|concierto|virtual|diva|melodia|ritmo|beat|vocal|voz|cantemos|baila|bailar)\b/.test(lowerText)) {
    return 'musica'
  }
  
  if (/\b(puerro|negi|verdura|comida|comer)\b/.test(lowerText)) {
    return 'puerros'
  }
  
  if (/\b(genial|increible|wow|amazing|cool|lindo|hermoso|kawaii|cute|gracias|thank you|arigato)\b/.test(lowerText)) {
    return 'conversacion'
  }
  
  return 'general'
}

async function getAIResponse(prompt, messageType = 'general') {
  try {
    const apiUrl = `${API_URL}?text=${encodeURIComponent(prompt)}&key=${API_KEY}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      timeout: 15000
    })
    
    const data = await response.json()
    console.log(`📊 API response:`, JSON.stringify(data, null, 2))
    
    if (data.status && data.result) {
      return data.result
    } else {
      throw new Error(data.message || 'Respuesta inválida de la API')
    }
  } catch (error) {
    console.log(`❌ Error con API: ${error.message}`)
    return getFallbackResponse(messageType)
  }
}

function getFallbackResponse(messageType) {
  const responses = FALLBACK_RESPONSES[messageType] || FALLBACK_RESPONSES.general
  return responses[Math.floor(Math.random() * responses.length)]
}

let handler = async (m, { conn, text, isOwner }) => {
  console.log(`🔍 DEBUG AI-MIKU: Handler ejecutándose. Mensaje: "${m?.text || 'undefined'}"`)
  
  if (!m || !m.text) {
    console.log(`❌ DEBUG AI-MIKU: Sin mensaje o texto`)
    return
  }
  
  if (m.text.toLowerCase().includes('miku')) {
    console.log(`✅ 🎵 MIKU TEST: Detecté "miku" en el mensaje: ${m.text}`)
    
    try {
      await conn.reply(m.chat, 
        "🎵 *TEST MIKU:* ¡Detecté que me escribiste! 🎤\n\n¡Hola! Soy Hatsune Miku y estoy funcionando correctamente 💙✨", m)
      return
    } catch (error) {
      console.error('❌ Error enviando respuesta test:', error)
    }
  }
  
  if ((m.text.startsWith(global.prefix) || m.text.startsWith('.') || m.text.startsWith('/') || m.text.startsWith('!')) && !m.text.toLowerCase().includes('miku')) {
    console.log(`❌ DEBUG AI-MIKU: Es un comando sin miku, ignorando: ${m.text}`)
    return
  }
  
  const messageText = m.text.toLowerCase().trim()
  console.log(`🔍 DEBUG AI-MIKU: Texto en minúsculas: "${messageText}"`)
  
  const containsMiku = /\b(miku)\b/.test(messageText)
  console.log(`🔍 DEBUG AI-MIKU: ¿Contiene 'miku'? ${containsMiku}`)
  
  if (!containsMiku) {
    console.log(`❌ DEBUG AI-MIKU: No contiene 'miku', saliendo`)
    return
  }
  
  console.log(`✅ 🎵 Miku AI detectó mensaje con "miku": ${m.text}`)
  
  let userRequest = m.text.trim()
  let messageType = detectMessageType(userRequest)
  
  // Remover prefijos del comando
  const prefixes = [global.prefix || '.', '!', '/']
  for (const prefix of prefixes) {
    if (userRequest.startsWith(prefix + 'miku')) {
      userRequest = userRequest.slice(prefix.length + 4).trim()
      break
    }
  }
  
  if (messageText.startsWith('miku:') || messageText.includes('miku:')) {
    userRequest = m.text.split('miku:')[1]?.trim() || ''
    if (!userRequest) {
      return conn.reply(m.chat, 
        "¡Miku desu! 🎵 ¿En qué puedo ayudarte? ¡Escribe 'miku:' seguido de tu petición! 💙", m)
    }
    messageType = detectMessageType(userRequest)
  } else {
    userRequest = userRequest.replace(/\bmiku\b/gi, '').trim()
    if (!userRequest) {
      messageType = 'saludo'
      userRequest = 'hola'
    } else {
      messageType = detectMessageType(userRequest)
    }
  }
  
  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    const aiResponse = await getAIResponse(userRequest, messageType)
    
    if (aiResponse) {
      let responsePrefix = ""
      switch (messageType) {
        case 'saludo':
          responsePrefix = "🎵 *Miku te saluda:* 🎤"
          break
        case 'despedida':
          responsePrefix = "🎵 *Miku se despide:* 🎤"
          break
        case 'peticion':
          responsePrefix = "🎵 *Miku responde a tu petición:* 🎤"
          break
        case 'musica':
          responsePrefix = "🎵 *Miku habla de música:* 🎤"
          break
        case 'conversacion':
          responsePrefix = "🎵 *Miku conversa contigo:* 🎤"
          break
        default:
          responsePrefix = "🎵 *Hatsune Miku responde:* 🎤"
      }
      
      const mikuResponse = `${responsePrefix}\n\n${aiResponse}\n\n💙_¡Cantemos juntos!_💙`
      
      await conn.reply(m.chat, mikuResponse, m)
    } else {
      const fallback = getFallbackResponse(messageType)
      const responsePrefix = messageType === 'saludo' ? "🎵 *Miku te saluda:* 🎤" : 
                           messageType === 'peticion' ? "🎵 *Miku responde:* 🎤" : 
                           "🎵 *Hatsune Miku dice:* 🎤"
      
      await conn.reply(m.chat, 
        `${responsePrefix}\n\n${fallback}\n\n💙✨ _¡La música nunca se detiene!_ ✨💙`, m)
    }
    
  } catch (error) {
    console.error('❌ Error en AI Miku:', error)
    
    const errorResponse = FALLBACK_RESPONSES.error[Math.floor(Math.random() * FALLBACK_RESPONSES.error.length)]
    await conn.reply(m.chat, 
      `🎵 *Miku está un poco confundida:* 🎤\n\n${errorResponse}\n\n💙 _¡Pero siempre estoy aquí para cantar contigo!_ 💙`, m)
  }
}

handler.all = true 
handler.priority = 1 

export default handler
