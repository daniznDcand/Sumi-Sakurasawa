
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

let handler = async (m, { conn, usedPrefix }) => {
  let user = global.db.data.users[m.sender]
  
  
  if (!user.rpgData) {
    user.rpgData = {
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      exp: 0,
      totalExp: 0,
      wins: 0,
      losses: 0,
      bossKills: 0,
      ultraBossKills: 0,
      lastAdventure: 0,
      rank: 0,
      specialRank: false
    }
  }

  let coins = user.coin || 0
  let expNeeded = user.rpgData.level * 100
  let expProgress = Math.floor((user.rpgData.exp / expNeeded) * 100)
  let hpProgress = Math.floor((user.rpgData.hp / user.rpgData.maxHp) * 100)
  
  
  let totalBattles = user.rpgData.wins + user.rpgData.losses
  let winRate = totalBattles > 0 ? Math.floor((user.rpgData.wins / totalBattles) * 100) : 0
  
  
  let currentRank = getRank(user.rpgData.totalExp)
  let nextRank = RANKS[currentRank.level + 1]
  

  let tempAttack = 0
  let tempEffects = []
  
  if (user.rpgData.tempAttack && user.rpgData.tempAttackExpiry > Date.now()) {
    tempAttack = user.rpgData.tempAttack
    let remaining = Math.ceil((user.rpgData.tempAttackExpiry - Date.now()) / (60 * 1000))
    tempEffects.push(`⚡ Ataque temporal: +${tempAttack} (${remaining} min)`)
  }
  
  if (user.rpgData.luckBoost && user.rpgData.luckBoost > Date.now()) {
    let remaining = Math.ceil((user.rpgData.luckBoost - Date.now()) / (60 * 1000))
    tempEffects.push(`🍀 Suerte activa: +50% recompensas (${remaining} min)`)
  }
  
  if (user.rpgData.magicShield && user.rpgData.magicShield > 0) {
    tempEffects.push(`🔰 Escudo mágico: ${user.rpgData.magicShield} usos restantes`)
  }
  
  if (user.rpgData.reviveToken) {
    tempEffects.push(`🌟 Cristal de resurrección: Activo`)
  }

  let statsText = `📊 *PERFIL COMPLETO RPG* 📊\n\n`
  statsText += `👤 *Aventurero:* ${conn.getName(m.sender)}\n`
  statsText += `⭐ *Nivel:* ${user.rpgData.level}\n`
  statsText += `📈 *EXP:* ${user.rpgData.exp}/${expNeeded} (${expProgress}%)\n`
  statsText += `🏆 *EXP Total:* ${user.rpgData.totalExp.toLocaleString()}\n\n`
  
  
  statsText += `🏛️ *SISTEMA DE RANGOS:*\n`
  statsText += `${currentRank.icon} *Rango Actual:* ${currentRank.name}\n`
  if (user.rpgData.specialRank) {
    statsText += `${RANKS[10].icon} *Rango Especial:* ${RANKS[10].name}\n`
  }
  if (nextRank) {
    let expToNext = nextRank.minExp - user.rpgData.totalExp
    statsText += `🎯 *Siguiente:* ${nextRank.icon} ${nextRank.name} (${expToNext.toLocaleString()} EXP)\n`
  }
  statsText += `\n`
  
  statsText += `💪 *Atributos:*\n`
  statsText += `❤️ HP: ${user.rpgData.hp}/${user.rpgData.maxHp} (${hpProgress}%)\n`
  statsText += `⚔️ Ataque: ${user.rpgData.attack}${tempAttack > 0 ? ` (+${tempAttack})` : ''}\n`
  statsText += `🛡️ Defensa: ${user.rpgData.defense}\n`
  statsText += `💰 Cebollines: ${coins.toLocaleString()}\n\n`
  
  statsText += `🏆 *Historial de Combate:*\n`
  statsText += `✅ Victorias: ${user.rpgData.wins}\n`
  statsText += `❌ Derrotas: ${user.rpgData.losses}\n`
  statsText += `📊 Ratio de victoria: ${winRate}%\n`
  statsText += `⚔️ Batallas totales: ${totalBattles}\n`
  statsText += `💀 Jefes derrotados: ${user.rpgData.bossKills || 0}\n`
  if (user.rpgData.ultraBossKills > 0) {
    statsText += `🌌 Ultra Boss derrotados: ${user.rpgData.ultraBossKills}\n`
  }
  statsText += `\n`
  
  if (tempEffects.length > 0) {
    statsText += `✨ *Efectos Activos:*\n`
    tempEffects.forEach(effect => {
      statsText += `${effect}\n`
    })
    statsText += `\n`
  }
  
  
  statsText += `🏷️ *TABLA DE RANGOS:*\n`
  Object.entries(RANKS).forEach(([level, rank]) => {
    if (rank.special) return
    let status = user.rpgData.totalExp >= rank.minExp ? '✅' : '🔒'
    let current = parseInt(level) === currentRank.level ? ' ⭐' : ''
    statsText += `${status} ${rank.icon} ${rank.name}${current}\n`
  })
  
  if (user.rpgData.specialRank) {
    statsText += `✅ ${RANKS[10].icon} ${RANKS[10].name} ✨\n`
  } else {
    statsText += `🔒 ${RANKS[10].icon} ${RANKS[10].name} (Especial)\n`
  }
  
  statsText += `\n💡 *Comandos útiles:*\n`
  statsText += `• \`${usedPrefix}mazmorra\` - Explorar mazmorras\n`
  statsText += `• \`${usedPrefix}tiendarpg\` - Comprar objetos\n`
  statsText += `• \`${usedPrefix}ranking\` - Ver ranking global`

  const statsButtons = [
    { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏛️ Mazmorras' }, type: 1 },
    { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '🏪 Tienda RPG' }, type: 1 },
    { buttonId: `${usedPrefix}ranking`, buttonText: { displayText: '🏆 Ranking' }, type: 1 }
  ]
  
  const moreButtons = [
    { buttonId: `${usedPrefix}rpgstats`, buttonText: { displayText: '🔄 Actualizar' }, type: 1 },
    { buttonId: `${usedPrefix}tienda`, buttonText: { displayText: '🏪 Tienda Premium' }, type: 1 }
  ]

  const buttonMessage = {
    text: statsText,
    footer: '📊 Perfil Completo - Hatsune Miku Bot',
    buttons: statsButtons.concat(moreButtons),
    headerType: 1
  }

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.help = ['rpgstats', 'stats']
handler.tags = ['rpg']
handler.command = /^(rpgstats|stats|estadisticas)$/i
handler.register = true

export default handler