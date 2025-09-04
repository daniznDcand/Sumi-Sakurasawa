import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    if (!args[0]) return conn.reply(m.chat, `💙🌱 Hola! Soy Hatsune Miku! Necesito un link de TikTok con imágenes para ayudarte ✨`, m, rcanal)
    if (!args[0].match(/tiktok/gi)) return conn.reply(m.chat, `💙🌱 ¡Oye! Verifica que el link sea de TikTok, por favor 📱`, m, rcanal)
    
    await m.react('⏳')
    
    try {
        
        const response = await fetch(args[0], {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
        })
        
        const html = await response.text()
        const $ = cheerio.load(html)
        
        
        const scriptData = $('script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]').html()
        
        if (scriptData) {
            const jsonData = JSON.parse(scriptData)
            const videoData = jsonData.__DEFAULT_SCOPE__['webapp.video-detail']?.itemInfo?.itemStruct
            
            if (videoData && videoData.imagePost && videoData.imagePost.images) {
                let txt = '┏━━━━━━━━━━━━━━━━━━━━┓\n'
                txt += '┃💙🌱 𝐇𝐚𝐭𝐬𝐮𝐧𝐞 𝐌𝐢𝐤𝐮 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 💙🌱┃\n'
                txt += '┗━━━━━━━━━━━━━━━━━━━━━━━┛\n'
                txt += '╭─────────────╮\n'
                txt += '│🎵 𝐈𝐧𝐟𝐨 𝐆𝐞𝐧𝐞𝐫𝐚𝐥 🎵│\n'
                txt += '├──────────────┤\n'
                txt += `│👤 𝐔𝐬𝐮𝐚𝐫𝐢𝐨: ${videoData.author.nickname}\n`
                txt += `│📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐩𝐜𝐢ó𝐧: ${videoData.desc}\n`
                txt += `│🖼️ 𝐈𝐦á𝐠𝐞𝐧𝐞𝐬: ${videoData.imagePost.images.length}\n`
                txt += '├─────────────────────┤\n'
                txt += '│💙🌱 "¡Descargando imágenes!" 💙🌱│\n'
                txt += '╰─────────────────────╯\n'
                txt += '♪(´▽｀)♪\n'
                txt += '╭──────────────────────╮\n'
                txt += '│"¡Aquí van todas tus imágenes!"│\n'
                txt += '╰──────────────────────╯\n'
                
                
                await conn.reply(m.chat, txt, m, rcanal)
                
                
                let images = []
                
                
                for (let i = 0; i < videoData.imagePost.images.length; i++) {
                    const imageUrl = videoData.imagePost.images[i].imageURL.urlList[0]
                    
                    const imageResponse = await fetch(imageUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Accept-Encoding': 'gzip, deflate, br',
                            'Referer': 'https://www.tiktok.com/',
                            'Origin': 'https://www.tiktok.com',
                            'DNT': '1',
                            'Connection': 'keep-alive',
                            'Sec-Fetch-Dest': 'image',
                            'Sec-Fetch-Mode': 'no-cors',
                            'Sec-Fetch-Site': 'cross-site',
                        }
                    })
                    
                    if (imageResponse.ok) {
                        const imageBuffer = await imageResponse.buffer()
                        images.push({
                            buffer: imageBuffer,
                            filename: `miku_tiktok_${i + 1}.jpg`
                        })
                    } else {
                        console.log(`💙🌱 Miku: Error descargando imagen ${i + 1}: ${imageResponse.status}`)
                    }
                }
                
                
                let imageCaption = '┏━━━━━━━━━━━━━━━━━━━━━━┓\n'
                imageCaption += '┃💙🌱 𝐇𝐚𝐭𝐬𝐮𝐧𝐞 𝐌𝐢𝐤𝐮 𝐃𝐞𝐥𝐢𝐯𝐞𝐫𝐲 💙🌱┃\n'
                imageCaption += '┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n'
                imageCaption += '╭───────────────────╮\n'
                imageCaption += `│🖼️ ${images.length} 𝐈𝐦á𝐠𝐞𝐧𝐞𝐬 𝐝𝐞 𝐓𝐢𝐤𝐓𝐨𝐤 │\n`
                imageCaption += '├───────────────────┤\n'
                imageCaption += '│🎵 𝐓𝐢𝐤𝐓𝐨𝐤 𝐈𝐦𝐚𝐠𝐞 𝐏𝐚𝐜𝐤 🎵\n'
                imageCaption += '├───────────────────┤\n'
                imageCaption += `│👤 𝐂𝐫𝐞𝐚𝐝𝐨𝐫: ${videoData.author.nickname}\n`
                imageCaption += `│📱 𝐏𝐥𝐚𝐭𝐚𝐟𝐨𝐫𝐦𝐚: TikTok\n`
                imageCaption += `│🎯 𝐂𝐚𝐥𝐢𝐝𝐚𝐝: HD\n`
                imageCaption += `│🌱 𝐏𝐫𝐨𝐜𝐞𝐬𝐚𝐝𝐨 𝐩𝐨𝐫: Hatsune Miku\n`
                imageCaption += '╰──────────────────╯\n'
                imageCaption += '(◕‿◕)♡\n'
                imageCaption += '╭────────────────────╮\n'
                imageCaption += '│"¡Espero que te gusten todas!"│\n'
                imageCaption += '╰────────────────────╯\n'
                imageCaption += '💙🌱 𝐌𝐢𝐤𝐮 𝐒𝐭𝐲𝐥𝐞 𝐂𝐨𝐥𝐥𝐞𝐜𝐭𝐢𝐨𝐧 💙🌱'
                
                
                if (images.length > 0) {
                   
                    if (images.length > 1) {
                        
                        await conn.sendFile(m.chat, images[0].buffer, images[0].filename, imageCaption, m, null, rcanal)
                        
                        
                        for (let i = 1; i < images.length; i++) {
                            await conn.sendFile(m.chat, images[i].buffer, images[i].filename, '', m, null, rcanal)
                        }
                    } else {
                       
                        await conn.sendFile(m.chat, images[0].buffer, images[0].filename, imageCaption, m, null, rcanal)
                    }
                }
                
                await m.react('💙')
                
                
                let finalMsg = '┏━━━━━━━━━━━━━━━┓\n'
                finalMsg += '┃💙🌱 𝐌𝐢𝐬𝐢ó𝐧 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚 💙🌱┃\n'
                finalMsg += '┗━━━━━━━━━━━━━━━━━━┛\n'
                finalMsg += '╭──────────────╮\n'
                finalMsg += '│🎵 𝐑𝐞𝐬𝐮𝐥𝐭𝐚𝐝𝐨 🎵│\n'
                finalMsg += '├──────────────┤\n'
                finalMsg += `│📸 𝐈𝐦á𝐠𝐞𝐧𝐞𝐬 𝐞𝐧𝐯𝐢𝐚𝐝𝐚𝐬: ${images.length}\n`
                finalMsg += '│✅ 𝐄𝐬𝐭𝐚𝐝𝐨: ¡Completado!\n'
                finalMsg += '│💙🌱 𝐀𝐠𝐞𝐧𝐭𝐞: Hatsune Miku\n'
                finalMsg += '├──────────────────────────┤\n'
                finalMsg += '│"¡Misión cumplida! ♪(´▽｀)♪"│\n'
                finalMsg += '╰──────────────────────────╯\n'
                finalMsg += '💙🌱 ¡𝐆𝐫𝐚𝐜𝐢𝐚𝐬 𝐩𝐨𝐫 𝐮𝐬𝐚𝐫𝐦𝐞! 💙🌱'
                
                await conn.reply(m.chat, finalMsg, m, rcanal)
                return
            }
        }
        
        throw new Error('No se encontraron imágenes')
        
    } catch (error) {
        console.error('Error:', error)
        await m.react('💔')
        
        let errorMsg = `💔🌱 **Error** 💔🌱\n\n⚠️ Miku: "¡Oh no! Algo salió mal..."\n\n🔍 Verifica que el link contenga imágenes\n📱 Que sea un link válido de TikTok\n\n*"¡Inténtalo de nuevo!"*`
        
        conn.reply(m.chat, errorMsg, m, rcanal)
    }
}

handler.help = ['tiktokimg *<url tt>*']
handler.tags = ['downloader']
handler.command = ['tiktokimg', 'tiktokimgs', 'ttimg', 'ttimgs']
handler.register = true

export default handler
