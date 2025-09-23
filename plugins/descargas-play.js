import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";
import fs from 'fs';
import path from 'path';
import stream from 'stream';
import { promisify } from 'util';

const pipeline = promisify(stream.pipeline);

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];

  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `💙 Ingresa el nombre de la música a descargar.\n\nEjemplo: ${usedPrefix}${command} Coldplay Viva la Vida`, m, fake);
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
      
      console.log(`Stored search for user ${m.sender}: ${title} (ID: ${m.key.id})`);
      
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
      
      console.log("Error al obtener la miniatura:", thumbError);
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


async function handleGoogleYTv3API(apiConfig) {
  try {
    console.log('🎯 Procesando con Google YouTube v3 API...');
    
    const response = await fetch(apiConfig.endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Google API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0];
      const videoId = video.id;
      
      
      if (apiConfig.api.includes('Google-YT-v3') && !apiConfig.api.includes('Video')) {
        return `https://rr3---sn-4g5e6ne7.googlevideo.com/videoplayback?expire=9999999999&ei=abc123&ip=0.0.0.0&id=${videoId}&itag=140&aitags=140&source=youtube&requiressl=yes&mime=audio/mp4&gir=yes&clen=0&dur=0&lmt=0&fvip=3&c=WEB&txp=5532432&sparams=expire,ei,ip,id,aitags,source,requiressl,mime,gir,clen,dur,lmt&lsparams=mh,mm,mn,ms,mv,mvi,pl,lsig&lsig=AG3C_xAwRAIgDummy`;
      } else {
        // Para video
        return `https://rr3---sn-4g5e6ne7.googlevideo.com/videoplayback?expire=9999999999&ei=abc123&ip=0.0.0.0&id=${videoId}&itag=22&source=youtube&requiressl=yes&mime=video/mp4&cnr=14&dur=0&lmt=0&fvip=3&c=WEB&txp=5532432&sparams=expire,ei,ip,id,itag,source,requiressl,mime,cnr,dur,lmt&lsparams=mh,mm,mn,ms,mv,mvi,pl,lsig&lsig=AG3C_xAwRAIgDummy`;
      }
    }
    
    return null;
  } catch (error) {
    console.log(`❌ Error en Google YT v3 API: ${error.message}`);
    return null;
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
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
    
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
  await conn.reply(m.chat, `💙 Procesando ${downloadType}. Por favor espera...`, m);
  
  try {
    let downloadUrl;
    let fileName;
    let mimeType;

    if (option === 1 || option === 3) {
     
      downloadUrl = await getAudioUrl(url);
      fileName = `${title.replace(/[^\w\s]/gi, '')}.mp3`;
      mimeType = 'audio/mpeg';
      
      if (!downloadUrl) {
        
        const contentType = (option === 1 || option === 3) ? 'audio' : 'video';
        throw new Error(`❌ No se pudo obtener el enlace de ${contentType}. Las APIs pueden estar temporalmente fuera de servicio. Por favor intenta de nuevo en unos minutos.`);
      }

      console.log(`Audio URL obtenida: ${downloadUrl}`);

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
      
      downloadUrl = await getVideoUrl(url);
      fileName = `${title.replace(/[^\w\s]/gi, '')}.mp4`;
      mimeType = 'video/mp4';
      
      if (!downloadUrl) {
        
        const contentType = 'video';
        throw new Error(`❌ No se pudo obtener el enlace de ${contentType}. Las APIs pueden estar temporalmente fuera de servicio. Por favor intenta de nuevo en unos minutos.`);
      }

      console.log(`Video URL obtenida: ${downloadUrl}`);

      if (option === 2) {
        
        await conn.sendMessage(m.chat, { 
          video: { url: downloadUrl }, 
          fileName: fileName, 
          mimetype: mimeType, 
          caption: title
        }, { quoted: m });
      } else {
       
        await conn.sendMessage(m.chat, { 
          document: { url: downloadUrl },
          mimetype: mimeType,
          fileName: fileName,
          caption: title
        }, { quoted: m });
      }
    }
    
    
    const user = global.db.data.users[m.sender];
    if (!user.cebollinesDeducted) {
      user.chocolates -= 2;
      user.cebollinesDeducted = true;
      conn.reply(m.chat, `💙 Has utilizado 2 *Cebollines 🌱*`, m);
    }
    
    return true;
  } catch (error) {
    console.error("Error al procesar descarga:", error);
    conn.reply(m.chat, `💙 Error: ${error.message}`, m);
    return false;
  }
}

async function fetchFromApis(apis) {
  for (let i = 0; i < apis.length; i++) {
    try {
      console.log(`🔍 Probando ${apis[i].api}: ${apis[i].endpoint}`);
      
      
      if (apis[i].api.includes('Google-YT-v3')) {
        const result = await handleGoogleYTv3API(apis[i]);
        if (result) {
          console.log(`✅ ${apis[i].api} - URL obtenida exitosamente`);
          const isValid = await validateDownloadUrl(result);
          if (isValid) {
            return result;
          } else {
            console.log(`❌ ${apis[i].api} - URL no válida, continuando...`);
            continue;
          }
        }
      }
      
      const fetchOptions = {
        method: apis[i].method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...apis[i].headers
        },
        timeout: 8000 
      };
      
      if (apis[i].body) {
        fetchOptions.body = apis[i].body;
      }
      
      const response = await fetch(apis[i].endpoint, fetchOptions);
      
      if (!response.ok) {
        console.log(`${apis[i].api} responded with status: ${response.status}`);
        continue;
      }
      
      const apiJson = await response.json();
      console.log(`${apis[i].api} response:`, JSON.stringify(apiJson, null, 2));
      
      
      if (apis[i].api === 'API.Video' || apis[i].api === 'API.Video-Audio') {
        const downloadUrl = await handleApiVideoResponse(apiJson, apis[i].api);
        if (downloadUrl && isValidUrl(downloadUrl)) {
          
          const isWorking = await validateDownloadUrl(downloadUrl);
          if (isWorking) {
            console.log(`✅ ${apis[i].api} devolvió URL válida y funcional: ${downloadUrl}`);
            return downloadUrl;
          } else {
            console.log(`❌ ${apis[i].api} URL no funciona (404 o error): ${downloadUrl}`);
          }
        }
      } else {
        const downloadUrl = apis[i].extractor(apiJson);
        if (downloadUrl && isValidUrl(downloadUrl)) {
          
          const isWorking = await validateDownloadUrl(downloadUrl);
          if (isWorking) {
            console.log(`✅ ${apis[i].api} devolvió URL válida y funcional: ${downloadUrl}`);
            return downloadUrl;
          } else {
            console.log(`❌ ${apis[i].api} URL no funciona (404 o error): ${downloadUrl}`);
          }
        } else {
          console.log(`✗ ${apis[i].api} no devolvió URL válida:`, downloadUrl);
        }
      }
      
    } catch (error) {
      console.error(`✗ ${apis[i].api} falló:`, error.message);
    }
  }
  
  console.log("Todas las APIs fallaron");
  return null;
}


async function getAud(url) {
  const apis = [
    { api: 'ZenzzXD', endpoint: `https://api.zenzxz.my.id/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'ZenzzXD v2', endpoint: `https://api.zenzxz.my.id/downloader/ytmp3v2?url=${encodeURIComponent(url)}`, extractor: res => res.download_url }, 
    { api: 'Vreden', endpoint: `https://api.vreden.tech/api/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Delirius', endpoint: `https://delirius-apiofc.vercel.app/download/ymp3?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url }
  ]
  return await fetchFromBackupApis(apis)
}

async function getVid(url) {
  const apis = [
    { api: 'ZenzzXD', endpoint: `https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'ZenzzXD v2', endpoint: `https://api.zenzxz.my.id/downloader/ytmp4v2?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'Vreden', endpoint: `https://api.vreden.tech/api/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Delirius', endpoint: `https://delirius-apiofc.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url }
  ]
  return await fetchFromBackupApis(apis)
}

async function fetchFromBackupApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000) 
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 200)) 
  }
  return null
}


async function handleApiVideoResponse(response, apiType) {
  try {
    
    if (response.videoId) {
      console.log(`📹 ${apiType} videoId: ${response.videoId}`);
      
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      
      const videoDetailResponse = await fetch(`https://sandbox.api.video/videos/${response.videoId}`, {
        headers: {
          'Authorization': 'Bearer h92qspHJpE3iiOgKH6A5MknP6ylbP44ODKfLAr9VqV1',
          'Accept': 'application/json'
        }
      });
      
      if (videoDetailResponse.ok) {
        const videoDetails = await videoDetailResponse.json();
        console.log(`📹 ${apiType} details:`, JSON.stringify(videoDetails, null, 2));
        
        
        if (apiType === 'API.Video-Audio') {
          return videoDetails.assets?.hls || 
                 videoDetails.assets?.mp4 || 
                 videoDetails.source?.uri ||
                 `https://sandbox.api.video/videos/${response.videoId}/source`;
        }
        
       
        return videoDetails.assets?.mp4 || 
               videoDetails.source?.uri || 
               videoDetails.player?.src ||
               `https://sandbox.api.video/videos/${response.videoId}/source`;
      }
    }
    
    
    if (apiType === 'API.Video-Audio') {
      return response.assets?.hls || response.assets?.mp4 || response.source?.uri;
    }
    
    return response.assets?.mp4 || response.source?.uri || response.player?.src;
    
  } catch (error) {
    console.error(`❌ Error procesando respuesta de ${apiType}:`, error.message);
    return null;
  }
}

async function getAudioUrl(url) {
  const apis = [
    
    { api: 'Delirius', endpoint: `https://delirius-apiofc.vercel.app/download/ymp3?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url },
    { api: 'ZenzzXD', endpoint: `https://api.zenzxz.my.id/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'Y2Mate', endpoint: `https://api-y2mate.onrender.com/api/download/audio/${encodeURIComponent(url)}`, extractor: res => res?.download_url },
    { api: 'StellarWA', endpoint: `https://api.stellarwa.xyz/dow/ytmp3?url=${encodeURIComponent(url)}&apikey=Diamond`, extractor: res => res?.data?.dl },
    { api: 'Lolhuman', endpoint: `https://api.lolhuman.xyz/api/ytaudio?apikey=GataDios&url=${encodeURIComponent(url)}`, extractor: res => res?.result?.link }
  ];
  
  
  const result = await fetchFromApis(apis);
  if (result) return result;
  
 
  try {
    console.log('🔄 Trying backup APIs from getAud function...');
    const backupResult = await getAud(url);
    if (backupResult && backupResult.url) {
      console.log(`✅ Backup API ${backupResult.api} succeeded`);
      return backupResult.url;
    }
  } catch (error) {
    console.error('❌ Backup APIs from getAud failed:', error.message);
  }
  
  
  try {
    console.log('🔄 Intentando método directo para audio como último recurso...');
    return await getDirectAudioUrl(url);
  } catch (error) {
    console.error('❌ Método directo para audio también falló:', error.message);
    return null;
  }
}


async function getDirectAudioUrl(url) {
  
  throw new Error('Método directo de audio no disponible - todas las APIs fallaron');
}

async function getVideoUrl(url) {
  const apis = [
    
    { api: 'Delirius', endpoint: `https://delirius-apiofc.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url },
    { api: 'ZenzzXD', endpoint: `https://api.zenzxz.my.id/downloader/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'Y2Mate-Video', endpoint: `https://api-y2mate.onrender.com/api/download/video/${encodeURIComponent(url)}`, extractor: res => res?.download_url },
    { api: 'Lolhuman', endpoint: `https://api.lolhuman.xyz/api/ytvideo?apikey=GataDios&url=${encodeURIComponent(url)}`, extractor: res => res?.result?.link }
  ];
  
  
  const result = await fetchFromApis(apis);
  if (result) return result;
  

  try {
    console.log('🔄 Trying backup APIs from getVid function...');
    const backupResult = await getVid(url);
    if (backupResult && backupResult.url) {
      console.log(`✅ Backup API ${backupResult.api} succeeded`);
      return backupResult.url;
    }
  } catch (error) {
    console.error('❌ Backup APIs from getVid failed:', error.message);
  }
  
  
  try {
    console.log('🔄 Intentando método directo como último recurso...');
    return await getDirectVideoUrl(url);
  } catch (error) {
    console.error('❌ Método directo también falló:', error.message);
    return null;
  }
}


async function getDirectVideoUrl(url) {
  
  throw new Error('Método directo no disponible - todas las APIs fallaron');
}

handler.before = async (m, { conn }) => {
  
  if (m.sender && global.db.data.users[m.sender]?.lastYTSearch) {
    console.log('\n🔍 [FULL DEBUG] Message received from user with active search:');
    console.log(`   📱 Sender: ${m.sender}`);
    console.log(`   📝 Type (mtype): ${m.mtype}`);
    console.log(`   💬 Text: "${m.text}"`);
    console.log(`   🗂️ Full message object:`, JSON.stringify(m, null, 2));
    console.log(`   📊 Message structure:`, {
      key: m.key,
      message: m.message,
      msg: m.msg
    });
    console.log('─'.repeat(80));
  }
  
  
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
    
    if (m.sender && global.db.data.users[m.sender]?.lastYTSearch) {
      console.log(`❌ [DEBUG] Message "${m.text}" doesn't match any button pattern`);
    }
    return false;
  }
  
  const user = global.db.data.users[m.sender];
  if (!user || !user.lastYTSearch) {
    console.log(`❌ [DEBUG] No user or no active search for ${m.sender}`);
    return false;
  }
  
  console.log(`✅ [BUTTON DETECTED] Pattern: ${matchedPattern || 'keyword match'}`);
  console.log(`📱 User: ${m.sender}`);
  console.log(`🎵 Active search: ${user.lastYTSearch.title}`);
  
  const currentTime = Date.now();
  const searchTime = user.lastYTSearch.timestamp || 0;
  
  
  if (currentTime - searchTime > 10 * 60 * 1000) {
    console.log("⏰ Search expired");
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
    console.log(`✅ [DETECTED] Button text matched: MP3 Audio`);
  } else if (/🎬.*MP4.*Video/i.test(m.text)) {
    option = 2; 
    console.log(`✅ [DETECTED] Button text matched: MP4 Video`);
  } else if (/📁.*MP3.*Documento/i.test(m.text)) {
    option = 3; 
    console.log(`✅ [DETECTED] Button text matched: MP3 Document`);
  } else if (/📁.*MP4.*Documento/i.test(m.text)) {
    option = 4; 
    console.log(`✅ [DETECTED] Button text matched: MP4 Document`);
  }
  
  if (!option) {
    console.log(`❌ [DEBUG] No option found for button text: "${m.text}"`);
    return false;
  }
  
  console.log(`🎵 Processing option ${option} for "${user.lastYTSearch.title}"`);

  
  if (user.processingDownload) {
    console.log(`⚠️ Ya está procesando una descarga, ignorando solicitud duplicada`);
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
    console.log(`✅ Download processed successfully for option ${option}`);
    
  } catch (error) {
    console.error(`❌ Error processing download:`, error);
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

