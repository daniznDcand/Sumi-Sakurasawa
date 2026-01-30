import fetch from "node-fetch";
import yts from 'yt-search';

// Sistema de cache
const videoCache = {};
const cacheTimeout = 10 * 60 * 1000;
const MAX_FILE_SIZE_MB = 100;

// Acortador de URLs
const shortenURL = async (url) => {
  try {
    let response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    let shortUrl = await response.text();
    return shortUrl.includes("http") ? shortUrl : url;
  } catch {
    return url;
  }
};

// Función fetchAPI
const fetchAPI = async (url, type) => {
  try {
    const endpoints = {
      audio: `https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${url}`,
      video: `https://dark-core-api.vercel.app/api/download/ytmp4/v2?key=api&url=${url}`,
    };
    let response = await fetch(endpoints[type]);
    let data = await response.json();
    if (data?.download) return data;

    throw new Error("API principal no respondió correctamente.");
  } catch (error) {
    console.log("Error en API principal:", error.message);
    try {
      const fallbackEndpoints = {
        audio: `https://api.neoxr.eu/api/youtube?url=${url}&type=audio&quality=128kbps&apikey=GataDios`,
        video: `https://api.neoxr.eu/api/youtube?url=${url}&type=video&quality=720p&apikey=GataDios`,
      };
      let response = await fetch(fallbackEndpoints[type]);
      let data = await response.json();
      if (data?.data?.url) {
        return {
          download: data.data.url,
          title: data.data.title,
          filesize: data.data.filesize,
          duration: data.data.duration,
          channel: data.data.channel,
        };
      }
      throw new Error("API de respaldo no respondió correctamente.");
    } catch (error) {
      console.log("Error en API de respaldo:", error.message);
      return null;
    }
  }
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, 
        `🎵 *Búsqueda de Música*\nPor favor, ingresa el nombre de la canción.\n\n💡 *Ejemplo:* ${usedPrefix}play bad bunny`, 
        m
      );
    }

    // Mensaje de búsqueda
    await conn.sendMessage(m.chat, { 
      text: `🔍 *Buscando...*\n\"${text}\"` 
    }, { quoted: m });

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('❌ *No se encontraron resultados*\nPrueba con otro nombre de canción.');
    }

    // Tomar el primer resultado automáticamente
    const videoInfo = search.all[0];
    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;

    const vistas = formatViews(views);
    const canal = author.name || 'Desconocido';

    // Mostrar información del video encontrado
    const infoMessage = `
🎧 *INFORMACIÓN ENCONTRADA*

📌 *Título:* ${title}
⏱️ *Duración:* ${timestamp}
👁️ *Vistas:* ${vistas}
📺 *Canal:* ${canal}
📅 *Publicado:* ${ago}

💡 *Responde con:* 
• "audio" 🎵 para descargar audio
• "video" 🎬 para descargar video`;

    const thumb = (await conn.getFile(thumbnail))?.data;
    
    // Guardar información en cache para procesar la respuesta
    videoCache[m.sender] = {
      url: url,
      title: title,
      timestamp: Date.now()
    };

    await conn.sendMessage(m.chat, {
      image: thumb,
      caption: infoMessage
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { 
      text: `💥 *Error en la búsqueda*\n${error.message}` 
    }, { quoted: m });
  }
};

// Handler para procesar respuestas "audio" o "video"
handler.before = async (m, { conn }) => {
  // Solo procesar si es respuesta a un mensaje del bot
  if (!m.quoted || !m.quoted.text.includes("INFORMACIÓN ENCONTRADA")) return;

  const userInput = m.text.toLowerCase().trim();

  // Verificar cache
  if (!videoCache[m.sender] || Date.now() - videoCache[m.sender].timestamp > cacheTimeout) {
    delete videoCache[m.sender];
    return conn.reply(m.chat, 
      "❌ *La sesión expiró*\nPor favor, realiza una nueva búsqueda.", 
      m
    );
  }

  const { url, title } = videoCache[m.sender];

  try {
    let mediaType, responseMessage, fileName, mimetype, caption;

    if (userInput === 'audio') {
      mediaType = 'audio';
      responseMessage = '🎶 *Descargando audio...*\nPor favor espera.';
      fileName = `${title}.mp3`;
      mimetype = 'audio/mpeg';
      caption = '🎵 *¡Audio descargado!*';
      
    } else if (userInput === 'video') {
      mediaType = 'video';
      responseMessage = '🎬 *Descargando video...*\nPor favor espera.';
      fileName = `${title}.mp4`;
      mimetype = 'video/mp4';
      caption = `🎬 *${title}*\n✅ Video descargado exitosamente`;
      
    } else {
      return conn.reply(m.chat, 
        `❌ *Opción no válida*\nSolo responde con:\n• "audio" 🎵\n• "video" 🎬`, 
        m
      );
    }

    // Enviar mensaje de progreso
    await conn.reply(m.chat, responseMessage, m);

    // Obtener enlace de descarga
    let apiData = await fetchAPI(url, mediaType);

    if (!apiData || !apiData.download) {
      return conn.reply(m.chat, 
        "❌ *Error en la descarga*\nNo se pudo obtener el enlace. Intenta más tarde.", 
        m
      );
    }

    // Acortar URL
    let downloadUrl = await shortenURL(apiData.download);
    
    // Verificar tamaño del archivo
    let fileSizeMB = apiData.filesize ? parseFloat(apiData.filesize) / (1024 * 1024) : null;
    let asDocument = fileSizeMB && fileSizeMB > MAX_FILE_SIZE_MB;

    if (asDocument) {
      await conn.reply(m.chat, 
        "📦 *Archivo muy grande*\nSe enviará como documento.", 
        m
      );
    }

    // Preparar mensaje según el tipo
    let messageOptions;
    if (asDocument) {
      messageOptions = { 
        document: { url: downloadUrl }, 
        fileName, 
        mimetype: mimetype,
        caption: caption
      };
    } else if (mediaType === 'audio') {
      messageOptions = { 
        audio: { url: downloadUrl }, 
        mimetype: "audio/mpeg", 
        fileName: fileName
      };
    } else {
      messageOptions = { 
        video: { url: downloadUrl }, 
        caption: caption 
      };
    }

    // Enviar archivo
    await conn.sendMessage(m.chat, messageOptions, { quoted: m });

    // Mensaje de confirmación
    await conn.sendMessage(m.chat, { 
      text: `✅ *Descarga exitosa!*` 
    });

    // Limpiar cache
    delete videoCache[m.sender];

  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, 
      `❌ *Error en la descarga*\n${error.message}`, 
      m
    );
  }
};

handler.command = handler.help = ['play', 'mp3', 'playaudio', 'play2', 'mp4', 'playvideo'];
handler.tags = ['downloader'];

export default handler;

function formatViews(views) {
  if (!views) return "No disponible";
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B`;
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M`;
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K`;
  return views.toString();
}
