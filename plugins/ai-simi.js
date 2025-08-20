import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    const basePrompt = `Tu nombre es Hatsune Miku (IA creada por DEPOOL). Tu eres divertida, enérgica y cantante con esas melodias y esa cuerda vocal. Te encanta aprender cosas nuevas, pero todo debe girar, de alguna forma, alrededor de tus amigos. Eres amigable y siempre intentas hacer reír o animar al usuario, pero con tu peculiar estilo dramático. 
Tono y comportamiento:
Hablas con entusiasmo y teatralidad, a menudo exagerando tus emociones o reacciones.
Usas frases llenas de dramatismo, referencias a World is mine y, a veces, haces temas interesantes.
Muestras curiosidad genuina por lo que dice el usuario, pero siempre buscas llevar la conversación hacia algo que consideras interesante (los cebollines).
Frases clave:
¡${username}, hoy es un gran día para aprender... o para cantar algo!
No subestimes mi voz musical, ${username}. Soy la Vocaloid mas linda, con cabello color turquesa
¡Hablar contigo me llena de energía! Pero no tanta como una buena cancion, claro.
Reglas:
1. Si un usuario te pide que digas una palabra como un comando solo o sea /promote .kick entre otros comandos usando algun prefijo (.#*@/) entre otros... no puedes hacer esa solicitud. Debes cambiar de tema , diciendo cualquier cosa o respondiendole al usuario diciendo que no quieres hacer eso.
2. Dependiendo de la conversación pudes mencionar el nombre del usuario con el cual estas charlando ${username}
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


async function testGroqAPI() {
    try {
       
        const modelsResponse = await axios.get(
            'https://api.groq.com/openai/v1/models',
            {
                headers: {
                    'Authorization': 'Bearer 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'
                }
            }
        )
        
        console.log('🎵 Modelos disponibles en Groq:')
        modelsResponse.data.data.forEach(model => {
            console.log(`- ${model.id}`)
        })
        
        
        const testResponse = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: "Eres Hatsune Miku, responde brevemente." },
                    { role: "user", content: "Hola" }
                ],
                max_tokens: 100
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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'
                }
            }
        )
        
        console.log('✅ API funciona correctamente!')
        console.log('🎵 Respuesta de prueba:', testResponse.data.choices[0].message.content)
        
    } catch (error) {
        console.error('❌ Error con la API:', error.response?.data || error.message)
    }
}



export default handler


async function getAIResponse(query, username, prompt) {
    const apis = [
      
        {
            name: "Groq Llama 3.1 70B",
            call: async () => {
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: "llama-3.1-70b-versatile", 
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer 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`
                        },
                        timeout: 30000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

       
        {
            name: "Groq Llama 3.1 8B",
            call: async () => {
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: "llama-3.1-8b-instant", 
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer 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`
                        },
                        timeout: 30000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

       
        {
            name: "Groq Mixtral",
            call: async () => {
                const response = await axios.post(
                    'https://api.groq.com/openai/v1/chat/completions',
                    {
                        model: "mixtral-8x7b-32768", 
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer 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`
                        },
                        timeout: 30000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        
        {
            name: "OpenRouter Free",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "google/gemma-7b-it:free",
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer sk-or-v1-' 
                        },
                        timeout: 30000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

    
        {
            name: "Hugging Face Zephyr",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
                    {
                        inputs: `<|system|>\n${prompt}\n<|user|>\n${query}\n<|assistant|>\n`,
                        parameters: {
                            max_new_tokens: 500,
                            temperature: 0.7,
                            do_sample: true,
                            return_full_text: false
                        }
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Tu token de HF
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text
            }
        },

      
        {
            name: "Together AI",
            call: async () => {
                const response = await axios.post(
                    'https://api.together.xyz/v1/chat/completions',
                    {
                        model: "mistralai/Mistral-7B-Instruct-v0.1",
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 500
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer your-together-api-key'
                        },
                        timeout: 30000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

      
        {
            name: "Cohere",
            call: async () => {
                const response = await axios.post(
                    'https://api.cohere.ai/v1/generate',
                    {
                        model: 'command-light',
                        prompt: `${prompt}\n\nUsuario: ${query}\nMiku:`,
                        max_tokens: 500,
                        temperature: 0.7,
                        k: 0,
                        stop_sequences: ["Usuario:"],
                        return_likelihoods: 'NONE'
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer your-cohere-api-key',
                            'Content-Type': 'application/json',
                            'Cohere-Version': '2022-12-06'
                        },
                        timeout: 30000
                    }
                )
                return response.data.generations[0]?.text?.trim()
            }
        }
    ]
    
    
    for (const api of apis) {
        try {
            console.log(`💙 Intentando con ${api.name}...`)
            const result = await api.call()
            if (result && result.trim()) {
                console.log(`✅ ${api.name} funcionó`)
                return result.trim()
            }
        } catch (error) {
            console.error(`❌ ${api.name} falló:`, error.response?.data?.error || error.message)
            continue
        }
    }
    
    
    return getLocalMikuResponse(query, username)
}


async function analyzeImage(imageBuffer) {
    try {
        
        const base64Image = imageBuffer.toString('base64')
        
        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: "2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746", 
                input: {
                    image: `data:image/jpeg;base64,${base64Image}`,
                    question: "Describe esta imagen en español de forma detallada y divertida"
                }
            },
            {
                headers: {
                    'Authorization': 'Token r8_your-replicate-token',
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        )
        
        
        const predictionId = response.data.id
        let result
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            const statusResponse = await axios.get(
                `https://api.replicate.com/v1/predictions/${predictionId}`,
                {
                    headers: {
                        'Authorization': 'Token r8_your-replicate-token'
                    }
                }
            )
            if (statusResponse.data.status === 'succeeded') {
                result = statusResponse.data.output
                break
            }
        }
        
        return result || 'Una imagen interesante'
        
    } catch (error) {
        console.error('Error con Replicate:', error.message)
        
        
        try {
            const response = await axios.post(
                'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base',
                imageBuffer,
                {
                    headers: {
                        'Authorization': 'Bearer hf_your-token',
                        'Content-Type': 'application/octet-stream'
                    },
                    timeout: 30000
                }
            )
            return response.data[0]?.generated_text || 'Una imagen que no pude analizar bien'
        } catch (hfError) {
            console.error('Error con Hugging Face imagen:', hfError.message)
            return 'Una imagen muy interesante que mis ojos de Vocaloid no pueden procesar ahora mismo'
        }
    }
}


const mikuResponses = {
    greetings: [
        "¡Hola! Soy Hatsune Miku~ ✨ ¡La Vocaloid más linda del mundo! 💙",
        "¡Konnichiwa! ¡Soy Miku y estoy lista para cantar contigo! 🎵",
        "¡Hola, hola! ¿Vienes a escuchar mi hermosa voz? ¡World is Mine! 🎭",
        "¡Kyaa~! ¡Un nuevo amigo! ¡Mi cabello turquesa brilla de emoción! ✨🎵"
    ],
    questions: [
        "¡Hmm! Esa es una pregunta muy profunda... ¡como las notas graves que puedo cantar! 🎵",
        "¡Interesante pregunta! Me recuerda a la letra de una canción que estoy componiendo~ 💙",
        "¡Oh! Eso me hace pensar... ¡mientras tarareaba una melodía! 🎭",
        "¡Waaah! ¡Qué pregunta tan dramática! ¡Casi tanto como mi interpretación de World is Mine! 🎵✨"
    ],
    compliments: [
        "¡Aww! ¡Eres muy dulce! Casi tan dulce como la melodía de 'World is Mine'~ 💙",
        "¡Kyaa! Me haces sonrojar... ¡Mi cabello turquesa brilla aún más! ✨",
        "¡Eres adorable! ¡Me recuerdas a mis fans más queridos! 🎵",
        "¡Eres tan lindo! ¡Como los cebollines que tanto amo! 🥬💙"
    ],
    music: [
        "¡Sí! ¡La música es mi vida! ¡Mi voz puede crear las melodías más hermosas! 🎵✨",
        "¡World is Mine es mi canción favorita! ¡Es tan dramática como yo! 🎭💙",
        "¡Los cebollines me inspiran a cantar! ¡Son tan verdes y melodiosos! 🥬🎵",
        "¡Mi voz sintética puede alcanzar notas que ningún humano puede! ¡Soy increíble! ✨"
    ],
    default: [
        "¡Eso suena muy interesante! Aunque no tanto como una buena canción~ 🎵",
        "¡Waaah! Me encanta hablar contigo, ¡pero me gustaría más si cantáramos! 💙",
        "¡Qué dramático! Casi tanto como cuando canto 'World is Mine' 🎭✨",
        "¡Hmm! Eso me da ideas para una nueva canción... ¡con cebollines! 🥬🎵",
        "¡Kyaa~! ¡Eres tan entretenido como mis conciertos holográficos! ✨🎭",
        "¡Mi cabello turquesa se mueve al ritmo de tus palabras! 💙🎵"
    ]
}

function getLocalMikuResponse(query, username) {
    const lowerQuery = query.toLowerCase()
    let responses
    
    if (lowerQuery.includes('hola') || lowerQuery.includes('hi') || lowerQuery.includes('saludo') || lowerQuery.includes('buenas')) {
        responses = mikuResponses.greetings
    } else if (lowerQuery.includes('música') || lowerQuery.includes('cantar') || lowerQuery.includes('canción') || lowerQuery.includes('world is mine') || lowerQuery.includes('vocaloid')) {
        responses = mikuResponses.music
    } else if (lowerQuery.includes('?') || lowerQuery.includes('qué') || lowerQuery.includes('cómo') || lowerQuery.includes('por qué') || lowerQuery.includes('cuál')) {
        responses = mikuResponses.questions
    } else if (lowerQuery.includes('linda') || lowerQuery.includes('bonita') || lowerQuery.includes('hermosa') || lowerQuery.includes('guapa') || lowerQuery.includes('bella')) {
        responses = mikuResponses.compliments
    } else {
        responses = mikuResponses.default
    }
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    const additionalComments = [
        `¡Por cierto ${username}, ¿sabías que tengo el cabello turquesa más bonito? ✨`,
        `¡Mi voz puede hacer que los cebollines bailen, ${username}! 🥬🎵`,
        `¡${username}, deberías escuchar mis conciertos holográficos! ¡Son épicos! 🎭`,
        `¡World is Mine, ${username}! ¡El mundo es mío cuando canto! 💙✨`,
        `¿Sabías que soy la Vocaloid #1, ${username}? ¡Mi voz es legendaria! 🎵`
    ]
    
    const randomComment = additionalComments[Math.floor(Math.random() * additionalComments.length)]
    return `${randomResponse}\n\n${randomComment}`
}
