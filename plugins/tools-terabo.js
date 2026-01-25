import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const subCommand = args[0]?.toLowerCase()
    
    if (!subCommand) {
        return m.reply(`🛠️ *TOOLS TERABO*\n\n💡 *Comandos disponibles:*\n\n\`${usedPrefix + command} url <link>\` - Extrae imágenes y videos de una URL\n\`${usedPrefix + command} download <número>\` - Descarga elemento específico\n\`${usedPrefix + command} save\` - Guardar lista de enlaces\n\n📋 *Ejemplo:*\n\`${usedPrefix + command} url https://terabo.pro\``)
    }

    
    if (subCommand === 'url') {
        const url = args[1]
        
        if (!url) {
            return m.reply(`🔗 *Extraer imágenes y videos*\n\n❌ Proporciona una URL válida:\n\`${usedPrefix + command} url <URL>\`\n\n📋 *Ejemplo:*\n\`${usedPrefix + command} url https://terabo.pro\``)
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return m.reply('❌ La URL debe comenzar con http:// o https://')
        }

        await m.reply('🔍 *Buscando imágenes y videos...*\n\nExtrayendo URLs de la página...')

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 10000
            })

            const $ = cheerio.load(response.data)
            
           
            const images = []
            const videos = []
            
           
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
                            alt: alt,
                            type: 'image'
                        })
                    }
                }
            })

           
            $('video').each((i, elem) => {
                const $video = $(elem)
                let src = $video.attr('src')
                
                
                if (!src) {
                    $video.find('source').each((j, source) => {
                        const sourceSrc = $(source).attr('src')
                        if (sourceSrc) {
                            src = sourceSrc
                            return false
                        }
                    })
                }
                
                if (src) {
                    if (src.startsWith('//')) {
                        src = 'https:' + src
                    } else if (src.startsWith('/')) {
                        const urlObj = new URL(url)
                        src = urlObj.origin + src
                    } else if (!src.startsWith('http')) {
                        src = new URL(src, url).href
                    }
                    
                    videos.push({
                        index: i + 1,
                        src: src,
                        type: 'video'
                    })
                }
            })

            
            const uniqueImages = images.filter((img, index, self) => 
                index === self.findIndex((t) => t.src === img.src)
            )
            
            const uniqueVideos = videos.filter((vid, index, self) => 
                index === self.findIndex((t) => t.src === vid.src)
            )

            if (uniqueImages.length === 0 && uniqueVideos.length === 0) {
                return m.reply('❌ No se encontraron imágenes o videos válidos en la página.')
            }

            
            let result = `🖼️ *IMÁGENES Y VIDEOS ENCONTRADOS*\n\n`
            result += `🌐 *URL:* ${url}\n`
            result += `📊 *Total imágenes:* ${uniqueImages.length}\n`
            result += `📊 *Total videos:* ${uniqueVideos.length}\n\n`

           
            if (uniqueImages.length > 0) {
                result += `📸 *IMÁGENES:*\n\n`
                const imagesToShow = uniqueImages.slice(0, 5)
                
                imagesToShow.forEach((img, i) => {
                    result += `${i + 1}. 🖼️ ${img.src}\n`
                    if (img.alt) result += `   📝 ${img.alt}\n`
                    result += `\n`
                })
                
                if (uniqueImages.length > 5) {
                    result += `📝 *... y ${uniqueImages.length - 5} imágenes más*\n\n`
                }
            }

            
            if (uniqueVideos.length > 0) {
                result += `🎬 *VIDEOS:*\n\n`
                const videosToShow = uniqueVideos.slice(0, 5)
                
                videosToShow.forEach((vid, i) => {
                    result += `${i + 1}. 🎥 ${vid.src}\n\n`
                })
                
                if (uniqueVideos.length > 5) {
                    result += `📝 *... y ${uniqueVideos.length - 5} videos más*\n\n`
                }
            }

            
            global.lastTeraboMedia = [...uniqueImages, ...uniqueVideos]
            global.lastTeraboUrl = url

            result += `💡 *Para descargar usa:*\n\`${usedPrefix}terabo download <número>\`\n\n`
            result += `💾 *Para guardar la lista usa:*\n\`${usedPrefix}terabo save\``

            await conn.reply(m.chat, result, m)

        } catch (error) {
            console.error('Error extrayendo medios:', error.message)
            let errorMsg = '❌ *Error extrayendo medios*\n\n'
            
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
        const mediaIndex = parseInt(args[1]) - 1
        
        if (!global.lastTeraboMedia || !global.lastTeraboMedia[mediaIndex]) {
            return m.reply('❌ No hay medios disponibles o el número es inválido. Usa primero `tools-terabo url <URL>`.')
        }

        const media = global.lastTeraboMedia[mediaIndex]
        
        await m.reply(`📥 *Descargando ${media.type === 'video' ? 'video' : 'imagen'} ${mediaIndex + 1}...*\n\n🔗 ${media.src}`)

        try {
            const response = await axios.get(media.src, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            })
            
            const buffer = Buffer.from(response.data)
            
            if (media.type === 'video') {
                await conn.sendMessage(m.chat, {
                    video: buffer,
                    caption: `🎥 *Video ${mediaIndex + 1}*\n\n🔗 URL: ${media.src}`
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, {
                    image: buffer,
                    caption: `🖼️ *Imagen ${mediaIndex + 1}*\n\n📝 ALT: ${media.alt || 'Sin descripción'}\n🔗 URL: ${media.src}`
                }, { quoted: m })
            }

        } catch (error) {
            console.error('Error descargando medio:', error.message)
            await m.reply(`❌ Error descargando el ${media.type}: ${error.message}`)
        }
    }
    
    
    else if (subCommand === 'save') {
        if (!global.lastTeraboMedia || global.lastTeraboMedia.length === 0) {
            return m.reply('❌ No hay medios para guardar. Usa primero `tools-terabo url <URL>`.')
        }

        const mediaData = {
            url: global.lastTeraboUrl,
            timestamp: new Date().toISOString(),
            totalMedia: global.lastTeraboMedia.length,
            images: global.lastTeraboMedia.filter(m => m.type === 'image').length,
            videos: global.lastTeraboMedia.filter(m => m.type === 'video').length,
            media: global.lastTeraboMedia
        }

        const fileName = `terabo_media_${Date.now()}.json`
        fs.writeFileSync(fileName, JSON.stringify(mediaData, null, 2))

        await m.reply(`💾 *Lista de medios guardada*\n\n📁 Archivo: ${fileName}\n📊 Total: ${global.lastTeraboMedia.length} medios\n🖼️ Imágenes: ${mediaData.images}\n🎬 Videos: ${mediaData.videos}\n🌐 URL: ${global.lastTeraboUrl}`)
    }
    
    else {
        await m.reply(`❌ Comando no reconocido. Usa:\n\`${usedPrefix + command} url <URL>\`\n\`${usedPrefix + command} download <número>\`\n\`${usedPrefix + command} save\``)
    }
}

handler.help = ['tools-terabo', 'terabo']
handler.tags = ['tools']
handler.command = /^(tera|terabo)$/i

export default handler
