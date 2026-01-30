import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
    if (!text) {
        await conn.reply(m.chat, '🎵 *SOUNDCLOUD*\n\nUsa: .soundcloud <nombre de canción>\n\nEjemplo: .soundcloud Un amor del ayer', m);
        return;
    }
    
    try {
        await conn.reply(m.chat, `🔍 Buscando: "${text}"`, m);
        
        const API_KEY = 'stellar-wCnAirJG';
        const searchUrl = `https://api.stellarwa.xyz/dl/soundcloudsearch?query=${encodeURIComponent(text)}&key=${API_KEY}`;
        
        console.log('URL de búsqueda:', searchUrl);
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        console.log('Respuesta API:', data);
        
        if (!data.success || !data.data) {
            await conn.reply(m.chat, '❌ No se encontraron resultados', m);
            return;
        }
        
        const result = data.data;
        
        // Mostrar información
        await conn.reply(m.chat, `🎵 *${result.title}*\n👤 ${result.artist}\n⬇️ Descargando...`, m);
        
        // Enviar audio
        await conn.sendMessage(m.chat, {
            audio: { url: result.dl },
            mimetype: 'audio/mpeg',
            fileName: 'soundcloud.mp3',
            ptt: false
        }, { quoted: m });
        
        await conn.reply(m.chat, '✅ Descarga completada', m);
        
    } catch (error) {
        console.error('Error:', error);
        await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
    }
};

handler.help = ['soundcloud <texto>'];
handler.tags = ['downloader'];
handler.command = /^(soundcloud|sc)$/i;
handler.register = true;

export default handler;
