import fetch from "node-fetch";

// Sistema de cache
const soundcloudCache = {};
const cacheTimeout = 10 * 60 * 1000;

// Función para obtener datos de SoundCloud
const fetchSoundCloud = async (url) => {
  try {
    const apiUrl = `https://api.delirius.store/download/soundcloud?url=${encodeURIComponent(url)}`;
    console.log(`Consultando API: ${apiUrl}`);
    
    let response = await fetch(apiUrl);
    let data = await response.json();
    
    console.log("Respuesta API:", JSON.stringify(data, null, 2));
    
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
  console.log(`Comando recibido: ${command}, Texto: ${text}`);
  
  try {
    // Reaccionar al mensaje con emoji inmediatamente
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

    if (!text || !text.trim()) {
      return conn.reply(m.chat, 
        `🎵 *DESCARGAR DE SOUNDCLOUD*\n\n✨ *Uso:* ${usedPrefix}soundcloud [enlace]\n\n📝 *Ejemplo:*\n${usedPrefix}soundcloud https://soundcloud.com/twice-57013/one-spark\n\n⚠️ *Solo enlaces de SoundCloud*`, 
        m
      );
    }

    // Validar que sea un enlace de SoundCloud
    if (!text.includes('soundcloud.com')) {
      return conn.reply(m.chat, 
        `❌ *ENLACE INVÁLIDO*\n\nDebe ser un enlace de SoundCloud.\n\n✅ *Correcto:*\nhttps://soundcloud.com/usuario/cancion\n\n❌ *Incorrecto:*\n${text}`, 
        m
      );
    }

    // Mensaje de procesamiento
    const processingMsg = await conn.sendMessage(m.chat, { 
      text: `⏳ *PROCESANDO...*\n\n🔗 Enlace: ${text}\n\nPor favor espera, esto puede tomar unos segundos...` 
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
        `❌ *ERROR DE DESCARGA*\n\nNo se pudo obtener la información.\n\n🔍 *Posibles causas:*\n• Enlace privado/eliminado\n• Error temporal de API\n• Formato no compatible\n\n✨ *Intenta con otro enlace*`, 
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

    // Reacción de éxito
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "✅",
          key: m.key
        }
      });
    } catch {}

    // Guardar en cache
    soundcloudCache[m.sender] = {
      title: title,
      url: url,
      timestamp: Date.now(),
      chatId: m.chat
    };

    console.log(`Cache guardado para ${m.sender}:`, soundcloudCache[m.sender]);

    // Enviar mensaje
    try {
      if (thumbnail) {
        const thumb = (await conn.getFile(thumbnail))?.data;
        await conn.sendMessage(m.chat, {
          image: thumb,
          caption: infoMessage,
          footer: `🎵 Usa: ${usedPrefix}soundcloud [enlace]`,
        }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, {
          text: infoMessage,
          footer: `🎵 Usa: ${usedPrefix}soundcloud [enlace]`,
        }, { quoted: m });
      }
    } catch (error) {
      console.log("Error enviando mensaje:", error);
      await conn.sendMessage(m.chat, {
        text: infoMessage,
        footer: `🎵 Usa: ${usedPrefix}soundcloud [enlace]`,
      }, { quoted: m });
    }

  } catch (error) {
    console.error("Error en handler:", error);
    
    try {
      await conn.sendMessage(m.chat, {
        react: {
          text: "💥",
          key: m.key
        }
      });
    } catch {}
    
    await conn.reply(m.chat, 
      `💥 *ERROR CRÍTICO*\n\n${error.message}\n\n🔧 Por favor, intenta más tarde.`, 
      m
    );
  }
};

// Handler para respuestas
export async function all(m, { conn, usedPrefix }) {
  try {
    // Si es un mensaje normal (no comando)
    if (m.isBaileys || !m.text) return;
    
    const text = m.text.toLowerCase().trim();
    const sender = m.sender;
    
    console.log(`Mensaje recibido de ${sender}: ${text}`);
    console.log(`Cache disponible:`, soundcloudCache[sender]);
    
    // Verificar si el usuario tiene cache activo
    if (soundcloudCache[sender]) {
      const cacheData = soundcloudCache[sender];
      
      // Verificar si el cache expiró
      if (Date.now() - cacheData.timestamp > cacheTimeout) {
        delete soundcloudCache[sender];
        console.log(`Cache expirado para ${sender}`);
        return;
      }
      
      // Procesar respuesta "si" o "no"
      if (text === 'si' || text === 'sí' || text === 'yes') {
        console.log(`Usuario ${sender} confirmó descarga`);
        
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
          `⬇️ *DESCARGANDO...*\n\n🎵 ${title}\n\n⏳ Por favor espera...`, 
          m
        );

        try {
          // Enviar el audio
          await conn.sendMessage(m.chat, {
            audio: { url: url },
            mimetype: 'audio/mpeg',
            fileName: `${title.substring(0, 50)}.mp3`.replace(/[^\w\s.-]/gi, ''),
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
            text: `✨ *¡DESCARGA COMPLETADA!*\n\n🎧 ${title}\n\n✅ Audio descargado exitosamente` 
          });

        } catch (error) {
          console.error("Error enviando audio:", error);
          await conn.reply(m.chat, 
            `❌ *ERROR DE DESCARGA*\n\n${error.message}`, 
            m
          );
        }
        
        // Limpiar cache
        delete soundcloudCache[sender];
        console.log(`Cache limpiado para ${sender}`);
        
      } else if (text === 'no') {
        console.log(`Usuario ${sender} canceló descarga`);
        
        try {
          await conn.sendMessage(m.chat, {
            react: {
              text: "👋",
              key: m.key
            }
          });
        } catch {}
        
        await conn.reply(m.chat, 
          `👋 *DESCARGA CANCELADA*\n\nUsa ${usedPrefix}soundcloud para otra canción`, 
          m
        );
        
        // Limpiar cache
        delete soundcloudCache[sender];
        console.log(`Cache limpiado para ${sender}`);
      }
    }
  } catch (error) {
    console.error("Error en handler all:", error);
  }
}

handler.command = ['soundcloud', 'sc', 'scloud'];
handler.help = ['soundcloud <enlace>', 'sc <enlace>', 'scloud <enlace>'];
handler.tags = ['downloader'];
handler.premium = false;
handler.limit = true;

export default handler;
