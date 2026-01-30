import fetch from "node-fetch";

// Sistema de cache
const soundcloudCache = {};
const cacheTimeout = 10 * 60 * 1000;

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
        `🎵 *Descarga de SoundCloud*\nPor favor, ingresa el enlace de SoundCloud.\n\n💡 *Ejemplo:* ${usedPrefix}soundcloud https://soundcloud.com/twice-57013/one-spark`, 
        m
      );
    }

    // Validar que sea un enlace de SoundCloud
    if (!text.includes('soundcloud.com')) {
      return conn.reply(m.chat, 
        `❌ *Enlace inválido*\nPor favor, ingresa un enlace válido de SoundCloud.\n\n💡 *Ejemplo:* ${usedPrefix}soundcloud https://soundcloud.com/usuario/cancion`, 
        m
      );
    }

    // Mensaje de procesamiento
    await conn.sendMessage(m.chat, { 
      text: `🔍 *Procesando enlace de SoundCloud...*\nPor favor espera.` 
    }, { quoted: m });

    // Obtener datos de SoundCloud
    const soundcloudData = await fetchSoundCloud(text);
    
    if (!soundcloudData.success) {
      return conn.reply(m.chat, 
        `❌ *Error al procesar*\nNo se pudo obtener información del enlace.\n\nError: ${soundcloudData.error}`, 
        m
      );
    }

    const { title, thumbnail, duration, uploader, url, formats } = soundcloudData;

    // Formatear duración si está en segundos
    let formattedDuration = duration;
    if (!isNaN(duration) && duration > 0) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Mostrar información de la canción
    const infoMessage = `
🎧 *INFORMACIÓN DE SOUNDCLOUD*

📌 *Título:* ${title}
⏱️ *Duración:* ${formattedDuration}
🎤 *Subido por:* ${uploader}
🔗 *Formato:* MP3

⚠️ *Responder con "SI" para descargar*`;

    // Guardar información en cache
    soundcloudCache[m.sender] = {
      title: title,
      url: url,
      timestamp: Date.now()
    };

    // Enviar mensaje con imagen si está disponible
    if (thumbnail) {
      try {
        const thumb = (await conn.getFile(thumbnail))?.data;
        await conn.sendMessage(m.chat, {
          image: thumb,
          caption: infoMessage
        }, { quoted: m });
      } catch {
        await conn.sendMessage(m.chat, {
          text: infoMessage
        }, { quoted: m });
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: infoMessage
      }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { 
      text: `💥 *Error*\n${error.message}\n\nPor favor, verifica el enlace e intenta nuevamente.` 
    }, { quoted: m });
  }
};

// Handler para procesar respuesta "SI"
handler.before = async (m, { conn }) => {
  // Solo procesar si es respuesta a un mensaje del bot
  if (!m.quoted || !m.quoted.text.includes("INFORMACIÓN DE SOUNDCLOUD")) return;

  const userInput = m.text.toLowerCase().trim();

  if (userInput !== 'si') {
    return conn.reply(m.chat, 
      `❌ *Respuesta incorrecta*\nSolo responde con "SI" para confirmar la descarga.`, 
      m
    );
  }

  // Verificar cache
  if (!soundcloudCache[m.sender] || Date.now() - soundcloudCache[m.sender].timestamp > cacheTimeout) {
    delete soundcloudCache[m.sender];
    return conn.reply(m.chat, 
      "❌ *La sesión expiró*\nPor favor, ingresa el enlace nuevamente.", 
      m
    );
  }

  const { title, url } = soundcloudCache[m.sender];

  try {
    // Mensaje de descarga
    await conn.reply(m.chat, 
      '⬇️ *Descargando audio de SoundCloud...*\nPor favor espera, esto puede tomar unos segundos.', 
      m
    );

    // Enviar el audio
    await conn.sendMessage(m.chat, {
      audio: { url: url },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m });

    // Mensaje de confirmación
    await conn.sendMessage(m.chat, { 
      text: `✅ *¡Descarga completada!*\n\n🎵 ${title}\n\n¡Disfruta de la música! 🎧` 
    }, { quoted: m });

    // Limpiar cache
    delete soundcloudCache[m.sender];

  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, 
      `❌ *Error en la descarga*\n${error.message}\n\nIntenta nuevamente con otro enlace.`, 
      m
    );
  }
};

handler.command = handler.help = ['soundcloud', 'sc', 'scloud'];
handler.tags = ['downloader'];

export default handler;
