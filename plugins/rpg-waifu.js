import { promises as fs } from 'fs';

global.db = global.db || {};
global.db.waifu = global.db.waifu || {
    cooldowns: {},
    waifus: {},
    collection: {}
};


const waifuList = [
   
    {
        name: "Hatsune Chibi",
        rarity: "común",
        probability: 5,  
        img: "https://qu.ax/aWtNa.png"
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
        img: "https://qu.ax/BReiE.png"
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
        img: "https://qu.ax/MsAUn.png"
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
        img: "https://qu.ax/xpAMK.png"
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
        name: "Defoko Utau",
        rarity: "rara",
        probability: 3,
        img: "https://files.catbox.moe/0ghewm.png"
    },
    {
        name: "Yowane Haku 2006",
        rarity: "rara",
        probability: 3,
        img: "https://qu.ax/QAaKc.png"
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
        img: "https://qu.ax/mMBGD.png"
    },
    
    
    {
        name: "💙Miku💙",
        rarity: "épica",
        probability: 1.5,
        img: "https://qu.ax/KxBuO.png"
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
        name: "💛Neru💛",
        rarity: "épica",
        probability: 1.5,
        img: "https://qu.ax/pZTCf.png"
    },
    {
        name: "🍺Haku🍺",
        rarity: "épica",
        probability: 1.5,
        img: "https://qu.ax/MKmhB.png"
    },
    {
        name: "💛Rin💛",
        rarity: "épica",
        probability: 1.5,
        img: "https://qu.ax/muceU.png"
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
        img: "https://qu.ax/nskdt.png"
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
        img: "https://qu.ax/NLdTF.png"
    },
    {
        name: "🍻Yowane Haku🥂",
        rarity: "ultra rara",
        probability: 0.4,
        img: "https://qu.ax/RwlPs.png"
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
        img: "https://qu.ax/HYHSi.png"
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
    
    
    if (global.db.waifu.cooldowns[userId]) {
        const timeDiff = currentTime - global.db.waifu.cooldowns[userId];
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

    
    let message = `🎲 WAIFU GACHA 🎲\n\n`;
    message += `👤 Invocador: @${userId.split('@')[0]}\n`;
    message += `${rarityColors[selectedWaifu.rarity]} Rareza: ${selectedWaifu.rarity.toUpperCase()} (${rarityProbs[selectedWaifu.rarity]})\n`;
    message += `💫 ¡Felicidades! Obtuviste a:\n`;
    message += `💙 ${selectedWaifu.name}\n`;
    message += `\n💫 Usa .save o .c para guardar tu waifu!`;

   
    await conn.sendMessage(m.chat, { 
        image: { url: selectedWaifu.img },
        caption: message,
        mentions: [userId]
    });

    
    global.db.waifu.cooldowns[userId] = currentTime;
    global.db.waifu.waifus[userId] = selectedWaifu;
}

handler.help = ['rw']
handler.tags = ['rpg']
handler.command = /^(rw|rollwaifu|gacha)$/i
handler.register = true
handler.group = true
handler.cooldown = 900000

export default handler





// --- FUNCIONES PARA REGALAR Y SUBASTAR WAIFUS ---

// Comando: .regalarwaifu @usuario
let regalarWaifuHandler = async (m, { conn, args, participants }) => {
    const userId = m.sender;
    const mentionedJid = (m.mentionedJid && m.mentionedJid[0]) || args[0];
    if (!mentionedJid) return m.reply('Debes mencionar a quién quieres regalar tu waifu.');
    if (!global.db.waifu.waifus[userId]) return m.reply('No tienes ninguna waifu para regalar.');
    if (userId === mentionedJid) return m.reply('No puedes regalarte una waifu a ti mismo.');
    // Transferencia
    global.db.waifu.waifus[mentionedJid] = global.db.waifu.waifus[userId];
    delete global.db.waifu.waifus[userId];
    m.reply(`🎁 Has regalado tu waifu a @${mentionedJid.split('@')[0]}!`, null, { mentions: [mentionedJid] });
};

regalarWaifuHandler.help = ['regalarwaifu @usuario'];
regalarWaifuHandler.tags = ['rpg'];
regalarWaifuHandler.command = /^(regalarwaifu)$/i;
regalarWaifuHandler.register = true;
regalarWaifuHandler.group = true;

// Comando: .subastawaifu cantidad
let subasta = {};
let subastarWaifuHandler = async (m, { conn, args }) => {
    const userId = m.sender;
    const waifu = global.db.waifu.waifus[userId];
    if (!waifu) return m.reply('No tienes ninguna waifu para subastar.');
    const cantidad = parseInt(args[0]);
    if (isNaN(cantidad) || cantidad <= 0) return m.reply('Debes indicar una cantidad válida para la subasta.');
    if (subasta[userId]) return m.reply('Ya tienes una subasta activa. Espera a que termine.');
    subasta[userId] = { waifu, cantidad, puja: 0, mejorPostor: null, timeout: null };
    m.reply(`🔨 Subasta iniciada por @${userId.split('@')[0]}: ${waifu.name}\nPrecio inicial: ${cantidad} monedas\nUsa .pujarwaifu <cantidad> para pujar.`, null, { mentions: [userId] });
    // Finaliza subasta en 1 minuto
    subasta[userId].timeout = setTimeout(() => {
        if (subasta[userId].mejorPostor) {
            // Transferir waifu y monedas
            global.db.waifu.waifus[subasta[userId].mejorPostor] = waifu;
            delete global.db.waifu.waifus[userId];
            // Resta monedas al ganador (asume global.db.data.users)
            global.db.data.users[subasta[userId].mejorPostor].money -= subasta[userId].puja;
            global.db.data.users[userId].money += subasta[userId].puja;
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

// Comando: .pujarwaifu cantidad
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
    if (!global.db.data.users[userId] || global.db.data.users[userId].money < cantidad) return m.reply('No tienes suficientes monedas.');
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







