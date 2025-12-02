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

const waifuList = [
    { name: "Hatsune Chibi", rarity: "común", img: "https://i.pinimg.com/originals/21/68/0a/21680a7aeec369f1428daaa82a054eac.png" },
    { name: "Aoki Chibi", rarity: "común", img: "https://files.catbox.moe/ds1rt5.png" },
    { name: "Momo Chibi", rarity: "común", img: "https://qu.ax/snGCa.png" },
    { name: "Ritsu chibi", rarity: "común", img: "https://i.pinimg.com/474x/6a/40/42/6a4042784e3330a180743d6cef798521.jpg" },
    { name: "Defoko Chibi", rarity: "común", img: "https://files.catbox.moe/r951p2.png" },
    { name: "Neru Chibi", rarity: "común", img: "https://files.catbox.moe/ht6aci.png" },
    { name: "Haku Chibi", rarity: "común", img: "https://images.jammable.com/voices/yowane-haku-6GXWn/2341bc1d-9a5e-4419-8657-cb0cd6bbba40.png" },
    { name: "Rin Chibi", rarity: "común", img: "https://files.catbox.moe/2y6wre.png" },
    { name: "Teto Chibi", rarity: "común", img: "https://files.catbox.moe/h9m6ac.webp" },
    { name: "Gumi Chibi", rarity: "común", img: "https://i.pinimg.com/originals/84/20/37/84203775150673cf10084888b4f7d67f.png" },
    { name: "Emu Chibi", rarity: "común", img: "https://files.catbox.moe/nrchrb.webp" },
    { name: "Len Chibi", rarity: "común", img: "https://files.catbox.moe/rxvuqq.png" },
    { name: "Luka Chibi", rarity: "común", img: "https://files.catbox.moe/5cyyis.png" },
    { name: "Sukone Chibi", rarity: "común", img: "https://qu.ax/ROZWw.png" },
    { name: "Hatsune Miku 2006", rarity: "rara", img: "https://i.pinimg.com/736x/37/3c/3b/373c3b3b3b3b3b3b3b3b3b3b3b3b3b3b.jpg" },
    { name: "Kagamine Rin", rarity: "rara", img: "https://i.pinimg.com/736x/5a/1b/2c/5a1b2c2c2c2c2c2c2c2c2c2c2c2c2c2c.jpg" },
    { name: "Kagamine Len", rarity: "rara", img: "https://i.pinimg.com/736x/6b/2d/3e/6b2d3e3e3e3e3e3e3e3e3e3e3e3e3e3e.jpg" },
    { name: "Megurine Luka", rarity: "épica", img: "https://i.pinimg.com/736x/7c/3f/4f/7c3f4f4f4f4f4f4f4f4f4f4f4f4f4f4f.jpg" },
    { name: "KAITO", rarity: "épica", img: "https://i.pinimg.com/736x/8d/4g/5g/8d4g5g5g5g5g5g5g5g5g5g5g5g5g5g5g.jpg" },
    { name: "MEIKO", rarity: "épica", img: "https://i.pinimg.com/736x/9e/5h/6h/9e5h6h6h6h6h6h6h6h6h6h6h6h6h6h.jpg" },
    { name: "Hatsune Miku V4X", rarity: "Legendaria", img: "https://i.pinimg.com/736x/af/6i/7i/af6i7i7i7i7i7i7i7i7i7i7i7i7i7i7i.jpg" },
    { name: "Hatsune Miku NT", rarity: "Legendaria", img: "https://i.pinimg.com/736x/bg/7j/8j/bg7j8j8j8j8j8j8j8j8j8j8j8j8j8j8j.jpg" }
];

function getRandomWaifu(rarity = null) {
    let filteredWaifus = waifuList;
    if (rarity) {
        filteredWaifus = waifuList.filter(w => w.rarity === rarity);
    }
    return filteredWaifus[Math.floor(Math.random() * filteredWaifus.length)];
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

    const shopImage = 'https://wallpapers-clan.com/wp-content/uploads/2025/04/hatsune-miku-cherry-blossoms-pc-desktop-laptop-wallpaper-cover.jpg'

    const buttons = [
        { buttonId: 'shop_limited', buttonText: { displayText: '⏰ OFERTAS LIMITADAS' }, type: 1 },
        { buttonId: 'shop_premium', buttonText: { displayText: '💎 WAIFU PREMIUM' }, type: 1 },
        { buttonId: 'shop_rpg', buttonText: { displayText: '⚔️ ITEMS RPG' }, type: 1 },
        { buttonId: 'shop_cosmetics', buttonText: { displayText: '🎨 COSMÉTICOS' }, type: 1 }
    ]

    const coins = user.coin || 0

    let shopMessage = `🏪 *TIENDA PREMIUM HATSUNE MIKU* 🏪\n\n`
    shopMessage += `💰 *Tus monedas:* ${coins} cebollines\n\n`
    shopMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
    shopMessage += `🎯 *¡Bienvenido a la tienda más exclusiva!*\n\n`
    shopMessage += `✨ Descubre ofertas increíbles\n`
    shopMessage += `💎 Waifu premium con beneficios únicos\n`
    shopMessage += `⚔️ Items para potenciar tu aventura\n`
    shopMessage += `🎨 Personaliza tu experiencia\n\n`
    shopMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
    shopMessage += `💡 *Selecciona una categoría:*\n\n`
    shopMessage += `• ⏰ *Ofertas Limitadas* - Descuentos temporales\n`
    shopMessage += `• 💎 *Waifu Premium* - Personajes exclusivos\n`
    shopMessage += `• ⚔️ *Items RPG* - Mejoras de combate\n`
    shopMessage += `• 🎨 *Cosméticos* - Personalización\n\n`
    shopMessage += `━━━━━━━━━━━━━━━━━━━━━`

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

    let buttonId = null

    if (m.message.templateButtonReplyMessage) {
        buttonId = m.message.templateButtonReplyMessage.selectedId
    }
    if (m.message.buttonsResponseMessage) {
        buttonId = m.message.buttonsResponseMessage.selectedButtonId
    }

    const user = global.db.data.users[m.sender]
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

        let limitedMessage = `⏰ *OFERTAS LIMITADAS* ⏰\n\n`
        limitedMessage += `💰 *Tus monedas:* ${coins} cebollines\n\n`

        if (discountInfo.active) {
            limitedMessage += `🎉 *¡DESCUENTO DEL ${discountInfo.discount}% ACTIVO!*\n`
            limitedMessage += `⏱️ *Tiempo restante:* ${discountInfo.timeLeft}\n\n`
        }

        limitedMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        limitedMessage += `🎁 *PACK BÁSICO*\n`
        limitedMessage += `💰 Precio: ${pack1Price} coins ${discountInfo.active ? `(antes: 500)` : ''}\n`
        limitedMessage += `• 3 Waifu aleatorias garantizadas\n`
        limitedMessage += `• 1000 EXP extra\n`
        limitedMessage += `• Bono: 10% descuento tienda\n\n`
        limitedMessage += `💎 *PACK PREMIUM*\n`
        limitedMessage += `💰 Precio: ${pack2Price} coins ${discountInfo.active ? `(antes: 1200)` : ''}\n`
        limitedMessage += `• 1 Waifu rara garantizada\n`
        limitedMessage += `• 5 Pócimas de salud\n`
        limitedMessage += `• 2500 EXP extra\n`
        limitedMessage += `• Bono: 25% descuento tienda\n\n`
        limitedMessage += `👑 *PACK LEGENDARIO*\n`
        limitedMessage += `💰 Precio: ${pack3Price} coins ${discountInfo.active ? `(antes: 2500)` : ''}\n`
        limitedMessage += `• 1 Waifu legendaria garantizada\n`
        limitedMessage += `• Set completo de equipo\n`
        limitedMessage += `• 10000 EXP extra\n`
        limitedMessage += `• Bono: 50% descuento tienda (24h)\n\n`
        limitedMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`

        if (discountInfo.active) {
            limitedMessage += `⚠️ *¡Aprovecha el descuento antes de que termine!*\n\n`
        } else {
            limitedMessage += `⚠️ *Próximo descuento: 14:00-17:00 (15%) y 20:00-23:00 (25%)*\n\n`
        }

        limitedMessage += `🎲 *Las waifu son completamente aleatorias!*`

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
            { buttonId: 'buy_premium_miku', buttonText: { displayText: '🎵 Hatsune Miku Premium - 5000' }, type: 1 },
            { buttonId: 'buy_premium_luka', buttonText: { displayText: '🎼 Luka Megurine Premium - 4500' }, type: 1 },
            { buttonId: 'buy_premium_rin', buttonText: { displayText: '🎶 Rin & Len Premium - 4000' }, type: 1 },
            { buttonId: 'shop_back', buttonText: { displayText: '⬅️ Volver' }, type: 1 }
        ]

        let premiumMessage = `💎 *WAIFU PREMIUM* 💎\n\n`
        premiumMessage += `💰 *Tus monedas:* ${coins} cebollines\n\n`
        premiumMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        premiumMessage += `🎵 *HATSUNE MIKU PREMIUM*\n`
        premiumMessage += `• Personaje único con animaciones\n`
        premiumMessage += `• Bono experiencia: +100%\n`
        premiumMessage += `• Regeneración automática de HP\n`
        premiumMessage += `• Acceso a canales premium\n`
        premiumMessage += `• Marco especial en perfil\n\n`
        premiumMessage += `🎼 *LUKA MEGURINE PREMIUM*\n`
        premiumMessage += `• Voz especial en comandos\n`
        premiumMessage += `• Bono ataque: +50%\n`
        premiumMessage += `• Protección contra robos\n`
        premiumMessage += `• Efectos visuales únicos\n\n`
        premiumMessage += `🎶 *RIN & LEN PREMIUM*\n`
        premiumMessage += `• Pareja inseparable\n`
        premiumMessage += `• Bono defensa: +75%\n`
        premiumMessage += `• Habilidad especial: doble turno\n`
        premiumMessage += `• Animaciones sincronizadas\n\n`
        premiumMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        premiumMessage += `✨ *¡Waifu exclusivas con beneficios únicos!*`

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

        let rpgMessage = `⚔️ *ITEMS RPG* ⚔️\n\n`
        rpgMessage += `💰 *Tus monedas:* ${coins} cebollines\n\n`
        rpgMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        rpgMessage += `🧪 *POCIÓN DE SALUD*\n`
        rpgMessage += `• Restaura 50 HP\n`
        rpgMessage += `• Uso inmediato\n\n`
        rpgMessage += `💉 *MEGA POCION*\n`
        rpgMessage += `• Restaura HP completo\n`
        rpgMessage += `• Efecto inmediato\n\n`
        rpgMessage += `⚔️ *POCIÓN DE FUERZA*\n`
        rpgMessage += `• +3 Ataque permanente\n`
        rpgMessage += `• Efecto acumulable\n\n`
        rpgMessage += `🛡️ *POCIÓN DE DEFENSA*\n`
        rpgMessage += `• +2 Defensa permanente\n`
        rpgMessage += `• Protección mejorada\n\n`
        rpgMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        rpgMessage += `🎮 *Potencia tus aventuras con estos items!*`

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

        let cosmeticMessage = `🎨 *COSMÉTICOS* 🎨\n\n`
        cosmeticMessage += `💰 *Tus monedas:* ${coins} cebollines\n\n`
        cosmeticMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        cosmeticMessage += `🎨 *MARCO MIKU*\n`
        cosmeticMessage += `• Marco exclusivo de Miku\n`
        cosmeticMessage += `• Efecto brillante\n\n`
        cosmeticMessage += `🌸 *MARCO SAKURA*\n`
        cosmeticMessage += `• Pétalos animados\n`
        cosmeticMessage += `• Diseño floral único\n\n`
        cosmeticMessage += `👑 *TÍTULO VIP*\n`
        cosmeticMessage += `• Prefijo especial en mensajes\n`
        cosmeticMessage += `• Reconocimiento premium\n\n`
        cosmeticMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        cosmeticMessage += `✨ *Personaliza tu experiencia de juego!*`

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

        let shopMessage = `🏪 *TIENDA PREMIUM HATSUNE MIKU* 🏪\n\n`
        shopMessage += `💰 *Tus monedas:* ${coins} cebollines\n\n`
        shopMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        shopMessage += `🎯 *¡Bienvenido a la tienda más exclusiva!*\n\n`
        shopMessage += `✨ Descubre ofertas increíbles\n`
        shopMessage += `💎 Waifu premium con beneficios únicos\n`
        shopMessage += `⚔️ Items para potenciar tu aventura\n`
        shopMessage += `🎨 Personaliza tu experiencia\n\n`
        shopMessage += `━━━━━━━━━━━━━━━━━━━━━\n\n`
        shopMessage += `💡 *Selecciona una categoría:*\n\n`
        shopMessage += `• ⏰ *Ofertas Limitadas* - Descuentos temporales\n`
        shopMessage += `• 💎 *Waifu Premium* - Personajes exclusivos\n`
        shopMessage += `• ⚔️ *Items RPG* - Mejoras de combate\n`
        shopMessage += `• 🎨 *Cosméticos* - Personalización\n\n`
        shopMessage += `━━━━━━━━━━━━━━━━━━━━━`

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
                itemDescription = 'Hatsune Miku Premium (personaje único con beneficios exclusivos)'
                rewards = [{ type: 'premium_waifu', name: 'Hatsune Miku Premium' }]
                break
            case 'buy_premium_luka':
                finalPrice = 4500
                itemDescription = 'Luka Megurine Premium (voz especial + bono ataque)'
                rewards = [{ type: 'premium_waifu', name: 'Luka Megurine Premium' }]
                break
            case 'buy_premium_rin':
                finalPrice = 4000
                itemDescription = 'Rin & Len Premium (pareja inseparable + bono defensa)'
                rewards = [{ type: 'premium_waifu', name: 'Rin & Len Premium' }]
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
        if (!db.users[userId]) {
            db.users[userId] = { name: 'Usuario', characters: [] };
        }

        let successMessage = `✅ *¡COMPRA EXITOSA!* ✅\n\n`
        successMessage += `🛍️ *Producto:* ${itemDescription}\n`
        if (discountInfo.active && buttonId.includes('limited')) {
            successMessage += `💰 *Precio original:* ${basePrice} cebollines\n`
            successMessage += `🎉 *Precio con descuento:* ${finalPrice} cebollines (${discountInfo.discount}% OFF)\n`
        } else {
            successMessage += `💰 *Precio:* ${finalPrice} cebollines\n`
        }
        successMessage += `💳 *Saldo restante:* ${user.coin} cebollines\n\n`

        successMessage += `🎁 *Recompensas obtenidas:*\n`

        for (const reward of rewards) {
            if (reward.type === 'waifu') {
                const waifus = getRandomWaifus(reward.count, reward.rarity)
                for (const waifu of waifus) {
                    const exists = db.users[userId].characters.find(
                        char => char.name === waifu.name && char.rarity === waifu.rarity
                    );

                    if (!exists) {
                        db.users[userId].characters.push({
                            name: waifu.name,
                            rarity: waifu.rarity,
                            obtainedAt: new Date().toISOString(),
                            obtainedFrom: 'tienda_pack'
                        });
                        successMessage += `💙 ${waifu.name} (${waifu.rarity})\n`
                    } else {
                        successMessage += `💙 ${waifu.name} (${waifu.rarity}) - ¡Ya la tienes!\n`
                    }
                }
            } else if (reward.type === 'exp') {
                if (!user.rpgData) {
                    user.rpgData = { level: 1, hp: 100, maxHp: 100, attack: 20, defense: 10, exp: 0, wins: 0, losses: 0, lastAdventure: 0 };
                }
                user.rpgData.exp += reward.amount;
                successMessage += `⭐ +${reward.amount} EXP\n`
            } else if (reward.type === 'potion') {
                successMessage += `🧪 +${reward.count} Pócimas de salud\n`
            } else if (reward.type === 'equipment') {
                successMessage += `⚔️ Set completo de equipo RPG\n`
            } else if (reward.type === 'discount') {
                successMessage += `💰 ${reward.percentage}% descuento en tienda${reward.duration ? ` (${reward.duration}h)` : ''}\n`
            } else if (reward.type === 'premium_waifu') {
                const premiumWaifu = {
                    name: reward.name,
                    rarity: 'premium',
                    obtainedAt: new Date().toISOString(),
                    obtainedFrom: 'tienda_premium',
                    benefits: ['exp_boost', 'special_effects', 'unique_abilities']
                };
                db.users[userId].characters.push(premiumWaifu);
                successMessage += `💎 ${reward.name} (Premium)\n`
            } else if (reward.type === 'rpg_item') {
                if (!user.rpgData) {
                    user.rpgData = { level: 1, hp: 100, maxHp: 100, attack: 20, defense: 10, exp: 0, wins: 0, losses: 0, lastAdventure: 0 };
                }

                if (reward.effect === 'heal') {
                    const healAmount = Math.min(reward.amount, user.rpgData.maxHp - user.rpgData.hp);
                    user.rpgData.hp += healAmount;
                    successMessage += `❤️ +${healAmount} HP restaurado\n`
                } else if (reward.effect === 'fullheal') {
                    const fullHealAmount = user.rpgData.maxHp - user.rpgData.hp;
                    user.rpgData.hp = user.rpgData.maxHp;
                    successMessage += `💚 HP completamente restaurado (+${fullHealAmount})\n`
                } else if (reward.effect === 'attack') {
                    user.rpgData.attack += reward.amount;
                    successMessage += `⚔️ +${reward.amount} Ataque permanente\n`
                } else if (reward.effect === 'defense') {
                    user.rpgData.defense += reward.amount;
                    successMessage += `🛡️ +${reward.amount} Defensa permanente\n`
                }
            } else if (reward.type === 'cosmetic') {
                successMessage += `🎨 ${reward.item.replace('_', ' ').toUpperCase()}\n`
            }
        }

        saveDatabase(db);

        successMessage += `\n🎉 ¡Gracias por tu compra! Disfruta de tus nuevas recompensas.`

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
