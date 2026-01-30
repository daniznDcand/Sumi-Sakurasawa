import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
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

const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `*🎵 Por favor, ingresa un enlace de SoundCloud.*\n> *\`Ejemplo:\`* ${usedPrefix + command} https://soundcloud.com/twice-57013/one-spark`;

  // Validar que sea un enlace de SoundCloud
  if (!text.includes('soundcloud.com')) throw '⚠️ *Debes ingresar un enlace válido de SoundCloud.*';

  // Procesar enlace
  const soundcloudData = await fetchSoundCloud(text);
  
  if (!soundcloudData.success) throw `❌ *Error al procesar el enlace:* ${soundcloudData.error}`;

  const { title, thumbnail, duration, uploader, url } = soundcloudData;

  // Formatear duración
  let formattedDuration = duration;
  if (!isNaN(duration) && duration > 0) {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Preparar imagen si existe
  let media = {};
  if (thumbnail) {
    try {
      media = await prepareWAMessageMedia(
        { image: { url: thumbnail } },
        { upload: conn.waUploadToServer }
      );
    } catch (e) {
      console.log("Error cargando imagen:", e.message);
    }
  }

  const interactiveMessage = {
    body: {
      text: `*${title}*\n\n≡ 🎤 *\`Artista:\`* ${uploader}\n≡ ⏱️ *\`Duración:\`* ${formattedDuration}\n≡ 🔗 *\`Enlace:\`* ${text}`
    },
    footer: { text: 'SoundCloud Downloader' },
    header: thumbnail && media.imageMessage ? {
      title: '```🎧 SOUNDCLOUD```',
      hasMediaAttachment: true,
      imageMessage: media.imageMessage
    } : {
      title: '```🎧 SOUNDCLOUD```',
      hasMediaAttachment: false
    },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: 'Opciones de descarga',
            sections: [{
              title: 'Formatos disponibles',
              rows: [
                {
                  header: title,
                  title: uploader,
                  description: `𝖣𝖾𝗌𝖼𝖺𝗋𝗀𝖺𝗋 𝖺𝗎𝖽𝗂𝗈 𝖬𝖯𝟥 | Duración: ${formattedDuration}`,
                  id: `.scmp3 ${url}`
                }
              ]
            }]
          })
        }
      ],
      messageParamsJson: ''
    }
  };

  const userJid = conn?.user?.jid || m.key.participant || m.chat;
  const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid, quoted: m });
  conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

// Handler para procesar el comando .scmp3 que envía el botón
handler.before = async (m, { conn }) => {
  if (!m.text || m.isBaileys) return;
  
  // Verificar si es el comando .scmp3 enviado por el botón
  if (m.text.startsWith('.scmp3 ')) {
    const url = m.text.split(' ')[1];
    
    try {
      await conn.reply(m.chat, `⬇️ *Descargando audio de SoundCloud...*`, m);
      
      // Enviar el audio directamente
      await conn.sendMessage(m.chat, {
        audio: { url: url },
        mimetype: 'audio/mpeg',
        fileName: 'soundcloud_audio.mp3',
        ptt: false
      }, { quoted: m });
      
      await conn.reply(m.chat, `✨ *¡Audio descargado exitosamente!*`, m);
      
    } catch (error) {
      console.error("Error descargando:", error);
      await conn.reply(m.chat, `❌ *Error al descargar:* ${error.message}`, m);
    }
    
    return true; // Indica que procesó el mensaje
  }
  
  return false;
};

handler.help = ['soundcloud'];
handler.tags = ['downloader'];
handler.command = /^(soundcloud|sc|scloud)$/i;

export default handler;
