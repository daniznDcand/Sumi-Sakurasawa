import fetch from 'node-fetch';
import yts from 'yt-search';

// Función principal del comando play
let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ Por favor proporciona un término de búsqueda.\n\n*Ejemplo:* ${usedPrefix + command} despacito`);
  }

  try {
    await m.reply('🔍 Buscando en YouTube...');
    
    const search = await yts(text);
    
    if (!search || !search.videos || search.videos.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const video = search.videos[0];
    if (!video) {
      return m.reply('No se pudo obtener información del video.');
    }

    const { 
      title = 'Desconocido', 
      thumbnail = '', 
      timestamp = 'Desconocido', 
      views = 0, 
      ago = 'Desconocido', 
      url = '', 
      author = { name: 'Desconocido' } 
    } = video;

    if (!url) {
      return m.reply('No se pudo obtener la URL del video.');
    }

    const vistas = formatViews(views);
    const canal = author.name || 'Desconocido';
    
    // Información del video
    const infoText = `� *YOUTUBE PLAY*

� *Título:* ${title}
⏰ *Duración:* ${timestamp}
� *Vistas:* ${vistas}
📢 *Canal:* ${canal}
� *Publicado:* ${ago}

🔗 *URL:* ${url}

💌 *Selecciona el formato para descargar:*`;

    // Guardar información en cache
    global.videoInfoCache = global.videoInfoCache || {};
    global.videoInfoCache[m.chat] = {
      url,
      title,
      thumbnail,
      timestamp,
      views: vistas,
      channel: canal,
      publishedTime: ago
    };

    // Enviar información del video
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: infoText
    }, { quoted: m });

    // Enviar opciones de descarga
    await m.reply('📱 *Opciones de descarga:*\n\n• Responde *audio* para MP3\n• Responde *video* para MP4\n• Responde *doc* para documento');

  } catch (error) {
    console.error('Error en play command:', error);
    await m.reply('❌ Ocurrió un error al buscar el video. Inténtalo de nuevo.');
  }
};


// Función para formatear vistas
function formatViews(views) {
  if (!views || views === 0) return '0';
  
  const num = parseInt(views);
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Función simple para obtener audio
async function getAudioUrl(url) {
  console.log('🔍 Buscando URL de audio para:', url);
  
  // API principal - neoxr.eu
  try {
    const response = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(url)}&type=audio&quality=128kbps&apikey=GataDios`);
    const data = await response.json();
    
    if (data && data.data && data.data.url) {
      console.log('✅ Audio obtenido con neoxr.eu');
      return data.data.url;
    }
  } catch (error) {
    console.log('❌ Error con neoxr.eu:', error.message);
  }
  
  // API de respaldo - siputzx
  try {
    const response = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data && data.dl) {
      console.log('✅ Audio obtenido con siputzx');
      return data.dl;
    }
  } catch (error) {
    console.log('❌ Error con siputzx:', error.message);
  }
  
  console.log('❌ Todas las APIs de audio fallaron');
  return null;
}

// Función simple para obtener video
async function getVideoUrl(url) {
  console.log('🔍 Buscando URL de video para:', url);
  
  // API principal - neoxr.eu
  try {
    const response = await fetch(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(url)}&type=video&quality=720p&apikey=GataDios`);
    const data = await response.json();
    
    if (data && data.data && data.data.url) {
      console.log('✅ Video obtenido con neoxr.eu');
      return data.data.url;
    }
  } catch (error) {
    console.log('❌ Error con neoxr.eu:', error.message);
  }
  
  // API de respaldo - siputzx
  try {
    const response = await fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    
    if (data && data.dl) {
      console.log('✅ Video obtenido con siputzx');
      return data.dl;
    }
  } catch (error) {
    console.log('❌ Error con siputzx:', error.message);
  }
  
  console.log('❌ Todas las APIs de video fallaron');
  return null;
}


// Handler para respuestas de texto
handler.before = async (m, { conn }) => {
  // Solo procesar si hay texto y hay un video en cache
  if (m.text && global.videoInfoCache?.[m.chat]) {
    const chatInfo = global.videoInfoCache[m.chat];
    const { url, title } = chatInfo;
    const userResponse = m.text.toLowerCase().trim();
    
    if (userResponse === 'audio' || userResponse === 'mp3') {
      try {
        await m.reply('⬇️ Descargando audio...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
          await m.reply('✅ Audio enviado exitosamente');
        } else {
          await m.reply('❌ No se pudo descargar el audio');
        }
      } catch (error) {
        console.error('Error descargando audio:', error);
        await m.reply('❌ Error al descargar el audio.');
      }
      return false;
    }
    
    if (userResponse === 'video' || userResponse === 'mp4') {
      try {
        await m.reply('⬇️ Descargando video...');
        const videoUrl = await getVideoUrl(url);
        
        if (videoUrl) {
          await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*`
          }, { quoted: m });
          await m.reply('✅ Video enviado exitosamente');
        } else {
          await m.reply('❌ No se pudo descargar el video');
        }
      } catch (error) {
        console.error('Error descargando video:', error);
        await m.reply('❌ Error al descargar el video.');
      }
      return false;
    }
    
    if (userResponse === 'doc' || userResponse === 'documento') {
      try {
        await m.reply('⬇️ Descargando como documento...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            document: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
          await m.reply('✅ Documento enviado exitosamente');
        } else {
          await m.reply('❌ No se pudo descargar el documento');
        }
      } catch (error) {
        console.error('Error descargando documento:', error);
        await m.reply('❌ Error al descargar el documento.');
      }
      return false;
    }
  }
  
  return true; // Permitir otros comandos
};

handler.command = handler.help = ['play'];
handler.tags = ['downloader'];
handler.limit = true;

export default handler;