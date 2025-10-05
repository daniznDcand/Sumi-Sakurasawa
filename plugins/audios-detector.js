import { AUDIO_CONFIG } from './menu-audios.js';

let handler = async (m, { conn }) => {
    
    if (!m.isGroup) return;
    
    
    if (m.fromMe) return;
    
    
    if (!global.db || !global.db.data || !global.db.data.chats) return;
    
    
    if (!global.db.data.chats[m.chat]) {
        global.db.data.chats[m.chat] = {};
    }
    
   
    const audiosActivados = global.db.data.chats[m.chat]?.audios;
    console.log(`🔍 [AUDIO DEBUG] Grupo: ${m.chat.slice(-10)} - Audios activados: ${audiosActivados}`);
    
    if (!audiosActivados) {
        console.log(`❌ [AUDIO DEBUG] Audios desactivados en este grupo`);
        return;
    }
    
  
    const texto = (m.text || '').trim();
    if (!texto) return;
    
    console.log(`🔍 [AUDIO DEBUG] Texto original: "${texto}"`);
    
    
    const palabras = texto.split(/\s+/);
    console.log(`🔍 [AUDIO DEBUG] Número de palabras: ${palabras.length}`);
    
    if (palabras.length !== 1) {
        console.log(`❌ [AUDIO DEBUG] Más de una palabra, ignorando mensaje`);
        return;
    }
    
    
    const palabraOriginal = palabras[0];
    const palabra = palabraOriginal.toLowerCase().replace(/[^\w]/g, '');
    
    console.log(`🔍 [AUDIO DEBUG] Palabra original: "${palabraOriginal}"`);
    console.log(`🔍 [AUDIO DEBUG] Palabra limpia: "${palabra}"`);
    console.log(`🔍 [AUDIO DEBUG] Existe en config: ${!!AUDIO_CONFIG[palabra]}`);
    
    if (AUDIO_CONFIG[palabra]) {
        console.log(`🔍 [AUDIO DEBUG] URL encontrada: ${AUDIO_CONFIG[palabra]}`);
    }
    
    
    if (!AUDIO_CONFIG[palabra]) {
        console.log(`❌ [AUDIO DEBUG] No existe audio para "${palabra}"`);
        console.log(`🔍 [AUDIO DEBUG] Palabras disponibles:`, Object.keys(AUDIO_CONFIG));
        return;
    }
    
    try {
        console.log(`🎵 [AUDIO DEBUG] Iniciando envío de audio para: "${palabra}"`);
        console.log(`🎵 [AUDIO DEBUG] URL del audio: ${AUDIO_CONFIG[palabra]}`);
        
        // Enviar el audio como nota de voz con configuración mejorada
        const audioMessage = await conn.sendMessage(m.chat, {
            audio: { url: AUDIO_CONFIG[palabra] },
            mimetype: 'audio/mpeg',
            ptt: true, 
            fileName: `${palabra}.mp3`,
            seconds: 10,
            waveform: [100,50,100,50,100,50,100,50,100,50,100,50,100,50,100,50,100,50,100,50]
        }, { quoted: m });
        
        console.log(`✅ [AUDIO DEBUG] Audio enviado exitosamente para: "${palabra}"`);
        console.log(`✅ [AUDIO DEBUG] Mensaje ID: ${audioMessage.key?.id}`);
        
    } catch (error) {
        console.error(`❌ [AUDIO DEBUG] Error enviando audio para "${palabra}":`, error);
        console.error(`❌ [AUDIO DEBUG] Error completo:`, error.stack);
    }
};


handler.all = true;
handler.priority = 5;

export default handler;