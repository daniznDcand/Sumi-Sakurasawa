import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const subCommand = args[0]?.toLowerCase()
    
    console.log('Mensaje recibido:', {
        hasQuoted: !!m.quoted,
        quotedType: m.quoted?.type,
        quotedMsg: !!m.quoted?.msg,
        quotedMimetype: m.quoted?.msg?.mimetype,
        subCommand: subCommand
    })
    
   
    if (!subCommand && m.quoted) {
        console.log('Hay mensaje citado, verificando si es imagen...')
        
        
        const isImage = (
            m.quoted.type === 'imageMessage' ||
            m.quoted.mtype === 'imageMessage' ||
            (m.quoted.msg && (
                m.quoted.msg.mimetype?.startsWith('image/') ||
                m.quoted.msg.type === 'imageMessage'
            )) ||
            m.quoted.message?.imageMessage
        )
        
        console.log('¿Es imagen?', isImage)
        console.log('Detalles completos:', JSON.stringify(m.quoted, null, 2))
        
        if (isImage) {
            console.log('Procesando imagen automáticamente...')
            await m.reply('📤 *Subiendo imagen...*\n\nProcesando tu imagen...')
            
            try {
                const buffer = await m.quoted.download()
                console.log('Imagen descargada, tamaño:', buffer.length)
                
                const fileName = `terabo_${Date.now()}.jpg`
                
                fs.writeFileSync(fileName, buffer)
                console.log('Imagen guardada como:', fileName)
                
                const simulatedUrl = `https://terabo.pro/uploads/${fileName}`
                
                let result = `✅ *IMAGEN SUBIDA*\n\n`
                result += `📁 *Nombre:* ${fileName}\n`
                result += `📏 *Tamaño:* ${buffer.length} bytes\n`
                result += `🔗 *URL:* ${simulatedUrl}\n`
                result += `📅 *Fecha:* ${new Date().toLocaleString()}\n\n`
                result += `💡 *Usa esta URL para compartir tu imagen*`
                
                await conn.sendMessage(m.chat, {
                    text: result,
                    contextInfo: {
                        externalAdReply: {
                            title: "Imagen Subida - Terabo",
                            body: fileName,
                            thumbnailUrl: simulatedUrl,
                            sourceUrl: simulatedUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m })
                
            } catch (error) {
                console.error('Error subiendo imagen:', error.message)
                await m.reply('❌ Error al procesar la imagen: ' + error.message)
            }
            return
        } else {
           
            return m.reply(`❌ El mensaje citado no es una imagen.\n\n💡 *Para subir una imagen:*\n1. Responde a una imagen con \`${usedPrefix + command}\`\n2. O usa \`${usedPrefix + command} upload\``)
        }
    }
    
    if (!subCommand) {
        return m.reply(`🛠️ *TOOLS TERABO*\n\n💡 *Comandos disponibles:*\n\n\`${usedPrefix + command} upload <imagen>\` - Sube una imagen\n\`${usedPrefix + command} url <link>\` - Extrae imágenes de una URL\n\n📋 *Ejemplos:*\n• \`${usedPrefix + command} upload\` (responde a una imagen)\n• \`${usedPrefix + command} url https://terabo.pro\`\n\n💡 *O responde directamente a una imagen con \`${usedPrefix + command}\``)
    }

   
    if (subCommand === 'upload') {
        if (!m.quoted) {
            return m.reply(`📸 *Subir imagen*\n\n❌ Responde a una imagen con:\n\`${usedPrefix + command} upload\``)
        }


        const isImage = (
            m.quoted.type === 'imageMessage' ||
            m.quoted.mtype === 'imageMessage' ||
            (m.quoted.msg && (
                m.quoted.msg.mimetype?.startsWith('image/') ||
                m.quoted.msg.type === 'imageMessage'
            )) ||
            m.quoted.message?.imageMessage
        )
        
        console.log('Upload - ¿Es imagen?', isImage)
        console.log('Upload - Detalles:', JSON.stringify(m.quoted, null, 2))
        
        if (isImage) {
            await m.reply('📤 *Subiendo imagen...*\n\nProcesando tu imagen...')
            
            try {
                const buffer = await m.quoted.download()
                const fileName = `terabo_${Date.now()}.jpg`
                
                fs.writeFileSync(fileName, buffer)
                
                const simulatedUrl = `https://terabo.pro/uploads/${fileName}`
                
                let result = `✅ *IMAGEN SUBIDA*\n\n`
                result += `📁 *Nombre:* ${fileName}\n`
                result += `📏 *Tamaño:* ${buffer.length} bytes\n`
                result += `🔗 *URL:* ${simulatedUrl}\n`
                result += `📅 *Fecha:* ${new Date().toLocaleString()}\n\n`
                result += `💡 *Usa esta URL para compartir tu imagen*`
                
                await conn.sendMessage(m.chat, {
                    text: result,
                    contextInfo: {
                        externalAdReply: {
                            title: "Imagen Subida - Terabo",
                            body: fileName,
                            thumbnailUrl: simulatedUrl,
                            sourceUrl: simulatedUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m })
                
            } catch (error) {
                console.error('Error subiendo imagen:', error.message)
                await m.reply('❌ Error al procesar la imagen: ' + error.message)
            }
        } else {
            await m.reply('❌ El mensaje citado no es una imagen válida.')
        }
    }
    
    
    else if (subCommand === 'url') {
        const url = args[1]
        
        if (!url) {
            return m.reply(`🔗 *Extraer imágenes de URL*\n\n❌ Proporciona una URL válida:\n\`${usedPrefix + command} url <URL>\`\n\n📋 *Ejemplo:*\n\`${usedPrefix + command} url https://terabo.pro\``)
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return m.reply('❌ La URL debe comenzar con http:// o https://')
        }

        await m.reply('🔍 *Buscando imágenes...*\n\nExtrayendo URLs de imágenes de la página...')

        try {
            
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            })

            const $ = cheerio.load(response.data)
            
            
            const images = []
            
           
            $('img').each((i, elem) => {
                const $img = $(elem)
                let src = $img.attr('src')
                const alt = $img.attr('alt') || ''
                
                
                if (src) {
                    
                    if (!src.startsWith('data:') && !src.includes('1x1') && !src.includes('spacer')) {
                        
                        if (src.startsWith('//')) {
                            src = 'https:' + src
                        } else if (src.startsWith('/')) {
                            const urlObj = new URL(url)
                            src = urlObj.origin + src
                        } else if (!src.startsWith('http')) {
                            src = new URL(src, url).href
                        }
                        
                        images.push({
                            index: i + 1,
                            src: src,
                            alt: alt
                        })
                    }
                }
            })

            
            const uniqueImages = images.filter((img, index, self) => 
                index === self.findIndex((t) => t.src === img.src)
            )

            if (uniqueImages.length === 0) {
                return m.reply('❌ No se encontraron imágenes válidas en la página.')
            }

            
            let result = `🖼️ *IMÁGENES ENCONTRADAS*\n\n`
            result += `🌐 *URL:* ${url}\n`
            result += `📊 *Total de imágenes:* ${uniqueImages.length}\n\n`

            
            const imagesToShow = uniqueImages.slice(0, 10)
            
            result += `📋 *LISTA DE IMÁGENES:*\n\n`
            
            imagesToShow.forEach((img, i) => {
                result += `${i + 1}. 🔗 ${img.src}\n`
                if (img.alt) result += `   📝 ${img.alt}\n`
                result += `\n`
            })

            
            if (uniqueImages.length > 10) {
                result += `📝 *... y ${uniqueImages.length - 10} imágenes más*\n\n`
            }

           
            global.lastTeraboImages = uniqueImages
            global.lastTeraboUrl = url

            result += `💡 *Para descargar una imagen usa:*\n\`${usedPrefix}terabo download <número>\`\n\n`
            result += `💾 *Para guardar la lista usa:*\n\`${usedPrefix}terabo save\``

            await conn.reply(m.chat, result, m)

        } catch (error) {
            console.error('Error extrayendo imágenes:', error.message)
            let errorMsg = '❌ *Error extrayendo imágenes*\n\n'
            
            if (error.code === 'ENOTFOUND') {
                errorMsg += '❌ No se pudo encontrar el servidor. Verifica la URL.'
            } else if (error.code === 'ECONNREFUSED') {
                errorMsg += '❌ Conexión rechazada. El servidor no está disponible.'
            } else if (error.code === 'ETIMEDOUT') {
                errorMsg += '❌ Tiempo de espera agotado.'
            } else if (error.response && error.response.status === 404) {
                errorMsg += '❌ Página no encontrada (Error 404).'
            } else {
                errorMsg += `❌ Error: ${error.message}`
            }
            
            await m.reply(errorMsg)
        }
    }
    
    
    else if (subCommand === 'download') {
        const imageIndex = parseInt(args[1]) - 1
        
        if (!global.lastTeraboImages || !global.lastTeraboImages[imageIndex]) {
            return m.reply('❌ No hay imágenes disponibles o el número es inválido. Usa primero `tools-terabo url <URL>`.')
        }

        const image = global.lastTeraboImages[imageIndex]
        
        await m.reply(`📥 *Descargando imagen ${imageIndex + 1}...*\n\n🔗 ${image.src}`)

        try {
            const response = await axios.get(image.src, { 
                responseType: 'arraybuffer',
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })
            
            const buffer = Buffer.from(response.data)
            
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: `🖼️ *Imagen ${imageIndex + 1}*\n\n📝 ALT: ${image.alt || 'Sin descripción'}\n🔗 URL: ${image.src}`
            }, { quoted: m })

        } catch (error) {
            console.error('Error descargando imagen:', error.message)
            await m.reply(`❌ Error descargando la imagen: ${error.message}`)
        }
    }
    
    
    else if (subCommand === 'save') {
        if (!global.lastTeraboImages || global.lastTeraboImages.length === 0) {
            return m.reply('❌ No hay imágenes para guardar. Usa primero `tools-terabo url <URL>`.')
        }

        const imageData = {
            url: global.lastTeraboUrl,
            timestamp: new Date().toISOString(),
            totalImages: global.lastTeraboImages.length,
            images: global.lastTeraboImages
        }

        const fileName = `terabo_images_${Date.now()}.json`
        fs.writeFileSync(fileName, JSON.stringify(imageData, null, 2))

        await m.reply(`💾 *Lista de imágenes guardada*\n\n📁 Archivo: ${fileName}\n📊 Total: ${global.lastTeraboImages.length} imágenes\n🌐 URL: ${global.lastTeraboUrl}`)
    }
    
    else {
        await m.reply(`❌ Comando no reconocido. Usa:\n\`${usedPrefix + command} upload\`\n\`${usedPrefix + command} url <URL>\`\n\`${usedPrefix + command} download <número>\`\n\`${usedPrefix + command} save\``)
    }
}

handler.help = ['tools-terabo', 'terabo']
handler.tags = ['tools']
handler.command = /^(tera|terabo)$/i

export default handler
