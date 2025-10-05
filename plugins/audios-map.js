
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

let handler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, '❌ Este menú solo funciona en grupos.', m);
    }

    const groupId = m.chat;
    const config = loadConfig();
    const isEnabled = config.enabledGroups && config.enabledGroups[groupId];

    
    const status = isEnabled ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
    const adminInfo = (isAdmin || isOwner) ? 
        `\n🎛️ *CONTROLES DE ADMIN:*\n• \`.enable audios\` - Activar audios automáticos\n• \`.disable audios\` - Desactivar audios automáticos\n` : '';

    const audioCategories = {
        '👋 SALUDOS': ['a', 'hola', 'buenos', 'buenas'],
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