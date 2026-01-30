import fetch from "node-fetch";

const API_KEY = 'stellar-wCnAirJG';
const API_URL = 'https://api.stellarwa.xyz/dl/soundcloudsearch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Verificar que haya texto
    if (!text) {
        return conn.reply(m.chat, 
            `🎵 *SOUNDCLOUD DOWNLOADER*\n\n*Uso:*\n• ${usedPrefix}${command} <nombre de canción> - Para buscar\n• ${usedPrefix}${command} <enlace soundcloud> - Para descargar directamente\n\n*Ejemplos:*\n${usedPrefix}${command} Un amor del ayer\n${usedPrefix}${command} https://soundcloud.com/twice-57013/one-spark`, 
            m
        );
    }
    
    try {
        // Reacción para indicar que está procesando
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: "🔍",
                    key: m.key
                }
            });
        } catch {}
        
        // Verificar si es un enlace de SoundCloud
        const isSoundCloudLink = text.includes('soundcloud.com');
        
        let result;
        
        if (isSoundCloudLink) {
            // Si es un enlace, buscar directamente usando la API de búsqueda
            // Extraer parte del enlace para buscar
            const searchTerm = text.split('/').pop() || text;
            const searchUrl = `${API_URL}?query=${encodeURIComponent(searchTerm)}&key=${API_KEY}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (!data.success || !data.data) {
                throw new Error('No se pudo encontrar información para este enlace');
            }
            
            result = data.data;
        } else {
            // Si es texto de búsqueda normal
            const searchUrl = `${API_URL}?query=${encodeURIComponent(text)}&key=${API_KEY}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (!data.success || !data.data) {
                throw new Error('No se encontraron resultados para tu búsqueda');
            }
            
            result = data.data;
        }
        
        // Formatear duración
        const durationMs = result.duration || 0;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Crear mensaje con información
        const infoMessage = `
🎧 *SOUNDCLOUD*

📌 *Título:* ${result.title || 'Sin título'}
👤 *Artista:* ${result.artist || 'Desconocido'}
⏱️ *Duración:* ${formattedDuration}

⬇️ *Descarga automática en proceso...*`;
        
        // Enviar mensaje informativo
        await conn.sendMessage(m.chat, {
            text: infoMessage
        }, { quoted: m });
        
        // Reacción de procesamiento
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: "⬇️",
                    key: m.key
                }
            });
        } catch {}
        
        // Mensaje de descarga
        await conn.sendMessage(m.chat, {
            text: `⏳ *Descargando audio...*\nPor favor espera unos segundos.`
        }, { quoted: m });
        
        // Intentar descargar y enviar el audio
        try {
            if (!result.dl) {
                throw new Error('No hay enlace de descarga disponible');
            }
            
            await conn.sendMessage(m.chat, {
                audio: { url: result.dl },
                mimetype: 'audio/mpeg',
                fileName: `${(result.title || 'audio').substring(0, 40).replace(/[^\w\s]/gi, '')}.mp3`,
                ptt: false
            }, { quoted: m });
            
            // Reacción de éxito
            try {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: "✅",
                        key: m.key
                    }
                });
            } catch {}
            
            await conn.sendMessage(m.chat, {
                text: `✨ *¡Descarga completada!*\n🎵 *${result.title}*\n👤 ${result.artist}`
            });
            
        } catch (downloadError) {
            console.error('Error en descarga:', downloadError);
            
            // Reacción de error
            try {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: "❌",
                        key: m.key
                    }
                });
            } catch {}
            
            await conn.sendMessage(m.chat, {
                text: `❌ *Error en la descarga*\n\n${downloadError.message}\n\nPuedes intentar con otro enlace o término de búsqueda.`
            });
        }
        
    } catch (error) {
        console.error('Error general:', error);
        
        // Reacción de error
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: "💥",
                    key: m.key
                }
            });
        } catch {}
        
        await conn.reply(m.chat, 
            `💥 *Error*\n\n${error.message}\n\nVerifica:\n1. Tu conexión a internet\n2. Que el enlace sea válido\n3. Intenta nuevamente`, 
            m
        );
    }
};

// Comandos que activarán este handler
handler.command = ['soundcloud', 'sc', 'soundcloudsearch', 'scsearch'];
handler.help = ['soundcloud <texto/enlace>'];
handler.tags = ['downloader'];

export default handler;
