import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
        return conn.sendMessage(m.chat, {
            text: `💙 *Uso del comando Catbox*\n\n` +
                  `📤 *Sube imágenes o videos a Catbox y obtén el enlace directo*\n\n` +
                  `📝 *Ejemplos:*\n` +
                  `• Responde a una imagen/video con \`${usedPrefix + command}\`\n` +
                  `• Envía una imagen/video con \`${usedPrefix + command}\`\n\n` +
                  `📊 *Límite:* Hasta 200 MB por archivo`,
            quoted: m
        })
    }

    if (!mime.includes('image/') && !mime.includes('video/')) {
        return conn.sendMessage(m.chat, {
            text: `❌ *Solo se permiten imágenes y videos*\n\n📁 *Formatos aceptados:* JPG, PNG, GIF, MP4, WEBP, etc.`,
            quoted: m
        })
    }

    await m.react('⏳')

    try {
        const buffer = await q.download()
        if (!buffer) {
            return conn.sendMessage(m.chat, {
                text: `❌ *No se pudo descargar el archivo*`,
                quoted: m
            })
        }

        const fileName = q.filename || `upload_${Date.now()}.${mime.split('/')[1] || 'file'}`
        const contentType = mime

        const formData = new FormData()
        formData.append('reqtype', 'fileupload')
        formData.append('userhash', '')
        formData.append('fileToUpload', new Blob([buffer], { type: contentType }), fileName)

        const uploadResponse = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://catbox.moe/',
                'Accept': 'text/plain, */*; q=0.01',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 60000
        })

        console.log('Respuesta de Catbox:', uploadResponse.data)

        if (uploadResponse.data) {
            const responseData = uploadResponse.data.toString().trim()
            
            if (responseData.includes('https://files.catbox.moe/') || responseData.includes('https://catbox.moe/files/')) {
                const uploadedUrl = responseData.match(/https:\/\/files\.catbox\.moe\/[^\s]+/)?.[0] || responseData.match(/https:\/\/catbox\.moe\/files\/[^\s]+/)?.[0]
                
                if (uploadedUrl) {
                    const successMessage = `✅ *Archivo subido exitosamente*\n\n` +
                                         `🔗 *Enlace:* ${uploadedUrl}\n` +
                                         `📁 *Nombre:* ${fileName}\n` +
                                         `📊 *Tamaño:* ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n` +
                                         `🏷️ *Tipo:* ${contentType.includes('image/') ? '🖼️ Imagen' : '🎥 Video'}`

                    conn.sendMessage(m.chat, {
                        text: successMessage,
                        quoted: m
                    })
                    
                    await m.react('✅')
                    return
                }
            }
            
            // Si no es un enlace, mostrar la respuesta para depuración
            console.log('Respuesta no reconocida:', responseData)
            throw new Error(`Respuesta del servidor: ${responseData.substring(0, 100)}...`)
        } else {
            throw new Error('El servidor no devolvió respuesta')
        }

    } catch (error) {
        console.error('Error al subir a Catbox:', error)
        await m.react('❌')
        
        let errorMessage = '❌ *Error al subir archivo*\n\n'
        
        if (error.response?.status === 413) {
            errorMessage += '💦 *Motivo:* Archivo demasiado grande (máximo 200 MB)'
        } else if (error.code === 'ECONNABORTED') {
            errorMessage += '⏱️ *Motivo:* Tiempo de espera agotado'
        } else {
            errorMessage += `🐛 *Motivo:* ${error.message}`
        }

        conn.sendMessage(m.chat, {
            text: errorMessage,
            quoted: m
        })
    }
}

handler.help = ['catbox']
handler.tags = ['tools', 'upload']
handler.command = ['catbox']

export default handler
