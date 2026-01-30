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
        `🎵 *DESCARGAR DE SOUNDCLOUD*\n\nUso: ${usedPrefix}${command} [enlace]\n\nEjemplo: ${usedPrefix}${command} https://soundcloud.com/twice-57013/one-spark\n\nSolo enlaces de SoundCloud`, 
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

    // Mensaje de procesamiento
    await conn.reply(m.chat, `⏳ *Procesando enlace de SoundCloud...*`, m);

    // Obtener datos de SoundCloud
    const soundcloudData = await fetchSoundCloud(text);
    
    if (!soundcloudData.success) {
      return conn.reply(m.chat, 
        `❌ *ERROR DE DESCARGA*\n\nNo se pudo obtener la información.\n\nError: ${soundcloudData.error}`, 
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

    // Mostrar información
    const infoMessage = `
🎧 *INFORMACIÓN DE SOUNDCLOUD*

🎵 *Título:* ${title}
⏱️ *Duración:* ${formattedDuration}
👤 *Artista:* ${uploader}

✨ *¿Descargar esta canción?*

*Responde con:*
✅ *"si"* - Para descargar audio
❌ *"no"* - Para cancelar`;

    // Guardar información en cache global (igual que tu código de YouTube)
    const usr = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {};
    usr.lastSCSearch = {
      url: url,
      title: title,
      timestamp: Date.now()
    };

    // Enviar mensaje
    try {
      if (thumbnail) {
        const thumb = (await conn.getFile(thumbnail))?.data;
        await conn.sendMessage(m.chat, {
          image: thumb,
          caption: infoMessage
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          text: infoMessage
        }, { quoted: m });
      }
    } catch (error) {
      console.log("Error enviando mensaje:", error);
      await conn.sendMessage(m.chat, {
        text: infoMessage
      }, { quoted: m });
    }

  } catch (error) {
    console.error("Error en handler:", error);
    await conn.reply(m.chat, 
      `💥 *ERROR*\n\n${error.message}`, 
      m
    );
  }
};

// Handler para respuestas - IDÉNTICO a tu código de YouTube
handler.before = async (m, { conn, usedPrefix }) => {
  // Verificar si es una respuesta con "si" o "no"
  if (!m.text || m.isBaileys) return;
  
  const text = m.text.toLowerCase().trim();
  
  // Solo procesar si es "si" o "no"
  if (text !== 'si' && text !== 'sí' && text !== 'yes' && text !== 'no') {
    return false;
  }
  
  // Obtener usuario de la misma forma que tu código
  const user = global.db.data.users[m.sender];
  if (!user || !user.lastSCSearch) {
    return false;
  }
  
  // Verificar tiempo de expiración (10 minutos igual que tu código)
  const currentTime = Date.now();
  const searchTime = user.lastSCSearch.timestamp || 0;
  
  if (currentTime - searchTime > 10 * 60 * 1000) {
    await conn.reply(m.chat, '⏰ La búsqueda ha expirado. Por favor realiza una nueva búsqueda.', m);
    user.lastSCSearch = null;
    return false;
  }
  
  // Si el usuario dice "no"
  if (text === 'no') {
    await conn.reply(m.chat, '👋 *Descarga cancelada*', m);
    user.lastSCSearch = null;
    return true;
  }
  
  // Si el usuario dice "si" - proceder con la descarga
  const { url, title } = user.lastSCSearch;
  
  try {
    await conn.reply(m.chat, `⬇️ *Descargando audio...*\n\n🎵 ${title}`, m);
    
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
    console.error("Error enviando audio:", error);
    await conn.reply(m.chat, 
      `❌ *ERROR DE DESCARGA*\n\n${error.message}`, 
      m
    );
  }
  
  // Limpiar cache
  user.lastSCSearch = null;
  return true;
};

handler.command = ['soundcloud', 'sc', 'scloud'];
handler.help = ['soundcloud <enlace>', 'sc <enlace>', 'scloud <enlace>'];
handler.tags = ['downloader'];

export default handler;
