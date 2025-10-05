
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'


const AUDIO_CONFIG = {
    // Audios de saludo
    'a': 'https://files.catbox.moe/11rn0c.mp3',
    'hola': 'https://files.catbox.moe/azyvu9.mp3',
    'buenos': 'https://files.catbox.moe/wzl18t.mp3',
    'buenas': 'https://files.catbox.moe/h9j2k8.mp3',
    
    // Audios de reacciones
    'wow': 'https://files.catbox.moe/p4x6r2.mp3',
    'genial': 'https://files.catbox.moe/m8v3q1.mp3',
    'increible': 'https://files.catbox.moe/k7s9w5.mp3',
    
    // Audios de despedida
    'adios': 'https://files.catbox.moe/l6n4h3.mp3',
    'chao': 'https://files.catbox.moe/t2y8x9.mp3',
    'bye': 'https://files.catbox.moe/r5u1z7.mp3',
    
    // Audios divertidos
    'jaja': 'https://files.catbox.moe/f8d3c6.mp3',
    'lol': 'https://files.catbox.moe/g9e4b2.mp3',
    'xd': 'https://files.catbox.moe/j1k5v8.mp3',
    
    // Audios de emociones
    'triste': 'https://files.catbox.moe/n7m2s4.mp3',
    'feliz': 'https://files.catbox.moe/q8p3x6.mp3',
    'enojado': 'https://files.catbox.moe/w4z7y1.mp3',
    
    // Audios de respuestas
    'si': 'https://files.catbox.moe/c5f9h8.mp3',
    'no': 'https://files.catbox.moe/v2b6n3.mp3',
    'talvez': 'https://files.catbox.moe/i4o7k2.mp3',
    
    // Audios especiales
    'miku': 'https://files.catbox.moe/s8x1z5.mp3',
    'bot': 'https://files.catbox.moe/d6g9j4.mp3',
    'help': 'https://files.catbox.moe/e3h2l7.mp3'
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