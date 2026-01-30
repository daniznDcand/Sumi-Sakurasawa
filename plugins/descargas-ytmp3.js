import fetch from "node-fetch";

// Función para obtener datos de SoundCloud
const fetchSoundCloud = async (url) => {
  try {
    const apiUrl = `https://api.delirius.store/download/soundcloud?url=${encodeURIComponent(url)}`;
    let response = await fetch(apiUrl);
    let data = await response.json();
    
    if (data?.status && data.status === "success" && data.result) {
      return {
        success: true,
        title: data.result.title || "Sin título",
        thumbnail: data.result.thumbnail || "",
        duration: data.result.duration || "Desconocido",
        uploader: data.result.uploader || "Desconocido",
        url: data.result.url,
        formats: data.result.formats || []
      };
    }
    throw new Error("API no respondió correctamente.");
  } catch (error) {
    console.log("Error en API de SoundCloud:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, 
        `🎵 *DESCARGAR DE SOUNDCLOUD*\n\nUso: ${usedPrefix}${command} [enlace]\n\nEjemplo: ${usedPrefix}${command} https://soundcloud.com/twice-57013/one-spark`, 
        m
      );
    }

    // Validar que sea un enlace de SoundCloud
    if (!text.includes('soundcloud.com')) {
      return conn.reply(m.chat, 
        `❌ *ENLACE INVÁLIDO*\n\nDebe ser un enlace de SoundCloud.\n\nFormato: https://soundcloud.com/usuario/cancion`, 
        m
      );
    }

    // Obtener datos de SoundCloud
    const soundcloudData = await fetchSoundCloud(text);
    
    if (!soundcloudData.success) {
      return conn.reply(m.chat, 
        `❌ *ERROR*\n\nNo se pudo obtener la información.\n\nError: ${soundcloudData.error}`, 
        m
      );
    }

    const { title, thumbnail, duration, uploader, url } = soundcloudData;

    // Formatear duración
    let formattedDuration = duration;
    if (!isNaN(duration) && duration > 0) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Texto de información
    const infoText = `🎧 *SOUNDCLOUD*

> 🎵 *Título:* ${title}
> ⏱️ *Duración:* ${formattedDuration}
> 👤 *Artista:* ${uploader}

*Descarga directa del audio:*`;

    const footer = 'SoundCloud Downloader';
    
    // Botones - SIGUIENDO EL MISMO PATRÓN que tu código
    const buttons = [
      ['🎵 Descargar MP3', 'sc_download']
    ];

    try {
      let thumb = null;
      if (thumbnail) {
        try {
          thumb = (await conn.getFile(thumbnail))?.data;
        } catch (e) {
          console.log("Error obteniendo thumbnail:", e.message);
        }
      }
      
      // IMPORTANTE: Usar sendNCarousel como en tu código
      await conn.sendNCarousel(m.chat, infoText, footer, thumb, buttons, null, null, null, m);
      
    } catch (error) {
      console.error("Error enviando carrusel:", error);
      await conn.sendNCarousel(m.chat, infoText, footer, null, buttons, null, null, null, m);
    }
    
    // GUARDAR EN CACHE EXACTAMENTE COMO tu código de YouTube
    // Esto es lo más importante
    const usr = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
    usr.lastSCSearch = {
      url: url,
      title: title,
      messageId: m.key.id,
      timestamp: Date.now()
    };

  } catch (error) {
    console.error("Error completo:", error);
    return conn.reply(m.chat, `💥 Error: ${error.message}`, m);
  }
};

// Handler para botones - EXACTAMENTE IGUAL que tu código de YouTube
handler.before = async (m, { conn }) => {
  // Solo procesar si es un comando de botón específico
  if (!m.text || m.isBaileys) return false;
  
  // IMPORTANTE: Solo capturar comandos específicos, NO texto normal
  const buttonPatterns = [
    /sc_download/
  ];
  
  let isButtonResponse = false;
  for (const pattern of buttonPatterns) {
    if (pattern.test(m.text)) {
      isButtonResponse = true;
      break;
    }
  }
  
  if (!isButtonResponse) {
    return false; // NO procesar si no es un comando de botón
  }
  
  // VERIFICAR CACHE exactamente como tu código
  const user = global.db.data.users[m.sender];
  if (!user || !user.lastSCSearch) {
    await conn.reply(m.chat, '⏰ No hay búsqueda activa. Realiza una nueva búsqueda.', m);
    return false;
  }
  
  console.log(`🔗 Procesando SoundCloud: ${user.lastSCSearch.title}`);
  
  // Verificar expiración (10 minutos)
  const currentTime = Date.now();
  const searchTime = user.lastSCSearch.timestamp || 0;
  
  if (currentTime - searchTime > 10 * 60 * 1000) {
    await conn.reply(m.chat, '⏰ La búsqueda ha expirado. Por favor realiza una nueva búsqueda.', m);
    user.lastSCSearch = null;
    return false;
  }
  
  const { url, title } = user.lastSCSearch;

  try {
    await conn.reply(m.chat, `⬇️ *Descargando audio de SoundCloud...*`, m);

    // Enviar el audio
    await conn.sendMessage(m.chat, {
      audio: { url: url },
      mimetype: 'audio/mpeg',
      fileName: `${title.replace(/[^\w\s]/gi, '').substring(0, 50)}.mp3`,
      ptt: false
    }, { quoted: m });
    
    await conn.sendMessage(m.chat, { 
      text: `✨ *¡Descarga completada!*\n\n🎧 ${title}` 
    });
    
  } catch (error) {
    console.error(`❌ Error en descarga:`, error.message);
    await conn.reply(m.chat, `❌ Error al procesar la descarga: ${error.message}`, m);
  }
  
  // Limpiar cache
  user.lastSCSearch = null;
  return true;
};

handler.command = ['soundcloud', 'sc', 'scloud'];
handler.help = ['soundcloud <enlace>'];
handler.tags = ['downloader'];
handler.register = true;

export default handler;
