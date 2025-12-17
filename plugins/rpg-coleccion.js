import fs from 'fs';
import path from 'path';


const dbPath = path.join(process.cwd(), 'src', 'database');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');


function loadDatabase() {
    if (!fs.existsSync(databaseFilePath)) {
        return { users: {} }; 
    }
    try {
        return JSON.parse(fs.readFileSync(databaseFilePath, 'utf-8'));
    } catch (error) {
        console.error('❌ Error al cargar database:', error);
        return { users: {} };
    }
}

let handler = async (m, { conn }) => {
    const userId = m.sender;
    
    try {
        if (!global.db.data) global.db.data = {}
        if (!global.db.data.users) global.db.data.users = {}
        if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
        const user = global.db.data.users[userId]
        if (!user.waifu) user.waifu = { characters: [], pending: null, cooldown: 0 }
        if (!Array.isArray(user.waifu.characters)) user.waifu.characters = []

        let collection = user.waifu.characters

        if (!collection || collection.length === 0) {
            const oldDb = loadDatabase()
            const oldChars = oldDb?.users?.[userId]?.characters
            if (Array.isArray(oldChars) && oldChars.length > 0) {
                for (const w of oldChars) {
                    if (!w?.name || !w?.rarity) continue
                    const exists = user.waifu.characters.find(x => x.name === w.name && x.rarity === w.rarity)
                    if (!exists) {
                        user.waifu.characters.push({
                            name: w.name,
                            rarity: w.rarity,
                            obtainedAt: w.obtainedAt || new Date().toISOString(),
                            obtainedFrom: w.obtainedFrom || 'migrated'
                        })
                    }
                }
                collection = user.waifu.characters
            }
        }

        if (!collection || collection.length === 0) {
            return m.reply('📝 Tu colección está vacía. Usa .rw para obtener personajes.');
        }
        
        
        const rarityCount = {
            'Legendaria': 0,
            'ultra rara': 0,
            'épica': 0,
            'rara': 0,
            'común': 0
        };
        
        collection.forEach(waifu => rarityCount[waifu.rarity.toLowerCase()]++);
        
        const getTopName = (rarity) => {
            const found = collection.find(w => (w?.rarity || '').toLowerCase() === rarity)
            return found?.name || null
        }
        const topLegend = getTopName('legendaria')
        const topUltra = getTopName('ultra rara')
        
        let message = `🎴 *COLECCIÓN DE WAIFUS* 🎴\n`;
        message += `━━━━━━━━━━━━━━━━━━\n`;
        message += `👤 @${userId.split('@')[0]}\n`;
        message += `📦 Total: *${collection.length}*\n`;
        message += `━━━━━━━━━━━━━━━━━━\n\n`;

        message += `📊 *Resumen por rareza*\n`;
        message += `🔴 Legendaria: *${rarityCount['Legendaria']}* ${createBar(rarityCount['Legendaria'], 10)}\n`;
        message += `🟡 Ultra rara: *${rarityCount['ultra rara']}* ${createBar(rarityCount['ultra rara'], 10)}\n`;
        message += `🟣 Épica: *${rarityCount['épica']}* ${createBar(rarityCount['épica'], 10)}\n`;
        message += `🔵 Rara: *${rarityCount['rara']}* ${createBar(rarityCount['rara'], 10)}\n`;
        message += `⚪ Común: *${rarityCount['común']}* ${createBar(rarityCount['común'], 10)}\n\n`;

        if (topLegend || topUltra) {
            message += `⭐ *Destacadas*\n`
            if (topLegend) message += `🔴 ${topLegend}\n`
            if (topUltra) message += `🟡 ${topUltra}\n`
            message += `\n`
        }
        
   
        const rarityEmojis = {
            'legendaria': '🔴',
            'ultra rara': '🟡',
            'épica': '🟣',
            'rara': '🔵',
            'común': '⚪'
        };
        
      
        const groupedByRarity = {};
        collection.forEach(waifu => {
            const rarityLower = waifu.rarity.toLowerCase();
            if (!groupedByRarity[rarityLower]) {
                groupedByRarity[rarityLower] = [];
            }
            groupedByRarity[rarityLower].push(waifu);
        });
        
      
        for (const rarity of Object.keys(rarityCount)) {
            const rarityLower = rarity.toLowerCase();
            if (groupedByRarity[rarityLower]?.length > 0) {
                message += `${rarityEmojis[rarityLower]} *${rarity.toUpperCase()}*\n`;
                const list = groupedByRarity[rarityLower]
                list.slice(0, 25).forEach((waifu, index) => {
                    message += `${(index + 1).toString().padStart(2)}. ${waifu.name}\n`;
                });
                if (list.length > 25) message += `... y ${list.length - 25} más\n`
                message += `\n`
            }
        }

        const catalogo = path.join(process.cwd(), 'src', 'catalogo.jpg')
        if (fs.existsSync(catalogo)) {
            return await conn.sendFile(m.chat, catalogo, 'coleccion.jpg', message, m, false, { mentions: [userId] })
        }

        return conn.reply(m.chat, message, m, { mentions: [userId] });
    } catch (e) {
        console.error(e);
        return m.reply('💙 Error al mostrar la colección. Intenta de nuevo.');
    }
}


function createBar(value, maxSize) {
    const filled = Math.ceil((value / 20) * maxSize); 
    const empty = maxSize - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

handler.help = ['collection', 'coleccion']
handler.tags = ['rpg']
handler.command = /^(collection|coleccion|col|personajes|harem|waifus)$/i
handler.group = true

export default handler;

