import fetch from "node-fetch";

const handler = async (m, { conn, text }) => {
    // Verificar que haya texto después del comando
    if (!text || text.trim() === '') {
        return conn.reply(m.chat, 
            `🎵 *SOUNDCLOUD DOWNLOADER*\n\n🔍 *Uso:* .soundcloud <nombre de canción o artista>\n\n📝 *Ejemplo:* .soundcloud Un amor del ayer\n\n⚠️ *Nota:* Solo funciona con búsquedas, no con enlaces directos.`, 
            m
        );
    }
    
    console.log(`🔍 Comando soundcloud detectado. Buscando: "${text}"`);
    
    try {
        // Enviar mensaje de que está buscando
        await conn.reply(m.chat, `🔍 *Buscando en SoundCloud:*\n"${text}"`, m);
        
        // Realizar la búsqueda
        const API_KEY = 'stellar-wCnAirJG';
        const searchUrl = `https://api.stellarwa.xyz/dl/soundcloudsearch?query=${encodeURIComponent(text)}&key=${API_KEY}`;
        
        console.log(`🌐 Consultando API: ${searchUrl}`);
        
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        console.log(`📥 Respuesta API recibida:`, JSON.stringify(data, null, 2));
        
        if (!data.success || !data.data) {
            throw new Error('❌ No se encontraron resultados para tu búsqueda');
        }
        
        const result = data.data;
        
        // Formatear duración
        const durationMs = result.duration || 0;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Crear mensaje de información
        const infoMessage = `
🎧 *RESULTADO ENCONTRADO*

📌 *Título:* ${result.title || 'Sin título'}
👤 *Artista:* ${result.artist || 'Desconocido'}
⏱️ *Duración:* ${formattedDuration}

⬇️ *Iniciando descarga...*`;
        
        // Mostrar información primero
        await conn.reply(m.chat, infoMessage, m);
        
        // Empezar descarga
        await conn.reply(m.chat, `⏳ *Descargando audio...*`, m);
        
        console.log(`⬇️ Intentando descargar desde: ${result.dl}`);
        
        // Verificar que haya URL de descarga
        if (!result.dl || !result.dl.startsWith('http')) {
            throw new Error('URL de descarga no disponible');
        }
        
        // Enviar el audio
        await conn.sendMessage(m.chat, {
            audio: { url: result.dl },
            mimetype: 'audio/mpeg',
            fileName: `${(result.title || 'audio_soundcloud').substring(0, 50).replace(/[^\w\s.-]/gi, '')}.mp3`,
            ptt: false
        }, { quoted: m });
        
        console.log(`✅ Audio enviado exitosamente`);
        
        // Mensaje de confirmación
        await conn.reply(m.chat, `✅ *¡Descarga completada!*\n\n🎵 Disfruta de: ${result.title}`, m);
        
    } catch (error) {
        console.error(`💥 ERROR en soundcloud:`, error);
        
        // Mensaje de error específico
        let errorMessage = `❌ *Error*\n\n`;
        
        if (error.message.includes('No se encontraron resultados')) {
            errorMessage += 'No se encontró música con ese nombre.\n\n🔍 *Sugerencias:*\n• Revisa la ortografía\n• Intenta con otro término\n• Usa palabras clave más específicas';
        } else if (error.message.includes('URL de descarga')) {
            errorMessage += 'No se pudo obtener el enlace de descarga.\nLa API puede estar temporalmente fuera de servicio.';
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
            errorMessage += 'Error de conexión con la API.\nVerifica tu internet e intenta nuevamente.';
        } else {
            errorMessage += error.message;
        }
        
        await conn.reply(m.chat, errorMessage, m);
    }
};

// Configuración MUY IMPORTANTE - igual que tus otros comandos
handler.help = ['soundcloud <texto>'];
handler.tags = ['downloader'];
handler.command = /^(soundcloud|sc)$/i;
handler.register = true;

export default handler;
