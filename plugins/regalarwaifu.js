let handler = async (m, { conn, args }) => {
    const from = m.sender;
    const to = (m.mentionedJid && m.mentionedJid[0]) || (args[0] && (args[0].includes('@') ? args[0] : args[0] + '@s.whatsapp.net'));
    if (!to) return m.reply('Debes mencionar a quién quieres regalar tu waifu. Ejemplo: .regalarwaifu @usuario');
    if (from === to) return m.reply('No puedes regalarte una waifu a ti mismo.');
    if (!global.db.waifu) global.db.waifu = {};
    if (!global.db.waifu.waifus || !global.db.waifu.waifus[from]) return m.reply('No tienes ninguna waifu para regalar.');
    // Asegurar estructura de usuarios destino
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[to]) global.db.data.users[to] = {};
    // Transferir
    global.db.waifu.waifus[to] = global.db.waifu.waifus[from];
    delete global.db.waifu.waifus[from];
    await conn.reply(m.chat, `🎁 Has regalado tu waifu a @${to.split('@')[0]}!`, m, { mentions: [to] });
};

handler.help = ['regalarwaifu @usuario'];
handler.tags = ['rpg'];
handler.command = ['regalarwaifu'];
handler.register = true;
handler.group = true;

export default handler;
