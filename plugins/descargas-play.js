import fetch from 'node-fetch';
import yts from 'yt-search';


const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`❌ Por favor proporciona un término de búsqueda.\n\n*Ejemplo:* ${usedPrefix + command} despacito`);
  }

  try {
    m.reply('🔍 Buscando en YouTube...');
    
    const search = await yts(text);
    
    if (!search || !search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    if (!videoInfo) {
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
    } = videoInfo;

    if (!url) {
      return m.reply('No se pudo obtener la URL del video.');
    }

    const vistas = formatViews(views);
    const canal = author.name || 'Desconocido';
    
    const buttons = [
      ['🎵 MP3 (Audio)', 'ytdl_audio_mp3'],
      ['🎬 MP4 (Video)', 'ytdl_video_mp4'],
      ['📁 MP3 Documento', 'ytdl_audio_doc'],
      ['📁 MP4 Documento', 'ytdl_video_doc']
    ];
    
    const infoText = `*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ💙𝗠𝗶𝗸𝘂𝗺𝗶𝗻🌱ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*

> 💙 *Título:* ${title}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 🌱 *Duración:* ${timestamp}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 💙 *Vistas:* ${vistas}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 🌱 *Canal:* ${canal}
*°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°*
> 💙 *Publicado:* ${ago}
*⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ۛ۫۫۫۫۫۫ۜ⏝ּׅ︢︣ׄۛ۫۫۫۫۫۫ۜ*

💌 *Selecciona el formato para descargar:*`;

    const footer = '🌱 Hatsune Miku Bot - YouTube';

    
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

    try {
      await conn.sendButton(
        m.chat,
        infoText,
        footer,
        thumbnail || null,
        buttons,
        m
      );
      
    } catch (buttonError) {
      console.log('Error enviando botones, usando mensaje alternativo:', buttonError);
      
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `${infoText}\n\n*Para descargar responde con:*\n• *audio* - Para MP3\n• *video* - Para MP4\n• *doc* - Para documento`
      }, { quoted: m });
    }

  } catch (error) {
    console.error('Error en play command:', error);
    m.reply('❌ Ocurrió un error al buscar el video. Inténtalo de nuevo.');
  }
};


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



async function getAudioUrl(url) {
  console.log('🔍 Buscando URL de audio para:', url);
  
  
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



async function getVideoUrl(url) {
  console.log('🔍 Buscando URL de video para:', url);
  
  
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



handler.before = async (m, { conn }) => {
  
  const buttonId = m.selectedButtonId || m.butt || m.selectedId || 
                   (m.message?.buttonsResponseMessage?.selectedButtonId) ||
                   (m.message?.templateButtonReplyMessage?.selectedId);
  
  if (buttonId && global.videoInfoCache?.[m.chat]) {
    const chatInfo = global.videoInfoCache[m.chat];
    const { url, title } = chatInfo;
    
    if (buttonId === 'ytdl_audio_mp3') {
      try {
        await m.reply('⬇️ Descargando audio...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
        } else {
          m.reply(`❌ No se pudo descargar el audio de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando audio:', error);
        m.reply('❌ Error al descargar el audio.');
      }
      return false;
    }
    
    if (buttonId === 'ytdl_video_mp4') {
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
        } else {
          m.reply(`❌ No se pudo descargar el video de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando video:', error);
        m.reply('❌ Error al descargar el video.');
      }
      return false;
    }
    
    if (buttonId === 'ytdl_audio_doc') {
      try {
        await m.reply('⬇️ Descargando audio como documento...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            document: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
        } else {
          m.reply(`❌ No se pudo descargar el audio de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando audio como documento:', error);
        m.reply('❌ Error al descargar el audio como documento.');
      }
      return false;
    }
    
    if (buttonId === 'ytdl_video_doc') {
      try {
        await m.reply('⬇️ Descargando video como documento...');
        const videoUrl = await getVideoUrl(url);
        
        if (videoUrl) {
          await conn.sendMessage(m.chat, {
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`
          }, { quoted: m });
        } else {
          m.reply(`❌ No se pudo descargar el video de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando video como documento:', error);
        m.reply('❌ Error al descargar el video como documento.');
      }
      return false;
    }
  }
  
  
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
  
  return true; 
};

handler.command = handler.help = ['play'];
handler.tags = ['downloader'];
handler.limit = true;

export default handler;