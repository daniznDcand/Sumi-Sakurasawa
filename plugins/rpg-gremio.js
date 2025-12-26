let cooldowns = {}

const GUILDS = {
  miku: {
    name: "💙 Gremio Hatsune Miku",
    description: "El gremio oficial de la diva virtual",
    icon: "🎤",
    benefits: {
      expBonus: 1.25,
      coinBonus: 1.20,
      dungeonBonus: 1.15,
      healthRegen: 5
    },
    requirements: {
      level: 1,
      coins: 1000
    },
    maxMembers: 50
  },
  warriors: {
    name: "⚔️ Gremio de Guerreros",
    description: "Para los más valientes aventureros",
    icon: "🛡️",
    benefits: {
      expBonus: 1.30,
      coinBonus: 1.15,
      dungeonBonus: 1.25,
      healthRegen: 8
    },
    requirements: {
      level: 5,
      coins: 2500
    },
    maxMembers: 30
  },
  merchants: {
    name: "💰 Gremio de Mercaderes",
    description: "Especialistas en comercio y riqueza",
    icon: "💎",
    benefits: {
      expBonus: 1.15,
      coinBonus: 1.40,
      dungeonBonus: 1.10,
      healthRegen: 3
    },
    requirements: {
      level: 3,
      coins: 5000
    },
    maxMembers: 40
  },
  shadows: {
    name: "🌙 Gremio de las Sombras",
    description: "Para los aventureros más sigilosos",
    icon: "🗡️",
    benefits: {
      expBonus: 1.35,
      coinBonus: 1.25,
      dungeonBonus: 1.30,
      healthRegen: 6
    },
    requirements: {
      level: 10,
      coins: 10000
    },
    maxMembers: 20
  }
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  let user = global.db.data.users[m.sender]
  
  if (!user.guildData) {
    user.guildData = {
      guild: null,
      joinDate: null,
      contributions: 0,
      rank: "Miembro"
    }
  }

  if (!text) {
    return await showGuildMenu(conn, m, user, usedPrefix)
  }

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()

  switch (action) {
    case 'unirse':
    case 'join':
      let guildId = args[1]
      return await joinGuild(conn, m, user, guildId, usedPrefix)
    case 'salir':
    case 'leave':
      return await leaveGuild(conn, m, user, usedPrefix)
    case 'info':
      let infoGuildId = args[1] || user.guildData.guild
      return await showGuildInfo(conn, m, user, infoGuildId, usedPrefix)
    case 'miembros':
    case 'members':
      return await showGuildMembers(conn, m, user, usedPrefix)
    case 'contribuir':
    case 'donate':
      let amount = parseInt(args[1]) || 0
      return await contributeToGuild(conn, m, user, amount, usedPrefix)
    default:
      return await showGuildMenu(conn, m, user, usedPrefix)
  }
}

async function showGuildMenu(conn, m, user, usedPrefix) {
  let img = 'https://files.catbox.moe/xzkumb.png'
  
  let menuText = `🏛️ *SISTEMA DE GREMIOS* 🏛️\n\n`
  
  if (user.guildData.guild) {
    let guild = GUILDS[user.guildData.guild]
    let joinDate = new Date(user.guildData.joinDate).toLocaleDateString()
    
    menuText += `${guild.icon} *Tu Gremio:* ${guild.name}\n`
    menuText += `📅 *Miembro desde:* ${joinDate}\n`
    menuText += `🎖️ *Rango:* ${user.guildData.rank}\n`
    menuText += `💝 *Contribuciones:* ${user.guildData.contributions.toLocaleString()}\n\n`
    
    menuText += `🎁 *BENEFICIOS ACTIVOS:*\n`
    menuText += `⭐ EXP: +${Math.round((guild.benefits.expBonus - 1) * 100)}%\n`
    menuText += `💰 Cebollines: +${Math.round((guild.benefits.coinBonus - 1) * 100)}%\n`
    menuText += `🏛️ Mazmorras: +${Math.round((guild.benefits.dungeonBonus - 1) * 100)}%\n`
    menuText += `❤️ Regeneración: +${guild.benefits.healthRegen} HP/hora\n\n`
    
    menuText += `📋 *COMANDOS:*\n`
    menuText += `• \`${usedPrefix}gremio info\` - Ver información del gremio\n`
    menuText += `• \`${usedPrefix}gremio miembros\` - Ver miembros\n`
    menuText += `• \`${usedPrefix}gremio contribuir [cantidad]\` - Donar cebollines\n`
    menuText += `• \`${usedPrefix}gremio salir\` - Abandonar gremio\n`
    menuText += `• \`${usedPrefix}mazmorra\` - Ir a mazmorras (con bonificación)`
    
  } else {
    menuText += `🚪 *No perteneces a ningún gremio*\n\n`
    menuText += `🏛️ *GREMIOS DISPONIBLES:*\n\n`
    
    Object.entries(GUILDS).forEach(([id, guild]) => {
      let memberCount = getMemberCount(id)
      let status = memberCount >= guild.maxMembers ? "🔴 LLENO" : "🟢 ABIERTO"
      
      menuText += `${guild.icon} **${guild.name}** ${status}\n`
      menuText += `📝 ${guild.description}\n`
      menuText += `👥 Miembros: ${memberCount}/${guild.maxMembers}\n`
      menuText += `📊 Nivel req: ${guild.requirements.level}\n`
      menuText += `💰 Costo: ${guild.requirements.coins.toLocaleString()} cebollines\n`
      menuText += `🎁 EXP: +${Math.round((guild.benefits.expBonus - 1) * 100)}% | Coins: +${Math.round((guild.benefits.coinBonus - 1) * 100)}%\n`
      menuText += `🏛️ Mazmorras: +${Math.round((guild.benefits.dungeonBonus - 1) * 100)}%\n`
      menuText += `⚡ Comando: \`${usedPrefix}gremio unirse ${id}\`\n\n`
    })
    
    menuText += `💡 *Los beneficios se aplican automáticamente en todas las actividades*`
  }

  await conn.sendFile(m.chat, img, 'gremio.jpg', menuText, fkontak)
}

async function joinGuild(conn, m, user, guildId, usedPrefix) {
  if (!guildId || !GUILDS[guildId]) {
    return m.reply('❌ Gremio no válido. Usa: miku, warriors, merchants, shadows')
  }

  if (user.guildData.guild) {
    return m.reply('❌ Ya perteneces a un gremio. Sal primero con `/gremio salir`')
  }

  let guild = GUILDS[guildId]
  let userLevel = user.level || 1
  let userCoins = user.coin || 0
  let memberCount = getMemberCount(guildId)

  if (userLevel < guild.requirements.level) {
    return m.reply(`❌ Necesitas nivel ${guild.requirements.level} para unirte a ${guild.name}`)
  }

  if (userCoins < guild.requirements.coins) {
    return m.reply(`❌ Necesitas ${guild.requirements.coins.toLocaleString()} cebollines para unirte a ${guild.name}`)
  }

  if (memberCount >= guild.maxMembers) {
    return m.reply(`❌ ${guild.name} está lleno (${guild.maxMembers}/${guild.maxMembers} miembros)`)
  }

  user.coin -= guild.requirements.coins
  user.guildData.guild = guildId
  user.guildData.joinDate = Date.now()
  user.guildData.contributions = 0
  user.guildData.rank = "Miembro"

  let joinText = `🎉 *¡BIENVENIDO AL GREMIO!* 🎉\n\n`
  joinText += `${guild.icon} Te has unido a **${guild.name}**\n`
  joinText += `💸 Cuota pagada: ${guild.requirements.coins.toLocaleString()} cebollines\n\n`
  joinText += `🎁 *BENEFICIOS OBTENIDOS:*\n`
  joinText += `⭐ +${Math.round((guild.benefits.expBonus - 1) * 100)}% EXP en todas las actividades\n`
  joinText += `💰 +${Math.round((guild.benefits.coinBonus - 1) * 100)}% Cebollines\n`
  joinText += `🏛️ +${Math.round((guild.benefits.dungeonBonus - 1) * 100)}% Recompensas de mazmorras\n`
  joinText += `❤️ +${guild.benefits.healthRegen} HP de regeneración por hora\n\n`
  joinText += `💡 *Los beneficios se aplican automáticamente*\n`
  joinText += `🤝 *Contribuye al gremio para mejorar tu rango*`

  await conn.reply(m.chat, joinText, m)
}

async function leaveGuild(conn, m, user, usedPrefix) {
  if (!user.guildData.guild) {
    return m.reply('❌ No perteneces a ningún gremio.')
  }

  let guild = GUILDS[user.guildData.guild]
  let guildName = guild.name

  user.guildData.guild = null
  user.guildData.joinDate = null
  user.guildData.contributions = 0
  user.guildData.rank = "Miembro"

  let leaveText = `👋 *HAS ABANDONADO EL GREMIO* 👋\n\n`
  leaveText += `${guild.icon} Has salido de **${guildName}**\n`
  leaveText += `💔 Ya no recibes los beneficios del gremio\n`
  leaveText += `💡 Puedes unirte a otro gremio cuando quieras`

  await conn.reply(m.chat, leaveText, m)
}

async function showGuildInfo(conn, m, user, guildId, usedPrefix) {
  if (!guildId || !GUILDS[guildId]) {
    return m.reply('❌ Especifica un gremio válido: miku, warriors, merchants, shadows')
  }

  let guild = GUILDS[guildId]
  let memberCount = getMemberCount(guildId)
  let img = 'https://files.catbox.moe/xzkumb.png'

  let infoText = `${guild.icon} *${guild.name.toUpperCase()}* ${guild.icon}\n\n`
  infoText += `📝 *Descripción:* ${guild.description}\n`
  infoText += `👥 *Miembros:* ${memberCount}/${guild.maxMembers}\n\n`
  
  infoText += `📋 *REQUISITOS DE ENTRADA:*\n`
  infoText += `📊 Nivel mínimo: ${guild.requirements.level}\n`
  infoText += `💰 Cuota de entrada: ${guild.requirements.coins.toLocaleString()} cebollines\n\n`
  
  infoText += `🎁 *BENEFICIOS DEL GREMIO:*\n`
  infoText += `⭐ Bonificación EXP: +${Math.round((guild.benefits.expBonus - 1) * 100)}%\n`
  infoText += `💰 Bonificación Cebollines: +${Math.round((guild.benefits.coinBonus - 1) * 100)}%\n`
  infoText += `🏛️ Bonificación Mazmorras: +${Math.round((guild.benefits.dungeonBonus - 1) * 100)}%\n`
  infoText += `❤️ Regeneración HP: +${guild.benefits.healthRegen} por hora\n\n`
  
  if (!user.guildData.guild) {
    infoText += `💡 Usa \`${usedPrefix}gremio unirse ${guildId}\` para unirte`
  } else if (user.guildData.guild === guildId) {
    infoText += `✅ *Ya eres miembro de este gremio*`
  } else {
    infoText += `⚠️ *Debes salir de tu gremio actual primero*`
  }

  await conn.sendFile(m.chat, img, 'gremio.jpg', infoText, fkontak)
}

async function showGuildMembers(conn, m, user, usedPrefix) {
  if (!user.guildData.guild) {
    return m.reply('❌ No perteneces a ningún gremio.')
  }

  let guild = GUILDS[user.guildData.guild]
  let members = getGuildMembers(user.guildData.guild)

  let membersText = `${guild.icon} *MIEMBROS DE ${guild.name.toUpperCase()}* ${guild.icon}\n\n`
  
  if (members.length === 0) {
    membersText += `👥 No hay otros miembros registrados\n`
    membersText += `💡 ¡Invita a tus amigos a unirse!`
  } else {
    members.forEach((member, index) => {
      let name = member.jid.split('@')[0]
      let joinDate = new Date(member.joinDate).toLocaleDateString()
      let position = index + 1
      
      membersText += `${position}. **${name}**\n`
      membersText += `   🎖️ ${member.rank}\n`
      membersText += `   💝 ${member.contributions.toLocaleString()} contribuciones\n`
      membersText += `   📅 Desde: ${joinDate}\n\n`
    })
  }
  
  membersText += `👥 *Total de miembros:* ${members.length}/${guild.maxMembers}`

  await conn.reply(m.chat, membersText, m)
}

async function contributeToGuild(conn, m, user, amount, usedPrefix) {
  if (!user.guildData.guild) {
    return m.reply('❌ No perteneces a ningún gremio.')
  }

  if (amount <= 0 || isNaN(amount)) {
    return m.reply('❌ Especifica una cantidad válida de cebollines para contribuir.')
  }

  if ((user.coin || 0) < amount) {
    return m.reply(`❌ No tienes suficientes cebollines. Tienes: ${(user.coin || 0).toLocaleString()}`)
  }

  user.coin -= amount
  user.guildData.contributions += amount

  let newRank = "Miembro"
  if (user.guildData.contributions >= 50000) newRank = "Veterano"
  else if (user.guildData.contributions >= 20000) newRank = "Oficial"
  else if (user.guildData.contributions >= 5000) newRank = "Soldado"

  let rankUp = newRank !== user.guildData.rank
  user.guildData.rank = newRank

  let guild = GUILDS[user.guildData.guild]
  let contributeText = `💝 *CONTRIBUCIÓN REALIZADA* 💝\n\n`
  contributeText += `${guild.icon} Gremio: **${guild.name}**\n`
  contributeText += `💰 Contribución: ${amount.toLocaleString()} cebollines\n`
  contributeText += `📊 Total contribuido: ${user.guildData.contributions.toLocaleString()}\n`
  contributeText += `🎖️ Rango actual: ${user.guildData.rank}\n\n`
  
  if (rankUp) {
    contributeText += `🎊 *¡NUEVO RANGO OBTENIDO!* 🎊\n`
    contributeText += `🎖️ **${newRank}**\n\n`
  }
  
  contributeText += `💡 *Rangos disponibles:*\n`
  contributeText += `• Miembro (0+ contribuciones)\n`
  contributeText += `• Soldado (5,000+ contribuciones)\n`
  contributeText += `• Oficial (20,000+ contribuciones)\n`
  contributeText += `• Veterano (50,000+ contribuciones)`

  await conn.reply(m.chat, contributeText, m)
}

function getMemberCount(guildId) {
  let count = 0
  Object.values(global.db.data.users).forEach(user => {
    if (user.guildData && user.guildData.guild === guildId) {
      count++
    }
  })
  return count
}

function getGuildMembers(guildId) {
  let members = []
  Object.entries(global.db.data.users).forEach(([jid, user]) => {
    if (user.guildData && user.guildData.guild === guildId) {
      members.push({
        jid: jid,
        rank: user.guildData.rank,
        contributions: user.guildData.contributions,
        joinDate: user.guildData.joinDate
      })
    }
  })
  return members.sort((a, b) => b.contributions - a.contributions)
}

export function applyGuildBenefits(user, baseReward, type = 'exp') {
  if (!user.guildData || !user.guildData.guild) return baseReward
  
  let guild = GUILDS[user.guildData.guild]
  if (!guild) return baseReward
  
  switch (type) {
    case 'exp':
      return Math.floor(baseReward * guild.benefits.expBonus)
    case 'coin':
      return Math.floor(baseReward * guild.benefits.coinBonus)
    case 'dungeon':
      return Math.floor(baseReward * guild.benefits.dungeonBonus)
    default:
      return baseReward
  }
}

handler.tags = ['rpg']
handler.help = ['gremio']
handler.command = ['gremio', 'guild']
handler.register = true
handler.group = true

export default handler