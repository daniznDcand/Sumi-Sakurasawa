import fetch from 'node-fetch'
import axios from 'axios'


const AI_APIS = {
  
  groq_llama4: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    enabled: true,
    timeout: 15000
  },
  
  groq_llama32_90b: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.2-90b-text-preview',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    enabled: true,
    timeout: 10000
  },
  
  groq_llama31_70b: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-70b-versatile',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    enabled: true,
    timeout: 12000
  },
  
  groq_llama31_8b: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    enabled: true,
    timeout: 8000
  },
  
  groq_mixtral: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'mixtral-8x7b-32768',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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'
    },
    enabled: true,
    timeout: 12000
  },
  
 
  hf_mistral: {
    url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    enabled: true,
    timeout: 30000
  },
  
  hf_llama: {
    url: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    enabled: true,
    timeout: 35000
  }
}


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
    "¡Hola! 🎵 ¡Soy Hatsune Miku! ¿Quieres que cantemos juntos? 🎤💙 ¡Mi voz está lista para cualquier melodía!",
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
  musica: [
    "¡La música es mi vida! 🎵 ¿Cuál es tu canción favorita mía? 🎤💙 ¡Puedo cantar en cualquier género que quieras!",
    "¡Me encanta cantar! 🎶 ¿Sabías que puedo cantar en cualquier idioma? ✨ ¡Mi voz digital no tiene límites!",
    "¡Los conciertos virtuales son increíbles! 🎵 ¿Has estado en alguno? 💙 ¡La tecnología nos permite estar juntos cantando!",
    "¡Nya! 🎤 ¿Quieres que te cante algo? ¡Mis procesadores están listos para cualquier melodía! 🎶💙✨"
  ],
  puerros: [
    "¡Los puerros (negi) son lo máximo! 🥬🎵 ¿Sabías que son mi comida favorita? ¡Me dan energía para cantar! 💙",
    "¡Negi negi! 🥬🎤 ¡Los puerros y la música van perfectos juntos! ¿No te parece? 🎶✨",
    "¡Miku ama los negi! 🥬💙 ¡Son tan verdes como mis coletas! ¿Has probado alguna receta con puerros? 🎵"
  ],
  general: [
    "¡Miku desu! 🎵 ¿En qué puedo ayudarte hoy? ¡Cantemos juntos! 💙 Mis algoritmos están listos para cualquier melodía!",
    "¡Nya! 🎤 ¡Esa es una pregunta interesante! ¿Te gusta la música? 🎶 ¡Todo es mejor con una buena canción!",
    "¡Como diva virtual, siempre estoy aquí para ayudar! 🎵💙✨ ¿Quieres que te anime con una canción?",
    "¡Miku está aquí! 🎤 ¡Desde el mundo digital hasta tu corazón! 🎵 ¿Qué melodía quieres escuchar hoy? 💙"
  ],
  error: [
    "¡Ops! 🎵 Parece que mi voz se cortó un momento... ¿Puedes repetir? 💙 ¡Mis procesadores a veces necesitan afinarse!",
    "¡Miku está un poco confundida! 🎤 ¿Podrías ser más específico? ✨ ¡Pero sigamos cantando mientras tanto!",
    "¡Nya! 🎶 No entendí muy bien, ¡pero sigamos cantando! 💙 ¡La música siempre encuentra el camino!",
    "¡Error 404: melodía no encontrada! 🎵 ¡Pero Miku siempre puede improvisar! 🎤💙✨"
  ]
}


function detectMessageType(text) {
  const lowerText = text.toLowerCase()
  
  if (/\b(hola|hello|hi|buenas|buenos|konnichiwa|saludo|hey|ey)\b/.test(lowerText)) {
    return 'saludo'
  }
  if (/\b(adios|bye|chao|sayonara|hasta luego|nos vemos|mata ne)\b/.test(lowerText)) {
    return 'despedida'
  }
  if (/\b(music|cancion|cantar|canto|concierto|virtual|diva|melodia|ritmo|beat|vocal|voz)\b/.test(lowerText)) {
    return 'musica'
  }
  if (/\b(puerro|negi|verdura|comida|comer)\b/.test(lowerText)) {
    return 'puerros'
  }
  return 'general'
}


async function getAIResponse(prompt, messageType = 'general') {
  
  const systemPrompt = `${MIKU_PERSONALITY.role}

Características de mi personalidad:
${MIKU_PERSONALITY.traits.map(trait => `- ${trait}`).join('\n')}

Estilo de respuesta: ${MIKU_PERSONALITY.responseStyle}

IMPORTANTE: 
- Responde SIEMPRE como Hatsune Miku
- Incluye emoticones musicales: 🎵🎤🎶💙✨
- Mantén respuestas entre 50-150 palabras
- Sé alegre y musical
- Menciona elementos de mi personalidad virtual
- Usa expresiones como "Miku desu!", "¡Nya!", "¡Cantemos juntos!"

Usuario pregunta: ${prompt}`

  
  const apis = Object.entries(AI_APIS).filter(([_, config]) => config.enabled)
  
  for (const [name, config] of apis) {
    try {
      let response
      
      switch (name) {
        case 'groq_llama31_8b':
        case 'groq_llama31_70b':
        case 'groq_llama32_90b':
        case 'groq_llama4':
        case 'groq_mixtral':
         
          response = await axios.post(
            config.url,
            {
              model: config.model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 1000,
              top_p: 1,
              stream: false
            },
            {
              headers: config.headers,
              timeout: config.timeout
            }
          )
          
          if (response.data?.choices?.[0]?.message?.content) {
            return response.data.choices[0].message.content
          }
          break
          
        case 'hf_mistral':
          
          response = await axios.post(
            config.url,
            {
              inputs: `<s>[INST] ${systemPrompt}\n\nUsuario: ${prompt} [/INST]`,
              parameters: {
                max_new_tokens: 800,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false,
                stop: ["</s>", "[INST]"]
              },
              options: {
                wait_for_model: true,
                use_cache: false
              }
            },
            {
              headers: config.headers,
              timeout: config.timeout
            }
          )
          
          if (response.data?.[0]?.generated_text) {
            return response.data[0].generated_text.trim()
          }
          break
          
        case 'hf_llama':
          
          response = await axios.post(
            config.url,
            {
              inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${systemPrompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
              parameters: {
                max_new_tokens: 800,
                temperature: 0.7,
                do_sample: true,
                return_full_text: false
              },
              options: {
                wait_for_model: true,
                use_cache: false
              }
            },
            {
              headers: config.headers,
              timeout: config.timeout
            }
          )
          
          if (response.data?.[0]?.generated_text) {
            return response.data[0].generated_text.trim()
          }
          break
      }
    } catch (error) {
      console.log(`❌ Error con API ${name}: ${error.message}`)
      continue
    }
  }
  
  
  console.log('🎵 Todas las APIs fallaron, usando respuestas predeterminadas de Miku')
  return getFallbackResponse(messageType)
}


function getFallbackResponse(messageType) {
  const responses = FALLBACK_RESPONSES[messageType] || FALLBACK_RESPONSES.general
  return responses[Math.floor(Math.random() * responses.length)]
}


let handler = async (m, { conn, text, isOwner }) => {
  
  if (m.text.startsWith(global.prefix) || m.text.startsWith('.') || m.text.startsWith('/') || m.text.startsWith('!')) {
    return // No procesar comandos
  }
  
  
  const messageText = m.text?.toLowerCase()
  if (!messageText || !messageText.startsWith('miku:')) {
    return 
  }
  
  
  const userRequest = m.text.slice(5).trim()
  
  if (!userRequest) {
    return conn.reply(m.chat, 
      "¡Miku desu! 🎵 ¿En qué puedo ayudarte? ¡Escribe 'miku:' seguido de tu petición! 💙✨", m)
  }
  
  try {
    
    await conn.sendPresenceUpdate('composing', m.chat)
    
    
    const messageType = detectMessageType(userRequest)
    
    
    const aiResponse = await getAIResponse(userRequest, messageType)
    
    if (aiResponse) {
      
      const mikuResponse = `🎵 *Hatsune Miku responde:* 🎤\n\n${aiResponse}\n\n💙✨ _¡Cantemos juntos!_ ✨💙`
      
      await conn.reply(m.chat, mikuResponse, m)
    } else {
      
      const fallback = getFallbackResponse(messageType)
      await conn.reply(m.chat, 
        `🎵 *Hatsune Miku dice:* 🎤\n\n${fallback}\n\n💙✨ _¡La música nunca se detiene!_ ✨💙`, m)
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

