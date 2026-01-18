import fetch from 'node-fetch'

const API_KEY = 'Duarte-zz12';

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) return conn.reply(m.chat, `💙 Por favor, proporciona el nombre de una canción o artista.`, m, global.rcanal)

    try {
        
        const searchRes = await fetch(`https://rest.alyabotpe.xyz/search/spotify?query=${encodeURIComponent(text)}&key=${API_KEY}`)
        
        if (!searchRes.ok) throw `Error al buscar canciones, código de estado: ${searchRes.status}`
        
        const searchData = await searchRes.json()
        
        if (!searchData.status || !searchData.result || searchData.result.length === 0) {
            throw 'No se encontraron canciones'
        }
        
        let resultList = `💙 *Resultados encontrados:*\n\n`
        const buttons = []
        
        searchData.result.forEach((song, index) => {
            resultList += `*${index + 1}.* ${song.title}\n`
            resultList += `   🎤 ${song.artist}\n`
            resultList += `   ⏱️ ${Math.floor(song.duration_ms / 60000)}:${String(Math.floor((song.duration_ms % 60000) / 1000)).padStart(2, '0')}\n`
            resultList += `   🤑 Popularidad: ${song.popularity}\n\n`
            
            
            if (index < 10) {
                const title = `${index + 1}. ${song.title.substring(0, 25)}${song.title.length > 25 ? '...' : ''}`
                buttons.push([title, `spotify_select_${index}`])
            }
        })
        
        resultList += `💙 *Selecciona una canción con los botones*`
        
        
        try {
            await conn.sendButton(m.chat, resultList, '🌱 Hatsune Miku - Spotify', searchData.result[0]?.image, buttons, m)
        } catch (error) {
            
            await conn.sendNCarousel(m.chat, resultList, '🌱 Hatsune Miku - Spotify', searchData.result[0]?.image, buttons, null, null, null, m)
        }
        
        
        const user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        user.spotifyResults = searchData.result
        user.spotifySearchTime = Date.now()
        
        return

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
        await conn.reply(m.chat, `💙 Obteniendo enlace de descarga para *${selectedSong.title}*...`, m)
        
        
        const downloadRes = await fetch(`https://rest.alyabotpe.xyz/dl/spotifyplay?query=${encodeURIComponent(selectedSong.title + ' ' + selectedSong.artist)}&key=${API_KEY}`)
        
        if (!downloadRes.ok) throw `Error al obtener descarga, código: ${downloadRes.status}`
        
        const downloadData = await downloadRes.json()
        
        if (!downloadData.status || !downloadData.data?.dl) {
            throw 'No se pudo obtener el enlace de descarga'
        }
        
        const downloadUrl = downloadData.data.dl
        
        
        try {
            const checkResponse = await fetch(downloadUrl, { method: 'HEAD' });
            if (!checkResponse.ok) {
                throw new Error('El enlace de descarga no está disponible');
            }
        } catch (checkError) {
            throw new Error('El enlace de descarga no funciona o ha expirado. Intenta con otra canción.');
        }
        
        await conn.sendMessage(m.chat, {
            document: { url: downloadUrl },
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


