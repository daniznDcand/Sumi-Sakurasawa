import { promises as fs } from 'fs';
import fs_sync from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'database');
const databaseFilePath = path.join(dbPath, 'waifudatabase.json');

const SELL_PRICES = {
    'común': 10,
    'rara': 50,
    'épica': 100,
    'ultra rara': 200,
    'Legendaria': 500
};

function loadDatabase() {
    try {
        console.log('Loading waifu database from:', databaseFilePath);
        if (!fs_sync.existsSync(dbPath)) {
            console.log('Creating database directory:', dbPath);
            fs_sync.mkdirSync(dbPath, { recursive: true });
        }
        if (!fs_sync.existsSync(databaseFilePath)) {
            console.log('Creating new waifu database file');
            const data = { users: {} };
            fs_sync.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2));
            return data;
        }
        const data = JSON.parse(fs_sync.readFileSync(databaseFilePath, 'utf-8'));
        console.log('Loaded waifu database with', Object.keys(data.users || {}).length, 'users');
        return data;
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

global.db = global.db || {};
global.db.data = global.db.data || {};
global.db.data.users = global.db.data.users || {};


try {
    const fileData = loadDatabase();
    if (fileData && fileData.users) {
        
        for (const uid of Object.keys(fileData.users)) {
            if (!global.db.data.users[uid]) global.db.data.users[uid] = fileData.users[uid];
        }
    }
} catch (e) { console.error('Error merging waifu DB:', e) }


const waifuList = [
   
    {
        name: "Hatsune Chibi",
        rarity: "común",
        probability: 5,  
        img: "https://i.pinimg.com/originals/21/68/0a/21680a7aeec369f1428daaa82a054eac.png"
    },
    {
        name: "Aoki Chibi",
        rarity: "común",
        probability: 5,  
        img: "https://files.catbox.moe/ds1rt5.png"
    },
    {
        name: "Momo Chibi",
        rarity: "común",
        probability: 5,  
        img: "https://i.pinimg.com/736x/89/85/bf/8985bf3fefe2bf09fbd5602bf325285b.jpg"
    },
    {
        name: "Ritsu chibi",
        rarity: "común",
        probability: 5,  
        img: "https://i.pinimg.com/474x/6a/40/42/6a4042784e3330a180743d6cef798521.jpg"
    },
    {
        name: "Defoko Chibi",
        rarity: "común",
        probability: 5,  
        img: "https://files.catbox.moe/r951p2.png"
    },
    {
        name: "Neru Chibi",
        rarity: "común",
        probability: 5,
        img: "https://files.catbox.moe/ht6aci.png"
    },
    {
        name: "Haku Chibi",
        rarity: "común",
        probability: 5,
        img: "https://images.jammable.com/voices/yowane-haku-6GXWn/2341bc1d-9a5e-4419-8657-cb0cd6bbba40.png"
    },
    {
        name: "Rin Chibi",
        rarity: "común",
        probability: 5,
        img: "https://files.catbox.moe/2y6wre.png"
    },
    {
        name: "Teto Chibi",
        rarity: "común",
        probability: 5,
        img: "https://files.catbox.moe/h9m6ac.webp"
    },
    {
        name: "Gumi Chibi",
        rarity: "común",
        probability: 5,
        img: "https://i.pinimg.com/originals/84/20/37/84203775150673cf10084888b4f7d67f.png"
    },
    {
        name: "Emu Chibi",
        rarity: "común",
        probability: 5,
        img: "https://files.catbox.moe/nrchrb.webp"
    },
    {
        name: "Len Chibi",
        rarity: "común",
        probability: 5,
        img: "https://files.catbox.moe/rxvuqq.png"
    },
    {
        name: "Luka Chibi",
        rarity: "común",
        probability: 5,
        img: "https://files.catbox.moe/5cyyis.png"
    },
        {
        name: "Sukone Chibi",
        rarity: "común",
        probability: 5,
        img: "https://i.pinimg.com/736x/bd/65/34/bd65347807569025f7196e1da753c252.jpg"
    },
        {
        name: "Fuiro Chibi",
        rarity: "común",
        probability: 5,
        img: "https://i.pinimg.com/736x/ca/b5/a4/cab5a41cac30a455a70d1b80c89c662b.jpg"
    },
    
    
    {
        name: "Hatsune Miku 2006",
        rarity: "rara",
        probability: 3,
        img: "https://i.pinimg.com/736x/ab/22/a9/ab22a9b92f94e77c46645ac78d16a01b.jpg"
    },
    {
        name: "Aoki Lapis 2006",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/5m2nw3.png"
    },
    {
        name: "Momone momo 2006",
        rarity: "rara",
        probability: 3,
        img: "https://i.pinimg.com/736x/23/42/38/2342389710827674684269196ebabbb6.jpg"
    },
    {
        name: "Namine Ritsu 2006",
        rarity: "rara",
        probability: 3,
        img: "https://i.pinimg.com/736x/64/4d/7e/644d7e9ddff3461dee41850febf411c5.jpg"
    },
    {
        name: "Defoko Utau",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/0ghewm.png"
    },
    {
        name: "Yowane Haku 2006",
        rarity: "rara",
        probability: 3,
        img: "https://i.pinimg.com/originals/13/5d/02/135d0231c953db4d8cd85cc42abdf7b2.png"
    },
    {
        name: "Akita Neru 2006",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/zia0tk.png"
    },
    {
        name: "Sukone Tei 2006",
        rarity: "rara",
        probability: 3,
        img: "https://i.pinimg.com/736x/67/1e/40/671e40a106af9b5e4cf1e14a212266a7.jpg"
    },
    {
        name: "Gumi Megpoid 2006",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/ulvmhk.png"
    },
    {
        name: "Rin",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/wk4sh0.png"
    },
    {
        name: "Teto",
        rarity: "rara",
        probability: 3,
        img: "https://i.pinimg.com/736x/ff/1b/5e/ff1b5e2a8c30cedab77eb4490cea7b0e.jpg"
    },
    {
        name: "Emu Otori",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/vphcvo.png"
    },
    {
        name: "Len",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/x4du11.png"
    },
    {
        name: "Luka Megurine 2006",
        rarity: "rara",
        probability: 3,
        img: "https://i1.sndcdn.com/artworks-8ne47oeiNyxO90bm-LBx2Ng-t500x500.jpg"
    },
    {
        name: "Fuiro 2006",
        rarity: "rara",
        probability: 3,
        img: "https://gprw.s3.amazonaws.com/uploads/releases/614/image/lg-022f3cf7193976905295029c6bbfbe86.png"
    },
    
    
    {
        name: "💙Miku💙",
        rarity: "épica",
        probability: 1.5,
        img: "https://cdn.vietgame.asia/wp-content/uploads/20161116220419/hatsune-miku-project-diva-future-tone-se-ra-mat-o-phuong-tay-news.jpg"
    },
    {
        name: "💚Momo💗",
        rarity: "épica",
        probability: 1.5,
        img: "https://i.pinimg.com/736x/e7/8e/99/e78e995ea0bd0c4affd17c8d476c4c09.jpg"
    },
    {
        name: "🩵Aoki Lapis🩵",
        rarity: "épica",
        probability: 1.5,
        img: "https://files.catbox.moe/gje6q7.png"
    },
    {
        name: "❤Sukone🤍",
        rarity: "épica",
        probability: 1.5,
        img: "https://i1.sndcdn.com/artworks-000147734539-c348up-t1080x1080.jpg"
    },
    {
        name: "💜Defoko Utane💜",
        rarity: "épica",
        probability: 1.5,
        img: "https://files.catbox.moe/eb1jy3.png"
    },
    {
        name: "❤Ritsu🖤",
        rarity: "épica",
        probability: 1.5,
        img: "https://i1.sndcdn.com/artworks-000033453125-njjsvn-t1080x1080.jpg"
    },
    {
        name: "💛Neru💛",
        rarity: "épica",
        probability: 1.5,
        img: "https://images3.alphacoders.com/768/768095.jpg"
    },
    {
        name: "🍺Haku🍺",
        rarity: "épica",
        probability: 1.5,
        img: "https://prodigits.co.uk/thumbs/wallpapers/p2/anime/12/681ab84912482088.jpg"
    },
    {
        name: "💛Rin💛",
        rarity: "épica",
        probability: 1.5,
        img: "https://images5.alphacoders.com/330/330144.jpg"
    },
    {
        name: "💚Gumi💚",
        rarity: "épica",
        probability: 1.5,
        img: "https://files.catbox.moe/hpalur.png"
    },
    {
        name: "❤Teto❤",
        rarity: "épica",
        probability: 1.5,
        img: "https://files.catbox.moe/k5w0ea.png"
    },
    {
        name: "💗Emu💗",
        rarity: "épica",
        probability: 1.5,
        img: "https://files.catbox.moe/sygb0h.png"
    },
    {
        name: "🍌 Len 🍌",
        rarity: "épica",
        probability: 1.5,
        img: "https://i.pinimg.com/236x/3a/af/e5/3aafe5d43f983f083440fb5ab9d9f3d8.jpg"
    },
    {
        name: "💗LUKA🪷",
        rarity: "épica",
        probability: 1.5,
        img: "https://files.catbox.moe/bp2wrg.webp"
    },
    {
        name: "🖤FUIRO🖤",
        rarity: "épica",
        probability: 1.5,
        img: "https://media.tenor.com/-zHmFGOc-rkAAAAe/fuiro-vocaloid.png"
    },
   
    
    {
        name: "💙HATSUNE MIKU💙",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/881c3b.png"
    },
    {
        name: "💚Momone Momo💗",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://i.ytimg.com/vi/SinNL35NUuc/maxresdefault.jpg"
    },
    {
        name: "🩵Aoki Lapis🩵",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://c4.wallpaperflare.com/wallpaper/737/427/729/vocaloid-aoki-lapis-sword-blue-hair-wallpaper-preview.jpg"
    },
    {
        name: "🖤Namine Ritsu💞",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://images.gamebanana.com/img/ss/mods/668cabe0bcbff.jpg"
    },
    {
        name: "🍻Yowane Haku🥂",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/fk14cc.png"
    },
    {
        name: "🤍Sukone Tei💘",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://i.ytimg.com/vi/dxvU8lowsbg/maxresdefault.jpg"
    },
    {
        name: "💜Utane Defoko💜",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://i.pinimg.com/236x/4a/c8/aa/4ac8aa5c5fc1fc5ce83ef0fb71952e14.jpg"
    },
    {
        name: "💛AKITA NERU💛",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/agw1y1.png"
    },
    {
        name: "💗EMU OTORI💗",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/ekzntn.png"
    },
    {
        name: "💚Megpoid Gumi💚",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/opn7vz.png"
    },
    {
        name: "❤KASANE TETO❤",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/6j9jgl.webp"
    },
    {
        name: "💛KAGAMINE RIN💛",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/lh5sxn.png"
    },
    {
        name: "💥KAGAMINE LEN💢",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/awuecy.png"
    },
    {
        name: "💗MEGUMIRE LUKA💮",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/jodjln.png"
    },
    
    
    {
        name: "💙Brazilian Miku💛",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://files.catbox.moe/ifl773.jpg" 
    },
    {
        name: "🖤Inabakumori🖤",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://i.ytimg.com/vi/4bzEgrvU1lA/maxresdefault.jpg"
    },
    {
        name: "❤KASANE TETO❤",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://files.catbox.moe/3cb73f.jpg"
    },
    {
        name: "☢️Cyberpunk Edgeruners💫",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://i.pinimg.com/736x/41/20/97/4120973c715fbcaa8baeb348e7610b5d.jpg"
    },
    {
        name: "❤️🩷VOCALOIDS💛💙",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://files.catbox.moe/g6kfb6.jpg"
    },
    {
        name: "💢💥BORDERLANDS☢⚠",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://pixelz.cc/wp-content/uploads/2019/05/borderlands-3-super-deluxe-edition-uhd-4k-wallpaper.jpg"
    },
    {
        name: "🌌HALO⚕️",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://c4.wallpaperflare.com/wallpaper/752/1001/122/halo-master-chief-hd-wallpaper-preview.jpg"
    }
];



const totalProbability = waifuList.reduce((sum, waifu) => sum + waifu.probability, 0);
console.log(`Probabilidad total calculada: ${totalProbability}%`);


const cumulativeProbabilities = [];
let accumulated = 0;
for (const waifu of waifuList) {
    accumulated += waifu.probability;
    cumulativeProbabilities.push({ waifu, threshold: accumulated });
}

let handler = async (m, { conn }) => {
    const userId = m.sender;
    const currentTime = Date.now();

    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    const user = global.db.data.users[userId]
    if (!user.waifu) user.waifu = { characters: [], pending: null, cooldown: 0 }
    if (!Array.isArray(user.waifu.characters)) user.waifu.characters = []

    
    console.log('RW Command - Checking database...');
    console.log('Database path:', databaseFilePath);
    console.log('Database exists:', fs_sync.existsSync(databaseFilePath));
    
    
    if (user.waifu.cooldown) {
        const timeDiff = currentTime - user.waifu.cooldown;
        if (timeDiff < 900000) {
            const remainingTime = 900000 - timeDiff;
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            return m.reply(`⏰ Debes esperar ${minutes}m ${seconds}s para volver a usar este comando.`);
        }
    }

   
    const roll = Math.random() * totalProbability;
    let selectedWaifu = null;
    
    
    for (const { waifu, threshold } of cumulativeProbabilities) {
        if (roll <= threshold) {
            selectedWaifu = waifu;
            break;
        }
    }
    
   
    if (!selectedWaifu) {
        selectedWaifu = waifuList[waifuList.length - 1];
    }

    
    const rarityColors = {
        'común': '⚪',
        'rara': '🔵',
        'épica': '🟣',
        'ultra rara': '🟡',
        'Legendaria': '🔴'
    };

    const rarityProbs = {
        'común': '50%',
        'rara': '30%',
        'épica': '15%',
        'ultra rara': '4%',
        'Legendaria': '1%'
    };


    const sellPrice = SELL_PRICES[selectedWaifu.rarity] || 10;

    let message = `🎲 WAIFU GACHA 🎲\n\n`;
    message += `👤 Invocador: @${userId.split('@')[0]}\n`;
    message += `${rarityColors[selectedWaifu.rarity]} Rareza: ${selectedWaifu.rarity.toUpperCase()} (${rarityProbs[selectedWaifu.rarity]})\n`;
    message += `💫 ¡Felicidades! Obtuviste a:\n`;
    message += `💙 ${selectedWaifu.name}\n\n`;
    message += `💡 ¿Qué deseas hacer con este personaje?`;

    const buttons = [
        { buttonId: `waifu_claim_${userId.split('@')[0]}`, buttonText: { displayText: '💚 Reclamar Personaje' }, type: 1 },
        { buttonId: `waifu_sell_${userId.split('@')[0]}`, buttonText: { displayText: `💰 Vender por ${sellPrice} cebollines` }, type: 1 }
    ];

    const buttonMessage = {
        image: { url: selectedWaifu.img },
        caption: message,
        footer: '🎮 Sistema de Personajes - Hatsune Miku Bot',
        buttons: buttons,
        headerType: 4,
        mentions: [userId]
    };

    await conn.sendMessage(m.chat, buttonMessage);

    
    user.waifu.cooldown = currentTime
    user.waifu.pending = selectedWaifu
}

handler.help = ['rw']
handler.tags = ['rpg']
handler.command = /^(rw|rollwaifu|gacha)$/i
handler.register = true
handler.group = true
handler.cooldown = 900000

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

    if (buttonId && (buttonId.startsWith('waifu_claim_') || buttonId.startsWith('waifu_sell_'))) {
        const userId = buttonId.split('_')[2] + '@s.whatsapp.net';
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

        if (!user.waifu.pending) {
            return await m.reply('❌ No tienes ningún personaje disponible.');
        }

        const currentWaifu = user.waifu.pending;
        const action = buttonId.startsWith('waifu_claim_') ? 'claim' : 'sell';

        try {
            if (action === 'claim') {
                const exists = user.waifu.characters.find(
                    char => char.name === currentWaifu.name && char.rarity === currentWaifu.rarity
                );

                if (exists) {
                    user.waifu.pending = null
                    console.log(`User ${userId} already has ${currentWaifu.name} (${currentWaifu.rarity})`);
                    return await m.reply(`💙 Ya tienes a *${currentWaifu.name}* (${currentWaifu.rarity}) en tu colección.\n\n🔍 Usa *.col* para ver todas tus waifus guardadas en la base de datos.`);
                }

                user.waifu.characters.push({
                    name: currentWaifu.name,
                    rarity: currentWaifu.rarity,
                    obtainedAt: new Date().toISOString(),
                    obtainedFrom: 'rw'
                });

                user.waifu.pending = null
                try { saveDatabase({ users: global.db.data.users }) } catch (e) { console.error('Error saving waifu DB (claim):', e) }

                const rarityColors = {
                    'común': '⚪',
                    'rara': '🔵',
                    'épica': '🟣',
                    'ultra rara': '🟡',
                    'Legendaria': '🔴'
                };

                const emoji = rarityColors[currentWaifu.rarity] || '💙';

                let msg = `✅ ¡PERSONAJE RECLAMADO! ✅\n\n`;
                msg += `${emoji} *${currentWaifu.name}*\n`;
                msg += `💎 *${currentWaifu.rarity.toUpperCase()}*\n`;
                msg += `👤 ${userName}\n`;
                msg += `📊 Total: *${user.waifu.characters.length}* personajes\n\n`;
                msg += `🔍 Usa *.col* para ver tu colección completa\n`;
                

                console.log(`Waifu claimed: ${currentWaifu.name} (${currentWaifu.rarity}) for user ${userId}`);
                return await m.reply(msg);

            } else if (action === 'sell') {
                const sellPrice = SELL_PRICES[currentWaifu.rarity] || 10;

                if (!user.coin) user.coin = 0
                user.coin += sellPrice

                user.waifu.pending = null
                try { saveDatabase({ users: global.db.data.users }) } catch (e) { console.error('Error saving waifu DB (sell):', e) }

                const rarityColors = {
                    'común': '⚪',
                    'rara': '🔵',
                    'épica': '🟣',
                    'ultra rara': '🟡',
                    'Legendaria': '🔴'
                };

                const emoji = rarityColors[currentWaifu.rarity] || '💙';

                let msg = `💰 ¡PERSONAJE VENDIDO! 💰\n\n`;
                msg += `${emoji} *${currentWaifu.name}*\n`;
                msg += `💎 *${currentWaifu.rarity.toUpperCase()}*\n`;
                msg += `💵 *Recibiste:* ${sellPrice} cebollines\n`;
                msg += `💳 *Total cebollines:* ${user.coin}\n\n`;
                msg += `🏪 Usa *.tienda* para gastar tus cebollines`;

                return await m.reply(msg);
            }

        } catch (error) {
            console.error('Error en waifu button handler:', error);
            return await m.reply(`❌ Error: ${error.message}`);
        }
    }

    return false;
}

export default handler






let regalarWaifuHandler = async (m, { conn, args, participants }) => {
    const userId = m.sender;
    const mentionedJid = (m.mentionedJid && m.mentionedJid[0]) || args[0];
    if (!mentionedJid) return m.reply('Debes mencionar a quién quieres regalar tu waifu.');
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    const fromUser = global.db.data.users[userId]
    if (!fromUser.waifu) fromUser.waifu = { characters: [], pending: null, cooldown: 0 }
    if (!Array.isArray(fromUser.waifu.characters)) fromUser.waifu.characters = []

    if (!fromUser.waifu.pending) return m.reply('No tienes ninguna waifu para regalar.');
    if (userId === mentionedJid) return m.reply('No puedes regalarte una waifu a ti mismo.');

    if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = {}
    const toUser = global.db.data.users[mentionedJid]
    if (!toUser.waifu) toUser.waifu = { characters: [], pending: null, cooldown: 0 }
    if (!Array.isArray(toUser.waifu.characters)) toUser.waifu.characters = []

    toUser.waifu.pending = fromUser.waifu.pending
    fromUser.waifu.pending = null
    try { saveDatabase({ users: global.db.data.users }) } catch (e) { console.error('Error saving waifu DB (gift):', e) }
    m.reply(`🎁 Has regalado tu waifu a @${mentionedJid.split('@')[0]}!`, null, { mentions: [mentionedJid] });
};

regalarWaifuHandler.help = ['regalarwaifu @usuario'];
regalarWaifuHandler.tags = ['rpg'];
regalarWaifuHandler.command = /^(regalarwaifu)$/i;
regalarWaifuHandler.register = true;
regalarWaifuHandler.group = true;


let subasta = {};
let subastarWaifuHandler = async (m, { conn, args }) => {
    const userId = m.sender;
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    const user = global.db.data.users[userId]
    if (!user.waifu) user.waifu = { characters: [], pending: null, cooldown: 0 }
    if (!Array.isArray(user.waifu.characters)) user.waifu.characters = []

    const waifu = user.waifu.pending
    if (!waifu) return m.reply('No tienes ninguna waifu para subastar.');
    const cantidad = parseInt(args[0]);
    if (isNaN(cantidad) || cantidad <= 0) return m.reply('Debes indicar una cantidad válida para la subasta.');
    if (subasta[userId]) return m.reply('Ya tienes una subasta activa. Espera a que termine.');
    subasta[userId] = { waifu, cantidad, puja: 0, mejorPostor: null, timeout: null };
    m.reply(`🔨 Subasta iniciada por @${userId.split('@')[0]}: ${waifu.name}\nPrecio inicial: ${cantidad} monedas\nUsa .pujarwaifu <cantidad> para pujar.`, null, { mentions: [userId] });
    
    subasta[userId].timeout = setTimeout(() => {
        if (subasta[userId].mejorPostor) {

            const winnerId = subasta[userId].mejorPostor
            if (!global.db.data.users[winnerId]) global.db.data.users[winnerId] = {}
            const winner = global.db.data.users[winnerId]
            if (!winner.waifu) winner.waifu = { characters: [], pending: null, cooldown: 0 }
            if (!Array.isArray(winner.waifu.characters)) winner.waifu.characters = []

           
            winner.waifu.pending = waifu
            user.waifu.pending = null

            
            if (!winner.coin) winner.coin = 0
            if (!user.coin) user.coin = 0
            winner.coin -= subasta[userId].puja;
            user.coin += subasta[userId].puja;
            try { saveDatabase({ users: global.db.data.users }) } catch (e) { console.error('Error saving waifu DB (auction):', e) }
            conn.reply(m.chat, `🏆 Subasta finalizada. Ganador: @${subasta[userId].mejorPostor.split('@')[0]} por ${subasta[userId].puja} monedas.`, null, { mentions: [subasta[userId].mejorPostor] });
        } else {
            conn.reply(m.chat, '⏰ Subasta finalizada sin postores.', null, { mentions: [userId] });
        }
        clearTimeout(subasta[userId].timeout);
        delete subasta[userId];
    }, 60000);
};

subastarWaifuHandler.help = ['subastawaifu <cantidad>'];
subastarWaifuHandler.tags = ['rpg'];
subastarWaifuHandler.command = /^(subastawaifu)$/i;
subastarWaifuHandler.register = true;
subastarWaifuHandler.group = true;


let pujarWaifuHandler = async (m, { conn, args }) => {
    const userId = m.sender;
    const cantidad = parseInt(args[0]);
    let found = null, subastador = null;
    for (const uid in subasta) {
        if (uid !== userId && subasta[uid]) {
            found = subasta[uid];
            subastador = uid;
            break;
        }
    }
    if (!found) return m.reply('No hay subastas activas.');
    if (isNaN(cantidad) || cantidad <= found.puja || cantidad < found.cantidad) return m.reply(`Debes pujar más de ${found.puja || found.cantidad} monedas.`);
    if (!global.db.data?.users?.[userId] || (global.db.data.users[userId].coin || 0) < cantidad) return m.reply('No tienes suficientes monedas.');
    found.puja = cantidad;
    found.mejorPostor = userId;
    m.reply(`Nueva puja: @${userId.split('@')[0]} ofrece ${cantidad} monedas.`, null, { mentions: [userId] });
};

pujarWaifuHandler.help = ['pujarwaifu <cantidad>'];
pujarWaifuHandler.tags = ['rpg'];
pujarWaifuHandler.command = /^(pujarwaifu)$/i;
pujarWaifuHandler.register = true;
pujarWaifuHandler.group = true;

export { regalarWaifuHandler as regalarwaifu, subastarWaifuHandler as subastawaifu, pujarWaifuHandler as pujarwaifu };









