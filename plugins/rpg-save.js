import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'database');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');

function loadDatabase() {
    try {
        if (!fs.existsSync(dbPath)) {
            fs.mkdirSync(dbPath, { recursive: true });
        }
        if (!fs.existsSync(databaseFilePath)) {
            const data = { users: {} };
            fs.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2));
            return data;
        }
        return JSON.parse(fs.readFileSync(databaseFilePath, 'utf-8'));
    } catch (error) {
        console.error('Error DB:', error);
        return { users: {} };
    }
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving:', error);
        return false;
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender;
    let userName = 'Usuario';

    try {
        userName = (await conn.getName(userId)) || 'Usuario';
    } catch {}


    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    const user = global.db.data.users[userId]
    if (!user.waifu) user.waifu = { characters: [], pending: null, cooldown: 0 }
    if (!Array.isArray(user.waifu.characters)) user.waifu.characters = []

    try {

        let currentWaifu = user.waifu.pending

        if (!currentWaifu && global.db?.waifu?.waifus?.[userId]) {
            currentWaifu = global.db.waifu.waifus[userId]
            user.waifu.pending = currentWaifu
            try { delete global.db.waifu.waifus[userId] } catch {}
        }

        if (!currentWaifu || !currentWaifu.name) {
            return m.reply('💙 No se encontró personaje válido para guardar.');
        }


        const exists = user.waifu.characters.find(
            char => char.name === currentWaifu.name && char.rarity === currentWaifu.rarity
        );

        if (exists) {
            user.waifu.pending = null
            return m.reply(`💙 Ya tienes a *${currentWaifu.name}* (${currentWaifu.rarity}) en tu colección.`);
        }


        user.waifu.characters.push({
            name: currentWaifu.name,
            rarity: currentWaifu.rarity,
            obtainedAt: new Date().toISOString(),
            obtainedFrom: 'save'
        });

        user.waifu.pending = null


        const rarityEmojis = {
            'comun': '⚪', 'poco comun': '🟢', 'raro': '🔵',
            'epico': '🟣', 'legendario': '🟡', 'mitico': '🔴'
        };

        const emoji = rarityEmojis[currentWaifu.rarity.toLowerCase()] || '💙';

        let msg = `✅ ¡PERSONAJE GUARDADO! ✅\n\n`;
        msg += `${emoji} *${currentWaifu.name}*\n`;
        msg += `💎 *${currentWaifu.rarity.toUpperCase()}*\n`;
        msg += `👤 ${userName}\n`;
        msg += `📊 Total: *${user.waifu.characters.length}* personajes\n\n`;
        msg += `🔍 Usa *.col* para ver tu colección`;

        return m.reply(msg);

    } catch (error) {
        console.error('Error en save:', error);
        return m.reply(`❌ Error: ${error.message}`);
    }
}

handler.help = ['save', 'guardar', 'claim']
handler.tags = ['rpg']
handler.command = /^(save|guardar|c|reclamar)$/i
handler.group = true

export default handler;

