import fetch from 'node-fetch';

let handler = async (m, { text }) => {
  if (!text) {
    m.reply(`🎵 Por favor, proporciona el nombre de la canción o artista que deseas buscar en SoundCloud ✨`, m, global.miku);
    return true;
  }

  const apiUrl = `https://api.stellarwa.xyz/dl/soundcloudsearch?query=${encodeURIComponent(text)}&key=stellar-wCnAirJG`;

  try {
    const response = await fetch(apiUrl);
    const result = await response.json();

    if (!result.status || !result.result) {
      m.reply('🎶 No se encontraron resultados en SoundCloud 💫', m, global.miku);
      return true;
    }

    let replyMessage = `🔊 *Resultados de búsqueda en SoundCloud:*\n\n`;
    
    // Mostrar hasta 3 resultados
    const resultsToShow = result.result.slice(0, 3);
    
    resultsToShow.forEach((item, index) => {
      replyMessage += `🎵 *${index + 1}. ${item.title || 'Sin título'}*\n`;
      replyMessage += `👤 Artista: ${item.artist || 'Desconocido'}\n`;
      replyMessage += `⏱️ Duración: ${item.duration || 'Desconocida'}\n`;
      replyMessage += `🎶 Género: ${item.genre || 'No especificado'}\n`;
      replyMessage += `📅 Publicado: ${item.published || 'Fecha desconocida'}\n`;
      replyMessage += `🔗 URL: ${item.url || 'No disponible'}\n`;
      replyMessage += `💿 Tipo: ${item.type || 'Canción'}\n\n`;
    });

    m.react('🎶');

    m.reply(replyMessage);
  } catch (error) {
    console.error(`🎵 Error al realizar la solicitud a la API de SoundCloud:`, error);
    m.reply(`🎧 ¡Oops! Ocurrió un error al buscar en SoundCloud ✨`, m, global.miku);
  }
};

handler.command = ['soundcloud', 'scsearch'];
handler.tags = ['music'];
handler.help = ['soundcloud <texto>', 'scsearch <texto>'];
handler.register = true;

export default handler;
