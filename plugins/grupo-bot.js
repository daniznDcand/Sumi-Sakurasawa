let handler = async (m, { conn, args, isAdmin, isROwner, usedPrefix }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)

    const action = (args[0] || '').toLowerCase()
    if (!action || (action !== 'on' && action !== 'off')) {
        return conn.reply(m.chat, `💙 Usa:\n\n> » *${usedPrefix}bot on* (activar)\n> » *${usedPrefix}bot off* (desactivar)`, m, global.rcanal)
    }

    if (action === 'on') {
        global.db.data.chats[m.chat].isBanned = false
        await conn.reply(m.chat, '💙 Bot activo en este grupo.', m, global.rcanal)
        await m.react('✅')
        return
    }

    global.db.data.chats[m.chat].isBanned = true
    await conn.reply(m.chat, '💙 El bot fue desactivado en este grupo.', m, global.rcanal)
    await m.react('✅')
}

handler.help = ['bot']
handler.tags = ['group']
handler.command = ['bot']
handler.group = true
handler.register = true

export default handler
