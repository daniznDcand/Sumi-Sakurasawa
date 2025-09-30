

import { AUDIO_CONFIG } from './_audios.js';
import fs from 'fs';

let handler = async (m, { conn }) => {
    
    if (!m.isGroup) return;
    
    const groupId = m.chat;
    
    
    let config = {};
    try {
        const configPath = './tmp/audios_config.json';
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.log('❌ Error leyendo config de audios:', error.message);
        config = { enabledWords: [], blockedWords: [] };
    }
    
   
    console.log('🔧 Config cargada:', JSON.stringify(config, null, 2));
    console.log('🆔 Group ID actual:', groupId);
    console.log('✅ Grupos habilitados:', config.enabledWords);
    
    
    if (!config.enabledWords || !config.enabledWords.includes(groupId)) {
        console.log('❌ Audios NO habilitados para este grupo');
        return; 
    }
    
    console.log('✅ Audios HABILITADOS para este grupo');
    
    
    const messageText = (m.text || '').trim();
    
    if (!messageText) {
        console.log('❌ Mensaje vacío');
        return;
    }
    
    console.log('📝 Mensaje recibido:', messageText);
    
    
    const words = messageText.split(/\s+/);
    console.log('🔤 Palabras detectadas:', words);
    
    for (const rawWord of words) {
        
        const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
        console.log(`🧹 Palabra limpia: "${rawWord}" → "${cleanWord}"`);
        
        
        if (AUDIO_CONFIG[cleanWord]) {
            try {
                console.log(`🎵 ¡PALABRA DETECTADA! "${cleanWord}" en grupo ${groupId}`);
                console.log(`🔗 URL del audio: ${AUDIO_CONFIG[cleanWord]}`);
                
               
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
                console.error(`❌ Error enviando audio para "${cleanWord}":`, error);
            }
        } else {
            console.log(`❌ Palabra "${cleanWord}" NO encontrada en AUDIO_CONFIG`);
        }
    }
};


handler.all = true; 
handler.priority = 5; 

export default handler;