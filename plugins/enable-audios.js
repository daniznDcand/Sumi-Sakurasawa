let handler = async (m, { conn, args, isAdmin, isOwner }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);
    }

    if (!isAdmin && !isOwner) {
        return conn.reply(m.chat, '❌ Solo administradores pueden usar este comando.', m);
    }

    const action = args[0]?.toLowerCase();
    const feature = args[1]?.toLowerCase();
    
    // Verificar que sea el comando correcto para audios
    if (action === 'enable' && feature === 'audios') {
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = {};
        }
        global.db.data.chats[m.chat].audios = true;
        return conn.reply(m.chat, '✅ *AUDIOS AUTOMÁTICOS ACTIVADOS*\n\n🎵 Ahora cuando escriban palabras específicas se enviarán audios automáticamente.\n\n💡 Usa `menu2` para ver las palabras disponibles.', m);
    }
    
    if (action === 'disable' && feature === 'audios') {
        if (!global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat] = {};
        }
        global.db.data.chats[m.chat].audios = false;
        return conn.reply(m.chat, '❌ *AUDIOS AUTOMÁTICOS DESACTIVADOS*\n\n🔇 Ya no se enviarán audios automáticamente por palabras.', m);
    }
    
    // Mostrar ayuda si no es el comando correcto
    const estadoActual = global.db.data.chats[m.chat]?.audios ? '🟢 ACTIVADO' : '🔴 DESACTIVADO';
    return conn.reply(m.chat, `🎵 *GESTIÓN DE AUDIOS AUTOMÁTICOS*\n\n📋 *Uso:*\n• \`enable audios\` - Activar audios automáticos\n• \`disable audios\` - Desactivar audios automáticos\n\n📊 *Estado actual:* ${estadoActual}`, m);
};

handler.help = ['enable', 'disable'];
handler.tags = ['enable'];
handler.command = ['enable', 'disable'];
handler.group = true;
handler.admin = true;

export default handler;