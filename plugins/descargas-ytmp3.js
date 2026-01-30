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
    // Reaccionar al mensaje con emoji
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "🔍",
          key: m.key
        }
      });
    } catch (error) {
      console.log("No se pudo enviar reacción:", error.message);
    }

    if (!text.trim()) {
      return conn.reply(m.chat, 
        `🎵 *Descarga de SoundCloud*\n\nPor favor, ingresa el enlace de SoundCloud.\n\n💡 *Ejemplo:* ${usedPrefix}soundcloud https://soundcloud.com/twice-57013/one-spark\n\n⚠️ *Solo enlaces de SoundCloud*`, 
        m
      );
    }

    // Validar que sea un enlace de SoundCloud
    if (!text.includes('soundcloud.com')) {
      return conn.reply(m.chat, 
        `❌ *Enlace inválido*\n\nPor favor, ingresa un enlace válido de SoundCloud.\n\n💡 *Ejemplo:* ${usedPrefix}soundcloud https://soundcloud.com/usuario/cancion\n\n🔗 Debe contener: soundcloud.com`, 
        m
      );
    }

    // Mensaje de procesamiento con reacción
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "⏳",
          key: m.key
        }
      });
    } catch {}

    const processingMsg = await conn.sendMessage(m.chat, { 
      text: `🎧 *Procesando enlace de SoundCloud...*\n\n⏳ Por favor espera unos segundos.\n\n🔗 *URL:* ${text}` 
    }, { quoted: m });

    // Obtener datos de SoundCloud
    const soundcloudData = await fetchSoundCloud(text);
    
    if (!soundcloudData.success) {
      // Reacción de error
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: "❌",
            key: m.key
          }
        });
      } catch {}
      
      return conn.reply(m.chat, 
        `❌ *Error al procesar*\n\nNo se pudo obtener información del enlace.\n\n🔍 *Posibles causas:*\n• El enlace es privado\n• La canción fue eliminada\n• Error temporal de la API\n\n⚠️ *Intenta con otro enlace*`, 
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

    // Mostrar información de la canción con botones
    const infoMessage = `
🎧 *INFORMACIÓN DE SOUNDCLOUD*

🎵 *Título:* ${title}
⏱️ *Duración:* ${formattedDuration}
👤 *Artista:* ${uploader}

⬇️ *¿Descargar esta canción?*

Selecciona una opción:
1. *AUDIO* 🎶 - Descargar como MP3
2. *CANCELAR* ❌ - Cancelar descarga

*Responde con el número de la opción*`;

    // Reacción de éxito
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "✅",
          key: m.key
        }
      });
    } catch {}

    // Guardar información en cache
    soundcloudCache[m.sender] = {
      title: title,
      url: url,
      timestamp: Date.now(),
      chatId: m.chat,
      messageId: processingMsg.key.id
    };

    // Enviar mensaje con imagen si está disponible
    if (thumbnail) {
      try {
        const thumb = (await conn.getFile(thumbnail))?.data;
        await conn.sendMessage(m.chat, {
          image: thumb,
          caption: infoMessage,
          footer: `✨ Usa ${usedPrefix}soundcloud [enlace] para otra descarga`,
          buttons: [
            { buttonId: '1', buttonText: { displayText: '🎶 DESCARGAR AUDIO' }, type: 1 },
            { buttonId: '2', buttonText: { displayText: '❌ CANCELAR' }, type: 1 }
          ],
          headerType: 1
        }, { quoted: m });
      } catch {
        await conn.sendMessage(m.chat, {
          text: infoMessage,
          footer: `✨ Usa ${usedPrefix}soundcloud [enlace] para otra descarga`,
          buttons: [
            { buttonId: '1', buttonText: { displayText: '🎶 DESCARGAR AUDIO' }, type: 1 },
            { buttonId: '2', buttonText: { displayText: '❌ CANCELAR' }, type: 1 }
          ]
        }, { quoted: m });
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: infoMessage,
        footer: `✨ Usa ${usedPrefix}soundcloud [enlace] para otra descarga`,
        buttons: [
          { buttonId: '1', buttonText: { displayText: '🎶 DESCARGAR AUDIO' }, type: 1 },
          { buttonId: '2', buttonText: { displayText: '❌ CANCELAR' }, type: 1 }
        ]
      }, { quoted: m });
    }

  } catch (error) {
    console.error(error);
    // Reacción de error
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "💥",
          key: m.key
        }
      });
    } catch {}
    
    await conn.sendMessage(m.chat, { 
      text: `💥 *Error inesperado*\n\n${error.message}\n\n🔧 *Solución:*\n1. Verifica tu conexión a internet\n2. Asegúrate que el enlace sea público\n3. Intenta nuevamente más tarde` 
    }, { quoted: m });
  }
};

// Handler para procesar respuestas (1 para descargar, 2 para cancelar)
handler.before = async (m, { conn, usedPrefix }) => {
  // Verificar si es una respuesta al comando soundcloud
  if (!m.quoted || !soundcloudCache[m.sender]) return;
  
  const userInput = m.text.toLowerCase().trim();
  const cacheData = soundcloudCache[m.sender];
  
  // Verificar si el cache expiró
  if (Date.now() - cacheData.timestamp > cacheTimeout) {
    delete soundcloudCache[m.sender];
    return conn.reply(m.chat, 
      "⏰ *Sesión expirada*\n\nPor favor, usa el comando nuevamente:\n" + usedPrefix + "soundcloud [enlace]", 
      m
    );
  }

  if (userInput === '1' || userInput === 'audio' || userInput === 'descargar') {
    try {
      // Reacción de procesamiento
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: "⬇️",
            key: m.key
          }
        });
      } catch {}
      
      const { title, url } = cacheData;
      
      await conn.reply(m.chat, 
        `⬇️ *Descargando audio...*\n\n🎵 *${title}*\n\n⏳ Esto puede tomar unos segundos...`, 
        m
      );

      // Enviar el audio
      await conn.sendMessage(m.chat, {
        audio: { url: url },
        mimetype: 'audio/mpeg',
        fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
        ptt: false
      }, { quoted: m });

      // Reacción de éxito
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: "✅",
            key: m.key
          }
        });
      } catch {}
      
      await conn.sendMessage(m.chat, { 
        text: `✨ *¡Descarga completada!*\n\n🎧 *${title}*\n\n✅ Audio descargado exitosamente\n\n💫 Usa ${usedPrefix}soundcloud para más descargas` 
      });

      // Limpiar cache
      delete soundcloudCache[m.sender];

    } catch (error) {
      console.error(error);
      try {
        await conn.sendMessage(m.chat, {
          react: {
            text: "❌",
            key: m.key
          }
        });
      } catch {}
      
      await conn.reply(m.chat, 
        `❌ *Error en la descarga*\n\n${error.message}\n\n🔗 Intenta con otro enlace de SoundCloud`, 
        m
      );
    }
    
  } else if (userInput === '2' || userInput === 'cancelar' || userInput === 'no') {
    // Reacción de cancelación
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "👋",
          key: m.key
        }
      });
    } catch {}
    
    await conn.reply(m.chat, 
      `👋 *Descarga cancelada*\n\nUsa ${usedPrefix}soundcloud [enlace] para otra canción`, 
      m
    );
    
    // Limpiar cache
    delete soundcloudCache[m.sender];
    
  } else if (m.quoted && soundcloudCache[m.sender]) {
    // Si responde con texto que no es 1 o 2
    await conn.reply(m.chat, 
      `❓ *Opción no válida*\n\nResponde con:\n• *1* o *audio* - Para descargar\n• *2* o *cancelar* - Para cancelar\n\nO usa ${usedPrefix}soundcloud [enlace] para empezar de nuevo`, 
      m
    );
  }
};

handler.command = handler.help = ['soundcloud', 'sc', 'scloud', 'sound'];
handler.tags = ['downloader'];

export default handler;
