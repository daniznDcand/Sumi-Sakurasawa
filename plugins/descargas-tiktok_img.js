import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    if (!args[0]) return conn.reply(m.chat, `💙 Hola! Soy Hatsune Miku! Necesito un link de TikTok con imágenes para ayudarte ✨`, m, rcanal)
    if (!args[0].match(/tiktok/gi)) return conn.reply(m.chat, `💙 ¡Oye! Verifica que el link sea de TikTok, por favor 📱`, m, rcanal)
    
    await m.react('⏳')
    
    try {
        let images = []
        let videoData = null
        
        
        try {
            const tikMateResponse = await fetch(`https://tikmate.app/download?url=${encodeURIComponent(args[0])}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                body: `url=${encodeURIComponent(args[0])}`
            })
            
            if (tikMateResponse.ok) {
                const tikMateHtml = await tikMateResponse.text()
                const $tikMate = cheerio.load(tikMateHtml)
                
                
                $tikMate('img').each((i, elem) => {
                    const imgSrc = $tikMate(elem).attr('src')
                    if (imgSrc && (imgSrc.includes('tiktokcdn') || imgSrc.includes('muscdn'))) {
                        images.push(imgSrc)
                    }
                })
                
                
                $tikMate('a').each((i, elem) => {
                    const href = $tikMate(elem).attr('href')
                    if (href && href.match(/\.(jpg|jpeg|png|webp)/i)) {
                        images.push(href)
                    }
                })
            }
        } catch (e) {
            console.log('💙 Método TikMate falló:', e.message)
        }
        
        
        if (images.length === 0) {
            const userAgents = [
                'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
                'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
            
            for (let userAgent of userAgents) {
                try {
                    const response = await fetch(args[0], {
                        headers: {
                            'User-Agent': userAgent,
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.5',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'DNT': '1',
                            'Connection': 'keep-alive',
                            'Upgrade-Insecure-Requests': '1',
                            'Sec-Fetch-Dest': 'document',
                            'Sec-Fetch-Mode': 'navigate',
                            'Sec-Fetch-Site': 'none',
                        }
                    })
                    
                    const html = await response.text()
                    const $ = cheerio.load(html)
                    
                   
                    $('script').each((i, elem) => {
                        const scriptContent = $(elem).html()
                        if (scriptContent) {
                           
                            const patterns = [
                                /"imagePost":\s*\{[^}]*"images":\s*\[[^\]]*\]/g,
                                /"images":\s*\[[^\]]*"imageURL"[^\]]*\]/g,
                                /https:\/\/[^"']*\.(?:jpg|jpeg|png|webp)/gi
                            ]
                            
                            patterns.forEach(pattern => {
                                const matches = scriptContent.match(pattern)
                                if (matches) {
                                    matches.forEach(match => {
                                        try {
                                            if (match.startsWith('http')) {
                                                if (match.includes('tiktokcdn') || match.includes('muscdn')) {
                                                    images.push(match)
                                                }
                                            } else {
                                              
                                                const urlMatches = match.match(/https:\/\/[^"']*\.(?:jpg|jpeg|png|webp)/gi)
                                                if (urlMatches) {
                                                    urlMatches.forEach(url => {
                                                        if (url.includes('tiktokcdn') || url.includes('muscdn')) {
                                                            images.push(url)
                                                        }
                                                    })
                                                }
                                            }
                                        } catch (e) {}
                                    })
                                }
                            })
                        }
                    })
                    
                    
                    if (images.length > 0) break
                    
                } catch (e) {
                    console.log(`💙🌱 User-agent ${userAgent} falló:`, e.message)
                }
            }
        }
        
       
        if (images.length === 0) {
            try {
                const sssResponse = await fetch('https://ssstik.io/abc?url=dl', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    body: `id=${encodeURIComponent(args[0])}&locale=en&tt=1`
                })
                
                if (sssResponse.ok) {
                    const sssHtml = await sssResponse.text()
                    const $sss = cheerio.load(sssHtml)
                    
                    
                    $sss('img').each((i, elem) => {
                        const imgSrc = $sss(elem).attr('src')
                        if (imgSrc && imgSrc.match(/\.(jpg|jpeg|png|webp)/i)) {
                            images.push(imgSrc)
                        }
                    })
                }
            } catch (e) {
                console.log('💙 Método SSSTik falló:', e.message)
            }
        }
        
      
        images = [...new Set(images)].filter(img => 
            img && 
            img.startsWith('http') && 
            img.match(/\.(jpg|jpeg|png|webp)/i)
        ).slice(0, 10) 
        
        if (images.length > 0) {
            
            if (!videoData) {
                videoData = {
                    author: { nickname: 'Usuario TikTok' },
                    desc: 'Imágenes de TikTok'
                }
            }
            
            
            let imageCaption = `💙 **Hatsune Miku Image Pack** 💙\n\n🖼️ ${images.length} imágenes de TikTok\n👤 Por: ${videoData.author.nickname}\n\n*"¡Aquí tienes todas tus imágenes!"*`
            
            
            let downloadedImages = []
            
            
            for (let i = 0; i < images.length; i++) {
                const imageUrl = images[i]
                
                try {
                    const imageResponse = await fetch(imageUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
                            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Referer': 'https://www.tiktok.com/',
                            'Origin': 'https://www.tiktok.com',
                        },
                        timeout: 10000 
                    })
                    
                    if (imageResponse.ok) {
                        const imageBuffer = await imageResponse.buffer()
                        if (imageBuffer && imageBuffer.length > 0) {
                            downloadedImages.push({
                                buffer: imageBuffer,
                                filename: `miku_tiktok_${i + 1}.jpg`
                            })
                        }
                    }
                } catch (e) {
                    console.log(`💙🌱 Miku: Error descargando imagen ${i + 1}: ${e.message}`)
                }
            }
            
            
            if (downloadedImages.length > 0) {
                
                await conn.sendFile(m.chat, downloadedImages[0].buffer, downloadedImages[0].filename, imageCaption, m, null, rcanal)
                
               
                for (let i = 1; i < downloadedImages.length; i++) {
                    await conn.sendFile(m.chat, downloadedImages[i].buffer, downloadedImages[i].filename, '', m, null, rcanal)
                }
                
                await m.react('💙')
                return
            }
        }
        
        throw new Error('No se encontraron imágenes')
        
    } catch (error) {
        console.error('Error:', error)
        await m.react('💔')
        
        let errorMsg = `💔 **Error** 💔\n\n⚠️ Miku: "¡Oh no! No pude encontrar imágenes..."\n\n🔍 Verifica que el link contenga imágenes\n📱 Que sea un link válido de TikTok\n🔄 Intenta con otro enlace\n\n*"¡Lo siento mucho!"*`
        
        conn.reply(m.chat, errorMsg, m, rcanal)
    }
}

handler.help = ['tiktokimg *<url tt>*']
handler.tags = ['downloader']
handler.command = ['tiktokimg', 'tiktokimgs', 'ttimg', 'ttimgs']
handler.register = true

export default handler
