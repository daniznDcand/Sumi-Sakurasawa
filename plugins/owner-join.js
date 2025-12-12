let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isOwner }) => {
    if (!text) return m.reply(`${emoji} Debes enviar una invitación para que *${botname}* se una al grupo.`);

    let [_, code] = text.match(linkRegex) || [];
    if (!code) return m.reply(`${emoji2} Enlace de invitación no válido.`);

    if (isOwner) {
        try {
            
            await conn.groupAcceptInvite(code);
            const groupJid = `${code}@g.us`;
            
           
            await m.reply(`${emoji} Me he unido exitosamente al grupo.`);
            
           
            await new Promise(resolve => setTimeout(resolve, 2000));
            
           
            await conn.sendMessage(groupJid, {
                video: { 
                    url: 'https://i.imgur.com/4ZubNrq.mp4' 
                },
                caption: '🎵 *¡HATSUNE MIKU HA LLEGADO!* 🎵',
                gifPlayback: false
            });
            
           
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            
            const welcomeMessage = `✨ *¡Hola a todos!* Soy Hatsune Miku, tu asistente virtual favorita.\n\n` +
            `💙 *Características:*\n` +
            `• Sistema de RPG y economía\n` +
            `• Juegos y entretenimiento\n` +
            `• Stickers personalizados\n` +
            `• Descarga de música y videos\n` +
            `• Y mucho más!\n\n` +
            `📌 *Comandos disponibles:*\n` +
            `- .menu - Muestra el menú de comandos\n` +
            `- .ayuda - Muestra la ayuda\n` +
            `- .reg - Regístrate para empezar\n\n` +
            `👨‍💻 *Creador:* DEPOOL\n` +
            `📱 *WhatsApp:* +51988514570 (Solo consultas importantes)\n\n` +
            `¡Disfruta de tu estadía en el grupo! 💙`;
            
            await conn.sendMessage(groupJid, {
                text: welcomeMessage,
                mentions: [m.sender]
            });
            
        } catch (err) {
            console.error('Error al unirse al grupo:', err);
            m.reply(`${msm} Error al unirme al grupo: ${err.message}`);
        }
    } else {
        let message = `${emoji} Invitación a un grupo:\n${text}\n\nPor: @${m.sender.split('@')[0]}`;
        await conn.sendMessage(`${suittag}@s.whatsapp.net`, { 
            text: message, 
            mentions: [m.sender] 
        }, { quoted: m });
        m.reply(`${emoji} El link del grupo ha sido enviado, gracias por tu invitación. ฅ^•ﻌ•^ฅ`);
    }
};

handler.help = ['invite'];
handler.tags = ['owner', 'tools'];
handler.command = ['invite', 'join'];

export default handler;