export async function before(m, { conn }) {
  
  if (m.text === 'ir_canal_directo') {
    const canalUrl = 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
    
    try {
      await conn.sendMessage(m.chat, {
        text: '🎵 *CANAL OFICIAL DE HATSUNE MIKU* 🎵',
        contextInfo: {
          externalAdReply: {
            title: '🎵 Seguir Canal Oficial',
            body: '💙 Toca aquí para unirte al canal 💙',
            thumbnailUrl: 'https://files.catbox.moe/wm4w1x.jpg',
            sourceUrl: canalUrl,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    } catch (error) {
      
      await conn.sendMessage(m.chat, {
        text: `🎵 *CANAL OFICIAL*\n\n${canalUrl}\n\n💙 Únete al canal oficial de Hatsune Miku 💙`
      }, { quoted: m })
    }
    return false 
  }
  
  return true 
}