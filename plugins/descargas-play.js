import fetch from "node-fetch";
import yts from 'yt-search';
import axios from "axios";

const handler = async (m, { conn, text, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender];

  if (user.chocolates < 2) {
    return conn.reply(m.chat, `💙 No tienes suficientes *Cebollines 🌱* Necesitas 2 más para usar este comando.`, m);
  }

  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `💙 Ingresa el nombre de la música a descargar.`, m);
    }

    const search = await yts(text);
    if (!search.all || search.all.length === 0) {
      return m.reply('No se encontraron resultados para tu búsqueda.');
    }

    const videoInfo = search.all[0];
    if (!videoInfo) {
      return m.reply('No se pudo obtener información del video.');
    }

    const { title, thumbnail, timestamp, views, ago, url, author } = videoInfo;

    if (!title || !thumbnail || !timestamp || !views || !ago || !url || !author) {
      return m.reply('Información incompleta del video.');
    }

    const vistas = formatViews(views);
    const canal = author.name ? author.name : 'Desconocido';
    const infoMessage = `*𖹭.╭╭ִ╼࣪━ִﮩ٨ـﮩ💙𝗠𝗶𝗸𝘂𝗺𝗶𝗻🌱ﮩ٨ـﮩ━ִ╾࣪╮╮.𖹭*

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

    const buttons = [
      ['🎵 MP3 (Audio)', 'ytdl_audio_mp3'],
      ['🎬 MP4 (Video)', 'ytdl_video_mp4'],
      ['📁 MP3 Documento', 'ytdl_audio_doc'],
      ['📁 MP4 Documento', 'ytdl_video_doc']
    ];

    const footer = '🌱 Hatsune Miku Bot - YouTube';

    
    global.videoInfoCache = global.videoInfoCache || {};
    global.videoInfoCache[m.chat] = {
      url,
      title,
      thumbnail,
      timestamp,
      views: vistas,
      channel: canal,
      publishedTime: ago
    };

    try {
      await conn.sendButton(
        m.chat,
        infoMessage,
        footer,
        thumbnail || null,
        buttons,
        m
      );
    } catch (buttonError) {
      console.log('Error enviando botones, usando mensaje alternativo:', buttonError);
      
      const thumb = (await conn.getFile(thumbnail))?.data;
      const JT = {
        contextInfo: {
          externalAdReply: {
            title: botname,
            body: dev,
            mediaType: 1,
            previewType: 0,
            mediaUrl: url,
            sourceUrl: url,
            thumbnail: thumb,
            renderLargerThumbnail: true,
          },
        },
      };
      await conn.reply(m.chat, infoMessage + '\n\n*Para descargar responde con:*\n• *audio* - Para MP3\n• *video* - Para MP4\n• *doc* - Para documento', m, JT);
    }

    user.chocolates -= 2;
    conn.reply(m.chat, `💙 Has utilizado 2 *Cebollines 🌱*`, m);

  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error}`);
  }
};


handler.before = async (m, { conn }) => {
  
  const buttonId = m.selectedButtonId || m.butt || m.selectedId || 
                   (m.message?.buttonsResponseMessage?.selectedButtonId) ||
                   (m.message?.templateButtonReplyMessage?.selectedId);
  
  if (buttonId && global.videoInfoCache?.[m.chat]) {
    const chatInfo = global.videoInfoCache[m.chat];
    const { url, title } = chatInfo;
    
    if (buttonId === 'ytdl_audio_mp3') {
      try {
        await m.reply('⬇️ Descargando audio...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
        } else {
          m.reply(`❌ No se pudo descargar el audio de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando audio:', error);
        m.reply('❌ Error al descargar el audio.');
      }
      return false;
    }
    
    if (buttonId === 'ytdl_video_mp4') {
      try {
        await m.reply('⬇️ Descargando video...');
        const videoUrl = await getVideoUrl(url);
        
        if (videoUrl) {
          await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*`
          }, { quoted: m });
        } else {
          m.reply(`❌ No se pudo descargar el video de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando video:', error);
        m.reply('❌ Error al descargar el video.');
      }
      return false;
    }
    
    if (buttonId === 'ytdl_audio_doc') {
      try {
        await m.reply('⬇️ Descargando audio como documento...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            document: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
        } else {
          m.reply(`❌ No se pudo descargar el audio de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando audio como documento:', error);
        m.reply('❌ Error al descargar el audio como documento.');
      }
      return false;
    }
    
    if (buttonId === 'ytdl_video_doc') {
      try {
        await m.reply('⬇️ Descargando video como documento...');
        const videoUrl = await getVideoUrl(url);
        
        if (videoUrl) {
          await conn.sendMessage(m.chat, {
            document: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`
          }, { quoted: m });
        } else {
          m.reply(`❌ No se pudo descargar el video de: *${title}*\n\n🔗 *URL:* ${url}\n\n💌 Puedes intentar más tarde o usar esta URL en tu descargador favorito.`);
        }
      } catch (error) {
        console.error('Error descargando video como documento:', error);
        m.reply('❌ Error al descargar el video como documento.');
      }
      return false;
    }
  }
  
  
  if (m.text && global.videoInfoCache?.[m.chat]) {
    const chatInfo = global.videoInfoCache[m.chat];
    const { url, title } = chatInfo;
    const userResponse = m.text.toLowerCase().trim();
    
    if (userResponse === 'audio' || userResponse === 'mp3') {
      try {
        await m.reply('⬇️ Descargando audio...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
        } else {
          await m.reply('❌ No se pudo descargar el audio');
        }
      } catch (error) {
        console.error('Error descargando audio:', error);
        await m.reply('❌ Error al descargar el audio.');
      }
      return false;
    }
    
    if (userResponse === 'video' || userResponse === 'mp4') {
      try {
        await m.reply('⬇️ Descargando video...');
        const videoUrl = await getVideoUrl(url);
        
        if (videoUrl) {
          await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`,
            caption: `🎬 *${title}*`
          }, { quoted: m });
        } else {
          await m.reply('❌ No se pudo descargar el video');
        }
      } catch (error) {
        console.error('Error descargando video:', error);
        await m.reply('❌ Error al descargar el video.');
      }
      return false;
    }
    
    if (userResponse === 'doc' || userResponse === 'documento') {
      try {
        await m.reply('⬇️ Descargando como documento...');
        const audioUrl = await getAudioUrl(url);
        
        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            document: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
          }, { quoted: m });
        } else {
          await m.reply('❌ No se pudo descargar el documento');
        }
      } catch (error) {
        console.error('Error descargando documento:', error);
        await m.reply('❌ Error al descargar el documento.');
      }
      return false;
    }
  }
  
  return true; 
};


async function getAudioUrl(url) {
  console.log('🔍 Buscando URL de audio para:', url);
  
  
  try {
    const response = await fetch(`https://api.stellarwa.xyz/dow/ytmp3?url=${encodeURIComponent(url)}&apikey=Diamond`);
    const data = await response.json();
    
    if (data && data.data && data.data.dl) {
      console.log('✅ Audio obtenido con stellarwa.xyz');
      return data.data.dl;
    }
  } catch (error) {
    console.log('❌ Error con stellarwa.xyz:', error.message);
  }
  
  
  const result = await getAud(url);
  if (result && result.url) {
    console.log(`✅ Audio obtenido con ${result.api}`);
    return result.url;
  }

  
  console.log('❌ Todas las APIs de audio fallaron');
  return null;
}


async function getVideoUrl(url) {
  console.log('🔍 Buscando URL de video para:', url);
  
  
  try {
    const response = await fetch(`https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=Diamond`);
    const data = await response.json();
    
    if (data && data.data && data.data.dl) {
      console.log('✅ Video obtenido con stellarwa.xyz');
      return data.data.dl;
    }
  } catch (error) {
    console.log('❌ Error con stellarwa.xyz:', error.message);
  }
  
  
  const result = await getVid(url);
  if (result && result.url) {
    console.log(`✅ Video obtenido con ${result.api}`);
    return result.url;
  }
  

  
  console.log('❌ Todas las APIs de video fallaron');
  return null;
}


async function getAud(url) {
  const apis = [
    { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp3v2?url=${encodeURIComponent(url)}`, extractor: res => res.download_url }, 
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/ytmp3?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Delirius', endpoint: `${global.APIs.delirius.url}/download/ymp3?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url }
  ]
  return await fetchFromApis(apis)
}

async function getVid(url) {
  const apis = [
    { api: 'ZenzzXD', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'ZenzzXD v2', endpoint: `${global.APIs.zenzxz.url}/downloader/ytmp4v2?url=${encodeURIComponent(url)}`, extractor: res => res.download_url },
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url },
    { api: 'Delirius', endpoint: `${global.APIs.delirius.url}/download/ytmp4?url=${encodeURIComponent(url)}`, extractor: res => res.data?.download?.url }
  ]
  return await fetchFromApis(apis)
}

async function fetchFromApis(apis) {
  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (e) {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return null
}

handler.command = handler.help = ['play'];
handler.tags = ['downloader'];

export default handler;

function formatViews(views) {
  if (views === undefined) {
    return "No disponible";
  }

  if (views >= 1_000_000_000) {
    return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`;
  } else if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`;
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`;
  }
  return views.toString();
}