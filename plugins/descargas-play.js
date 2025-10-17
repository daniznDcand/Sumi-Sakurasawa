import fetch from "node-fetch";
import yts from 'yt-search';
import { yta, ytv } from '../lib/y2mate.js';

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      console.log(`Intentando con API: ${api}`);
      const response = await fetch(endpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const result = extractor(data);
      
      if (result) {
        console.log(`✅ Descarga exitosa con API: ${api}`);
        return result;
      }
    } catch (error) {
      console.log(`❌ Fallo con API ${api}:`, error.message);
      continue;
    }
  }
  throw new Error('Todas las APIs fallaron');
}

async function getAud(url) {
  const fuentes = [
    { api: 'Adonix', endpoint: `https://api-adonix.ultraplus.click/download/ytmp3?apikey=${global.apikey}&url=${encodeURIComponent(url)}`, extractor: res => res?.data?.url },
    { api: 'MayAPI', endpoint: `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp3&apikey=${global.APIKeys['https://mayapi.ooguy.com']}`, extractor: res => res.result.url }
  ];
  return await fetchFromApis(fuentes);
}

async function ytdlAudio(url) {
  try {
    const altUrl = await getAud(url);
    return { url: altUrl, title: 'Audio sin título' };
  } catch (error) {
    console.error('Error APIs principales, probando Y2Mate:', error);
    try {
      const result = await yta(url);
      return { url: result?.link, title: result?.title || 'Audio sin título' };
    } catch {
      throw new Error('No se pudo descargar el audio');
    }
  }
}

async function getVid(url) {
  const fuentes = [
    { api: 'Adonix', endpoint: `https://api-adonix.ultraplus.click/download/ytmp4?apikey=${global.apikey}&url=${encodeURIComponent(url)}`, extractor: res => res?.data?.url },
    { api: 'MayAPI', endpoint: `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp4&apikey=${global.APIKeys['https://mayapi.ooguy.com']}`, extractor: res => res.result.url }
  ];
  return await fetchFromApis(fuentes);
}

async function ytdl(url) {
  try {
    const altUrl = await getVid(url);
    return { url: altUrl, title: 'Video sin título' };
  } catch (error) {
    console.error('Error APIs principales, probando Y2Mate:', error);
    try {
      const result = await ytv(url);
      return { url: result?.link, title: result?.title || 'Video sin título' };
    } catch {
      throw new Error('No se pudo descargar el video');
    }
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `💙 Ingresa el nombre de la música a descargar.\n\nEjemplo: ${usedPrefix}${command} Let you Down Cyberpunk`, m);
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
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
      ['🎵 Audio', 'ytdl_audio_mp3'],
      ['🎬 Video', 'ytdl_video_mp4'],
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
      const thumb = thumbnail ? (await conn.getFile(thumbnail))?.data : null;
      await conn.sendNCarousel(m.chat, infoText, footer, thumb, buttons, null, null, null, m);
    } catch (thumbError) {
      await conn.sendNCarousel(m.chat, infoText, footer, null, buttons, null, null, null, m);
      console.error("Error al obtener la miniatura:", thumbError);
    }

    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = {};
    }
    
    global.db.data.users[m.sender].lastYTSearch = {
      url,
      title,
      messageId: m.key.id,  
      timestamp: Date.now() 
    };

  } catch (error) {
    console.error("Error completo:", error);
    return m.reply(`💙 Ocurrió un error: ${error.message || 'Desconocido'}`);
  }
};

async function processDownload(conn, m, url, title, option) {
  const downloadTypes = {
    1: '🎵 audio MP3',
    2: '🎬 video MP4', 
    3: '📁 audio MP3 doc',
    4: '📁 video MP4 doc'
  };
  
  const downloadType = downloadTypes[option] || 'archivo';
  
  await conn.reply(m.chat, `💙 Obteniendo ${downloadType}... ⚡`, m);
  
  try {
    let downloadUrl;
    let fileName;
    let mimeType;

    if (option === 1 || option === 3) {
      const audioResult = await ytdlAudio(url);
      if (!audioResult || !audioResult.url) {
        throw new Error(`❌ No se pudo obtener el enlace de audio. Intenta de nuevo.`);
      }
      downloadUrl = audioResult.url;
      title = audioResult.title || title;
      fileName = `${title.replace(/[^\w\s]/gi, '').substring(0, 50)}.mp3`;
      mimeType = 'audio/mpeg';

      if (option === 1) {
        await conn.sendMessage(m.chat, {
          audio: { url: downloadUrl },
          fileName: fileName,
          mimetype: mimeType
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          document: { url: downloadUrl },
          mimetype: mimeType,
          fileName: fileName
        }, { quoted: m });
      }
    } else {
      const videoResult = await ytdl(url);
      if (!videoResult || !videoResult.url) {
        throw new Error(`❌ No se pudo obtener el enlace de video. Intenta de nuevo.`);
      }
      downloadUrl = videoResult.url;
      title = videoResult.title || title;
      fileName = `${title.replace(/[^\w\s]/gi, '').substring(0, 50)}.mp4`;
      mimeType = 'video/mp4';

      if (option === 2) {
        await conn.sendMessage(m.chat, {
          video: { url: downloadUrl },
          fileName: fileName,
          mimetype: mimeType,
          caption: `🎬 ${title}`
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          document: { url: downloadUrl },
          mimetype: mimeType,
          fileName: fileName,
          caption: `🎬 ${title}`
        }, { quoted: m });
      }
    }
    
    const user = global.db.data.users[m.sender];
    if (user && !user.monedaDeducted) {
      user.moneda = (user.moneda || 0) - 2;
      user.monedaDeducted = true;
      conn.reply(m.chat, `💙 Has utilizado 2 *Cebollines 🌱*`, m);
    }
    
    return true;
  } catch (error) {
    console.error("Error al procesar descarga:", error);
    conn.reply(m.chat, `💙 Error: ${error.message}`, m);
    return false;
  }
}

handler.before = async (m, { conn }) => {
  if (!m.text) return false;
  
  const buttonPatterns = [
    /^ytdl_(audio|video)_(mp3|mp4|doc)$/,
    /ytdl_audio_mp3/,
    /ytdl_video_mp4/,
    /ytdl_audio_doc/,
    /ytdl_video_doc/
  ];
  
  let isButtonResponse = false;
  
  for (const pattern of buttonPatterns) {
    if (pattern.test(m.text)) {
      isButtonResponse = true;
      break;
    }
  }
  
  const textContainsButton = m.text.includes('ytdl_') || 
                            m.text.includes('audio_mp3') || 
                            m.text.includes('video_mp4') ||
                            m.text.includes('audio_doc') ||
                            m.text.includes('video_doc');
  
  const buttonTextPatterns = [
    /🎵.*Audio/i,
    /🎬.*Video/i,
    /📁.*MP3.*Documento/i,
    /📁.*MP4.*Documento/i
  ];
  
  let isButtonTextResponse = false;
  for (const pattern of buttonTextPatterns) {
    if (pattern.test(m.text)) {
      isButtonTextResponse = true;
      break;
    }
  }
  
  if (!isButtonResponse && !textContainsButton && !isButtonTextResponse) {
    return false;
  }
  
  const user = global.db.data.users[m.sender];
  if (!user || !user.lastYTSearch) {
    return false;
  }
  
  console.log(`🎵 Procesando: ${user.lastYTSearch.title}`);
  
  const currentTime = Date.now();
  const searchTime = user.lastYTSearch.timestamp || 0;
  
  if (currentTime - searchTime > 10 * 60 * 1000) {
    await conn.reply(m.chat, '⏰ La búsqueda ha expirado. Por favor realiza una nueva búsqueda.', m);
    return false; 
  }
  
  let option = null;
  
  if (m.text.includes('audio_mp3') || m.text === 'ytdl_audio_mp3') {
    option = 1; 
  } else if (m.text.includes('video_mp4') || m.text === 'ytdl_video_mp4') {
    option = 2; 
  } else if (m.text.includes('audio_doc') || m.text === 'ytdl_audio_doc') {
    option = 3; 
  } else if (m.text.includes('video_doc') || m.text === 'ytdl_video_doc') {
    option = 4; 
  } else if (/🎵.*Audio/i.test(m.text)) {
    option = 1; 
  } else if (/🎬.*Video/i.test(m.text)) {
    option = 2; 
  } else if (/📁.*MP3.*Documento/i.test(m.text)) {
    option = 3; 
  } else if (/📁.*MP4.*Documento/i.test(m.text)) {
    option = 4; 
  }
  
  if (!option) {
    return false;
  }

  if (user.processingDownload) {
    return false;
  }
  
  user.processingDownload = true;
  user.monedaDeducted = false;

  try {
    await processDownload(
      conn, 
      m, 
      user.lastYTSearch.url, 
      user.lastYTSearch.title, 
      option
    );
    
    user.lastYTSearch = null;
    user.processingDownload = false;
    
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    user.processingDownload = false;
    await conn.reply(m.chat, `💙 Error al procesar la descarga: ${error.message}`, m);
  }
  
  return true;
};

function formatViews(views) {
  if (views === undefined) {
    return "No disponible";
  }

  try {
    if (views >= 1_000_000_000) {
      return `${(views / 1_000_000_000).toFixed(1)}B`;
    } else if (views >= 1_000_000) {
      return `${(views / 1_000_000).toFixed(1)}M`;
    } else if (views >= 1_000) {
      return `${(views / 1_000).toFixed(1)}k`;
    }
    return views.toLocaleString();
  } catch (e) {
    return String(views);
  }
}

handler.command = handler.help = ['play'];
handler.tags = ['downloader'];

export default handler;