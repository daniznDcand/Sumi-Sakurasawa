
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'


const AUDIO_CONFIG = {
    
    'a': 'https://files.catbox.moe/11rn0c.mp3',
    'buenos': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-10.mp3',
    'buenas': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-09.mp3',
    
   
    'wow': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-06.mp3',
    'genial': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-05.mp3',
    'increible': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-04.mp3',
    
   
    'adios': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-03.mp3',
    'chao': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-02.mp3',
    'bye': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-01.mp3',
    
    
    'jaja': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-08.mp3',
    'lol': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-11.mp3',
    'xd': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-12.mp3',
    
    
    'triste': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-13.mp3',
    'feliz': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-14.mp3',
    'enojado': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-15.mp3',
    
  
    'si': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-16.mp3',
    'no': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-17.mp3',
    'talvez': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-18.mp3',
    
    
    'miku': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-19.mp3',
    'bot': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-20.mp3',
    'help': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-21.mp3'
};

const CONFIG_FILE = './tmp/audio_words_config.json';

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
};


function loadConfig() {
    try {
        if (existsSync(CONFIG_FILE)) {
            const data = readFileSync(CONFIG_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error cargando config de audios:', error);
    }
    return { enabledGroups: {} };
}

function saveConfig(config) {
    try {
        
        const dir = './tmp';
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        
        writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error guardando config de audios:', error);
    }
}


handler.all = true; 
handler.priority = 5; 

export default handler;
export { AUDIO_CONFIG, loadConfig, saveConfig };