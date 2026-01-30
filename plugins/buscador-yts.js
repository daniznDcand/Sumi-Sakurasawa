import fetch from "node-fetch";

const API_KEY = 'stellar-wCnAirJG'; // Tu clave de API
const API_URL = 'https://api.stellarwa.xyz/dl/soundcloudsearch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🎵 *BUSCADOR DE SOUNDCLOUD*\n\nPor favor, ingresa el nombre de la canción o artista que buscas.\n\n💡 *Ejemplo:* ${usedPrefix + command} Un amor del ayer`;
    
    try {
        // Mensaje de búsqueda
        await m.reply(`🔍 *Buscando en SoundCloud...*\n"${text}"`);
        
        // Realizar la búsqueda
        const searchUrl = `${API_URL}?query=${encodeURIComponent(text)}&key=${API_KEY}`;
        const response = await fetch(searchUrl);
        const data = await response.json();
        
        if (!data.success || !data.data) {
            throw new Error('No se encontraron resultados');
        }
        
        const result = data.data;
        
        // Formatear la duración (de milisegundos a minutos:segundos)
        const durationMs = result.duration || 0;
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Crear mensaje con la información
        const infoMessage = `
🎧 *RESULTADO DE BÚSQUEDA*

📌 *Título:* ${result.title || 'Sin título'}
👤 *Artista:* ${result.artist || 'Desconocido'}
⏱️ *Duración:* ${formattedDuration}

✨ *¿Descargar esta canción?*

Responde con:
• *"si"* ✅ - Para descargar audio MP3
• *"no"* ❌ - Para cancelar`;
        
        // Guardar información para descarga posterior
        if (!global.db.data.users) global.db.data.users = {};
        const user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
        user.lastSoundCloudSearch = {
            title: result.title,
            artist: result.artist,
            url: result.dl,
            timestamp: Date.now()
        };
        
        // Enviar mensaje con imagen si está disponible
        if (result.banner) {
            try {
                const thumb = await (await fetch(result.banner)).buffer();
                await conn.sendMessage(m.chat, {
                    image: thumb,
                    caption: infoMessage,
                    footer: 'SoundCloud Search • @stellarwa.xyz'
                }, { quoted: m });
            } catch {
                // Si falla la imagen, enviar solo texto
                await m.reply(infoMessage);
            }
        } else {
            await m.reply(infoMessage);
        }
        
    } catch (error) {
        console.error(error);
        await m.reply(`❌ *Error en la búsqueda*\n${error.message}\n\nPor favor, intenta con otra búsqueda.`);
    }
};

// Handler para procesar respuestas "si" o "no"
handler.before = async (m, { conn }) => {
    if (!m.text || m.isBaileys) return;
    
    const text = m.text.toLowerCase().trim();
    if (text !== 'si' && text !== 'sí' && text !== 'yes' && text !== 'no') return;
    
    const user = global.db.data.users?.[m.sender];
    if (!user || !user.lastSoundCloudSearch) {
        return conn.reply(m.chat, '⚠️ No hay búsqueda activa. Usa el comando de nuevo.', m);
    }
    
    // Verificar si la búsqueda expiró (10 minutos)
    if (Date.now() - user.lastSoundCloudSearch.timestamp > 10 * 60 * 1000) {
        delete user.lastSoundCloudSearch;
        return conn.reply(m.chat, '⏰ La búsqueda ha expirado. Realiza una nueva búsqueda.', m);
    }
    
    const { title, artist, url } = user.lastSoundCloudSearch;
    
    if (text === 'no') {
        await m.reply('👋 *Búsqueda cancelada*\nUsa el comando nuevamente para buscar otra canción.');
        delete user.lastSoundCloudSearch;
        return;
    }
    
    // Si el usuario dijo "si", proceder con la descarga
    try {
        await m.reply(`⬇️ *Descargando...*\n🎵 ${title}\n👤 ${artist}\n\n⏳ Por favor espera...`);
        
        // Enviar el audio como mensaje
        await conn.sendMessage(m.chat, {
            audio: { url: url },
            mimetype: 'audio/mpeg',
            fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
            ptt: false
        }, { quoted: m });
        
        await m.reply(`✅ *¡Descarga completada!*\n\n🎧 Disfruta de: ${title}`);
        
    } catch (error) {
        console.error(error);
        await m.reply(`❌ *Error en la descarga*\n${error.message}`);
    }
    
    // Limpiar la búsqueda
    delete user.lastSoundCloudSearch;
};

handler.help = ['soundcloudsearch <texto>', 'scsearch <texto>', 'buscarsc <texto>'];
handler.tags = ['downloader'];
handler.command = /^(soundcloudsearch|scsearch|buscarsc)$/i;

export default handler;
