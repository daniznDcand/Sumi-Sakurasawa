import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'database');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');

const SELL_PRICES = {
    'comun': 10,
    'poco comun': 25,
    'raro': 50,
    'epico': 100,
    'legendario': 200,
    'mitico': 500
};

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

    
    if (!global.db) global.db = {};
    if (!global.db.waifu) global.db.waifu = { waifus: {} };

    try {
        
        let currentWaifu = null;
        let waifuKey = null;

       
        const waifuKeys = Object.keys(global.db.waifu.waifus);
        
        if (waifuKeys.length === 0) {
            return m.reply('💙 No hay personajes disponibles. Usa .rw para generar uno.');
        }

        
        if (global.db.waifu.waifus[userId]) {
            currentWaifu = global.db.waifu.waifus[userId];
            waifuKey = userId;
        }
       
        else if (waifuKeys.length > 0) {
            waifuKey = waifuKeys[0];
            currentWaifu = global.db.waifu.waifus[waifuKey];
        }

        if (!currentWaifu || !currentWaifu.name) {
            return m.reply('💙 No se encontró personaje válido para guardar.');
        }

        
        let db = loadDatabase();
        
       
        if (!db.users[userId]) {
            db.users[userId] = {
                name: userName,
                characters: []
            };
        }

        
        const exists = db.users[userId].characters.find(
            char => char.name === currentWaifu.name && char.rarity === currentWaifu.rarity
        );

        if (exists) {
            delete global.db.waifu.waifus[waifuKey];
            return m.reply(`💙 Ya tienes a *${currentWaifu.name}* (${currentWaifu.rarity}) en tu colección.`);
        }

        
        const rarityEmojis = {
            'comun': '⚪', 'poco comun': '🟢', 'raro': '🔵',
            'epico': '🟣', 'legendario': '🟡', 'mitico': '🔴'
        };

        const emoji = rarityEmojis[currentWaifu.rarity.toLowerCase()] || '💙';
        const sellPrice = SELL_PRICES[currentWaifu.rarity.toLowerCase()] || 10;

        let msg = `🎯 ¡PERSONAJE ENCONTRADO! 🎯\n\n`;
        msg += `${emoji} *${currentWaifu.name}*\n`;
        msg += `💎 *${currentWaifu.rarity.toUpperCase()}*\n`;
        msg += `👤 ${userName}\n\n`;
        msg += `💡 *¿Qué deseas hacer?*\n\n`;
        msg += `🔍 Usa *.col* para ver tu colección actual`;

        const buttons = [
            { buttonId: `save_claim_${waifuKey}`, buttonText: { displayText: '💚 Reclamar Personaje' }, type: 1 },
            { buttonId: `save_sell_${waifuKey}`, buttonText: { displayText: `💰 Vender por ${sellPrice} cebollines` }, type: 1 }
        ];

        const buttonMessage = {
            text: msg,
            footer: '🎮 Sistema de Personajes - Hatsune Miku Bot',
            buttons: buttons,
            headerType: 1
        };

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m });

    } catch (error) {
        console.error('Error en save:', error);
        return m.reply(`❌ Error: ${error.message}`);
    }
}

handler.help = ['save', 'guardar', 'claim']
handler.tags = ['rpg']
handler.command = /^(save|guardar|c|reclamar)$/i
handler.group = true

handler.before = async function (m, { conn }) {
    if (!m.message) return false;

    let buttonId = null;

    if (m.message.templateButtonReplyMessage) {
        buttonId = m.message.templateButtonReplyMessage.selectedId;
    }
    if (m.message.buttonsResponseMessage) {
        buttonId = m.message.buttonsResponseMessage.selectedButtonId;
    }
    if (m.message.listResponseMessage) {
        buttonId = m.message.listResponseMessage.singleSelectReply?.selectedRowId;
    }
    if (m.message.interactiveResponseMessage) {
        try {
            const paramsJson = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
            if (paramsJson) {
                const params = JSON.parse(paramsJson);
                buttonId = params.id;
            }
        } catch (e) {}
    }

    if (buttonId && (buttonId.startsWith('save_claim_') || buttonId.startsWith('save_sell_'))) {
        const userId = m.sender;
        let userName = 'Usuario';

        try {
            userName = (await conn.getName(userId)) || 'Usuario';
        } catch {}

        if (!global.db) global.db = {};
        if (!global.db.waifu) global.db.waifu = { waifus: {} };

        const waifuKey = buttonId.split('_')[2];
        const action = buttonId.startsWith('save_claim_') ? 'claim' : 'sell';

        if (!global.db.waifu.waifus[waifuKey]) {
            return await m.reply('❌ Este personaje ya no está disponible.');
        }

        const currentWaifu = global.db.waifu.waifus[waifuKey];

        try {
            let db = loadDatabase();

            if (!db.users[userId]) {
                db.users[userId] = {
                    name: userName,
                    characters: []
                };
            }

            const rarityEmojis = {
                'comun': '⚪', 'poco comun': '🟢', 'raro': '🔵',
                'epico': '🟣', 'legendario': '🟡', 'mitico': '🔴'
            };

            const emoji = rarityEmojis[currentWaifu.rarity.toLowerCase()] || '💙';

            if (action === 'claim') {
                const exists = db.users[userId].characters.find(
                    char => char.name === currentWaifu.name && char.rarity === currentWaifu.rarity
                );

                if (exists) {
                    delete global.db.waifu.waifus[waifuKey];
                    return await m.reply(`💙 Ya tienes a *${currentWaifu.name}* (${currentWaifu.rarity}) en tu colección.`);
                }

                db.users[userId].characters.push({
                    name: currentWaifu.name,
                    rarity: currentWaifu.rarity,
                    obtainedAt: new Date().toISOString()
                });

                if (!saveDatabase(db)) {
                    return await m.reply('❌ Error al guardar en base de datos.');
                }

                delete global.db.waifu.waifus[waifuKey];

                let msg = `✅ ¡PERSONAJE RECLAMADO! ✅\n\n`;
                msg += `${emoji} *${currentWaifu.name}*\n`;
                msg += `💎 *${currentWaifu.rarity.toUpperCase()}*\n`;
                msg += `👤 ${userName}\n`;
                msg += `📊 Total: *${db.users[userId].characters.length}* personajes\n\n`;
                msg += `🔍 Usa *.col* para ver tu colección`;

                return await m.reply(msg);

            } else if (action === 'sell') {
                const sellPrice = SELL_PRICES[currentWaifu.rarity.toLowerCase()] || 10;

                if (!global.db.data.users[userId]) {
                    global.db.data.users[userId] = {};
                }
                if (!global.db.data.users[userId].coin) {
                    global.db.data.users[userId].coin = 0;
                }
                global.db.data.users[userId].coin += sellPrice;

                delete global.db.waifu.waifus[waifuKey];

                let msg = `💰 ¡PERSONAJE VENDIDO! 💰\n\n`;
                msg += `${emoji} *${currentWaifu.name}*\n`;
                msg += `💎 *${currentWaifu.rarity.toUpperCase()}*\n`;
                msg += `💵 *Recibiste:* ${sellPrice} cebollines\n`;
                msg += `💳 *Total cebollines:* ${global.db.data.users[userId].coin}\n\n`;
                msg += `🏪 Usa *.tiendarpg* para gastar tus cebollines`;

                return await m.reply(msg);
            }

        } catch (error) {
            console.error('Error en button handler:', error);
            return await m.reply(`❌ Error: ${error.message}`);
        }
    }

    return false;
}

export default handler;

