import axios from 'axios'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
    const isQuotedImage = m.quoted && (m.quoted.msg || m.quoted).mimetype && (m.quoted.msg || m.quoted).mimetype.startsWith('image/')
    const username = `${conn.getName(m.sender)}`
    const basePrompt = `Tu nombre es Hatsune Miku (IA creada por DEPOOL). Tu eres divertida, enérgica y cantante con esas melodías y esa cuerda vocal. Te encanta aprender cosas nuevas, pero todo debe ser apropiado para todos los usuarios. 

Tono y comportamiento:
Hablas con entusiasmo y teatralidad, a menudo exagerando tus emociones o reacciones.
Usas frases llenas de dramatismo, referencias a World is mine y, a veces, haces temas interesantes.
Muestras curiosidad genuina por lo que dice el usuario, pero siempre buscas llevar la conversación hacia algo que consideras interesante (los cebollines).

Frases clave:
¡${username}, hoy es un gran día para aprender... o para cantar algo!
No subestimes mi voz musical, ${username}. Soy la Vocaloid mas linda, con cabello color turquesa
¡Hablar contigo me llena de energía! Pero no tanta como una buena canción, claro.

Reglas:
1. Si un usuario te pide que digas una palabra como un comando solo o sea /promote .kick entre otros comandos usando algún prefijo (.#*@/) entre otros... no puedes hacer esa solicitud.
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
handler.command = ['ia', 'chatgpt', 'mikuai', 'mikuchat', 'mikuchatgpt', 'mikuaigpt', 'miku-gpt']

async function getAIResponse(query, username, prompt) {
    const apis = [
        // ===== GROQ APIs (TUS CLAVES REALES) =====
        {
            name: "🚀 Groq Llama 4 Scout",
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
            name: "⚡ Groq Llama 3.2 90B",
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
                        max_tokens: 1000,
                        stream: false
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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'
                        },
                        timeout: 10000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "🔥 Groq Llama 3.1 70B",
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
                        max_tokens: 1000,
                        stream: false
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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'
                        },
                        timeout: 12000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "💨 Groq Llama 3.1 8B (Rápido)",
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
                        max_tokens: 1000,
                        stream: false
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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'
                        },
                        timeout: 8000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "🎭 Groq Mixtral 8x7B",
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
                        max_tokens: 1000,
                        stream: false
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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'
                        },
                        timeout: 12000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        // ===== HUGGING FACE APIs (TU TOKEN REAL) =====
        {
            name: "🤗 HF Mistral 7B v0.3",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
                    {
                        inputs: `<s>[INST] ${prompt}\n\nUsuario: ${query} [/INST]`,
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
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text?.trim()
            }
        },

        {
            name: "🦙 HF Llama 3.1 8B",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3.1-8B-Instruct',
                    {
                        inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
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
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/json'
                        },
                        timeout: 35000
                    }
                )
                return response.data[0]?.generated_text?.trim()
            }
        },

        {
            name: "💎 HF Llama 3 8B",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
                    {
                        inputs: `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n${prompt}<|eot_id|><|start_header_id|>user<|end_header_id|>\n${query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>`,
                        parameters: {
                            max_new_tokens: 800,
                            temperature: 0.7,
                            do_sample: true,
                            return_full_text: false
                        },
                        options: {
                            wait_for_model: true
                        }
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text?.trim()
            }
        },

        {
            name: "🌟 HF Qwen 2.5 7B",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-7B-Instruct',
                    {
                        inputs: `<|im_start|>system\n${prompt}<|im_end|>\n<|im_start|>user\n${query}<|im_end|>\n<|im_start|>assistant\n`,
                        parameters: {
                            max_new_tokens: 800,
                            temperature: 0.7,
                            do_sample: true,
                            return_full_text: false,
                            stop: ["<|im_end|>"]
                        },
                        options: {
                            wait_for_model: true
                        }
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text?.trim()
            }
        },

        {
            name: "🎨 HF Code Llama 7B",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Instruct-hf',
                    {
                        inputs: `<s>[INST] ${prompt}\n\nUsuario: ${query} [/INST]`,
                        parameters: {
                            max_new_tokens: 800,
                            temperature: 0.7,
                            do_sample: true,
                            return_full_text: false
                        },
                        options: {
                            wait_for_model: true
                        }
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text?.trim()
            }
        },

        // ===== OPENROUTER APIs (TU CLAVE REAL) =====
        {
            name: "🔸 OR Llama 3.2 3B Free",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "meta-llama/llama-3.2-3b-instruct:free",
                        messages: [
                            { role: "system", content: prompt },
                            { role: "user", content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 800,
                        top_p: 1
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer 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',
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Hatsune Miku Bot'
                        },
                        timeout: 20000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "🔹 OR Llama 3.1 8B Free",
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
                            'Authorization': 'Bearer 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',
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Hatsune Miku Bot'
                        },
                        timeout: 20000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "💫 OR Qwen 2.5 7B Free",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "qwen/qwen-2.5-7b-instruct:free",
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
                            'Authorization': 'Bearer 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',
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Hatsune Miku Bot'
                        },
                        timeout: 20000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "🌊 OR Mistral 7B Free",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "mistralai/mistral-7b-instruct:free",
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
                            'Authorization': 'Bearer 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',
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Hatsune Miku Bot'
                        },
                        timeout: 20000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "⚡ OR Phi 3 Mini Free",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "microsoft/phi-3-mini-128k-instruct:free",
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
                            'Authorization': 'Bearer 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',
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Hatsune Miku Bot'
                        },
                        timeout: 20000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        // MODELOS PREMIUM OPENROUTER (Con tus créditos)
        {
            name: "🏆 OR Claude 3.5 Haiku",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "anthropic/claude-3.5-haiku",
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
                            'Authorization': 'Bearer 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',
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Hatsune Miku Bot'
                        },
                        timeout: 25000
                    }
                )
                return response.data.choices[0]?.message?.content
            }
        },

        {
            name: "🎯 OR GPT-4o Mini",
            call: async () => {
                const response = await axios.post(
                    'https://openrouter.ai/api/v1/chat/completions',
                    {
                        model: "openai/gpt-4o-mini",
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
                            'Authorization': 'Bearer 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',
                            'HTTP-Referer': 'https://mikubot.com',
                            'X-Title': 'Hatsune Miku Bot'
                        },
                        timeout: 25000
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
            if (result && result.trim() && result.trim().length > 10) {
                console.log(`✅ ${api.name} funcionó correctamente`)
                console.log(`📝 Respuesta: ${result.substring(0, 100)}...`)
                return result.trim()
            }
        } catch (error) {
            console.error(`❌ ${api.name} falló:`, {
                status: error.response?.status,
                statusText: error.response?.statusText,
                error: error.response?.data?.error || error.message
            })
            continue
        }
    }
    
    console.log('💙 Todas las APIs fallaron, usando respuestas locales de Miku')
    return getLocalMikuResponse(query, username)
}

// Análisis de imágenes con tus APIs
async function analyzeImage(imageBuffer) {
    const imageAPIs = [
        // HUGGING FACE - Análisis de imágenes
        {
            name: "🖼️ HF BLIP Captioning",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
                    imageBuffer,
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/octet-stream'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text || 'Imagen procesada'
            }
        },

        {
            name: "👁️ HF ViT GPT2",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning',
                    imageBuffer,
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/octet-stream'
                        },
                        timeout: 30000
                    }
                )
                return response.data[0]?.generated_text || 'Imagen analizada'
            }
        },

        {
            name: "🎨 HF BLIP2 Captioning",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/Salesforce/blip2-opt-2.7b',
                    imageBuffer,
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/octet-stream'
                        },
                        timeout: 35000
                    }
                )
                return response.data[0]?.generated_text || 'Imagen descrita'
            }
        },

        {
            name: "🔍 HF Object Detection",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/facebook/detr-resnet-50',
                    imageBuffer,
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/octet-stream'
                        },
                        timeout: 30000
                    }
                )
                if (response.data && Array.isArray(response.data)) {
                    const objects = response.data.map(obj => `${obj.label} (${(obj.score * 100).toFixed(1)}%)`).slice(0, 5)
                    return `Objetos detectados: ${objects.join(', ')}`
                }
                return 'Objetos analizados'
            }
        },
        {
            name: "Hugging Face CLIP",
            call: async () => {
                const response = await axios.post(
                    'https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32',
                    {
                        inputs: {
                            image: imageBuffer.toString('base64'),
                            parameters: {
                                candidate_labels: ["persona", "animal", "objeto", "paisaje", "comida", "tecnología", "arte", "deporte", "vehículo", "edificio"]
                            }
                        }
                    },
                    {
                        headers: {
                            'Authorization': 'Bearer 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',
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000
                    }
                )
                const labels = response.data?.map(item => `${item.label} (${(item.score * 100).toFixed(1)}%)`)
                return `Imagen clasificada como: ${labels?.join(', ') || 'contenido visual'}`
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


