import { promises as fs } from 'fs';

// Asegúrate de que la base de datos global esté inicializada
if (!global.db) global.db = {};
if (!global.db.waifu) global.db.waifu = { cooldowns: {}, waifus: {}, collection: {}, cebollines: {} };

// REGALAR WAIFU
let regalarWaifu = async (m, { conn, args }) => {
    const userId = m.sender;
    const target = m.mentionedJid && m.mentionedJid[0];
    if (!target) return m.reply('Debes mencionar a quien quieres regalar tu waifu.');
    if (!global.db.waifu.waifus[userId]) return m.reply('No tienes waifu para regalar. Usa .rw para conseguir una.');
    if (global.db.waifu.waifus[target]) return m.reply('El usuario ya tiene una waifu.');
    global.db.waifu.waifus[target] = global.db.waifu.waifus[userId];
    delete global.db.waifu.waifus[userId];
    m.reply(`🎁 ¡Has regalado tu waifu a @${target.split('@')[0]}!`, null, { mentions: [target] });
};
regalarWaifu.help = ['regalarwaifu @usuario'];
regalarWaifu.tags = ['rpg'];
regalarWaifu.command = /^(regalarwaifu)$/i;
regalarWaifu.group = true;
regalarWaifu.register = true;

// SUBASTAR WAIFU POR CEBOLLINES
let subastaWaifu = async (m, { conn, args }) => {
    const userId = m.sender;
    const cantidad = parseInt(args[0]);
    if (isNaN(cantidad) || cantidad <= 0) return m.reply('Debes indicar la cantidad de cebollines 🌱 para subastar. Ejemplo: .subastawaifu 100');
    if (!global.db.waifu.waifus[userId]) return m.reply('No tienes waifu para subastar.');
    global.db.waifu.waifus[userId] = null;
    global.db.waifu.cebollines[userId] = (global.db.waifu.cebollines[userId] || 0) + cantidad;
    m.reply(`🎉 ¡Has subastado tu waifu por ${cantidad} cebollines 🌱! Ahora tienes ${global.db.waifu.cebollines[userId]} cebollines.`);
};
subastaWaifu.help = ['subastawaifu <cantidad>'];
subastaWaifu.tags = ['rpg'];
subastaWaifu.command = /^(subastawaifu)$/i;
subastaWaifu.group = true;
subastaWaifu.register = true;

export { regalarWaifu as default, subastaWaifu };
