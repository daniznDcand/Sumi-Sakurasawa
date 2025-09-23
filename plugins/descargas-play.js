import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';


try {
  var { youtubedl } = await import('@bochilteam/scraper');
} catch (e) {
 
  var youtubedl = async (url) => ({ audio: null, video: null });
}


const ogmp3 = {
  download: async (url, quality, type) => {
    try {
      const info = await youtubedl(url);
      return { result: { download: info.audio || info.video } };
    } catch (e) {
      throw new Error('ogmp3 failed');
    }
  }
};

const ytmp3 = async (url) => {
  try {
    const info = await youtubedl(url);
    return info.audio;
  } catch (e) {
    throw new Error('ytmp3 failed');
  }
};

const ytmp4 = async (url) => {
  try {
    const info = await youtubedl(url);
    return info.video;
  } catch (e) {
    throw new Error('ytmp4 failed');
  }
};

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

    try {
      await conn.sendButton(
        m.chat,
        infoText,
        footer,
        thumbnail || null,
        buttons,
        m
      );
      
      
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
      
    } catch (buttonError) {
      console.log('Error enviando botones, usando mensaje alternativo:', buttonError);
      
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `${infoText}\n\n*Para descargar responde con:*\n• *audio* - Para MP3\n• *video* - Para MP4\n• *doc* - Para documento`
      }, { quoted: m });
      
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


async function getFileSize(url) {
  try {
    if (!url) return 0;
    
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    
    if (contentLength) {
      return parseInt(contentLength) / (1024 * 1024); // Convertir a MB
    }
    
    
    return 10; 
  } catch (error) {
    console.log('Error obteniendo tamaño:', error.message);
    return 10; 
  }
}


const download = async (apis) => {
  let mediaData = null;
  let isDirect = false;
  
  for (const api of apis) {
    try {
      console.log('🔍 Probando API:', api.url.toString().substring(0, 50) + '...');
      const data = await api.url();
      const {data: extractedData, isDirect: direct} = api.extract(data);
      
      if (extractedData) {
        const size = await getFileSize(extractedData);
        console.log(`📁 Tamaño detectado: ${size.toFixed(2)} MB`);
        
        if (size >= 1) { 
          mediaData = extractedData;
          isDirect = direct;
          console.log('✅ API exitosa, archivo válido');
          break;
        } else {
          console.log('⚠️ Archivo muy pequeño, probando siguiente API...');
        }
      } else {
        console.log('❌ No se obtuvo URL de esta API');
      }
    } catch (e) {
      console.log(`❌ Error con API: ${e.message}`);
      continue;
    }
  }
  
  return {mediaData, isDirect};
};


async function getAudioUrl(url) {
  console.log('🔍 Buscando URL de audio para:', url);
  
  const userVideoData = { url };
  const selectedQuality = '128kbps';
  const apis = global.APIs?.exonity?.url || 'https://exonity.tech'; // Variable de APIs
  
  const audioApis = [
    {url: () => ogmp3.download(userVideoData.url, selectedQuality, 'audio'), extract: (data) => ({data: data.result.download, isDirect: false})},
    {url: () => ytmp3(userVideoData.url), extract: (data) => ({data, isDirect: true})},
    {
      url: () =>
        fetch(`https://api.neoxr.eu/api/youtube?url=${userVideoData.url}&type=audio&quality=128kbps&apikey=GataDios`).then((res) => res.json()),
      extract: (data) => ({data: data.data.url, isDirect: false})
    },
    {
      url: () => fetch(`${global.APIs?.stellar?.url || 'https://api.stellar.com'}/dow/ytmp3?url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data?.data?.dl, isDirect: false})
    },
    {
      url: () => fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data.dl, isDirect: false})
    },
    {
      url: () => fetch(`${apis}/download/ytmp3?url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data.status ? data.data.download.url : null, isDirect: false})
    },
    {
      url: () => fetch(`https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data.result.download.url, isDirect: false})
    }
  ];
  
  const result = await download(audioApis);
  return result.mediaData;
}


async function getVideoUrl(url) {
  console.log('🔍 Buscando URL de video para:', url);
  
  const userVideoData = { url };
  const selectedQuality = '720p';
  const apis = global.APIs?.exonity?.url || 'https://exonity.tech'; // Variable de APIs
  
  const videoApis = [
    {url: () => ogmp3.download(userVideoData.url, selectedQuality, 'video'), extract: (data) => ({data: data.result.download, isDirect: false})},
    {url: () => ytmp4(userVideoData.url), extract: (data) => ({data, isDirect: false})},
    {
      url: () => fetch(`https://api.siputzx.my.id/api/d/ytmp4?url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data.dl, isDirect: false})
    },
    {
      url: () => fetch(`https://api.neoxr.eu/api/youtube?url=${userVideoData.url}&type=video&quality=720p&apikey=GataDios`).then((res) => res.json()),
      extract: (data) => ({data: data.data.url, isDirect: false})
    },
    {
      url: () => fetch(`${global.APIs?.stellar?.url || 'https://api.stellar.com'}/dow/ytmp4?url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data?.data?.dl, isDirect: false})
    },
    {
      url: () => fetch(`${apis}/download/ytmp4?url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data.status ? data.data.download.url : null, isDirect: false})
    },
    {
      url: () => fetch(`https://exonity.tech/api/ytdlp2-faster?apikey=adminsepuh&url=${userVideoData.url}`).then((res) => res.json()),
      extract: (data) => ({data: data.result.media.mp4, isDirect: false})
    }
  ];
  
  const result = await download(videoApis);
  return result.mediaData;
}


handler.before = async (m, { conn }) => {
  
  const buttonId = m.selectedButtonId || m.butt || m.selectedId;
  
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
          m.reply(`❌ No se pudo descargar el audio de: *${title}*`);
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
          m.reply(`❌ No se pudo descargar el video de: *${title}*`);
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
          m.reply(`❌ No se pudo descargar el audio de: *${title}*`);
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
          m.reply(`❌ No se pudo descargar el video de: *${title}*`);
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
        m.reply('⬇️ Descargando audio...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
        }
      } catch (error) {
        console.error('Error descargando audio:', error);
        m.reply('❌ Error al descargar el audio.');
      }
      return false;
    }
    
    if (userResponse === 'video' || userResponse === 'mp4') {
      try {
        m.reply('⬇️ Descargando video...');
        const videoUrl = await getVideoUrl(url);
        
        if (videoUrl) {
          await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*`
          }, { quoted: m });
        }
      } catch (error) {
        console.error('Error descargando video:', error);
        m.reply('❌ Error al descargar el video.');
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