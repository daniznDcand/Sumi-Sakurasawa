
const AUDIO_CONFIG = {
    // Saludos
    'depool': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-07a.mp3',
    'buenos': 'https://files.catbox.moe/wzl18t.mp3',
    'buenas': 'https://files.catbox.moe/h9j2k8.mp3',
    
    // Reacciones
    'wow': 'https://files.catbox.moe/p4x6r2.mp3',
    'genial': 'https://files.catbox.moe/m8v3q1.mp3',
    
    // Despedidas
    'adios': 'https://files.catbox.moe/l6n4h3.mp3',
    'chao': 'https://files.catbox.moe/t2y8x9.mp3',
    'bye': 'https://files.catbox.moe/r5u1z7.mp3',
    
    // Diversión
    'jaja': 'https://files.catbox.moe/f8d3c6.mp3',
    'lol': 'https://files.catbox.moe/g9e4b2.mp3',
    'xd': 'https://files.catbox.moe/j1k5v8.mp3',
    
    // Emociones
    'triste': 'https://files.catbox.moe/n7m2s4.mp3',
    'feliz': 'https://files.catbox.moe/q8p3x6.mp3',
    
    // Respuestas
    'si': 'https://files.catbox.moe/c5f9h8.mp3',
    'no': 'https://files.catbox.moe/v2b6n3.mp3',
    
    // Especiales
    'miku': 'https://files.catbox.moe/s8x1z5.mp3',
    'bot': 'https://files.catbox.moe/d6g9j4.mp3'
};

let handler = async (m, { conn }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, '❌ Este menú solo funciona en grupos.', m);
    }

    const isEnabled = global.db.data.chats[m.chat]?.audios || false;
    const status = isEnabled ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';

   
    const palabrasAudio = [
        'depool', 'buenos', 'buenas', 'wow', 'genial', 'adios', 
        'chao', 'bye', 'jaja', 'lol', 'xd', 'triste', 'feliz', 
        'si', 'no', 'miku', 'bot'
    ];

    let menuText = `🎵 *AUDIOS AUTOMÁTICOS HATSUNE MIKU*\n\n📊 *Estado:* ${status}\n\n`;
    
    
    menuText += `📝 *PALABRAS DISPONIBLES:*\n\n`;
    
    for (const palabra of palabrasAudio) {
        menuText += `💙 ${palabra}\n`;
    }

    menuText += `\n💡 Escribe UNA palabra sola para activar el audio\n`;

    if (!isEnabled) {
        menuText += `\n⚠️ *DESACTIVADO* - Admin: \`enable audios\``;
    } else {
        menuText += `\n✅ *ACTIVADO* - Para desactivar: \`disable audios\``;
    }

    
    try {
        await conn.sendMessage(m.chat, {
            image: { url: 'https://images4.alphacoders.com/694/thumb-1920-694718.png' },
            caption: menuText
        }, { quoted: m });
    } catch (error) {
        
        return conn.reply(m.chat, menuText, m);
    }
};

handler.help = ['menu2', 'menuaudios'];
handler.tags = ['menu'];
handler.command = ['menu2', 'menuaudios'];
handler.group = true;

export default handler;
export { AUDIO_CONFIG };