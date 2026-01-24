const handler = async (m, { isPrems, conn }) => {
  
  if (!global.db) {
    global.db = { data: { users: {} } };
  }
  if (!global.db.data) {
    global.db.data = { users: {} };
  }
  if (!global.db.data.users) {
    global.db.data.users = {};
  }
  
  
  if (!global.db.data.users[m.sender]) {
    global.db.data.users[m.sender] = {
      coin: 0,
      diamonds: 0,
      joincount: 0,
      exp: 0,
      lastcofre: 0,
      waifus: [],
      keys: 0,
      potions: 0,
      magicScrolls: 0
    };
  }

  const user = global.db.data.users[m.sender];
  const lastCofreTime = user.lastcofre || 0;
  const timeToNextCofre = lastCofreTime + 86400000;

  if (Date.now() < timeToNextCofre) {
    const tiempoRestante = timeToNextCofre - Date.now();
    const mensajeEspera = `💙 ¡Ya reclamaste tu cofre virtual de Miku hoy! 💙\n⏰️ Regresa en: *${msToTime(tiempoRestante)}* para obtener más tesoros musicales. ✨`;
    await conn.sendMessage(m.chat, { text: mensajeEspera }, { quoted: m });
    return true;
  }

  const img = 'https://media.tenor.com/I_1R0Sf588QAAAPo/hatsune-miku-hatsune.mp4';
  
  
  const monedas = Math.floor(Math.random() * 200) + 50;
  const diamantes = Math.floor(Math.random() * 20) + 5;
  const tokens = Math.floor(Math.random() * 15) + 3;
  const experiencia = Math.floor(Math.random() * 10000) + 2000;
  const llaves = Math.floor(Math.random() * 3);
  const pociones = Math.floor(Math.random() * 2);
  const pergaminos = Math.floor(Math.random() * 2);
  
  
  const waifuList = [
    
    { name: "Hatsune Chibi", rarity: "común", probability: 5, img: "https://i.pinimg.com/originals/21/68/0a/21680a7aeec369f1428daaa82a054eac.png" },
    { name: "Aoki Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/ds1rt5.png" },
    { name: "Momo Chibi", rarity: "común", probability: 5, img: "https://i.pinimg.com/736x/89/85/bf/8985bf3fefe2bf09fbd5602bf325285b.jpg" },
    { name: "Ritsu chibi", rarity: "común", probability: 5, img: "https://i.pinimg.com/474x/6a/40/42/6a4042784e3330a180743d6cef798521.jpg" },
    { name: "Defoko Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/r951p2.png" },
    { name: "Neru Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/ht6aci.png" },
    { name: "Haku Chibi", rarity: "común", probability: 5, img: "https://images.jammable.com/voices/yowane-haku-6GXWn/2341bc1d-9a5e-4419-8657-cb0cd6bbba40.png" },
    { name: "Rin Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/2y6wre.png" },
    { name: "Teto Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/h9m6ac.webp" },
    { name: "Gumi Chibi", rarity: "común", probability: 5, img: "https://i.pinimg.com/originals/84/20/37/84203775150673cf10084888b4f7d67f.png" },
    { name: "Emu Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/nrchrb.webp" },
    { name: "Len Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/rxvuqq.png" },
    { name: "Luka Chibi", rarity: "común", probability: 5, img: "https://files.catbox.moe/5cyyis.png" },
    { name: "Sukone Chibi", rarity: "común", probability: 5, img: "https://i.pinimg.com/736x/bd/65/34/bd65347807569025f7196e1da753c252.jpg" },
    { name: "Fuiro Chibi", rarity: "común", probability: 5, img: "https://i.pinimg.com/736x/ca/b5/a4/cab5a41cac30a455a70d1b80c89c662b.jpg" },
    
    { name: "Hatsune Miku 2006", rarity: "rara", probability: 3, img: "https://i.pinimg.com/736x/ab/22/a9/ab22a9b92f94e77c46645ac78d16a01b.jpg" },
    { name: "Aoki Lapis 2006", rarity: "rara", probability: 3, img: "https://files.catbox.moe/5m2nw3.png" },
    { name: "Momone momo 2006", rarity: "rara", probability: 3, img: "https://i.pinimg.com/736x/23/42/38/2342389710827674684269196ebabbb6.jpg" },
    { name: "Namine Ritsu 2006", rarity: "rara", probability: 3, img: "https://i.pinimg.com/736x/64/4d/7e/644d7e9ddff3461dee41850febf411c5.jpg" },
    { name: "Defoko Utau", rarity: "rara", probability: 3, img: "https://files.catbox.moe/0ghewm.png" },
    { name: "Yowane Haku 2006", rarity: "rara", probability: 3, img: "https://i.pinimg.com/originals/13/5d/02/135d0231c953db4d8cd85cc42abdf7b2.png" },
    { name: "Akita Neru 2006", rarity: "rara", probability: 3, img: "https://files.catbox.moe/zia0tk.png" },
    { name: "Sukone Tei 2006", rarity: "rara", probability: 3, img: "https://i.pinimg.com/736x/67/1e/40/671e40a106af9b5e4cf1e14a212266a7.jpg" },
    { name: "Gumi Megpoid 2006", rarity: "rara", probability: 3, img: "https://files.catbox.moe/ulvmhk.png" },
    { name: "Rin", rarity: "rara", probability: 3, img: "https://files.catbox.moe/wk4sh0.png" },
    { name: "Teto", rarity: "rara", probability: 3, img: "https://i.pinimg.com/736x/ff/1b/5e/ff1b5e2a8c30cedab77eb4490cea7b0e.jpg" },
    { name: "Emu Otori", rarity: "rara", probability: 3, img: "https://files.catbox.moe/vphcvo.png" },
    { name: "Len", rarity: "rara", probability: 3, img: "https://files.catbox.moe/x4du11.png" },
    { name: "Luka Megurine 2006", rarity: "rara", probability: 3, img: "https://i1.sndcdn.com/artworks-8ne47oeiNyxO90bm-LBx2Ng-t500x500.jpg" },
    { name: "Fuiro 2006", rarity: "rara", probability: 3, img: "https://gprw.s3.amazonaws.com/uploads/releases/614/image/lg-022f3cf7193976905295029c6bbfbe86.png" },
    
    { name: "💙Miku💙", rarity: "épica", probability: 1.5, img: "https://cdn.vietgame.asia/wp-content/uploads/20161116220419/hatsune-miku-project-diva-future-tone-se-ra-mat-o-phuong-tay-news.jpg" },
    { name: "💚Momo💗", rarity: "épica", probability: 1.5, img: "https://i.pinimg.com/736x/e7/8e/99/e78e995ea0bd0c4affd17c8d476c4c09.jpg" },
    { name: "🩵Aoki Lapis🩵", rarity: "épica", probability: 1.5, img: "https://files.catbox.moe/gje6q7.png" },
    { name: "❤Sukone🤍", rarity: "épica", probability: 1.5, img: "https://i1.sndcdn.com/artworks-000147734539-c348up-t1080x1080.jpg" },
    { name: "💜Defoko Utane💜", rarity: "épica", probability: 1.5, img: "https://files.catbox.moe/eb1jy3.png" },
    { name: "❤Ritsu🖤", rarity: "épica", probability: 1.5, img: "https://i1.sndcdn.com/artworks-000033453125-njjsvn-t1080x1080.jpg" },
    { name: "💛Neru💛", rarity: "épica", probability: 1.5, img: "https://images3.alphacoders.com/768/768095.jpg" },
    { name: "🍺Haku🍺", rarity: "épica", probability: 1.5, img: "https://prodigits.co.uk/thumbs/wallpapers/p2/anime/12/681ab84912482088.jpg" },
    { name: "💛Rin💛", rarity: "épica", probability: 1.5, img: "https://images5.alphacoders.com/330/330144.jpg" },
    { name: "💚Gumi💚", rarity: "épica", probability: 1.5, img: "https://files.catbox.moe/hpalur.png" },
    { name: "❤Teto❤", rarity: "épica", probability: 1.5, img: "https://files.catbox.moe/k5w0ea.png" },
    { name: "💗Emu💗", rarity: "épica", probability: 1.5, img: "https://files.catbox.moe/sygb0h.png" },
    { name: "🍌 Len 🍌", rarity: "épica", probability: 1.5, img: "https://i.pinimg.com/236x/3a/af/e5/3aafe5d43f983f083440fb5ab9d9f3d8.jpg" },
    { name: "💗LUKA🪷", rarity: "épica", probability: 1.5, img: "https://files.catbox.moe/bp2wrg.webp" },
    { name: "🖤FUIRO🖤", rarity: "épica", probability: 1.5, img: "https://media.tenor.com/-zHmFGOc-rkAAAAe/fuiro-vocaloid.png" },
    
    { name: "💙HATSUNE MIKU💙", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/881c3b.png" },
    { name: "💚Momone Momo💗", rarity: "ultra rara", probability: 0.4, img: "https://i.ytimg.com/vi/SinNL35NUuc/maxresdefault.jpg" },
    { name: "🩵Aoki Lapis🩵", rarity: "ultra rara", probability: 0.4, img: "https://c4.wallpaperflare.com/wallpaper/737/427/729/vocaloid-aoki-lapis-sword-blue-hair-wallpaper-preview.jpg" },
    { name: "🖤Namine Ritsu💞", rarity: "ultra rara", probability: 0.4, img: "https://images.gamebanana.com/img/ss/mods/668cabe0bcbff.jpg" },
    { name: "🍻Yowane Haku🥂", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/fk14cc.png" },
    { name: "🤍Sukone Tei💘", rarity: "ultra rara", probability: 0.4, img: "https://i.ytimg.com/vi/dxvU8lowsbg/maxresdefault.jpg" },
    { name: "💜Utane Defoko💜", rarity: "ultra rara", probability: 0.4, img: "https://i.pinimg.com/236x/4a/c8/aa/4ac8aa5c5fc1fc5ce83ef0fb71952e14.jpg" },
    { name: "💛AKITA NERU💛", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/agw1y1.png" },
    { name: "💗EMU OTORI💗", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/ekzntn.png" },
    { name: "💚Megpoid Gumi💚", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/opn7vz.png" },
    { name: "❤KASANE TETO❤", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/6j9jgl.webp" },
    { name: "💛KAGAMINE RIN💛", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/lh5sxn.png" },
    { name: "💥KAGAMINE LEN💢", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/awuecy.png" },
    { name: "💗MEGUMIRE LUKA💮", rarity: "ultra rara", probability: 0.4, img: "https://files.catbox.moe/jodjln.png" },
    
    { name: "💙Brazilian Miku💛", rarity: "Legendaria", probability: 0.167, img: "https://files.catbox.moe/ifl773.jpg" },
    { name: "🖤Inabakumori🖤", rarity: "Legendaria", probability: 0.167, img: "https://i.ytimg.com/vi/4bzEgrvU1lA/maxresdefault.jpg" },
    { name: "❤KASANE TETO❤", rarity: "Legendaria", probability: 0.167, img: "https://files.catbox.moe/3cb73f.jpg" },
    { name: "☢️Cyberpunk Edgerunners💫", rarity: "Legendaria", probability: 0.167, img: "https://i.pinimg.com/736x/41/20/97/4120973c715fbcaa8baeb348e7610b5d.jpg" },
    { name: "❤️🩷VOCALOIDS💛💙", rarity: "Legendaria", probability: 0.167, img: "https://files.catbox.moe/g6kfb6.jpg" },
    { name: "💢💥BORDERLANDS☢⚠", rarity: "Legendaria", probability: 0.167, img: "https://pixelz.cc/wp-content/uploads/2019/05/borderlands-3-super-deluxe-edition-uhd-4k-wallpaper.jpg" },
    { name: "🌌HALO⚕️", rarity: "Legendaria", probability: 0.167, img: "https://c4.wallpaperflare.com/wallpaper/752/1001/122/halo-master-chief-hd-wallpaper-preview.jpg" }
  ];
  
  
  const totalProbability = waifuList.reduce((sum, waifu) => sum + waifu.probability, 0);
  const roll = Math.random() * totalProbability;
  let accumulated = 0;
  let waifuObtenida = null;
  
  for (const waifu of waifuList) {
    accumulated += waifu.probability;
    if (roll <= accumulated) {
      waifuObtenida = waifu;
      break;
    }
  }
  
  if (!waifuObtenida) {
    waifuObtenida = waifuList[waifuList.length - 1];
  }
  
  
  const userWaifuData = user.waifu || { characters: [], pending: null, cooldown: 0 };
  const esWaifuNueva = !userWaifuData.characters || !userWaifuData.characters.some(w => w.name === waifuObtenida.name && w.rarity === waifuObtenida.rarity);


  
  user.coin = (user.coin || 0) + monedas;
  user.diamonds = (user.diamonds || 0) + diamantes;
  user.joincount = (user.joincount || 0) + tokens;
  user.exp = (user.exp || 0) + experiencia;
  user.keys = (user.keys || 0) + llaves;
  user.potions = (user.potions || 0) + pociones;
  user.magicScrolls = (user.magicScrolls || 0) + pergaminos;
  user.lastcofre = Date.now();
  
 
  if (!user.waifu) user.waifu = { characters: [], pending: null, cooldown: 0 };
  if (!Array.isArray(user.waifu.characters)) user.waifu.characters = [];
  
  if (esWaifuNueva) {
  
    user.waifu.characters.push({
      name: waifuObtenida.name,
      rarity: waifuObtenida.rarity,
      obtainedAt: new Date().toISOString(),
      obtainedFrom: 'cofre',
      img: waifuObtenida.img
    });
  } else {
    
    user.diamonds += 20; 
  }
  
  
  try {
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'src', 'database');
    const databaseFilePath = path.join(dbPath, 'waifudatabase.json');
    
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    
    fs.writeFileSync(databaseFilePath, JSON.stringify({ users: global.db.data.users }, null, 2));
  } catch (error) {
    console.error('Error guardando waifu database:', error);
  }

  const texto = `
╭━〔  🔮 COFRE LEGENDARIO DE MIKU 🔮 💎 〕⬣
┃ ✨ *¡HAS ABIERTO UN COFRE LEGENDARIO!* ✨
┃ 🎵 *Los tesoros del mundo virtual te esperan*
╰━━━━━━━━━━━━⬣

╭━〔 🎁 RECOMPENSAS OBTENIDAS 🎁 〕⬣
┃ 💰 *${monedas} Monedas Doradas* 💰
┃ 💎 *${diamantes} Diamantes Mágicos* 💎
┃ 🎫 *${tokens} Tickets VIP* 🎫
┃ ⭐ *${experiencia} EXP Estelar* ⭐
┃ 🔑 *${llaves} Llaves Misteriosas* 🔑
┃ 🧪 *${pociones} Pociones de Poder* 🧪
┃ 📜 *${pergaminos} Pergaminos Antiguos* 📜
╰━━━━━━━━━━━━⬣

╭━〔 👘 WAIFU RPG OBTENIDA 👘 〕⬣
┃ ${esWaifuNueva ? '🎉 ¡NUEVA WAIFU!' : '💫 Waifu Repetida'}
┃ 🌸 *${waifuObtenida.name}* 🌸
┃ 💎 *Rareza: ${waifuObtenida.rarity.toUpperCase()}* 💎
┃ ${esWaifuNueva ? '✨ ¡Añadida a tu colección RPG!' : '💎 +20 Diamantes extra'}
┃ 🔍 Usa *.col* para ver tu colección completa
╰━━━━━━━━━━━━⬣

╭━〔 📊 ESTADÍSTICAS ACTUALES 📊 〕⬣
┃ 💰 Monedas: *${user.coin}* 💎 Diamantes: *${user.diamonds}*
┃ 🎫 Tickets: *${user.joincount}* ⭐ EXP: *${user.exp}*
┃ 🔑 Llaves: *${user.keys}* 🧪 Pociones: *${user.potions}*
┃ 📜 Pergaminos: *${user.magicScrolls}* 👘 Waifus: *${user.waifu.characters.length}*
╰━━━━━━━━━━━━⬣

💙 *¡Gracias por tu lealtad al mundo de Miku!* 💙
⏰ *Próximo cofre en 24 horas* ⏰`;

  try {
    await conn.sendMessage(m.chat, { 
      video: { url: 'https://media.tenor.com/I_1R0Sf588QAAAPo/hatsune-miku-hatsune.mp4' },
      gifPlayback: true,
      caption: texto,
      mentions: []
    }, { quoted: m });
  } catch (error) {
    console.error('💙 Error al enviar el cofre:', error);
    await conn.sendMessage(m.chat, { text: texto }, { quoted: m });
  }
};

handler.help = ['cofre'];
handler.tags = ['rpg'];
handler.command = ['cofre'];
handler.level = 5;
handler.group = true;
handler.register = true;

export default handler;

function msToTime(duration) {
  const milliseconds = parseInt((duration % 1000) / 100);
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  seconds = (seconds < 10) ? '0' + seconds : seconds;

  return `${hours} Horas ${minutes} Minutos`;
}

