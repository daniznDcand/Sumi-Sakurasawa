import axios from 'axios'
import cheerio from 'cheerio'
import { sticker } from '../lib/sticker.js'
import fs from 'fs'
import path from 'path'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `💙 *Uso del comando Catbox*\n\n` +
                  `📋 *Comandos disponibles:*\n` +
                  `• \`${usedPrefix + command} url <enlace>\` - Extraer información de un enlace de Catbox\n` +
                  `• \`${usedPrefix + command} upload <enlace>\` - Subir archivo a Catbox\n` +
                  `• \`${usedPrefix + command} info\` - Información del sitio\n\n` +
                  `📝 *Ejemplo:* \`${usedPrefix + command} url https://files.catbox.moe/example.png\``,
            quoted: m
        })
    }

    const [action, ...restArgs] = text.split(' ')
    const query = restArgs.join(' ')

    try {
        switch (action.toLowerCase()) {
            case 'url':
                await handleUrlExtraction(m, conn, query)
                break
            case 'upload':
                await handleUpload(m, conn, query)
                break
            case 'info':
                await handleInfo(m, conn)
                break
            default:
                await handleUrlExtraction(m, conn, text)
        }
    } catch (error) {
        console.error('Error en catbox-scraper:', error)
        conn.sendMessage(m.chat, {
            text: `❌ *Error:* ${error.message}`,
            quoted: m
        })
    }
}

async function handleUrlExtraction(m, conn, url) {
    if (!url || !url.includes('catbox.moe')) {
        return conn.sendMessage(m.chat, {
            text: `❌ *Por favor, ingresa un enlace válido de Catbox*\n\n📝 *Ejemplo:* \`.catbox url https://files.catbox.moe/example.png\``,
            quoted: m
        })
    }

    await m.react('⏳')

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        })

        const contentType = response.headers['content-type']
        const contentLength = response.headers['content-length']
        const fileSize = contentLength ? `${(contentLength / 1024 / 1024).toFixed(2)} MB` : 'Desconocido'

        let fileType = 'Desconocido'
        if (contentType) {
            if (contentType.includes('image/')) fileType = '🖼️ Imagen'
            else if (contentType.includes('video/')) fileType = '🎥 Video'
            else if (contentType.includes('audio/')) fileType = '🎵 Audio'
            else if (contentType.includes('text/')) fileType = '📄 Texto'
            else fileType = `📁 ${contentType.split('/')[0]?.toUpperCase() || 'Archivo'}`
        }

        const info = `💙 *Información del archivo Catbox*\n\n` +
                   `🔗 *URL:* ${url}\n` +
                   `📁 *Tipo:* ${fileType}\n` +
                   `📊 *Tamaño:* ${fileSize}\n` +
                   `🏷️ *Content-Type:* ${contentType || 'Desconocido'}\n` +
                   `✅ *Estado:* Archivo accesible`

        conn.sendMessage(m.chat, {
            text: info,
            quoted: m
        })

        
        if (contentType && contentType.includes('image/')) {
            try {
                const buffer = Buffer.from(response.data)
                const stiker = await sticker(buffer, false, global.packsticker, global.packsticker2)
                if (stiker) {
                    await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
                    await m.react('💙')
                }
            } catch (stickerError) {
                console.log('No se pudo crear sticker:', stickerError.message)
            }
        }

        await m.react('✅')

    } catch (error) {
        console.error('Error al procesar URL de Catbox:', error)
        await m.react('❌')
        
        let errorMessage = '❌ *No se pudo acceder al archivo*\n\n'
        
        if (error.response?.status === 404) {
            errorMessage += '🔍 *Motivo:* El archivo no existe o fue eliminado'
        } else if (error.response?.status === 403) {
            errorMessage += '🔒 *Motivo:* Acceso denegado al archivo'
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

async function handleUpload(m, conn, url) {
    if (!url) {
        return conn.sendMessage(m.chat, {
            text: `❌ *Por favor, ingresa un enlace para subir*\n\n📝 *Ejemplo:* \`.catbox upload https://example.com/image.png\``,
            quoted: m
        })
    }

    await m.react('⏳')

    try {
       
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000
        })

        const buffer = Buffer.from(response.data)
        const fileName = path.basename(new URL(url).pathname) || 'upload'
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
                                 `🔗 *URL:* ${uploadedUrl}\n` +
                                 `📁 *Nombre:* ${fileName}\n` +
                                 `📊 *Tamaño:* ${(buffer.length / 1024 / 1024).toFixed(2)} MB\n` +
                                 `🏷️ *Tipo:* ${contentType}\n\n` +
                                 `💙 *Compartido desde Catbox*`

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
        
        conn.sendMessage(m.chat, {
            text: `❌ *Error al subir archivo*\n\n🐛 *Motivo:* ${error.message}`,
            quoted: m
        })
    }
}

async function handleInfo(m, conn) {
    const info = `💙 *Información sobre Catbox*\n\n` +
                `🏠 *Sitio:* Catbox.moe\n` +
                `📝 *Descripción:* Servicio de hosting de archivos gratuito\n` +
                `📊 *Límite:* Hasta 200 MB por archivo\n` +
                `⏰ *Duración:* Los archivos se mantienen activos\n` +
                `🔒 *Privacidad:* No requiere registro para subir\n\n` +
                `📋 *Características:*\n` +
                `• ✅ Subida de archivos via drag & drop\n` +
                `• ✅ Subida via URL\n` +
                `• ✅ Soporte para imágenes, videos, audio\n` +
                `• ✅ Enlaces directos permanentes\n` +
                `• ✅ Sin límite de descargas\n\n` +
                `🔗 *Sitios relacionados:*\n` +
                `• 📁 Litterbox - Almacenamiento temporal\n` +
                `• 🎨 Catbox Spaces - Para creadores\n\n` +
                `💙 *Comandos disponibles:*\n` +
                `• \`.catbox url <enlace>\` - Extraer información\n` +
                `• \`.catbox upload <enlace>\` - Subir archivo\n` +
                `• \`.catbox info\` - Esta información`

    conn.sendMessage(m.chat, {
        text: info,
        quoted: m
    })
    
    await m.react('💙')
}

handler.help = ['catbox']
handler.tags = ['tools', 'download', 'upload']
handler.command = ['catbox']

export default handler
