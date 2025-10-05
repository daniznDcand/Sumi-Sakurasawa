import { AUDIO_CONFIG } from './menu-audios.js';

let handler = async (m, { conn }) => {
   
    if (!m.isGroup) return;
    
    
    const audiosActivados = global.db.data.chats[m.chat]?.audios;
    console.log(`🔍 [AUDIO DEBUG] Grupo: ${m.chat} - Audios activados: ${audiosActivados}`);
    
    if (!audiosActivados) return;
    
    
    const texto = (m.text || '').trim();
    if (!texto) return;
    
    console.log(`🔍 [AUDIO DEBUG] Texto recibido: "${texto}"`);
    
   
    const palabras = texto.split(/\s+/);
    console.log(`🔍 [AUDIO DEBUG] Número de palabras: ${palabras.length}`);
    
    if (palabras.length !== 1) return; 
    
    
    const palabra = palabras[0].toLowerCase().replace(/[^\w]/g, '');
    console.log(`🔍 [AUDIO DEBUG] Palabra limpia: "${palabra}"`);
    console.log(`🔍 [AUDIO DEBUG] Existe en config: ${!!AUDIO_CONFIG[palabra]}`);
    
    
    if (!AUDIO_CONFIG[palabra]) return;
    
    try {
        console.log(`🎵 Enviando audio para palabra: "${palabra}" en grupo: ${m.chat}`);
        console.log(`🎵 URL del audio: ${AUDIO_CONFIG[palabra]}`);
        
       
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