import { AUDIO_CONFIG, loadConfig } from './_audios.js';

let handler = async (m, { conn }) => {
    if (!m.isGroup) return;

    const groupId = m.chat;
    const config = loadConfig();
    
    
    if (!config.enabledGroups || !config.enabledGroups[groupId]) {
        return; 
    }

    
    const messageText = (m.text || '').toLowerCase().trim();
    
    if (!messageText) return;
    
    
    const words = messageText.split(/\s+/);
    
    for (const rawWord of words) {
        
        const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, '');
        
        
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
}
handler.all = true; 
handler.priority = 5; 

export default handler;