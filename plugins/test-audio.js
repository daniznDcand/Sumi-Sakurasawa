import { AUDIO_CONFIG } from './menu-audios.js';

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, '❌ Uso: .testaudio <palabra>\n\nEjemplo: .testaudio depool', m);
    }
    
    const palabra = text.toLowerCase().trim();
    const url = AUDIO_CONFIG[palabra];
    
    if (!url) {
        const palabrasDisponibles = Object.keys(AUDIO_CONFIG).join(', ');
        return conn.reply(m.chat, `❌ No existe audio para "${palabra}"\n\n📝 Palabras disponibles:\n${palabrasDisponibles}`, m);
    }
    
    try {
        await conn.reply(m.chat, `🎵 Probando audio para "${palabra}"...\nURL: ${url}`, m);
        
        
        await conn.sendMessage(m.chat, {
            audio: { url: url },
            mimetype: 'audio/mpeg',
            ptt: true,
            fileName: `${palabra}.mp3`,
            seconds: 10,
            waveform: [100,50,100,50,100,50,100,50,100,50,100,50,100,50,100,50,100,50,100,50]
        }, { quoted: m });
        
        await conn.reply(m.chat, `✅ Audio enviado correctamente para "${palabra}"`, m);
        
    } catch (error) {
        console.error('Error enviando audio de prueba:', error);
        await conn.reply(m.chat, `❌ Error enviando audio: ${error.message}`, m);
    }
};

handler.help = ['testaudio'];
handler.tags = ['test'];
handler.command = ['testaudio'];

export default handler;