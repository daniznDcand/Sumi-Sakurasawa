import fetch from 'node-fetch'

const API_KEY = 'Duarte-zz12';

let handler = async (m, { conn, text, usedPrefix, command }) => {

    if (!text) return conn.reply(m.chat, `💙 Por favor, proporciona el nombre de una canción o artista.`, m, global.rcanal)

    try {
        const res = await fetch(`https://rest.alyabotpe.xyz/dl/spotifyplay?query=${encodeURIComponent(text)}&key=${API_KEY}`)

        if (!res.ok) throw `Error al obtener datos de la API, código de estado: ${res.status}`

        const data = await res.json()
        
        if (!data.status) throw `Error: ${data.message || 'No se encontró la canción'}`
        
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

export default handler


