import { promises as fs } from 'fs';
import fs_sync from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'database');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');

function loadDatabase() {
    try {
        if (!fs_sync.existsSync(dbPath)) {
            fs_sync.mkdirSync(dbPath, { recursive: true });
        }
        if (!fs_sync.existsSync(databaseFilePath)) {
            const data = { users: {} };
            fs_sync.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2));
            return data;
        }
        return JSON.parse(fs_sync.readFileSync(databaseFilePath, 'utf-8'));
    } catch (error) {
        console.error('Error DB:', error);
        return { users: {} };
    }
}

function saveDatabase(data) {
    try {
        fs_sync.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving:', error);
        return false;
    }
}

let handler = async (m, { conn, args }) => {
    const from = m.sender;
    const to = (m.mentionedJid && m.mentionedJid[0]) || (args[0] && (args[0].includes('@') ? args[0] : args[0] + '@s.whatsapp.net'));
    if (!to) return m.reply('Debes mencionar a quién quieres regalar tu waifu. Ejemplo: .regalarwaifu @usuario <índice|nombre>');
    if (from === to) return m.reply('No puedes regalarte una waifu a ti mismo.');

    try {
        // Load database
        let db = loadDatabase();

        // Initialize user data if needed
        if (!db.users[from]) {
            db.users[from] = { name: 'Usuario', characters: [] };
        }
        if (!db.users[to]) {
            db.users[to] = { name: 'Usuario', characters: [] };
        }

        const col = db.users[from].characters || [];
        const normalize = s => (s || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

        // selector puede ser índice o nombre (args[1..])
        const selector = args.slice(1).join(' ').trim();

        // si no pone selector y tiene colección, mostrar lista
        if (!selector && col.length > 0) {
            const list = col.slice(0, 20).map((w, i) => `${i + 1}. ${w.name || 'Sin nombre'} ${w.rarity ? `— ${w.rarity}` : ''}`).join('\n');
            const more = col.length > 20 ? `\n...y ${col.length - 20} más` : '';
            return conn.reply(m.chat, `🗂️ Tu colección:\n${list}${more}\n\nUsa: .regalarwaifu @usuario <índice|nombre> para regalar. Ejemplo: .regalarwaifu @usuario 2`, m);
        }

        let selected = null;
        let selectedIndex = -1;

        if (selector) {
            const idx = parseInt(selector);
            if (!isNaN(idx)) {
                selectedIndex = idx - 1;
                selected = col[selectedIndex];
            } else {
                const norm = normalize(selector);
                selectedIndex = col.findIndex(w => w.name && normalize(w.name) === norm);
                if (selectedIndex === -1) {
                    selectedIndex = col.findIndex(w => w.name && normalize(w.name).includes(norm));
                }
                if (selectedIndex !== -1) {
                    selected = col[selectedIndex];
                }
            }
        }

        // fallback: slot único (waifu temporal)
        if (!selected && global.db.waifu && global.db.waifu.waifus && global.db.waifu.waifus[from]) {
            selected = global.db.waifu.waifus[from];
        }

        if (!selected) return m.reply('No tienes ninguna waifu para regalar. Usa: .regalarwaifu @usuario <índice|nombre>');

        // Get recipient name
        let toName = 'Usuario';
        try {
            toName = (await conn.getName(to)) || 'Usuario';
        } catch {}

        // Transferir al receptor
        const transferredWaifu = {
            name: selected.name,
            rarity: selected.rarity,
            obtainedAt: selected.obtainedAt || new Date().toISOString(),
            obtainedFrom: 'regalo'
        };

        db.users[to].characters.push(transferredWaifu);

        // Eliminar del origen
        if (selectedIndex !== -1) {
            // Remove from collection
            db.users[from].characters.splice(selectedIndex, 1);
        } else if (global.db.waifu && global.db.waifu.waifus && global.db.waifu.waifus[from]) {
            // Remove from temporary storage
            delete global.db.waifu.waifus[from];
        }

        // Save database
        if (!saveDatabase(db)) {
            return m.reply('❌ Error al guardar en base de datos.');
        }

        await conn.reply(m.chat, `🎁 Has regalado *${selected.name}* (${selected.rarity}) a @${to.split('@')[0]}!\n\n📊 Ahora tienes ${db.users[from].characters.length} waifus`, m, { mentions: [to] });

    } catch (error) {
        console.error('Error en regalarwaifu:', error);
        return m.reply(`❌ Error: ${error.message}`);
    }
};

handler.help = ['regalarwaifu @usuario'];
handler.tags = ['rpg'];
handler.command = ['regalarwaifu'];
handler.register = true;
handler.group = true;

export default handler;

