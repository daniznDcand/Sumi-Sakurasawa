import { loadConfig, saveConfig } from './_audios-menu.js';

let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);
    }

    if (!isAdmin && !isOwner) {
        return conn.reply(m.chat, '❌ Solo administradores pueden usar este comando.', m);
    }

    const groupId = m.chat;
    const config = loadConfig();

    if (!text || text.toLowerCase() !== 'audios') {
        return conn.reply(m.chat, `❌ Uso correcto: \`.${command} audios\``, m);
    }

    if (command === 'enable') {
        
        if (!config.enabledGroups) config.enabledGroups = {};
        config.enabledGroups[groupId] = true;
        saveConfig(config);
        
        return conn.reply(m.chat, '✅ *AUDIOS AUTOMÁTICOS ACTIVADOS*\n\n🎵 Ahora cuando alguien escriba palabras específicas se enviarán audios automáticamente.\n\n📋 Usa `.menu2` para ver todas las palabras disponibles.\n\n💡 Para desactivar usa `.disable audios`', m);
        
    } else if (command === 'disable') {
        
        if (config.enabledGroups && config.enabledGroups[groupId]) {
            delete config.enabledGroups[groupId];
            saveConfig(config);
        }
        
        return conn.reply(m.chat, '❌ *AUDIOS AUTOMÁTICOS DESACTIVADOS*\n\nYa no se enviarán audios automáticamente en este grupo.\n\n💡 Para reactivar usa `.enable audios`', m);
    }
};

handler.help = ['enable audios', 'disable audios'];
handler.tags = ['audio', 'admin'];
handler.command = ['enable', 'disable'];
handler.group = true;
handler.admin = true;

export default handler;