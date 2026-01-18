import fetch from 'node-fetch'

const API_KEY = 'Duarte-zz12';

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) return conn.reply(m.chat, `💙 Por favor, proporciona el nombre de una canción o artista.`, m, global.rcanal)

    try {
        const res = await fetch(`https://rest.alyabotpe.xyz/dl/spotifyplay?query=${encodeURIComponent(text)}&key=${API_KEY}`)

        if (!res.ok) throw `Error al obtener datos de la API, código de estado: ${res.status}`

        const data = await res.json()
        
        if (!data.status) throw `Error: ${data.message || 'No se encontró la canción'}`

       
        const song = data.data
        
        let resultList = `💙 *Canción encontrada:*\n\n`
        resultList += `🎵 *${song.title}*\n`
        resultList += `🎤 ${song.artist}\n`
        resultList += `💿 ${song.album}\n`
        resultList += `⏱️ ${song.duration}\n`
        resultList += `📅 ${song.release_date || 'N/A'}\n\n`
        
        const buttons = [
            ['📥 Descargar MP3', `spotify_download_${encodeURIComponent(song.dl)}`]
        ]
        
        resultList += `💙 *Presiona el botón para descargar*`
        
        await conn.sendNCarousel(m.chat, resultList, '🌱 Hatsune Miku - Spotify', song.image, buttons, null, null, null, m)
        
        
        const user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
        user.spotifySong = song
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
    
    if (!m.text || !m.text.includes('spotify_download_')) return false
    
    const user = global.db.data.users[m.sender]
    if (!user || !user.spotifySong) return false
    
    
    if (Date.now() - user.spotifySearchTime > 5 * 60 * 1000) {
        delete user.spotifySong
        delete user.spotifySearchTime
        return false
    }
    
    
    const match = m.text.match(/spotify_download_(.+)/)
    if (!match) return false
    
    const downloadUrl = decodeURIComponent(match[1])
    const song = user.spotifySong
    
    try {
        await conn.reply(m.chat, `💙 Descargando *${song.title}*...`, m)
        
        
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
            fileName: `${song.title.replace(/[/\\?%*:|"<>]/g, '')}.mp3`
        }, { quoted: m })
        
    } catch (error) {
        await conn.reply(m.chat, `💙 Error: ${error.message}`, m)
    }
    
    
    delete user.spotifySong
    delete user.spotifySearchTime
    
    return true
}

export default handler


