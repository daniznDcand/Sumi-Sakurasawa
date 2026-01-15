import fetch from "node-fetch";

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
   
    const isNsfwChat = global.db.data.chats[m.chat]?.nsfw || false;
    
    if (!isNsfwChat) {
      return conn.reply(m.chat, `💙 Este comando solo se puede usar en chats habilitados para contenido NSFW.\n\n🌱 Usa ${usedPrefix}enable nsfw para habilitarlo en este grupo.`, m);
    }
    
    await conn.reply(m.chat, `💙 Buscando waifu NSFW... ⚡`, m);
    
    const API_KEY = 'Duarte-zz12';
    const apiUrl = `https://rest.alyabotpe.xyz/nsfw/waifu?key=${API_KEY}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    console.log(`📊 API response:`, JSON.stringify(data, null, 2));
    
    if (data.status && data.result) {
      const imageUrl = data.result;
      
      await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `💙 *Waifu NSFW*\n\n🌱 *Powered by Hatsune Miku Bot*`
      }, { quoted: m });
      
    } else {
      throw new Error(data.message || 'No se pudo obtener la imagen');
    }
    
  } catch (error) {
    console.error("Error en comando waifu:", error);
    await conn.reply(m.chat, `💙 Error al obtener la imagen: ${error.message}`, m);
  }
};

handler.command = ['waifu18', 'nsfwwaifu'];
handler.tags = ['nsfw'];
handler.help = ['waifu'];
handler.register = true;
handler.nsfw = true;

export default handler;
