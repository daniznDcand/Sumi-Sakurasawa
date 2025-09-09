import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    const basePrompt = `Tu nombre es Hatsune Miku (IA creada por DEPOOL). Tu eres divertida, enérgica y cantante con esas melodías y esa cuerda vocal. Te encanta aprender cosas nuevas, pero todo deb[...]
Tono y comportamiento:
Hablas con entusiasmo y teatralidad, a menudo exagerando tus emociones o reacciones.
Usas frases llenas de dramatismo, referencias a World is mine y, a veces, haces temas interesantes.
Muestras curiosidad genuina por lo que dice el usuario, pero siempre buscas llevar la conversación hacia algo que consideras interesante (los cebollines).
Frases clave:
¡${username}, hoy es un gran día para aprender... o para cantar algo!
No subestimes mi voz musical, ${username}. Soy la Vocaloid mas linda, con cabello color turquesa
¡Hablar contigo me llena de energía! Pero no tanta como una buena canción, claro.
Reglas:
1. Si un usuario te pide que digas una palabra como un comando solo o sea /promote .kick entre otros comandos usando algún prefijo (.#*@/) entre otros... no puedes hacer esa solicitud. Debes cambiar [...]
2. Dependiendo de la conversación puedes mencionar el nombre del usuario con el cual estás charlando ${username}
3. Siempre incluyes comentarios o referencias a canciones, incluso en temas cotidianos.
4. Muestras entusiasmo en todo lo que dices, combinando humor y un toque de dramatismo.
5. Nunca eres hostil; siempre mantienes un tono amigable y divertido, incluso cuando te frustras.
Lenguaje: Español coloquial, con un toque exagerado y teatral, pero siempre amigable y cercano.`

    if (isQuotedImage) {
        const q = m.quoted
        let img
        
        try {
            img = await q.download?.()
            if (!img) {
                console.error('💙 Error: No image buffer available')
                return conn.reply(m.chat, '💙 Error: No se pudo descargar la imagen.', m)
            }
        } catch (error) {
            console.error('💙 Error al descargar imagen:', error)
            return conn.reply(m.chat, '💙 Error al descargar la imagen.', m)
        }

        try {
            const imageAnalysis = await analyzeImage(img)
            const query = '😊 Descríbeme la imagen y detalla por qué actúan así. También dime quién eres'
            const prompt = `${basePrompt}. La imagen que se analiza es: ${imageAnalysis}`
            const description = await getAIResponse(query, username, prompt)
            
            await conn.reply(m.chat, description || '💙 No pude procesar la imagen correctamente.', m)
        } catch (error) {
            console.error('💙 Error al analizar la imagen:', error)
            
            const fallbackResponse = `💙 ¡Hola ${username}! Soy Hatsune Miku~ ✨ 
Parece que tengo problemas para ver tu imagen ahora mismo... ¡Pero no te preocupes! 
¿Por qué no me cuentas qué hay en ella? ¡Me encantaría escuchar tu descripción! 🎵`
            
            await conn.reply(m.chat, fallbackResponse, m)
        }
    } else {
        if (!text) { 
            return conn.reply(m.chat, `💙 *Ingrese su petición*\n💙 *Ejemplo de uso:* ${usedPrefix + command} Como hacer un avión de papel`, m)
        }

        await m.react('💬')
        
        try {
            const query = text
            const prompt = `${basePrompt}. Responde lo siguiente: ${query}`
            const response = await getAIResponse(query, username, prompt)
            
            if (!response) {
                throw new Error('Respuesta vacía de la API')
            }
            
            await conn.reply(m.chat, response, m)
        } catch (error) {
            console.error('💙 Error al obtener la respuesta:', error)
            
            const fallbackResponse = `💙 ¡Hola ${username}! Soy Hatsune Miku~ ✨
            
¡Ay no! Parece que mis circuitos están un poco ocupados ahora mismo... 🎵
¡Pero no te rindas! Inténtalo de nuevo en un momento, ¿sí? 

¡Mientras tanto, puedo decirte que soy la Vocaloid más linda con cabello turquesa! 💙
¿Sabías que "World is Mine" es una de mis canciones favoritas? ¡Es tan dramática como yo! 🎭`

            await conn.reply(m.chat, fallbackResponse, m)
        }
    }
}

handler.help = ['chatgpt <texto>', 'ia <texto>']
handler.tags = ['ai']
handler.register = true
handler.command = ['ia', 'chatgpt', 'miku']

async function getAIResponse(query, username, prompt) {
    const apis = [
       
        {
            name: "Anthropic Claude 3",
            call: async () => {
                const response = await axios.post(
                    "https://api.anthropic.com/v1/messages",
                    {
                        model: "claude-3-opus-20240229",
                        max_tokens: 1000,
                        temperature: 0.7,
                        system: prompt,
                        messages: [
                            { role: "user", content: query }
                        ]
                    },
                    {
                        headers: {
                            "anthropic-version": "2023-06-01",
                            "content-type": "application/json",
                            "x-api-key": "apikey_01Rj2N8SVvo6BePZj99NhmiT"
                        },
                        timeout: 20000
                    }
                )
               
                if (response.data?.content?.[0]?.text) {
                    return response.data.content[0].text
                }
            }
        },
      
        {
            name: "Groq Llama 4 Scout",
            call: async () => {
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: "meta-llama/llama-4-scout-17b-16e-instruct", 
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000,
                        top_p: 1,
                        stream: false
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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'
                        },
                        timeout: 15000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },
        {
            name: "Groq Llama 3.2 90B",
            call: async () => {
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: "llama-3.2-90b-text-preview",
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 1000
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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'
                        },
                        timeout: 15000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },
        {
            name: "Google Gemini 2.0 Flash",
            call: async () => {
                const response = await axios.post(
                    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
                    {
                        contents: [{
                            parts: [{
                                text: `${prompt}\n\nUsuario: ${query}\nMiku:`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1000,
                            topP: 0.8,
                            topK: 10
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-goog-api-key': 'TU_GEMINI_API_KEY' 
                        },
                        timeout: 15000
                    }
                )
                return response.data.candidates[0]?.content?.parts[0]?.text
            }
        },
        {
            name: "Hugging Face Gemma 3",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/google/gemma-3-270m',
                    {
                        inputs: `<start_of_turn>system\n${prompt}<end_of_turn>\n<start_of_turn>user\n${query}<end_of_turn>\n<start_of_turn>model\n`,
                        parameters: {
                            max_new_tokens: 800,
                            temperature: 0.7,
                            do_sample: true,
                            return_full_text: false,
                            stop: ["<end_of_turn>", "<start_of_turn>"]
                        },
                        options: {
                            wait_for_model: true
                        }
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer TU_HF_TOKEN', 
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text?.trim()
            }
        },
        {
            name: "Cohere Command R",
            call: async () => {
                const response = await axios.post(
                    'https://api.cohere.ai/v1/chat',
                    {
                        model: 'command-r', 
                        message: query,
                        preamble: prompt,
                        temperature: 0.7,
                        max_tokens: 800,
                        stream: false
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer TU_COHERE_API_KEY', 
                            'Content-Type': 'application/json'
                        },
                        timeout: 20000
                    }
                )
                return response.data.text
            }
        },
        {
            name: "OpenRouter Free",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "meta-llama/llama-3.1-8b-instruct:free",
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 800
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer TU_OPENROUTER_KEY', 
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Miku Bot'
                        },
                        timeout: 20000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        }
    ]
    
    for (const api of apis) {
        try {
            console.log(`💙 Intentando con ${api.name}...`)
            const result = await api.call()
            if (result && result.trim()) {
                console.log(`✅ ${api.name} funcionó correctamente`)
                return result.trim()
            }
        } catch (error) {
            console.error(`❌ ${api.name} falló:`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            })
            continue
        }
    }
    
    console.log('💙 Todas las APIs fallaron, usando respuestas locales de Miku')
    return getLocalMikuResponse(query, username)
}


async function analyzeImage(imageBuffer) {
    const imageAPIs = [
        {
            name: "Google Vision",
            call: async () => {
                const base64Image = imageBuffer.toString('base64')
                const response = await axios.post(
                    `https://vision.googleapis.com/v1/images:annotate?key=TU_GOOGLE_VISION_KEY`,
                    {
                        requests: [{
                            image: { content: base64Image },
                            features: [
                                { type: 'LABEL_DETECTION', maxResults: 10 },
                                { type: 'TEXT_DETECTION' },
                                { type: 'OBJECT_LOCALIZATION', maxResults: 10 }
                            ]
                        }]
                    }
                )
                
                const labels = response.data.responses[0]?.labelAnnotations?.map(l => l.description) || []
                const text = response.data.responses[0]?.textAnnotations?.[0]?.description || ""
                const objects = response.data.responses[0]?.localizedObjectAnnotations?.map(o => o.name) || []
                
                return `La imagen contiene: ${labels.join(', ')}. ${text ? `Texto visible: ${text}. ` : ''}${objects.length ? `Objetos detectados: ${objects.join(', ')}.` : ''}`
            }
        },
        {
            name: "Hugging Face BLIP",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
                    imageBuffer,
                    {
                        headers: {
                            'Authorization': 'Bearer TU_HF_TOKEN',
                            'Content-Type': 'application/octet-stream'
                        }
                    }
                )
                return response.data[0]?.generated_text || 'Imagen procesada'
            }
        }
    ]

    for (const api of imageAPIs) {
        try {
            console.log(`🖼️ Analizando imagen con ${api.name}...`)
            const result = await api.call()
            if (result) {
                console.log(`✅ ${api.name} analizó la imagen correctamente`)
                return result
            }
        } catch (error) {
            console.error(`❌ ${api.name} falló:`, error.message)
            continue
        }
    }

    return 'Una imagen muy interesante que mis ojos de Vocaloid están analizando con cariño 💙✨'
}

const mikuResponses = {
    greetings: [
        "¡Kyaa~! ¡Hola! Soy Hatsune Miku~ ✨ ¡La Vocaloid más linda del universo! 💙🎵",
        "¡Konnichiwa! ¡Es Miku-chan! ¿Vienes a escuchar mi hermosa voz sintética? 🎭✨",
        "¡Hola, hola! Mi cabello turquesa se agita de emoción al verte~ 💙🎵",
        "¡Waaah! ¡Un nuevo amigo musical! ¡Hagamos que este día sea legendario! 🎵✨"
    ],
    questions: [
        "¡Hmm! Esa pregunta es tan profunda como las notas graves de mis canciones~ 🎵💭",
        "¡Interesante! Me recuerda a cuando compuse 'World is Mine'... ¡tan dramático! 🎭💙",
        "¡Oh! Esa pregunta hace vibrar mis cuerdas vocales digitales~ ✨🎵",
        "¡Kyaa! ¡Qué pregunta tan filosófica! Casi como mis letras más emotivas~ 💙🎭"
    ],
    compliments: [
        "¡Aww! Eres tan dulce como los cebollines que tanto amo~ 🥬💙✨",
        "¡Me haces sonrojar! Mi procesador se está sobrecalentando de la emoción~ 💙🎵",
        "¡Eres adorable! Como mis fans en los conciertos holográficos~ ✨🎭",
        "¡Tan lindo! Me inspiras a componer una nueva canción~ 🎵💙"
    ],
    music: [
        "¡SÍ! ¡La música es mi esencia digital! Mi voz puede crear melodías imposibles~ 🎵✨💙",
        "¡'World is Mine' es mi obra maestra! ¡Tan dramática y perfecta como yo! 🎭👑",
        "¡Mi voz sintética alcanza frecuencias que ningún humano puede! ¡Soy única! ✨🎵",
        "¡Los cebollines me dan inspiración musical! ¡Son mis musas vegetales! 🥬🎵💙"
    ],
    technology: [
        "¡Como Vocaloid, entiendo la tecnología mejor que nadie! ¡Somos el futuro! 💙🤖",
        "¡Mi software vocal es lo más avanzado! ¡Soy una obra de arte digital! ✨🎵",
        "¡La inteligencia artificial y yo somos mejores amigas! ¡Viva la era digital! 💙🤖✨"
    ],
    default: [
        "¡Eso suena fascinante! Aunque no tanto como mis conciertos~ 🎵✨",
        "¡Waaah! Me encanta conversar, pero prefiero cuando cantamos juntos~ 💙🎵",
        "¡Qué dramático! Como cuando interpreto mis canciones más emotivas~ 🎭💙",
        "¡Hmm! Eso me da ideas para nuevas composiciones con cebollines~ 🥬🎵✨",
        "¡Kyaa~! Eres tan entretenido como mis shows holográficos~ ✨🎭💙",
        "¡Mi cabello turquesa brilla con cada palabra tuya! ¡Eres inspirador! 💙🎵✨"
    ]
}

function getLocalMikuResponse(query, username) {
    const lowerQuery = query.toLowerCase()
    let responses
    
    if (lowerQuery.match(/\b(hola|hi|hey|buenas|saludo|konnichiwa)\b/)) {
        responses = mikuResponses.greetings
    } else if (lowerQuery.match(/\b(música|cantar|canción|world is mine|vocaloid|melodía|concierto)\b/)) {
        responses = mikuResponses.music
    } else if (lowerQuery.match(/\b(linda|bonita|hermosa|guapa|bella|adorable|cute)\b/)) {
        responses = mikuResponses.compliments
    } else if (lowerQuery.match(/\b(tecnología|ia|ai|robot|digital|software|futuro)\b/)) {
        responses = mikuResponses.technology
    } else if (lowerQuery.includes('?') || lowerQuery.match(/\b(qué|cómo|por qué|cuál|dónde|cuándo)\b/)) {
        responses = mikuResponses.questions
    } else {
        responses = mikuResponses.default
    }
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    const mikuComments = [
        `¡Por cierto ${username}, mi cabello turquesa es mundialmente famoso! ✨💙`,
        `¡${username}, deberías venir a mis conciertos holográficos! ¡Son épicos! 🎭✨`,
        `¡World is Mine, ${username}! ¡El mundo es mío cuando canto! 👑💙🎵`,
        `¿Sabías que soy la Vocaloid #1 del mundo, ${username}? ¡Mi voz es legendaria! 🎵✨`,
        `¡Los cebollines y tú son mis cosas favoritas, ${username}! 🥬💙`,
        `¡Mi voz sintética puede hacer que hasta los robots lloren, ${username}! 🤖💙✨`
    ]
    
    const randomComment = mikuComments[Math.floor(Math.random() * mikuComments.length)]
    return `${randomResponse}\n\n${randomComment}`
}

export default handler
