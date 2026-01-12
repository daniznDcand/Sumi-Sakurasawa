import { igdl } from 'ruhend-scraper'
import fetch from 'node-fetch'

const handler = async (m, { text, conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `${emoji} Por favor, ingresa un enlace de Facebook.`, m)
  }

  await m.react(rwait)

  // Esperar a que las APIs estén disponibles
  await new Promise(resolve => {
    const checkInterval = setInterval(() => {
      if (global.facebookAPI && global.facebookAPI.url && global.facebookAPI.key) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });

  let res
  try {
    const facebookApiUrl = `${global.facebookAPI.url}?url=${encodeURIComponent(args[0])}&key=${global.facebookAPI.key}`;
    console.log('Consultando API de Facebook...');
    
    const apiResponse = await fetch(facebookApiUrl);
    const apiData = await apiResponse.json();
    
    if (!apiData || !apiData.status || apiData.status !== 200) {
      throw new Error(apiData.message || 'La API no respondió correctamente');
    }
    
    res = apiData.result || apiData.data;
  } catch (e) {
    console.error('Error API Facebook:', e)
    
    // Fallback al método original
    try {
      res = await igdl(args[0])
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError)
      await m.react(error)
      return conn.reply(m.chat, `${msm} Error al obtener datos. Verifica que el enlace sea válido y público.`, m)
    }
  }

  let result = res?.data
  if (!result || result.length === 0) {
    await m.react(error)
    return conn.reply(m.chat, `${emoji2} No se encontraron resultados. Asegúrate de que el contenido sea público.`, m)
  }

  try {
    for (let data of result) {
      if (!data || !data.url) continue

      const mediaUrl = data.url
      const isVideo = data.resolution || mediaUrl.includes('.mp4') || mediaUrl.includes('video')

      if (isVideo) {
        await conn.sendMessage(m.chat, { 
          video: { url: mediaUrl }, 
          caption: `💙 *Facebook Video*\n\n✨ Resolución: ${data.resolution || 'Auto'}\n\n🎵 Descargado por Hatsune Miku Bot`, 
          fileName: 'facebook.mp4', 
          mimetype: 'video/mp4' 
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { 
          image: { url: mediaUrl }, 
          caption: `💙 *Facebook Image*\n\n🎵 Descargado por Hatsune Miku Bot` 
        }, { quoted: m })
      }
    }
    
    await m.react(done)
  } catch (e) {
    console.error('Error al enviar:', e)
    await m.react(error)
    return conn.reply(m.chat, `${msm} Error al descargar el archivo. El enlace puede haber expirado o el contenido no está disponible.`, m)
  }
}

handler.help = ['facebook', 'fb']
handler.tags = ['descargas']
handler.command = ['facebook', 'fb']
handler.group = true;
handler.register = true;
handler.moneda = 2;

export default handler
