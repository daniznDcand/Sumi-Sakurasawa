import { AUDIO_CONFIG } from './_audios.js';

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, 'Uso: .testaudio <palabra>\n\nEjemplo: .testaudio a', m);
    }
    
    const palabra = text.toLowerCase().trim();
    const url = AUDIO_CONFIG[palabra];
    
    if (!url) {
        return conn.reply(m.chat, `❌ No hay audio configurado para la palabra "${palabra}"`, m);
    }
    
    try {
        await conn.reply(m.chat, `🎵 Probando audio para "${palabra}"...\nURL: ${url}`, m);
        
        await conn.sendMessage(m.chat, {
            audio: { url: url },
            mimetype: 'audio/mp4',
            ptt: true,
            fileName: `${palabra}.mp3`,
            waveform: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        });
        
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