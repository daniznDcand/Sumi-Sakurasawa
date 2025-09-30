

import { AUDIO_CONFIG } from './_audios.js';
import fs from 'fs';

let handler = async (m, { conn }) => {
    
    if (!m.isGroup) return;
    
    const groupId = m.chat;
    
    
    let config = {};
    try {
        const configPath = './tmp/audios_config.json';
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        config = { enabledWords: [], blockedWords: [] };
    }
    
    
    if (!config.enabledWords || !config.enabledWords.includes(groupId)) {
        return; 
    }
    
    
    const messageText = (m.text || '').trim();
    
    if (!messageText) return;
    
    
    const words = messageText.split(/\s+/);
    
    for (const rawWord of words) {
        
        const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase();
        
        
        if (AUDIO_CONFIG[cleanWord]) {
            try {
                console.log(`🎵 Palabra detectada: "${cleanWord}" en grupo ${groupId}`);
                
                
                await conn.sendMessage(m.chat, {
                    audio: { url: AUDIO_CONFIG[cleanWord] },
                    mimetype: 'audio/mp4',
                    ptt: true, 
                    fileName: `${cleanWord}.mp3`,
                    waveform: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                });
                
                
                break;
                
            } catch (error) {
                console.error(`Error enviando audio para "${cleanWord}":`, error);
            }
        }
    }
};


handler.all = true; 
handler.priority = 5; 

export default handler;