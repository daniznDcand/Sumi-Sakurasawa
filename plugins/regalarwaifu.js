let handler = async (m, { conn, args }) => {
    const from = m.sender;
    const to = (m.mentionedJid && m.mentionedJid[0]) || (args[0] && (args[0].includes('@') ? args[0] : args[0] + '@s.whatsapp.net'));
    if (!to) return m.reply('Debes mencionar a quién quieres regalar tu waifu. Ejemplo: .regalarwaifu @usuario <índice|nombre>');
    if (from === to) return m.reply('No puedes regalarte una waifu a ti mismo.');
    global.db.waifu = global.db.waifu || {};
    global.db.waifu.collection = global.db.waifu.collection || {};

    // Asegurar estructura de usuarios destino
    if (!global.db.data) global.db.data = {};
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[to]) global.db.data.users[to] = {};

    // Selección: args[1..] puede ser índice o nombre (soporta nombres con espacios)
    let selector = args.slice(1).join(' ').trim();
    const normalize = (s) => (s || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
    let selected = null;

    // Preferir colección si existe
    const col = global.db.waifu.collection[from] || [];
    if (selector) {
        const idx = parseInt(selector);
        if (!isNaN(idx)) selected = col[idx - 1];
        else {
            const normSel = normalize(selector);
            selected = col.find(w => w.name && normalize(w.name) === normSel) || col.find(w => w.name && normalize(w.name).includes(normSel));
        }
    }

    // Si no seleccionó nada y tiene colección, tomar la primera
    if (!selected && col.length > 0) selected = col[0];

    // Fallback: slot único
        let selector = args.slice(1).join(' ').trim();
        const normalize = (s) => (s || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
        let selected = null;
        delete global.db.waifu.waifus[from];
        // Preferir colección si existe
        const col = global.db.waifu.collection[from] || [];
        if (selector) {
            const idx = parseInt(selector);
            if (!isNaN(idx)) selected = col[idx - 1];
            else {
                const normSel = normalize(selector);
                selected = col.find(w => w.name && normalize(w.name) === normSel) || col.find(w => w.name && normalize(w.name).includes(normSel));
            }
        }
    }

    await conn.reply(m.chat, `🎁 Has regalado ${selected.name} a @${to.split('@')[0]}!`, m, { mentions: [to] });
};

handler.help = ['regalarwaifu @usuario'];
handler.tags = ['rpg'];
handler.command = ['regalarwaifu'];
handler.register = true;
handler.group = true;

export default handler;
    global.db.waifu.waifus = global.db.waifu.waifus || {};
    global.db.data = global.db.data || {};
    global.db.data.users = global.db.data.users || {};
    if (!global.db.data.users[to]) global.db.data.users[to] = {};
