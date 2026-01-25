import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `💙 *Uso del comando Catbox*\n\n` +
                  `📤 *Sube archivos a Catbox y obtén el enlace directo*\n\n` +
                  `📝 *Ejemplo:* \`${usedPrefix + command} https://example.com/image.png\`\n\n` +
                  `📊 *Límite:* Hasta 200 MB por archivo`,
            quoted: m
        })
    }

    await m.react('⏳')

    try {
        const response = await axios.get(text, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        })

        const buffer = Buffer.from(response.data)
        const fileName = path.basename(new URL(text).pathname) || 'upload'
        const contentType = response.headers['content-type'] || 'application/octet-stream'

        const formData = new FormData()
        formData.append('reqtype', 'fileupload')
        formData.append('userhash', '')
        formData.append('fileToUpload', new Blob([buffer], { type: contentType }), fileName)

        const uploadResponse = await axios.post('https://catbox.moe/user/api.php', formData, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://catbox.moe/'
            },
            timeout: 60000
        })

        if (uploadResponse.data && uploadResponse.data.includes('https://files.catbox.moe/')) {
            const uploadedUrl = uploadResponse.data.trim()
            
            const successMessage = `✅ *Archivo subido exitosamente*\n\n` +
                                 `🔗 *Enlace:* ${uploadedUrl}\n` +
                                 `📁 *Nombre:* ${fileName}\n` +
                                 `📊 *Tamaño:* ${(buffer.length / 1024 / 1024).toFixed(2)} MB`

            conn.sendMessage(m.chat, {
                text: successMessage,
                quoted: m
            })
            
            await m.react('✅')
        } else {
            throw new Error('Respuesta inválida del servidor')
        }

    } catch (error) {
        console.error('Error al subir a Catbox:', error)
        await m.react('❌')
        
        let errorMessage = '❌ *Error al subir archivo*\n\n'
        
        if (error.response?.status === 404) {
            errorMessage += '🔍 *Motivo:* El enlace no existe'
        } else if (error.response?.status === 403) {
            errorMessage += '🔒 *Motivo:* Acceso denegado'
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
