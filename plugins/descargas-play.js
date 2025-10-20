import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);


function extractYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9\-\_]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9\-\_]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9\-\_]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}


async function mnuuConverter(url, format = 'mp3') {
  try {
    const videoId = extractYouTubeId(url);
    if (!videoId) throw new Error('URL de YouTube inválida');
    
    console.log(`🔍 Intentando mnuu converter para ${format}...`);
    
    
    const timestamp = Math.floor(Date.now() / 1000);
    
    
    const baseUrls = [
      'https://www1.mnuu.nu',
      'https://www2.mnuu.nu', 
      'https://www3.mnuu.nu'
    ];
    
    for (const baseUrl of baseUrls) {
      try {
        
        const initUrl = `${baseUrl}/api/v1/init?v=${videoId}&f=${format}&t=${timestamp}`;
        const initResponse = await fetch(initUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://mnuu.nu/'
          }
        });
        
        if (!initResponse.ok) continue;
        
        const initData = await initResponse.json();
        if (initData.error) continue;
        
        
        const convertResponse = await fetch(initData.convertURL, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://mnuu.nu/'
          }
        });
        
        if (!convertResponse.ok) continue;
        
        const convertData = await convertResponse.json();
        if (convertData.error) continue;
        
        
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
          try {
            const progressResponse = await fetch(convertData.progressURL, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://mnuu.nu/'
              }
            });
            
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              
              if (progressData.progress >= 3) {
                console.log(`✅ mnuu converter exitosa`);
                return {
                  url: convertData.downloadURL,
                  title: convertData.title || 'Video sin título',
                  api: 'mnuu'
                };
              }
            }
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            attempts++;
          } catch (e) {
            attempts++;
          }
        }
        
      } catch (error) {
        console.log(`❌ Error con ${baseUrl}: ${error.message}`);
        continue;
      }
    }
    
    throw new Error('Todos los servidores mnuu fallaron');
    
  } catch (error) {
    console.log(`❌ mnuu converter falló: ${error.message}`);
    return null;
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];

  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `💙 Ingresa el nombre de la música a descargar.\n\nEjemplo: ${usedPrefix}${command} Let you Down Cyberpunk`, m, rcanal);
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
*⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣︢ۛ۫۫۫۫۫۫ۜ⏝ּׅ︣ׄۛ۫۫۫۫۫۫ۜ*

💌 *Selecciona el formato para descargar:*`;

    const footer = '🌱 Hatsune Miku Bot - YouTube';

    try {
      const thumb = thumbnail ? (await conn.getFile(thumbnail))?.data : null;

      
      await conn.sendNCarousel(m.chat, infoText, footer, thumb, buttons, null, null, null, m);
      
      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {};
      }
      
      global.db.data.users[m.sender].lastYTSearch = {
        url,
        title,
        messageId: m.key.id,  
        timestamp: Date.now() 
      };
      
    } catch (thumbError) {
     
      await conn.sendNCarousel(m.chat, infoText, footer, null, buttons, null, null, null, m);
      
      if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {};
      }
      
      global.db.data.users[m.sender].lastYTSearch = {
        url,
        title,
        messageId: m.key.id,  
        timestamp: Date.now() 
      };
      
      console.error("Error al obtener la miniatura:", thumbError);
    }

  } catch (error) {
    console.error("Error completo:", error);
    return m.reply(`💙 Ocurrió un error: ${error.message || 'Desconocido'}`);
  }
};


function isValidUrl(string) {
  try {
    new URL(string);
    return string.startsWith('http://') || string.startsWith('https://');
  } catch (_) {
    return false;
  }
}




async function validateDownloadUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.log('❌ URL inválida o vacía');
    return false;
  }

  try {
    
    new URL(url);
    
    console.log(`🔍 Validating download URL: ${url.substring(0, 100)}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); 
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    
    const isValid = response.ok && 
                   response.status >= 200 && 
                   response.status < 400 &&
                   response.status !== 404 &&
                   response.status !== 403;
    
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    
    
    const isMediaFile = contentType.includes('video') || 
                       contentType.includes('audio') || 
                       contentType.includes('application/octet-stream') ||
                       contentType.includes('binary') ||
                       url.includes('.mp4') || 
                       url.includes('.mp3') || 
                       url.includes('.m4a');
    
    if (isValid && isMediaFile) {
      console.log(`✅ URL validation status: ${response.status} - Tipo: ${contentType} - Tamaño: ${contentLength || 'desconocido'}`);
      return true;
    } else {
      console.log(`❌ URL no válida - Status: ${response.status}, Tipo: ${contentType}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ URL validation failed: ${error.message}`);
    return false;
  }
}


async function processDownload(conn, m, url, title, option) {
  
  const downloadTypes = {
    1: '🎵 audio MP3',
    2: '🎬 video MP4', 
    3: '📁 audio MP3 doc',
    4: '📁 video MP4 doc'
  };
  
  const downloadType = downloadTypes[option] || 'archivo';
  
 
  const processingMsg = await conn.reply(m.chat, `💙 Obteniendo ${downloadType}... ⚡`, m);
  
  try {
    let downloadUrl;
    let fileName;
    let mimeType;

    if (option === 1 || option === 3) {
      
      downloadUrl = await ytdlAudio(url);
      fileName = `${title.replace(/[^\w\s]/gi, '')}.mp3`;
      mimeType = 'audio/mpeg';
      
      if (!downloadUrl) {
        throw new Error(`❌ No se pudo obtener el enlace de audio. Intenta de nuevo.`);
      }

      
      if (option === 1) {
        await conn.sendMessage(m.chat, { 
          document: downloadUrl, 
          mimetype: mimeType,
          fileName: fileName
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { 
          document: downloadUrl, 
          mimetype: mimeType,
          fileName: fileName
        }, { quoted: m });
      }
    } else {
      
      const videoResult = await ytdl(url);
      fileName = `${title.replace(/[\w\s]/gi, '')}.mp4`;
      mimeType = 'video/mp4';
      if (!videoResult) {
        throw new Error(`❌ No se pudo obtener el enlace de video. Intenta de nuevo.`);
      }
      downloadUrl = videoResult;
      if (videoResult.isAudioAsVideo) {
        mimeType = 'video/mp4';
      }
      if (option === 2) {
        await conn.sendMessage(m.chat, { 
          document: downloadUrl, 
          mimetype: mimeType,
          fileName: fileName,
          caption: title
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { 
          document: downloadUrl, 
          mimetype: mimeType,
          fileName: fileName,
          caption: title
        }, { quoted: m });
      }
    }
    
   
    const user = global.db.data.users[m.sender];
    if (!user.monedaDeducted) {
      user.moneda -= 2;
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


async function apiAdonix(url) {
  const apiURL = `https://apiadonix.kozow.com/download/ytmp4?apikey=${global.apikey}&url=${encodeURIComponent(url)}`
  const res = await fetch(apiURL)
  const data = await res.json()
  if (!data.status || !data.data?.url) throw new Error('API Adonix no devolvió datos válidos')
  return { url: data.data.url, title: data.data.title || 'Video sin título XD', fuente: 'Adonix' }
}


async function apiJoseDev(url) {
  const apiURL = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&apikey=sylphy-fbb9`
  const res = await fetch(apiURL)
  const data = await res.json()
  if (!data.status || !data.res?.url) throw new Error('API JoseDev no devolvió datos válidos')
  return { url: data.res.url, title: data.res.title || 'Video sin título XD', fuente: 'JoseDev' }
}


async function apiAdonixAudio(url) {
  const apiURL = `https://apiadonix.kozow.com/download/ytmp3?apikey=${global.apikey}&url=${encodeURIComponent(url)}`
  const res = await fetch(apiURL)
  const data = await res.json()
  if (!data.status || !data.data?.url) throw new Error('API Adonix (audio) no devolvió datos válidos')
  return { url: data.data.url, title: data.data.title || 'Audio sin título XD', fuente: 'Adonix' }
}


async function apiJoseDevAudio(url) {
  const apiURL = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(url)}&apikey=sylphy-fbb9`
  const res = await fetch(apiURL)
  const data = await res.json()
  if (!data.status || !data.res?.url) throw new Error('API JoseDev (audio) no devolvió datos válidos')
  return { url: data.res.url, title: data.res.title || 'Audio sin título XD', fuente: 'JoseDev' }
}


async function ytdl(url) {
  try {
    return await apiAdonix(url)
  } catch (e1) {
    return await apiJoseDev(url)
  }
}


async function ytdlAudio(url) {
  try {
    return await apiAdonixAudio(url)
  } catch (e1) {
    return await apiJoseDevAudio(url)
  }
}

handler.before = async (m, { conn }) => {
  
  
  const buttonPatterns = [
    /^ytdl_(audio|video)_(mp3|mp4|doc)$/,
    /ytdl_audio_mp3/,
    /ytdl_video_mp4/,
    /ytdl_audio_doc/,
    /ytdl_video_doc/
  ];
  
  let isButtonResponse = false;
  let matchedPattern = null;
  
  for (const pattern of buttonPatterns) {
    if (pattern.test(m.text)) {
      isButtonResponse = true;
      matchedPattern = pattern;
      break;
    }
  }
  
  const textContainsButton = m.text.includes('ytdl_') || 
                            m.text.includes('audio_mp3') || 
                            m.text.includes('video_mp4') ||
                            m.text.includes('audio_doc') ||
                            m.text.includes('video_doc');
  
  const buttonTextPatterns = [
    /🎵.*MP3.*Audio/i,
    /🎬.*MP4.*Video/i,
    /📁.*MP3.*Documento/i,
    /📁.*MP4.*Documento/i
  ];
  
  let isButtonTextResponse = false;
  for (const pattern of buttonTextPatterns) {
    if (pattern.test(m.text)) {
      isButtonTextResponse = true;
      matchedPattern = `text: ${pattern}`;
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
  }
  
  else if (/🎵.*MP3.*Audio/i.test(m.text)) {
    option = 1; 
  } else if (/🎬.*MP4.*Video/i.test(m.text)) {
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
  user.cebollinesDeducted = false;

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
