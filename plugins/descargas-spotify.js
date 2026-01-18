import fetch from 'node-fetch'

const API_KEY = 'Duarte-zz12';

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) return conn.reply(m.chat, `💙 Por favor, proporciona el nombre de una canción o artista.`, m, global.rcanal)

    try {
        const res = await fetch(`https://rest.alyabotpe.xyz/dl/spotifyplay?query=${encodeURIComponent(text)}&key=${API_KEY}`)

        if (!res.ok) throw `Error al obtener datos de la API, código de estado: ${res.status}`

        const data = await res.json()
        
        if (!data.status) throw `Error: ${data.message || 'No se encontró la canción'}`
        
        
        if (Array.isArray(data.data)) {
            if (data.data.length === 0) throw 'No se encontraron canciones'
            
            let resultList = `💙 *Resultados encontrados:*\n\n`
            const buttons = []
            
            data.data.forEach((song, index) => {
                resultList += `*${index + 1}.* ${song.title}\n`
                resultList += `   🎤 ${song.artist}\n`
                resultList += `   💿 ${song.album}\n`
                resultList += `   ⏱️ ${song.duration}\n\n`
                
                
                if (index < 10) {
                    buttons.push([`${index + 1}. ${song.title.substring(0, 20)}${song.title.length > 20 ? '...' : ''}`, `spotify_select_${index}`])
                }
            })
            
            resultList += `💙 *Selecciona una canción con los botones*`
            
            await conn.sendNCarousel(m.chat, resultList, '🌱 Hatsune Miku - Spotify', null, buttons, null, null, null, m)
            
           
            const user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
            user.spotifyResults = data.data
            user.spotifySearchTime = Date.now()
            
            return
        }
        
        
        const dlUrl = data?.data?.dl
        if (!dlUrl) throw "No se pudo obtener el enlace de descarga."

        const info = `💙 Descargando *<${data.data.title || 'Desconocido'}>*\n\n> 💫 Artista » *${data.data.artist || 'Desconocido'}*\n> 💌 Album » *${data.data.album || 'Desconocido'}*\n> ⏲ Duracion » *${data.data.duration || 'N/A'}*\n> 🜸 Link » ${data.data.url || 'N/A'}*`

        await conn.sendMessage(m.chat, { text: info, contextInfo: { forwardingScore: 9999999, isForwarded: false, 
        externalAdReply: {
            showAdAttribution: true,
            containsAutoReply: true,
            renderLargerThumbnail: true,
            title: botname,
            body: dev,
            mediaType: 1,
            thumbnailUrl: data.data.image,
            mediaUrl: data.data.url,
            sourceUrl: data.data.url
        }}}, { quoted: m })

        
        try {
            const checkResponse = await fetch(dlUrl, { method: 'HEAD' });
            if (!checkResponse.ok) {
                throw new Error('El enlace de descarga no está disponible');
            }
        } catch (checkError) {
            throw new Error('El enlace de descarga no funciona o ha expirado. Intenta con otra canción.');
        }

        await conn.sendMessage(m.chat, {
            document: { url: dlUrl },
            mimetype: 'audio/mpeg',
            fileName: `${(data.data.title || 'song').replace(/[/\\?%*:|"<>]/g, '')}.mp3`
        }, { quoted: m })

    } catch (e1) {
        m.reply(`${e1.message || e1}`)
    }
}
handler.help = ['spotify', 'music']
handler.tags = ['downloader']
handler.command = ['spotify', 'splay']
handler.group = true
handler.register = true;
handler.coin = 2;


handler.before = async (m, { conn }) => {
    
    if (!m.text || !m.text.includes('spotify_select_')) return false
    
    const user = global.db.data.users[m.sender]
    if (!user || !user.spotifyResults) return false
    
    
    if (Date.now() - user.spotifySearchTime > 5 * 60 * 1000) {
        delete user.spotifyResults
        delete user.spotifySearchTime
        return false
    }
    
    
    const match = m.text.match(/spotify_select_(\d+)/)
    if (!match) return false
    
    const selectedIndex = parseInt(match[1])
    if (selectedIndex < 0 || selectedIndex >= user.spotifyResults.length) {
        await conn.reply(m.chat, '❌ Selección inválida. Por favor intenta nuevamente.', m)
        return false
    }
    
    const selectedSong = user.spotifyResults[selectedIndex]
    
    try {
        await conn.reply(m.chat, `💙 Descargando *${selectedSong.title}*...`, m)
        
        
        try {
            const checkResponse = await fetch(selectedSong.dl, { method: 'HEAD' });
            if (!checkResponse.ok) {
                throw new Error('El enlace de descarga no está disponible');
            }
        } catch (checkError) {
            throw new Error('El enlace de descarga no funciona o ha expirado. Intenta con otra canción.');
        }
        
        await conn.sendMessage(m.chat, {
            document: { url: selectedSong.dl },
            mimetype: 'audio/mpeg',
            fileName: `${selectedSong.title.replace(/[/\\?%*:|"<>]/g, '')}.mp3`
        }, { quoted: m })
        
    } catch (error) {
        await conn.reply(m.chat, `💙 Error: ${error.message}`, m)
    }
    
    
    delete user.spotifyResults
    delete user.spotifySearchTime
    
    return true
}

export default handler


