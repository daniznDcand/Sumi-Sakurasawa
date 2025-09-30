
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'


const AUDIO_CONFIG = {
    // Audios de saludo
    'a': 'https://files.catbox.moe/11rn0c.mp3',
    'buenos': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-10.mp3',
    'buenas': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-09.mp3',
    
    // Audios de reacciones
    'wow': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-06.mp3',
    'genial': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-05.mp3',
    'increible': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-04.mp3',
    
    // Audios de despedida
    'adios': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-03.mp3',
    'chao': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-02.mp3',
    'bye': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-01.mp3',
    
    // Audios divertidos
    'jaja': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-08.mp3',
    'lol': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-11.mp3',
    'xd': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-12.mp3',
    
    // Audios de emociones
    'triste': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-13.mp3',
    'feliz': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-14.mp3',
    'enojado': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-15.mp3',
    
    // Audios de respuestas
    'si': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-16.mp3',
    'no': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-17.mp3',
    'talvez': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-18.mp3',
    
    // Audios especiales
    'miku': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-19.mp3',
    'bot': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-20.mp3',
    'help': 'https://www.soundjay.com/misc/sounds-for-mailers/beep-21.mp3'
};

const CONFIG_FILE = './tmp/audio_words_config.json';

let handler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, '❌ Este menú solo funciona en grupos.', m);
    }

    const groupId = m.chat;
    const config = loadConfig();
    const isEnabled = config.enabledGroups && config.enabledGroups[groupId];

    
    if (text && (text.toLowerCase() === 'enable' || text.toLowerCase() === 'disable')) {
        if (!isAdmin && !isOwner) {
            return conn.reply(m.chat, '❌ Solo administradores pueden activar/desactivar los audios.', m);
        }

        if (text.toLowerCase() === 'enable') {
            if (!config.enabledGroups) config.enabledGroups = {};
            config.enabledGroups[groupId] = true;
            saveConfig(config);
            return conn.reply(m.chat, '✅ *Audios automáticos ACTIVADOS*\n\nAhora cuando escriban palabras específicas se enviarán audios automáticamente.', m);
        } else {
            if (config.enabledGroups && config.enabledGroups[groupId]) {
                delete config.enabledGroups[groupId];
                saveConfig(config);
            }
            return conn.reply(m.chat, '❌ *Audios automáticos DESACTIVADOS*\n\nYa no se enviarán audios automáticamente.', m);
        }
    }

 // Mostrar menú principal
    const status = isEnabled ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
    const adminInfo = (isAdmin || isOwner) ? 
        `\n🎛️ *CONTROLES DE ADMIN:*\n• \`.menu2 enable\` - Activar audios automáticos\n• \`.menu2 disable\` - Desactivar audios automáticos\n` : '';

    const audioCategories = {
        '👋 SALUDOS': ['hola', 'buenos', 'buenas'],
        '😲 REACCIONES': ['wow', 'genial', 'increible'],
        '👋 DESPEDIDAS': ['adios', 'chao', 'bye'],
        '😄 DIVERSIÓN': ['jaja', 'lol', 'xd'],
        '😊 EMOCIONES': ['triste', 'feliz', 'enojado'],
        '✅ RESPUESTAS': ['si', 'no', 'talvez'],
        '🤖 ESPECIALES': ['miku', 'bot', 'help']
    };

    let menuText = `🎵 *MENÚ DE AUDIOS AUTOMÁTICOS*\n\n📊 *Estado:* ${status}\n\n`;

    for (const [category, words] of Object.entries(audioCategories)) {
        menuText += `${category}\n${words.map(w => `🔹 \`${w}\``).join(' • ')}\n\n`;
    }

    menuText += `💡 *¿Cómo funciona?*\n• Escribe cualquier palabra de la lista\n• Solo palabras exactas (no fragmentos)\n• Se envía audio automáticamente\n• Ejemplo: "hola amigos" ✅\n• Ejemplo: "holaaa" ❌\n${adminInfo}`;

    return conn.reply(m.chat, menuText, m);
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

handler.help = ['menu2', 'menuaudios'];
handler.tags = ['audio', 'menu'];
handler.command = ['menu2', 'menuaudios'];
handler.group = true;

export default handler;
export { AUDIO_CONFIG, loadConfig, saveConfig };