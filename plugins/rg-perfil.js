import moment from 'moment-timezone';
import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';

const RANKS = {
  0: { name: "Novato", icon: "🔰", minExp: 0 },
  1: { name: "Aprendiz", icon: "⚡", minExp: 500 },
  2: { name: "Guerrero", icon: "⚔️", minExp: 1500 },
  3: { name: "Veterano", icon: "🛡️", minExp: 3500 },
  4: { name: "Experto", icon: "🎯", minExp: 7000 },
  5: { name: "Maestro", icon: "⭐", minExp: 15000 },
  6: { name: "Campeón", icon: "🏆", minExp: 30000 },
  7: { name: "Leyenda", icon: "👑", minExp: 60000 },
  8: { name: "Mítico", icon: "🌟", minExp: 120000 },
  9: { name: "ERUDITO DE ARMAS", icon: "💎", minExp: 250000 },
  10: { name: "ERUDITO DE ARMAS BINARIAS", icon: "🔮", minExp: 0, special: true }
}

function getRank(totalExp) {
  for (let i = Object.keys(RANKS).length - 1; i >= 0; i--) {
    if (RANKS[i].special) continue
    if (totalExp >= RANKS[i].minExp) {
      return { ...RANKS[i], level: i }
    }
  }
  return { ...RANKS[0], level: 0 }
}

let handler = async (m, { conn, args }) => {
    let userId;
    if (m.quoted && m.quoted.sender) {
        userId = m.quoted.sender;
    } else {
        userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
    }

    let user = global.db.data.users[userId];
    
    
    if (!user.rpgData) {
        user.rpgData = {
            level: 1, hp: 100, maxHp: 100, attack: 20, defense: 10,
            exp: 0, totalExp: 0, wins: 0, losses: 0, bossKills: 0,
            ultraBossKills: 0, lastAdventure: 0, rank: 0, specialRank: false
        }
    }

    let name = conn.getName(userId);
    let cumpleanos = user.birth || 'No especificado';
    let genero = user.genre || 'No especificado';
    let pareja = user.marry || 'Nadie';
    let description = user.description || 'Sin Descripción';
    let exp = user.exp || 0;
    let nivel = user.level || 0;
    let role = user.role || 'Sin Rango';
    let coins = user.coin || 0;
    let bankCoins = user.bank || 0;
    
    
    let currentRank = getRank(user.rpgData?.totalExp || 0);
    let specialRankText = user.rpgData?.specialRank ? `${RANKS[10].icon} ${RANKS[10].name}` : "";

    let perfil = await conn.profilePictureUrl(userId, 'image').catch(_ => 'https://w7.pngwing.com/pngs/492/82/png-transparent-hatsune-miku-vocaloid-anime-animation-hatsune-miku-blue-fictional-characters-black-hair.png');

    let profileText = `💙 *PERFIL COMPLETO* ◢@${userId.split('@')[0]}◤
${description}

👤 *INFORMACIÓN PERSONAL*
🐱🏍 Edad » ${user.age || 'Desconocida'}
🎉 Cumpleaños » ${cumpleanos}
🚻 Género » ${genero}
💍 Casado con » ${pareja}

💰 *ECONOMÍA*
💎 Coins Cartera » ${coins.toLocaleString()}
🎫 Coins Banco » ${bankCoins.toLocaleString()}
🔰 Premium » ${user.premium ? '✅' : '❌'}

⚔️ *ESTADÍSTICAS RPG*
📊 Nivel RPG » ${user.rpgData?.level || 1}
❤️ HP » ${user.rpgData?.hp || 100}/${user.rpgData?.maxHp || 100}
⚔️ Ataque » ${user.rpgData?.attack || 20}
🛡️ Defensa » ${user.rpgData?.defense || 10}
⭐ EXP Total » ${(user.rpgData?.totalExp || 0).toLocaleString()}
${currentRank.icon} Rango » ${currentRank.name}
${specialRankText ? `${specialRankText}\n` : ''}🏆 Victorias » ${user.rpgData?.wins || 0}
💀 Derrotas » ${user.rpgData?.losses || 0}
👑 Jefes Derrotados » ${user.rpgData?.bossKills || 0}
🌌 Ultra Boss » ${user.rpgData?.ultraBossKills || 0}

🎮 *SISTEMA GENERAL*
💫 Experiencia » ${exp.toLocaleString()}
📈 Nivel » ${nivel}
🔌 Rango » ${role}`.trim();

    try {
        await conn.sendMessage(m.chat, {
            image: { url: perfil },
            caption: profileText,
            footer: '💙 Perfil Completo - Hatsune Miku Bot',
            contextInfo: {
                mentionedJid: [userId]
            }
        }, { quoted: m });
    } catch {
        await conn.sendMessage(m.chat, { 
            text: profileText,
            contextInfo: {
                mentionedJid: [userId],
                externalAdReply: {
                    title: '💙 Perfil de Usuario 💙',
                    body: 'Hatsune Miku Bot',
                    thumbnailUrl: perfil,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};

handler.help = ['profile'];
handler.tags = ['rg'];
handler.command = ['profile', 'perfil'];

export default handler;