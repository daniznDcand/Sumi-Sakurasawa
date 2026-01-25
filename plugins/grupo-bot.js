let handler = async (m, { conn, args, isROwner, usedPrefix }) => {
    if (!isROwner) return dfail('owner', m, conn)

    const action = (args[0] || '').toLowerCase()
    if (!action || (action !== 'on' && action !== 'off')) {
        return conn.reply(m.chat, `💙 Usa:\n\n> » *${usedPrefix}bot on* (activar)\n> » *${usedPrefix}bot off* (desactivar)`, m, global.rcanal)
    }

    const chat = global.getChat ? global.getChat(m.chat) : global.db.data.chats[m.chat]
    if (action === 'on') {
        chat.isBanned = false
        if (isROwner) {
            await conn.reply(m.chat, '💙 Bot activo en este grupo.', m, global.rcanal)
        }
        await m.react('✅')
        return true
    }

    chat.isBanned = true
    if (isROwner) {
        await conn.reply(m.chat, '💙 El bot fue desactivado en este grupo.', m, global.rcanal)
    }
    await m.react('✅')
}

handler.help = ['bot']
handler.tags = ['group']
handler.command = ['bot']
handler.group = true
handler.register = true

export default handler
