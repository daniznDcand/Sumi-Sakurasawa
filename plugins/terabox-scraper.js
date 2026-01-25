import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const subCommand = args[0]?.toLowerCase()
    
    if (!subCommand) {
        return m.reply(`☁️ *TERABOX SCRAPER*\n\n💡 *Comandos disponibles:*\n\n\`${usedPrefix + command} url <link>\` - Extrae contenido de TeraBox\n\`${usedPrefix + command} download <número>\` - Descarga elemento específico\n\`${usedPrefix + command} save\` - Guardar lista de enlaces\n\n📋 *Ejemplo:*\n\`${usedPrefix + command} url https://www.terabox.com/ai/index\``)
    }

    if (subCommand === 'url') {
        const url = args[1]
        
        if (!url) {
            return m.reply(`🔗 *Extraer contenido de TeraBox*\n\n❌ Proporciona una URL válida de TeraBox:\n\`${usedPrefix + command} url <URL>\`\n\n📋 *Ejemplo:*\n\`${usedPrefix + command} url https://www.terabox.com/ai/index\``)
        }
        
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return m.reply('❌ La URL debe comenzar con http:// o https://')
        }

        // Verificar que sea una URL de TeraBox
        if (!url.includes('terabox.com')) {
            return m.reply('❌ Esta herramienta está diseñada específicamente para URLs de TeraBox (terabox.com)')
        }

        await m.reply('☁️ *Analizando TeraBox...*\n\nExtrayendo información del servicio de almacenamiento en la nube...')

        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,image/svg+xml,image/*;q=0.8',
                    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 20000,
                maxRedirects: 5
            })

            const $ = cheerio.load(response.data)
            
            // Arrays para almacenar diferentes tipos de contenido
            const images = []
            const videos = []
            const links = []
            const scripts = []
            const metaTags = []
            const cdnResources = []
            
            // Extraer meta tags importantes
            $('meta').each((i, elem) => {
                const $meta = $(elem)
                const name = $meta.attr('name') || $meta.attr('property') || ''
                const content = $meta.attr('content') || ''
                
                if (name && content) {
                    metaTags.push({
                        name: name,
                        content: content
                    })
                }
            })

            // Extraer templateData si existe (información específica de TeraBox)
            const scriptContent = $('script').text()
            const templateDataMatch = scriptContent.match(/var templateData = ({.*?});/)
            let templateData = {}
            if (templateDataMatch) {
                try {
                    templateData = JSON.parse(templateDataMatch[1])
                } catch (e) {
                    console.log('Error parseando templateData:', e.message)
                }
            }

            // Extraer imágenes con mejor detección para TeraBox
            $('img').each((i, elem) => {
                const $img = $(elem)
                let src = $img.attr('src')
                const alt = $img.attr('alt') || ''
                const title = $img.attr('title') || ''
                const width = $img.attr('width') || ''
                const height = $img.attr('height') || ''
                const loading = $img.attr('loading') || ''
                
                if (src) {
                    // Ignorar imágenes muy pequeñas o de tracking
                    if (!src.startsWith('data:') && !src.includes('1x1') && !src.includes('spacer') && !src.includes('pixel') && !src.includes('tracking')) {
                        // Convertir URLs relativas a absolutas
                        if (src.startsWith('//')) {
                            src = 'https:' + src
                        } else if (src.startsWith('/')) {
                            const urlObj = new URL(url)
                            src = urlObj.origin + src
                        } else if (!src.startsWith('http')) {
                            src = new URL(src, url).href
                        }
                        
                        // Detectar recursos del CDN de TeraBox
                        const isCDN = src.includes('teraboxcdn.com')
                        
                        images.push({
                            index: i + 1,
                            src: src,
                            alt: alt,
                            title: title,
                            width: width,
                            height: height,
                            loading: loading,
                            type: 'image',
                            isCDN: isCDN
                        })

                        if (isCDN) {
                            cdnResources.push({
                                type: 'image',
                                src: src,
                                size: 'unknown'
                            })
                        }
                    }
                }
            })

            // Extraer videos con mejor detección
            $('video').each((i, elem) => {
                const $video = $(elem)
                let src = $video.attr('src')
                let poster = $video.attr('poster') || ''
                const title = $video.attr('title') || ''
                const controls = $video.attr('controls') || ''
                const autoplay = $video.attr('autoplay') || ''
                
                // Buscar en source tags también
                if (!src) {
                    $video.find('source').each((j, source) => {
                        const sourceSrc = $(source).attr('src')
                        const type = $(source).attr('type') || ''
                        if (sourceSrc) {
                            src = sourceSrc
                            return false // break
                        }
                    })
                }
                
                if (src) {
                    // Convertir URLs relativas a absolutas
                    if (src.startsWith('//')) {
                        src = 'https:' + src
                    } else if (src.startsWith('/')) {
                        const urlObj = new URL(url)
                        src = urlObj.origin + src
                    } else if (!src.startsWith('http')) {
                        src = new URL(src, url).href
                    }
                    
                    // Detectar recursos del CDN de TeraBox
                    const isCDN = src.includes('teraboxcdn.com')
                    
                    videos.push({
                        index: i + 1,
                        src: src,
                        poster: poster,
                        title: title,
                        controls: controls,
                        autoplay: autoplay,
                        type: 'video',
                        isCDN: isCDN
                    })

                    if (isCDN) {
                        cdnResources.push({
                            type: 'video',
                            src: src,
                            size: 'unknown'
                        })
                    }
                }
            })

            // Extraer enlaces importantes de TeraBox
            $('a[href]').each((i, elem) => {
                const $link = $(elem)
                const href = $link.attr('href')
                const text = $link.text().trim()
                const target = $link.attr('target') || ''
                
                if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
                    // Convertir URLs relativas a absolutas
                    let fullHref = href
                    if (href.startsWith('/')) {
                        const urlObj = new URL(url)
                        fullHref = urlObj.origin + href
                    } else if (!href.startsWith('http')) {
                        fullHref = new URL(href, url).href
                    }
                    
                    links.push({
                        index: i + 1,
                        href: fullHref,
                        originalHref: href,
                        text: text,
                        target: target,
                        type: 'link',
                        isInternal: fullHref.includes('terabox.com')
                    })
                }
            })

            // Extraer información de scripts
            $('script[src]').each((i, elem) => {
                const $script = $(elem)
                const src = $script.attr('src')
                const type = $script.attr('type') || ''
                
                if (src) {
                    // Convertir URLs relativas a absolutas
                    let fullSrc = src
                    if (src.startsWith('//')) {
                        fullSrc = 'https:' + src
                    } else if (src.startsWith('/')) {
                        const urlObj = new URL(url)
                        fullSrc = urlObj.origin + src
                    } else if (!src.startsWith('http')) {
                        fullSrc = new URL(src, url).href
                    }
                    
                    // Detectar recursos del CDN de TeraBox
                    const isCDN = fullSrc.includes('teraboxcdn.com')
                    
                    scripts.push({
                        index: i + 1,
                        src: fullSrc,
                        type: type,
                        isCDN: isCDN
                    })

                    if (isCDN) {
                        cdnResources.push({
                            type: 'script',
                            src: fullSrc,
                            size: 'unknown'
                        })
                    }
                }
            })

            // Eliminar duplicados
            const uniqueImages = images.filter((img, index, self) => 
                index === self.findIndex((t) => t.src === img.src)
            )
            
            const uniqueVideos = videos.filter((vid, index, self) => 
                index === self.findIndex((t) => t.src === vid.src)
            )
            
            const uniqueLinks = links.filter((link, index, self) => 
                index === self.findIndex((t) => t.href === link.href)
            )

            const uniqueScripts = scripts.filter((script, index, self) => 
                index === self.findIndex((t) => t.src === script.src)
            )

            if (uniqueImages.length === 0 && uniqueVideos.length === 0 && uniqueLinks.length === 0) {
                return m.reply('❌ No se encontró contenido válido en la página de TeraBox.')
            }

            // Construir mensaje de respuesta completo
            let result = `☁️ *ANÁLISIS COMPLETO DE TERABOX*\n\n`
            result += `🌐 *URL:* ${url}\n`
            
            // Información de la página
            if (metaTags.length > 0) {
                result += `📋 *Información de TeraBox:*\n`
                const title = metaTags.find(m => m.name.toLowerCase() === 'title')?.content || metaTags.find(m => m.property === 'og:title')?.content || 'TeraBox'
                const description = metaTags.find(m => m.name.toLowerCase() === 'description')?.content || metaTags.find(m => m.property === 'og:description')?.content || 'Servicio de almacenamiento en la nube'
                
                result += `• 📝 *Título:* ${title}\n`
                result += `• 📄 *Descripción:* ${description}\n`
                
                // Información de templateData si está disponible
                if (templateData.bdstoken) {
                    result += `• 🔐 *Token BDSToken:* ${templateData.bdstoken.substring(0, 20)}...\n`
                }
                if (templateData.userVipIdentity !== undefined) {
                    result += `• 👑 *VIP Identity:* ${templateData.userVipIdentity}\n`
                }
                if (templateData.country) {
                    result += `• 🌍 *Región:* ${templateData.country}\n`
                }
                result += `\n`
            }
            
            // Estadísticas del contenido
            result += `📊 *Estadísticas del contenido:*\n`
            result += `• 🖼️ Imágenes encontradas: ${uniqueImages.length}\n`
            result += `• 🎬 Videos encontrados: ${uniqueVideos.length}\n`
            result += `• 🔗 Enlaces encontrados: ${uniqueLinks.length}\n`
            result += `• 📜 Scripts detectados: ${uniqueScripts.length}\n`
            result += `• 💾 Recursos CDN: ${cdnResources.length}\n\n`

            // Mostrar imágenes (primeras 10)
            if (uniqueImages.length > 0) {
                result += `🖼️ *IMÁGENES ENCONTRADAS:*\n\n`
                const imagesToShow = uniqueImages.slice(0, 10)
                
                imagesToShow.forEach((img, i) => {
                    result += `${i + 1}. 🖼️ ${img.src}\n`
                    if (img.alt) result += `   📝 ${img.alt}\n`
                    if (img.title) result += `   📄 ${img.title}\n`
                    if (img.width && img.height) result += `   📐 ${img.width}x${img.height}\n`
                    if (img.isCDN) result += `   💾 CDN: TeraBox CDN\n`
                    result += `\n`
                })
                
                if (uniqueImages.length > 10) {
                    result += `📝 *... y ${uniqueImages.length - 10} imágenes más*\n\n`
                }
            }

            // Mostrar videos (primeros 5)
            if (uniqueVideos.length > 0) {
                result += `🎬 *VIDEOS ENCONTRADOS:*\n\n`
                const videosToShow = uniqueVideos.slice(0, 5)
                
                videosToShow.forEach((vid, i) => {
                    result += `${i + 1}. 🎥 ${vid.src}\n`
                    if (vid.title) result += `   📄 ${vid.title}\n`
                    if (vid.poster) result += `   🖼️ Poster: ${vid.poster}\n`
                    if (vid.controls) result += `   🎮 Controles: ${vid.controls}\n`
                    if (vid.isCDN) result += `   💾 CDN: TeraBox CDN\n`
                    result += `\n`
                })
                
                if (uniqueVideos.length > 5) {
                    result += `📝 *... y ${uniqueVideos.length - 5} videos más*\n\n`
                }
            }

            // Mostrar enlaces importantes (primeros 8)
            if (uniqueLinks.length > 0) {
                result += `🔗 *ENLACES IMPORTANTES:*\n\n`
                const linksToShow = uniqueLinks.slice(0, 8)
                
                linksToShow.forEach((link, i) => {
                    const icon = link.isInternal ? '🔗' : '🌐'
                    result += `${i + 1}. ${icon} ${link.href}\n`
                    if (link.text) result += `   📝 ${link.text}\n`
                    if (link.target) result += `   🎯 Target: ${link.target}\n`
                    if (link.isInternal) result += `   📌 Interno de TeraBox\n`
                    result += `\n`
                })
                
                if (uniqueLinks.length > 8) {
                    result += `📝 *... y ${uniqueLinks.length - 8} enlaces más*\n\n`
                }
            }

            // Mostrar recursos CDN de TeraBox
            if (cdnResources.length > 0) {
                result += `💾 *RECURSOS CDN DE TERABOX:*\n\n`
                const cdnImages = cdnResources.filter(r => r.type === 'image').length
                const cdnVideos = cdnResources.filter(r => r.type === 'video').length
                const cdnScripts = cdnResources.filter(r => r.type === 'script').length
                
                result += `• 🖼️ Imágenes CDN: ${cdnImages}\n`
                result += `• 🎬 Videos CDN: ${cdnVideos}\n`
                result += `• 📜 Scripts CDN: ${cdnScripts}\n\n`
            }

            
            global.lastTeraBoxMedia = [...uniqueImages, ...uniqueVideos]
            global.lastTeraBoxUrl = url
            global.lastTeraBoxData = {
                metaTags,
                templateData,
                cdnResources,
                links: uniqueLinks,
                scripts: uniqueScripts
            }

      
            let buttons = []
            
           
            if (global.lastTeraBoxMedia.length > 0) {
                buttons.push({
                    buttonId: `.terabox download 1`,
                    buttonText: { displayText: `📥 Descargar primer medio` },
                    type: 1
                })
            }
            
           
            if (global.lastTeraBoxMedia.length > 1) {
                buttons.push({
                    buttonId: `.terabox download 2`,
                    buttonText: { displayText: `📥 Descargar segundo medio` },
                    type: 1
                })
            }
            
            if (global.lastTeraBoxMedia.length > 2) {
                buttons.push({
                    buttonId: `.terabox download 3`,
                    buttonText: { displayText: `📥 Descargar tercer medio` },
                    type: 1
                })
            }
            
            
            buttons.push({
                buttonId: `.terabox save`,
                buttonText: { displayText: `💾 Guardar análisis completo` },
                type: 1
            })
            
            
            if (global.lastTeraBoxMedia.length > 3) {
                buttons.push({
                    buttonId: `.terabox list`,
                    buttonText: { displayText: `📋 Ver lista completa (${global.lastTeraBoxMedia.length} medios)` },
                    type: 1
                })
            }

            
            const buttonMessage = {
                text: result + `\n\n🎮 *Usa los botones para interactuar:*`,
                buttons: buttons,
                footer: `☁️ TeraBox Scraper • ${new Date().toLocaleString('es-ES')}`,
                headerType: 1
            }

            await conn.sendMessage(m.chat, buttonMessage, { quoted: m })

        } catch (error) {
            console.error('Error analizando TeraBox:', error.message)
            let errorMsg = '❌ *Error analizando TeraBox*\n\n'
            
            if (error.code === 'ENOTFOUND') {
                errorMsg += '❌ No se pudo encontrar el servidor TeraBox. Verifica la URL.'
            } else if (error.code === 'ECONNREFUSED') {
                errorMsg += '❌ Conexión rechazada. El servidor TeraBox no está disponible.'
            } else if (error.code === 'ETIMEDOUT') {
                errorMsg += '❌ Tiempo de espera agotado al conectar con TeraBox.'
            } else if (error.response && error.response.status === 404) {
                errorMsg += '❌ Página de TeraBox no encontrada (Error 404).'
            } else if (error.response && error.response.status === 403) {
                errorMsg += '❌ Acceso denegado. La página de TeraBox requiere autenticación.'
            } else {
                errorMsg += `❌ Error: ${error.message}`
            }
            
            await m.reply(errorMsg)
        }
    }
    
    else if (subCommand === 'download') {
        const mediaIndex = parseInt(args[1]) - 1
        
        if (!global.lastTeraBoxMedia || !global.lastTeraBoxMedia[mediaIndex]) {
            return m.reply('❌ No hay medios disponibles o el número es inválido. Usa primero `terabox url <URL>`.')
        }

        const media = global.lastTeraBoxMedia[mediaIndex]
        
        await m.reply(`📥 *Descargando ${media.type === 'video' ? 'video' : 'imagen'} de TeraBox ${mediaIndex + 1}...*\n\n🔗 ${media.src}`)

        try {
            const response = await axios.get(media.src, { 
                responseType: 'arraybuffer',
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': global.lastTeraBoxUrl || 'https://www.terabox.com/',
                    'Accept': media.type === 'video' ? 'video/*' : 'image/*'
                }
            })
            
            const buffer = Buffer.from(response.data)
            
            if (media.type === 'video') {
                await conn.sendMessage(m.chat, {
                    video: buffer,
                    caption: `🎥 *Video de TeraBox ${mediaIndex + 1}*\n\n🔗 URL: ${media.src}\n💾 CDN: ${media.isCDN ? 'TeraBox CDN' : 'Externo'}`
                }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, {
                    image: buffer,
                    caption: `🖼️ *Imagen de TeraBox ${mediaIndex + 1}*\n\n📝 ALT: ${media.alt || 'Sin descripción'}\n🔗 URL: ${media.src}\n💾 CDN: ${media.isCDN ? 'TeraBox CDN' : 'Externo'}`
                }, { quoted: m })
            }

        } catch (error) {
            console.error('Error descargando medio de TeraBox:', error.message)
            await m.reply(`❌ Error descargando el ${media.type} de TeraBox: ${error.message}`)
        }
    }
    
    else if (subCommand === 'save') {
        if (!global.lastTeraBoxMedia || global.lastTeraBoxMedia.length === 0) {
            return m.reply('❌ No hay medios para guardar. Usa primero `terabox url <URL>`.')
        }

        const mediaData = {
            url: global.lastTeraBoxUrl,
            timestamp: new Date().toISOString(),
            totalMedia: global.lastTeraBoxMedia.length,
            images: global.lastTeraBoxMedia.filter(m => m.type === 'image').length,
            videos: global.lastTeraBoxMedia.filter(m => m.type === 'video').length,
            media: global.lastTeraBoxMedia,
            teraboxData: global.lastTeraBoxData
        }

        const fileName = `terabox_analysis_${Date.now()}.json`
        fs.writeFileSync(fileName, JSON.stringify(mediaData, null, 2))

        await m.reply(`💾 *Análisis de TeraBox guardado*\n\n📁 Archivo: ${fileName}\n📊 Total medios: ${global.lastTeraBoxMedia.length}\n🖼️ Imágenes: ${mediaData.images}\n🎬 Videos: ${mediaData.videos}\n🌐 URL: ${global.lastTeraBoxUrl}`)
    }
    
    else if (subCommand === 'list') {
        if (!global.lastTeraBoxMedia || global.lastTeraBoxMedia.length === 0) {
            return m.reply('❌ No hay medios disponibles. Usa primero `terabox url <URL>`.')
        }

        let listText = `📋 *LISTA COMPLETA DE MEDIOS TERABOX*\n\n`
        listText += `🌐 *URL:* ${global.lastTeraBoxUrl}\n`
        listText += `📊 *Total de medios:* ${global.lastTeraBoxMedia.length}\n\n`

        
        let buttons = []
        
        global.lastTeraBoxMedia.forEach((media, index) => {
            const emoji = media.type === 'video' ? '🎬' : '🖼️'
            const name = media.alt || media.title || `${media.type} ${index + 1}`
            
            listText += `${index + 1}. ${emoji} ${name}\n`
            listText += `   🔗 ${media.src.substring(0, 50)}...\n\n`
            
            
            if (index < 5) {
                buttons.push({
                    buttonId: `.terabox download ${index + 1}`,
                    buttonText: { 
                        displayText: `${emoji} Descargar ${index + 1}` 
                    },
                    type: 1
                })
            }
        })

        
        if (global.lastTeraBoxMedia.length > 5) {
            buttons.push({
                buttonId: `.terabox save`,
                buttonText: { displayText: `💾 Guardar todo` },
                type: 1
            })
        }

        const buttonMessage = {
            text: listText + `\n🎮 *Selecciona un medio para descargar:*`,
            buttons: buttons,
            footer: `☁️ TeraBox Scraper • Mostrando ${Math.min(5, global.lastTeraBoxMedia.length)} de ${global.lastTeraBoxMedia.length} medios`,
            headerType: 1
        }

        await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }
    
    else {
        await m.reply(`❌ Comando no reconocido. Usa:\n\`${usedPrefix + command} url <URL>\`\n\`${usedPrefix + command} download <número>\`\n\`${usedPrefix + command} save\`\n\`${usedPrefix + command} list\``)
    }
}

handler.help = ['terabox', 'terabox-scraper']
handler.tags = ['tools', 'scraper']
handler.command = /^(terabox)$/i

export default handler
