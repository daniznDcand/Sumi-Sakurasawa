import { AUDIO_CONFIG } from './_audios.js';
import fs from 'fs';

let handler = async (m, { conn }) => {
    
    if (!m.isGroup) return;
    
    const groupId = m.chat;
    console.log(`🔍 AUDIO DEBUG: Procesando mensaje en grupo ${groupId}`);
    
    
    let config = {};
    try {
        const configPath = './tmp/audios_config.json';
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`📄 Config cargada:`, config);
    } catch (error) {
        console.log(`❌ No hay archivo de configuración. Usa ".enable audios" primero.`);
        return;
    }
    
  
    if (!config.enabledWords || !config.enabledWords.includes(groupId)) {
        console.log(`❌ Audios NO habilitados para grupo ${groupId}`);
        console.log(`✅ Grupos habilitados:`, config.enabledWords);
        return; 
    }
    
    console.log(`✅ Audios HABILITADOS para grupo ${groupId}`);
    
    
    const messageText = (m.text || '').trim();
    console.log(`📝 Mensaje recibido: "${messageText}"`);
    
    if (!messageText) return;
    
    
    const words = messageText.split(/\s+/);
    console.log(`🔤 Palabras: [${words.join(', ')}]`);
    
    for (const rawWord of words) {
        
        const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
        console.log(`🧹 "${rawWord}" → "${cleanWord}"`);
        
       
        if (AUDIO_CONFIG[cleanWord]) {
            try {
                console.log(`🎵 ¡PALABRA ENCONTRADA! "${cleanWord}" tiene audio: ${AUDIO_CONFIG[cleanWord]}`);
                console.log('Intentando enviar audio:', AUDIO_CONFIG[cleanWord]);
                await conn.sendMessage(m.chat, {
                    audio: { url: AUDIO_CONFIG[cleanWord] },
                    mimetype: 'audio/mp4',
                    ptt: true, 
                    fileName: `${cleanWord}.mp3`,
                    waveform: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] 
                });
                console.log(`✅ Audio enviado exitosamente para "${cleanWord}"`);
                
                break;
            } catch (error) {
                console.error(`❌ Error enviando audio para "${cleanWord}":`, error && (error.stack || error.message || error));
            }
        } else {
            console.log(`❌ "${cleanWord}" NO está en AUDIO_CONFIG`);
        }
    }
};
handler.all = true; 
handler.priority = 5; 

export default handler;