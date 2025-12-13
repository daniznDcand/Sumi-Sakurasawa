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

function getOrCreateWaifuUser(db, userId, fallbackName = 'Usuario') {
    if (!db.users) db.users = {};
    if (!db.users[userId]) {
        db.users[userId] = { name: fallbackName, characters: [] };
    }
    if (!Array.isArray(db.users[userId].characters)) db.users[userId].characters = [];
    if (!db.users[userId].name) db.users[userId].name = fallbackName;
    return db.users[userId];
}

function getButtonIdFromMessage(m) {
    try {
        if (!m || !m.message) return null;

        if (m.message.templateButtonReplyMessage) {
            return m.message.templateButtonReplyMessage.selectedId;
        }
        if (m.message.buttonsResponseMessage) {
            return m.message.buttonsResponseMessage.selectedButtonId;
        }
        if (m.message.listResponseMessage) {
            return m.message.listResponseMessage.singleSelectReply?.selectedRowId;
        }
        if (m.message.interactiveResponseMessage) {
            const paramsJson = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
            if (paramsJson) {
                const params = JSON.parse(paramsJson);
                return params.id || null;
            }
        }
        if (m.message.buttonResponseMessage) {
            return m.message.buttonResponseMessage.selectedButtonId;
        }
        if (m.message.selectionResponseMessage) {
            return m.message.selectionResponseMessage.selectedRowId;
        }
        return null;
    } catch {
        return null;
    }
}

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
        img: "https://qu.ax/snGCa.png"
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
        img: "https://qu.ax/ROZWw.png"
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
        img: "https://qu.ax/VuWrg.png"
    },
    {
        name: "Namine Ritsu 2006",
        rarity: "rara",
        probability: 3,
        img: "https://qu.ax/sEVwC.png"
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
        img: "https://qu.ax/EyaRp.png"
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
        img: "https://qu.ax/ZxvtB.png"
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
        img: "https://qu.ax/OhBgu.png"
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
        name: "💙HATSUNE MIKU💙",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://files.catbox.moe/881c3b.png"
    },
    {
        name: "💚Momone Momo💗",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://qu.ax/nOQpw.png"
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
        img: "https://qu.ax/cfEbf.jpg"
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
        name: "🌌HALO⚕️",
        rarity: "Legendaria",
        probability: 0.167,
        img: "https://c4.wallpaperflare.com/wallpaper/752/1001/122/halo-master-chief-hd-wallpaper-preview.jpg"
    }
];

// Sistema de probabilidades basado en el RW
const totalProbability = waifuList.reduce((sum, waifu) => sum + waifu.probability, 0);
const cumulativeProbabilities = [];
let accumulated = 0;
for (const waifu of waifuList) {
    accumulated += waifu.probability;
    cumulativeProbabilities.push({ waifu, threshold: accumulated });
}

function getRandomWaifu(rarity = null) {
    let filteredWaifus = waifuList;
    if (rarity) {
        filteredWaifus = waifuList.filter(w => w.rarity === rarity);
        if (filteredWaifus.length === 0) {
            // Si no hay waifus de esa rareza específica, usar todas
            filteredWaifus = waifuList;
        }
    }

    if (rarity && filteredWaifus !== waifuList) {
        // Si se especificó una rareza, usar selección simple
        return filteredWaifus[Math.floor(Math.random() * filteredWaifus.length)];
    } else {
        // Usar sistema de probabilidades del RW
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

        return selectedWaifu;
    }
}

function getRandomWaifus(count, rarity = null) {
    let waifus = [];
    for (let i = 0; i < count; i++) {
        waifus.push(getRandomWaifu(rarity));
    }
    return waifus;
}

function getLimitedTimeDiscount() {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 20 && hour <= 23) {
        return { active: true, discount: 25, timeLeft: `${23 - hour}h restante` };
    } else if (hour >= 14 && hour <= 17) {
        return { active: true, discount: 15, timeLeft: `${17 - hour}h restante` };
    }

    return { active: false, discount: 0, timeLeft: null };
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]
    const userId = m.sender

    const shopImage = 'https://i.pinimg.com/564x/fe/50/3d/fe503deb95faf6a5ca62d3c0cc5a4ccb.jpg'

    const buttons = [
        { buttonId: 'shop_limited', buttonText: { displayText: '⏰ OFERTAS LIMITADAS' }, type: 1 },
        { buttonId: 'shop_premium', buttonText: { displayText: '💎 WAIFU PREMIUM' }, type: 1 },
        { buttonId: 'shop_rpg', buttonText: { displayText: '⚔️ ITEMS RPG' }, type: 1 },
        { buttonId: 'shop_cosmetics', buttonText: { displayText: '🎨 COSMÉTICOS' }, type: 1 }
    ]

    const coins = user.coin || 0

    let shopMessage = `🏪 *TIENDA PREMIUM* 🏪\n\n`
    shopMessage += `💰 *Tu saldo:* ${coins.toLocaleString()} cebollines\n\n`
    shopMessage += `🎯 *Categorías:*\n`

    shopMessage += `⏰ *OFERTAS LIMITADAS*\n`
    shopMessage += `├─ Packs con descuento temporal\n`
    shopMessage += `├─ Waifus aleatorias + bonus EXP\n`
    shopMessage += `└─ Equipos completos con precio especial\n\n`

    shopMessage += `💎 *WAIFU PREMIUM*\n`
    shopMessage += `├─ Waifus Legendarias únicas\n`
    shopMessage += `├─ Personajes exclusivos del RW\n`
    shopMessage += `└─ Beneficios especiales permanentes\n\n`

    shopMessage += `⚔️ *ITEMS RPG*\n`
    shopMessage += `├─ Pócimas de salud y fuerza\n`
    shopMessage += `├─ Equipos y armas mejoradas\n`
    shopMessage += `└─ Bonus para aventuras\n\n`

    shopMessage += `🎨 *COSMÉTICOS*\n`
    shopMessage += `├─ Marcos exclusivos para perfil\n`
    shopMessage += `├─ Títulos VIP personalizados\n`
    shopMessage += `└─ Efectos visuales únicos\n\n`

    shopMessage += `💡 *¿CÓMO COMPRAR?*\n`
    shopMessage += `├─ Presiona el botón de la categoría\n`
    shopMessage += `├─ Elige el producto que deseas\n`
    shopMessage += `└─ ¡Disfruta de tu compra!\n\n`

    shopMessage += `🎮 *SISTEMA RPG INTEGRADO* 🎮`

    const buttonMessage = {
        image: { url: shopImage },
        caption: shopMessage,
        footer: '🎮 Tienda Premium - Hatsune Miku Bot',
        buttons: buttons,
        headerType: 4
    }

    return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.before = async function (m, { conn }) {
    if (!m.message) return false

    let buttonId = getButtonIdFromMessage(m)

    const userId = m.sender
    const user = global.db.data.users[userId]
    const coins = user.coin || 0

    if (buttonId === 'shop_limited') {
        const limitedOffersImage = 'https://wallpapers-clan.com/wp-content/uploads/2025/04/hatsune-miku-cherry-blossoms-pc-desktop-laptop-wallpaper-cover.jpg'
        const discountInfo = getLimitedTimeDiscount();

        let pack1Price = 500;
        let pack2Price = 1200;
        let pack3Price = 2500;

        if (discountInfo.active) {
            pack1Price = Math.floor(pack1Price * (1 - discountInfo.discount / 100));
            pack2Price = Math.floor(pack2Price * (1 - discountInfo.discount / 100));
            pack3Price = Math.floor(pack3Price * (1 - discountInfo.discount / 100));
        }

        const limitedButtons = [
            { buttonId: 'buy_limited_pack1', buttonText: { displayText: `🎁 Pack Básico - ${pack1Price} coins` }, type: 1 },
            { buttonId: 'buy_limited_pack2', buttonText: { displayText: `💎 Pack Premium - ${pack2Price} coins` }, type: 1 },
            { buttonId: 'buy_limited_pack3', buttonText: { displayText: `👑 Pack Legendario - ${pack3Price} coins` }, type: 1 },
            { buttonId: 'shop_back', buttonText: { displayText: '⬅️ Volver' }, type: 1 }
        ]

        let limitedMessage = `⏰ *OFERTAS LIMITADAS* ⏰\n\n💰 *Monedas:* ${coins}`

        if (discountInfo.active) {
            limitedMessage += `\n🎉 *${discountInfo.discount}% OFF* (${discountInfo.timeLeft})`
        }

        limitedMessage += `\n\n🎁 *Pack Básico*\n💰 ${pack1Price} coins\n• 3 Waifu aleatorias\n• +1000 EXP\n• 10% descuento tienda`

        limitedMessage += `\n\n💎 *Pack Premium*\n💰 ${pack2Price} coins\n• 1 Waifu rara\n• 5 Pócimas salud\n• +2500 EXP\n• 25% descuento tienda`

        limitedMessage += `\n\n👑 *Pack Legendario*\n💰 ${pack3Price} coins\n• 1 Waifu legendaria\n• Equipo completo\n• +10000 EXP\n• 50% descuento 24h`

        if (!discountInfo.active) {
            limitedMessage += `\n\n⚠️ *Descuentos: 14-17h (15%) y 20-23h (25%)*`
        }

        limitedMessage += `\n\n🎲 *Waifu completamente aleatorias*`

        const limitedButtonMessage = {
            image: { url: limitedOffersImage },
            caption: limitedMessage,
            footer: '⏰ Ofertas Limitadas - Tienda Premium',
            buttons: limitedButtons,
            headerType: 4
        }

        return await conn.sendMessage(m.chat, limitedButtonMessage, { quoted: m })
    }

    if (buttonId === 'shop_premium') {
        const premiumImage = 'https://wallpapers-clan.com/wp-content/uploads/2025/04/hatsune-miku-cherry-blossoms-pc-desktop-laptop-wallpaper-cover.jpg'

        const premiumButtons = [
            { buttonId: 'buy_premium_miku', buttonText: { displayText: '💙 Brazilian Miku - 5000' }, type: 1 },
            { buttonId: 'buy_premium_luka', buttonText: { displayText: '🖤 Inabakumori - 4500' }, type: 1 },
            { buttonId: 'buy_premium_rin', buttonText: { displayText: '☢️ Cyberpunk Edgeruners - 4000' }, type: 1 },
            { buttonId: 'shop_back', buttonText: { displayText: '⬅️ Volver' }, type: 1 }
        ]

        let premiumMessage = `💎 *WAIFU PREMIUM* 💎\n\n💰 *Monedas:* ${coins}`

        premiumMessage += `\n\n💙 *Brazilian Miku*\n💰 5000 coins\n• Waifu Legendaria Única\n• Animaciones especiales\n• +100% EXP\n• Regeneración automática`

        premiumMessage += `\n\n🖤 *Inabakumori*\n💰 4500 coins\n• Waifu Legendaria Única\n• Poderes misteriosos\n• +50% ataque\n• Protección contra robos`

        premiumMessage += `\n\n☢️ *Cyberpunk Edgeruners*\n💰 4000 coins\n• Waifu Legendaria Única\n• Estilo cyberpunk\n• +75% defensa\n• Efectos futuristas`

        const premiumButtonMessage = {
            image: { url: premiumImage },
            caption: premiumMessage,
            footer: '💎 Waifu Premium - Tienda Premium',
            buttons: premiumButtons,
            headerType: 4
        }

        return await conn.sendMessage(m.chat, premiumButtonMessage, { quoted: m })
    }

    if (buttonId === 'shop_rpg') {
        const rpgImage = 'https://wallpapers-clan.com/wp-content/uploads/2025/04/hatsune-miku-cherry-blossoms-pc-desktop-laptop-wallpaper-cover.jpg'

        const rpgButtons = [
            { buttonId: 'buy_rpg_potion', buttonText: { displayText: '🧪 Poción Salud - 100' }, type: 1 },
            { buttonId: 'buy_rpg_megapotion', buttonText: { displayText: '💉 Mega Poción - 250' }, type: 1 },
            { buttonId: 'buy_rpg_strength', buttonText: { displayText: '⚔️ Poción Fuerza - 500' }, type: 1 },
            { buttonId: 'buy_rpg_defense', buttonText: { displayText: '🛡️ Poción Defensa - 400' }, type: 1 },
            { buttonId: 'shop_back', buttonText: { displayText: '⬅️ Volver' }, type: 1 }
        ]

        let rpgMessage = `⚔️ *ITEMS RPG* ⚔️\n\n💰 *Monedas:* ${coins}`

        rpgMessage += `\n\n🧪 *Poción Salud*\n💰 100 coins\n• +50 HP\n• Uso inmediato`

        rpgMessage += `\n\n💉 *Mega Poción*\n💰 250 coins\n• HP completo\n• Efecto inmediato`

        rpgMessage += `\n\n⚔️ *Poción Fuerza*\n💰 500 coins\n• +3 Ataque permanente\n• Acumulable`

        rpgMessage += `\n\n🛡️ *Poción Defensa*\n💰 400 coins\n• +2 Defensa permanente\n• Protección mejorada`

        const rpgButtonMessage = {
            image: { url: rpgImage },
            caption: rpgMessage,
            footer: '⚔️ Items RPG - Tienda Premium',
            buttons: rpgButtons,
            headerType: 4
        }

        return await conn.sendMessage(m.chat, rpgButtonMessage, { quoted: m })
    }

    if (buttonId === 'shop_cosmetics') {
        const cosmeticImage = 'https://wallpapers-clan.com/wp-content/uploads/2025/04/hatsune-miku-cherry-blossoms-pc-desktop-laptop-wallpaper-cover.jpg'

        const cosmeticButtons = [
            { buttonId: 'buy_cosmetic_frame1', buttonText: { displayText: '🎨 Marco Miku - 300' }, type: 1 },
            { buttonId: 'buy_cosmetic_frame2', buttonText: { displayText: '🌸 Marco Sakura - 250' }, type: 1 },
            { buttonId: 'buy_cosmetic_title1', buttonText: { displayText: '👑 Título VIP - 500' }, type: 1 },
            { buttonId: 'shop_back', buttonText: { displayText: '⬅️ Volver' }, type: 1 }
        ]

        let cosmeticMessage = `🎨 *COSMÉTICOS* 🎨\n\n💰 *Monedas:* ${coins}`

        cosmeticMessage += `\n\n🎨 *Marco Miku*\n💰 300 coins\n• Marco exclusivo\n• Efectos brillantes`

        cosmeticMessage += `\n\n🌸 *Marco Sakura*\n💰 250 coins\n• Pétalos animados\n• Diseño floral`

        cosmeticMessage += `\n\n👑 *Título VIP*\n💰 500 coins\n• Prefijo especial\n• Reconocimiento premium`

        const cosmeticButtonMessage = {
            image: { url: cosmeticImage },
            caption: cosmeticMessage,
            footer: '🎨 Cosméticos - Tienda Premium',
            buttons: cosmeticButtons,
            headerType: 4
        }

        return await conn.sendMessage(m.chat, cosmeticButtonMessage, { quoted: m })
    }

    if (buttonId === 'shop_back') {
        const shopImage = 'https://wallpapers-clan.com/wp-content/uploads/2025/04/hatsune-miku-cherry-blossoms-pc-desktop-laptop-wallpaper-cover.jpg'

        const buttons = [
            { buttonId: 'shop_limited', buttonText: { displayText: '⏰ OFERTAS LIMITADAS' }, type: 1 },
            { buttonId: 'shop_premium', buttonText: { displayText: '💎 WAIFU PREMIUM' }, type: 1 },
            { buttonId: 'shop_rpg', buttonText: { displayText: '⚔️ ITEMS RPG' }, type: 1 },
            { buttonId: 'shop_cosmetics', buttonText: { displayText: '🎨 COSMÉTICOS' }, type: 1 }
        ]

        const coins = user.coin || 0

        let shopMessage = `🏪 *TIENDA PREMIUM* 🏪\n\n💰 *Monedas:* ${coins}\n\n🎯 *Categorías:*`

        const buttonMessage = {
            image: { url: shopImage },
            caption: shopMessage,
            footer: '🎮 Tienda Premium - Hatsune Miku Bot',
            buttons: buttons,
            headerType: 4
        }

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    if (buttonId && buttonId.startsWith('buy_')) {
        const itemType = buttonId.split('_')[1]
        const itemName = buttonId.split('_')[2]

        const discountInfo = getLimitedTimeDiscount();
        let basePrice = 0
        let finalPrice = 0
        let itemDescription = ''
        let rewards = []

        switch(buttonId) {
            case 'buy_limited_pack1':
                basePrice = 500
                finalPrice = discountInfo.active ? Math.floor(basePrice * (1 - discountInfo.discount / 100)) : basePrice
                itemDescription = 'Pack Básico (3 waifu aleatorias + 1000 EXP + 10% descuento)'
                rewards = [
                    { type: 'waifu', count: 3, rarity: null },
                    { type: 'exp', amount: 1000 },
                    { type: 'discount', percentage: 10, duration: null }
                ]
                break
            case 'buy_limited_pack2':
                basePrice = 1200
                finalPrice = discountInfo.active ? Math.floor(basePrice * (1 - discountInfo.discount / 100)) : basePrice
                itemDescription = 'Pack Premium (1 waifu rara + 5 pócimas + 2500 EXP + 25% descuento)'
                rewards = [
                    { type: 'waifu', count: 1, rarity: 'rara' },
                    { type: 'potion', count: 5 },
                    { type: 'exp', amount: 2500 },
                    { type: 'discount', percentage: 25, duration: null }
                ]
                break
            case 'buy_limited_pack3':
                basePrice = 2500
                finalPrice = discountInfo.active ? Math.floor(basePrice * (1 - discountInfo.discount / 100)) : basePrice
                itemDescription = 'Pack Legendario (1 waifu legendaria + equipo completo + 10000 EXP + 50% descuento 24h)'
                rewards = [
                    { type: 'waifu', count: 1, rarity: 'Legendaria' },
                    { type: 'equipment', set: 'full' },
                    { type: 'exp', amount: 10000 },
                    { type: 'discount', percentage: 50, duration: 24 }
                ]
                break
            case 'buy_premium_miku':
                finalPrice = 5000
                itemDescription = '💙Brazilian Miku💛 (Waifu Legendaria única)'
                rewards = [{ type: 'premium_waifu', name: '💙Brazilian Miku💛' }]
                break
            case 'buy_premium_luka':
                finalPrice = 4500
                itemDescription = '🖤Inabakumori🖤 (Waifu Legendaria única)'
                rewards = [{ type: 'premium_waifu', name: '🖤Inabakumori🖤' }]
                break
            case 'buy_premium_rin':
                finalPrice = 4000
                itemDescription = '☢️Cyberpunk Edgeruners💫 (Waifu Legendaria única)'
                rewards = [{ type: 'premium_waifu', name: '☢️Cyberpunk Edgeruners💫' }]
                break
            case 'buy_rpg_potion':
                finalPrice = 100
                itemDescription = 'Poción de Salud (+50 HP)'
                rewards = [{ type: 'rpg_item', effect: 'heal', amount: 50 }]
                break
            case 'buy_rpg_megapotion':
                finalPrice = 250
                itemDescription = 'Mega Poción (HP completo)'
                rewards = [{ type: 'rpg_item', effect: 'fullheal' }]
                break
            case 'buy_rpg_strength':
                finalPrice = 500
                itemDescription = 'Poción de Fuerza (+3 ataque permanente)'
                rewards = [{ type: 'rpg_item', effect: 'attack', amount: 3 }]
                break
            case 'buy_rpg_defense':
                finalPrice = 400
                itemDescription = 'Poción de Defensa (+2 defensa permanente)'
                rewards = [{ type: 'rpg_item', effect: 'defense', amount: 2 }]
                break
            case 'buy_cosmetic_frame1':
                finalPrice = 300
                itemDescription = 'Marco Miku (marco exclusivo con efectos)'
                rewards = [{ type: 'cosmetic', item: 'frame_miku' }]
                break
            case 'buy_cosmetic_frame2':
                finalPrice = 250
                itemDescription = 'Marco Sakura (marco floral animado)'
                rewards = [{ type: 'cosmetic', item: 'frame_sakura' }]
                break
            case 'buy_cosmetic_title1':
                finalPrice = 500
                itemDescription = 'Título VIP (prefijo especial)'
                rewards = [{ type: 'cosmetic', item: 'title_vip' }]
                break
        }

        if (coins < finalPrice) {
            return await m.reply(`💸 No tienes suficientes monedas!\n\n💰 *Necesitas:* ${finalPrice} cebollines\n💳 *Tienes:* ${coins} cebollines\n📊 *Te faltan:* ${finalPrice - coins} cebollines`)
        }

        user.coin -= finalPrice

        let db = loadDatabase();
        const waifuUser = getOrCreateWaifuUser(db, userId, user?.name || user?.username || 'Usuario');

        let successMessage = `✅ *COMPRA EXITOSA* ✅\n\n🛍️ ${itemDescription}\n`
        if (discountInfo.active && buttonId.includes('limited')) {
            successMessage += `💰 ${basePrice} → ${finalPrice} coins (${discountInfo.discount}% OFF)\n`
        } else {
            successMessage += `💰 ${finalPrice} coins\n`
        }
        successMessage += `💳 Saldo: ${user.coin} coins\n\n🎁 *Recompensas:*\n`

        let hasWaifuReward = false;
        let waifuImages = [];

        for (const reward of rewards) {
            if (reward.type === 'waifu') {
                hasWaifuReward = true;
                const waifus = getRandomWaifus(reward.count, reward.rarity)
                for (const waifu of waifus) {
                    const exists = waifuUser.characters.find(
                        char => char.name === waifu.name && char.rarity === waifu.rarity
                    );

                    if (!exists) {
                        waifuUser.characters.push({
                            name: waifu.name,
                            rarity: waifu.rarity,
                            obtainedAt: new Date().toISOString()
                        });
                        successMessage += `💙 ${waifu.name} (${waifu.rarity.charAt(0).toUpperCase()})\n`
                    } else {
                        successMessage += `💙 ${waifu.name} (${waifu.rarity.charAt(0).toUpperCase()}) ✓\n`
                    }

                    waifuImages.push({ name: waifu.name, img: waifu.img, rarity: waifu.rarity });
                }
            } else if (reward.type === 'exp') {
                if (!user.rpgData) {
                    user.rpgData = { level: 1, hp: 100, maxHp: 100, attack: 20, defense: 10, exp: 0, wins: 0, losses: 0, lastAdventure: 0 };
                }
                user.rpgData.exp += reward.amount;
                successMessage += `⭐ +${reward.amount} EXP\n`
            } else if (reward.type === 'potion') {
                successMessage += `🧪 +${reward.count} pócimas\n`
            } else if (reward.type === 'equipment') {
                successMessage += `⚔️ Equipo completo\n`
            } else if (reward.type === 'discount') {
                successMessage += `💰 ${reward.percentage}% descuento${reward.duration ? ` ${reward.duration}h` : ''}\n`
            } else if (reward.type === 'premium_waifu') {
                console.log('Processing premium waifu:', reward.name);
                console.log('Searching for waifu with name:', reward.name, 'and rarity: Legendaria');

                
                const legendWaifu = waifuList.find(w => w.name === reward.name && w.rarity === 'Legendaria');
                console.log('Legend waifu found:', legendWaifu ? legendWaifu.name : 'NOT FOUND');

                
                const legendarias = waifuList.filter(w => w.rarity === 'Legendaria');
                console.log('Available legendary waifus:', legendarias.map(w => w.name));

                if (legendWaifu) {
                    hasWaifuReward = true;

                    const exists = waifuUser.characters.find(
                        char => char.name === legendWaifu.name && char.rarity === legendWaifu.rarity
                    );

                    if (!exists) {
                        waifuUser.characters.push({
                            name: legendWaifu.name,
                            rarity: legendWaifu.rarity,
                            obtainedAt: new Date().toISOString()
                        });
                        console.log('Premium waifu saved to database:', legendWaifu.name);
                        successMessage += `💎 ${legendWaifu.name}\n`
                    } else {
                        successMessage += `💎 ${legendWaifu.name} ✓\n`
                    }

                    waifuImages.push({
                        name: legendWaifu.name,
                        img: legendWaifu.img,
                        rarity: legendWaifu.rarity
                    });
                } else {
                    console.log('ERROR: Premium waifu not found in waifuList');
                    successMessage += `❌ Error: Waifu ${reward.name} no encontrada\n`
                }
            } else if (reward.type === 'rpg_item') {
                if (!user.rpgData) {
                    user.rpgData = { level: 1, hp: 100, maxHp: 100, attack: 20, defense: 10, exp: 0, wins: 0, losses: 0, lastAdventure: 0 };
                }

                if (reward.effect === 'heal') {
                    const healAmount = Math.min(reward.amount, user.rpgData.maxHp - user.rpgData.hp);
                    user.rpgData.hp += healAmount;
                    successMessage += `❤️ +${healAmount} HP\n`
                } else if (reward.effect === 'fullheal') {
                    const fullHealAmount = user.rpgData.maxHp - user.rpgData.hp;
                    user.rpgData.hp = user.rpgData.maxHp;
                    successMessage += `💚 HP completo (+${fullHealAmount})\n`
                } else if (reward.effect === 'attack') {
                    user.rpgData.attack += reward.amount;
                    successMessage += `⚔️ +${reward.amount} ATK\n`
                } else if (reward.effect === 'defense') {
                    user.rpgData.defense += reward.amount;
                    successMessage += `🛡️ +${reward.amount} DEF\n`
                }
            } else if (reward.type === 'cosmetic') {
                successMessage += `🎨 ${reward.item.replace('_', ' ').toUpperCase()}\n`
            }
        }

        console.log('Saving database after purchase...');
        const saveResult = saveDatabase(db);
        console.log('Database save result:', saveResult);

        successMessage += `\n🎉 ¡Compra completada!`

       
        if (hasWaifuReward && waifuImages.length > 0) {
            
            await m.reply(successMessage);

          
            for (const waifu of waifuImages) {
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

                const emoji = rarityColors[waifu.rarity] || '💙';

                // Crear mensaje similar al del .rw pero adaptado para tienda
                let waifuCaption = `🏪 TIENDA PREMIUM 🏪\n\n`;
                waifuCaption += `👤 Comprador: @${userId.split('@')[0]}\n`;
                waifuCaption += `${emoji} Rareza: ${waifu.rarity.toUpperCase()} (${rarityProbs[waifu.rarity]})\n`;
                waifuCaption += `💫 ¡Felicidades! Obtuviste a:\n`;
                waifuCaption += `💙 ${waifu.name}\n\n`;
                waifuCaption += `🎁 ¡Obtenida en la tienda!`;

                const waifuMessage = {
                    image: { url: waifu.img },
                    caption: waifuCaption,
                    footer: '🏪 Tienda Premium - Hatsune Miku Bot',
                    mentions: [userId]
                };

                await conn.sendMessage(m.chat, waifuMessage, { quoted: m });
            }

            return;
        }

        return await m.reply(successMessage)
    }

    return false
}

handler.help = ['tienda', 'shop', 'store']
handler.tags = ['economy', 'shop']
handler.command = /^(tienda|shop|store)$/i
handler.register = true
handler.group = true

export default handler
