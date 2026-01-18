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
        
       
        const maxResults = Math.min(5, searchData.result.length)
        
        for (let index = 0; index < maxResults; index++) {
            const song = searchData.result[index]
            resultList += `*${index + 1}.* ${song.title}\n`
            resultList += `   🎤 ${song.artist}\n`
            resultList += `   ⏱️ ${Math.floor(song.duration_ms / 60000)}:${String(Math.floor((song.duration_ms % 60000) / 1000)).padStart(2, '0')}\n`
            resultList += `   🤑 Popularidad: ${song.popularity}\n\n`
        }
        
        resultList += `💙 *Selecciona una canción con los botones*`
        
        
        const thumbnail = searchData.result[0]?.image
        
        
        const buttons = [
            {buttonId: 'spotify_select_0', buttonText: {displayText: '🎵 Canción 1'}, type: 1},
            {buttonId: 'spotify_select_1', buttonText: {displayText: '🎵 Canción 2'}, type: 1},
            {buttonId: 'spotify_select_2', buttonText: {displayText: '🎵 Canción 3'}, type: 1},
            {buttonId: 'spotify_select_3', buttonText: {displayText: '🎵 Canción 4'}, type: 1},
            {buttonId: 'spotify_select_4', buttonText: {displayText: '🎵 Canción 5'}, type: 1}
        ]
        
       
        try {
            await conn.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption: resultList,
                footer: '🌱 Hatsune Miku - Spotify',
                buttons: buttons,
                headerType: 4
            }, { quoted: m })
        } catch (error) {
            console.log('❌ Error en formato principal:', error.message)
            
           
            await conn.sendMessage(m.chat, {
                text: resultList,
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        containsAutoReply: true,
                        renderLargerThumbnail: true,
                        title: '🌱 Hatsune Miku - Spotify',
                        body: 'Selecciona una canción',
                        mediaType: 1,
                        thumbnailUrl: thumbnail,
                        mediaUrl: thumbnail,
                        sourceUrl: thumbnail
                    }
                }
            }, { quoted: m })
            
            
            await conn.sendMessage(m.chat, {
                text: '📥 *Selecciona una canción:*',
                buttons: buttons
            }, { quoted: m })
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
    
    console.log('🔍 Detectando mensaje:', m.text)
    
    if (!m.text || !m.text.includes('spotify_select_')) {
        console.log('❌ No es un mensaje de selección de Spotify')
        return false
    }
    
    console.log('✅ Mensaje de Spotify detectado')
    
    const user = global.db.data.users[m.sender]
    if (!user || !user.spotifyResults) {
        console.log('❌ No hay resultados guardados para el usuario')
        return false
    }
    
    console.log('📊 Resultados guardados:', user.spotifyResults.length)
    
    
    if (Date.now() - user.spotifySearchTime > 5 * 60 * 1000) {
        console.log('⏰ Búsqueda expirada')
        delete user.spotifyResults
        delete user.spotifySearchTime
        return false
    }
    
    
    const match = m.text.match(/spotify_select_(\d+)/)
    if (!match) {
        console.log('❌ No se pudo extraer el índice')
        return false
    }
    
    const selectedIndex = parseInt(match[1])
    console.log('🎯 Índice seleccionado:', selectedIndex)
    
    if (selectedIndex < 0 || selectedIndex >= user.spotifyResults.length) {
        console.log('❌ Índice fuera de rango')
        await conn.reply(m.chat, '❌ Selección inválida. Por favor intenta nuevamente.', m)
        return false
    }
    
    const selectedSong = user.spotifyResults[selectedIndex]
    console.log('🎵 Canción seleccionada:', selectedSong.title)
    
    try {
        await conn.reply(m.chat, `💙 Obteniendo enlace de descarga para *${selectedSong.title}*...`, m)
        
        
        const downloadRes = await fetch(`https://rest.alyabotpe.xyz/dl/spotifyplay?query=${encodeURIComponent(selectedSong.title + ' ' + selectedSong.artist)}&key=${API_KEY}`)
        
        if (!downloadRes.ok) throw `Error al obtener descarga, código: ${downloadRes.status}`
        
        const downloadData = await downloadRes.json()
        
        if (!downloadData.status || !downloadData.data?.dl) {
            throw 'No se pudo obtener el enlace de descarga'
        }
        
        const downloadUrl = downloadData.data.dl
        console.log('🔗 URL de descarga obtenida')
        
        
        try {
            const checkResponse = await fetch(downloadUrl, { method: 'HEAD' });
            if (!checkResponse.ok) {
                throw new Error('El enlace de descarga no está disponible');
            }
        } catch (checkError) {
            throw new Error('El enlace de descarga no funciona o ha expirado. Intenta con otra canción.');
        }
        
        console.log('✅ Enviando archivo...')
        await conn.sendMessage(m.chat, {
            document: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${selectedSong.title.replace(/[/\\?%*:|"<>]/g, '')}.mp3`
        }, { quoted: m })
        
        console.log('✅ Archivo enviado exitosamente')
        
    } catch (error) {
        console.log('❌ Error en descarga:', error.message)
        await conn.reply(m.chat, `💙 Error: ${error.message}`, m)
    }
    
    
    delete user.spotifyResults
    delete user.spotifySearchTime
    
    return true
}

export default handler


