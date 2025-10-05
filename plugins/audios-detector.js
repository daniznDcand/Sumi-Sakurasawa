import { AUDIO_CONFIG } from './menu-audios.js';

let handler = async (m, { conn }) => {
    
    if (!m.isGroup) return;
    
    
    if (!global.db.data.chats[m.chat]?.audios) return;
    
   
    const texto = (m.text || '').trim();
    if (!texto) return;
    
    
    const palabras = texto.split(/\s+/);
    if (palabras.length !== 1) return; 
    
   
    const palabra = palabras[0].toLowerCase().replace(/[^\w]/g, '');
    
    
    if (!AUDIO_CONFIG[palabra]) return;
    
    try {
        console.log(`🎵 Enviando audio para palabra: "${palabra}" en grupo: ${m.chat}`);
        
        
        await conn.sendMessage(m.chat, {
            audio: { url: AUDIO_CONFIG[palabra] },
            mimetype: 'audio/mp4',
            ptt: true, 
            fileName: `${palabra}.mp3`
        });
        
        console.log(`✅ Audio enviado exitosamente para: "${palabra}"`);
        
    } catch (error) {
        console.error(`❌ Error enviando audio para "${palabra}":`, error.message);
    }
};


handler.all = true;
handler.priority = 5;

export default handler;