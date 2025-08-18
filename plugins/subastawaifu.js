let handler = async (m, { conn, args }) => {
    const owner = m.sender;
    const precio = parseInt(args[0]);
    global.db.waifu = global.db.waifu || {};
    global.db.waifu.collection = global.db.waifu.collection || {};
    if (!precio || precio <= 0) return m.reply('Debes indicar un precio inicial válido. Ejemplo: .subastawaifu 100');
    global.db.waifu.subastas = global.db.waifu.subastas || {};
    if (global.db.waifu.subastas[owner]) return m.reply('Ya tienes una subasta activa. Espera a que termine.');

    // Selección de waifu: args[1] puede ser índice o nombre
    let selector = args[1];
    const col = global.db.waifu.collection[owner] || [];
    let selected = null;
    if (selector) {
        const idx = parseInt(selector);
        if (!isNaN(idx)) selected = col[idx - 1];
        else selected = col.find(w => w.name && w.name.toLowerCase() === selector.toLowerCase());
    }
    if (!selected && col.length > 0) selected = col[0];
    if (!selected && global.db.waifu.waifus && global.db.waifu.waifus[owner]) selected = global.db.waifu.waifus[owner];
    if (!selected) return m.reply('No tienes ninguna waifu para subastar. Usa: .subastawaifu <precio> <índice|nombre>');

    // Crear subasta
    global.db.waifu.subastas[owner] = {
        owner,
        waifu: selected,
        fromCollection: !!col.length,
        precioInicial: precio,
        mejorPuja: 0,
        mejorPostor: null,
        start: Date.now(),
        timeout: null
    };
    // Mensaje inicial
    await conn.reply(m.chat, `🔨 Subasta iniciada por @${owner.split('@')[0]}\nWaifu: ${waifu.name}\nPrecio inicial: ${precio} ${global.db?.settings?.moneda || 'coin'}\nDuración: 60s\nUsa .pujarwaifu <cantidad> para pujar.`, m, { mentions: [owner] });
    // Finalizar subasta en 60s
    global.db.waifu.subastas[owner].timeout = setTimeout(async () => {
        const s = global.db.waifu.subastas[owner];
        if (!s) return;
    if (s.mejorPostor) {
            // Verificar fondos
            global.db.data = global.db.data || {};
            global.db.data.users = global.db.data.users || {};
            const winner = s.mejorPostor;
            const amount = s.mejorPuja;
            if (!global.db.data.users[winner] || (global.db.data.users[winner].coin || 0) < amount) {
                await conn.reply(m.chat, `⚠️ El ganador @${winner.split('@')[0]} ya no tiene suficientes monedas. Subasta cancelada.`, m, { mentions: [winner, s.owner] });
                delete global.db.waifu.subastas[owner];
                return;
            }
            // Transferir waifu y monedas
            global.db.waifu.collection[winner] = global.db.waifu.collection[winner] || [];
            global.db.waifu.collection[winner].push(s.waifu);
            // Eliminar de owner
            if (s.fromCollection && global.db.waifu.collection[s.owner]) {
                const pos = global.db.waifu.collection[s.owner].findIndex(w => w === s.waifu || (w.name && s.waifu.name && w.name === s.waifu.name));
                if (pos !== -1) global.db.waifu.collection[s.owner].splice(pos, 1);
            } else if (global.db.waifu.waifus && global.db.waifu.waifus[s.owner]) {
                delete global.db.waifu.waifus[s.owner];
            }
            global.db.data.users[winner].coin -= amount;
            global.db.data.users[s.owner].coin = (global.db.data.users[s.owner].coin || 0) + amount;
            await conn.reply(m.chat, `🏆 Subasta finalizada. Ganador: @${winner.split('@')[0]} por ${amount} ${global.db?.settings?.moneda || 'coin'}.`, m, { mentions: [winner, s.owner] });
        } else {
            await conn.reply(m.chat, `⏰ Subasta finalizada sin postores para la waifu de @${owner.split('@')[0]}.`, m, { mentions: [owner] });
        }
        clearTimeout(global.db.waifu.subastas[owner].timeout);
        delete global.db.waifu.subastas[owner];
    }, 60000);
};

handler.help = ['subastawaifu <precio>'];
handler.tags = ['rpg'];
handler.command = ['subastawaifu'];
handler.register = true;
handler.group = true;

export default handler;
