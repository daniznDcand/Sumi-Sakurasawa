let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
let pendingJoins = new Map(); 

let handler = async (m, { conn, text, isOwner }) => {
    if (!text) return m.reply(`${emoji} Debes enviar una invitación para que *${botname}* se una al grupo.`);

    let [_, code] = text.match(linkRegex) || [];
    if (!code) return m.reply(`${emoji2} Enlace de invitación no válido.`);

    const groupJid = `${code}@g.us`;
    const requester = m.sender;
    const requesterName = m.pushName || 'Usuario';

    if (isOwner) {
        
        await handleGroupJoin(conn, m, code, groupJid);
    } else {
        
        const requestId = Date.now().toString();
        pendingJoins.set(requestId, { code, groupJid, requester, requesterName });
        
        const approvalMessage = `📩 *Solicitud de unión a grupo*\n\n` +
            `👤 *Solicitante:* @${requester.split('@')[0]}\n` +
            `📝 *Nombre:* ${requesterName}\n\n` +
            `¿Deseas que el bot se una a este grupo?`;
        
        const buttons = [
            { buttonId: `approve_${requestId}`, buttonText: { displayText: '✅ Aprobar' }, type: 1 },
            { buttonId: `reject_${requestId}`, buttonText: { displayText: '❌ Rechazar' }, type: 1 }
        ];

        await conn.sendMessage(suittag + '@s.whatsapp.net', {
            text: approvalMessage,
            mentions: [requester],
            buttons: buttons,
            headerType: 1
        });

        m.reply(`${emoji} Se ha enviado una solicitud al propietario del bot. Por favor, espera la aprobación.`);
    }
};


export async function handleButtonResponse(conn, m, from, id, message) {
    if (!id.startsWith('approve_') && !id.startsWith('reject_')) return false;

    const requestId = id.split('_')[1];
    const request = pendingJoins.get(requestId);
    if (!request) return;

    const { code, groupJid, requester, requesterName } = request;

    if (id.startsWith('approve_')) {
        try {
            await m.reply('✅ *Aprobado*: El bot se unirá al grupo...');
            await handleGroupJoin(conn, m, code, groupJid, requester, requesterName);
        } catch (error) {
            console.error('Error al unirse al grupo:', error);
            await m.reply('❌ Ocurrió un error al intentar unirse al grupo.');
        }
    } else {
        await m.reply('❌ *Rechazado*: La solicitud de unión ha sido rechazada.');
        await conn.sendMessage(requester, {
            text: `❌ *Solicitud rechazada*\n\n` +
                  `El propietario ha rechazado tu solicitud para unir el bot al grupo.`
        });
    }

    pendingJoins.delete(requestId);
    return true;
}


async function handleGroupJoin(conn, m, code, groupJid, requester, requesterName) {
    try {
        await conn.groupAcceptInvite(code);
        
        
        if (m) {
            await m.reply(`${emoji} Me he unido exitosamente al grupo.`);
        }

        
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
            mentions: [requester || m?.sender]
        });

        
        if (requester) {
            await conn.sendMessage(requester, {
                text: `✅ *¡Solicitud aprobada!*\n\n` +
                      `El bot se ha unido exitosamente al grupo.`
            });
        }

    } catch (err) {
        console.error('Error al unirse al grupo:', err);
        const errorMsg = `❌ Error al unirse al grupo: ${err.message}`;
        if (m) await m.reply(errorMsg);
        if (requester) {
            await conn.sendMessage(requester, { text: errorMsg });
        }
    }
}

handler.help = ['invite'];
handler.tags = ['owner', 'tools'];
handler.command = ['invite', 'join'];

export default handler;