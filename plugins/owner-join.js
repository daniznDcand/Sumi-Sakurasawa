let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
let pendingJoins = new Map(); 

let handler = async (m, { conn, text, isOwner, command }) => {
   
    if (m.message?.buttonsResponseMessage) {
        const buttonId = m.message.buttonsResponseMessage.selectedButtonId;
        if (buttonId && (buttonId.startsWith('approve_') || buttonId.startsWith('reject_'))) {
            return handleButtonResponse(conn, m, m.sender, buttonId, m);
        }
    }

    
    if (m.messageStubType === 20) { 
        const groupJid = m.key.remoteJid;
        console.log('Mensaje de unión detectado para el grupo:', groupJid);
        return; 
    }

    
    if (!/^invite|join$/i.test(command)) return; 

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

async function handleButtonResponse(conn, m, from, buttonId, message) {
    if (!buttonId) return false;
    if (!buttonId.startsWith('approve_') && !buttonId.startsWith('reject_')) return false;

    const requestId = buttonId.split('_')[1];
    const request = pendingJoins.get(requestId);
    if (!request) {
        await m.reply('❌ Error: Solicitud no encontrada o expirada.');
        return true;
    }

    const { code, groupJid, requester, requesterName } = request;

    try {
        if (buttonId.startsWith('approve_')) {
            await m.reply('✅ *Aprobado*: El bot se unirá al grupo...');
            await handleGroupJoin(conn, m, code, groupJid, requester, requesterName);
        } else {
            await m.reply('❌ *Rechazado*: La solicitud de unión ha sido rechazada.');
            if (requester) {
                await conn.sendMessage(requester, {
                    text: `❌ *Solicitud rechazada*\n\n` +
                          `El propietario ha rechazado tu solicitud para unir el bot al grupo.`
                });
            }
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        await m.reply('❌ Ocurrió un error al procesar la solicitud.');
    } finally {
        pendingJoins.delete(requestId);
    }
    return true;
}

async function handleGroupJoin(conn, m, code, groupJid, requester, requesterName) {
    try {
        console.log('Intentando unirse al grupo con código:', code);
        
        
        await conn.groupAcceptInvite(code);
        console.log('Invitación aceptada exitosamente');
        
        
        if (m) {
            await m.reply(`${emoji} Me he unido exitosamente al grupo.`);
        }

        
        const welcomeMessage = `🎵 *¡HATSUNE MIKU HA LLEGADO!* 🎵\n\n` +
            `✨ *¡Hola a todos!* Soy Hatsune Miku, tu asistente virtual favorita.\n\n` +
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

        console.log('Enviando mensaje de bienvenida al grupo:', groupJid);
        
        
        await conn.sendMessage(groupJid, {
            video: { 
                url: 'https://i.imgur.com/4ZubNrq.mp4' 
            },
            caption: welcomeMessage,
            gifPlayback: false,
            mentions: requester ? [requester] : []
        });

        console.log('Mensaje de bienvenida enviado correctamente');

    
        if (requester) {
            await conn.sendMessage(requester, {
                text: `✅ *¡Solicitud aprobada!*\n\n` +
                      `El bot se ha unido exitosamente al grupo.`
            });
        }

    } catch (err) {
        console.error('Error en handleGroupJoin:', err);
        const errorMsg = `❌ Error al unirse al grupo: ${err.message}`;
        if (m) await m.reply(errorMsg);
        if (requester) {
            await conn.sendMessage(requester, { text: errorMsg });
        }
        throw err;
    }
}


handler.event = 'group-participants-update';
handler.participant = async function(participants, action, { conn, isOwner }) {
    
    if (action === 'add' && participants.includes(conn.user.jid)) {
        console.log('El bot fue agregado a un grupo');
        
    }
};

handler.help = ['invite'];
handler.tags = ['owner', 'tools'];
handler.command = ['invite', 'join'];

export default handler;