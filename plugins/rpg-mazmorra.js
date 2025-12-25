let cooldowns = {}
let activeDungeons = {}


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


const ULTRA_BOSS = {
  name: "🌌 DEPOOL.EXE BINARIO",
  hp: 2000,
  attack: 150,
  defense: 80,
  reward: { coins: 100000, exp: 50000 },
  probability: 0.001,
  image: "https://files.catbox.moe/1nnszd.png"
}


const DUNGEONS = {
  1: {
    name: "🏰 Castillo Abandonado",
    image: "https://images.stockcake.com/public/7/4/1/741c3c8e-4b8e-4b3e-9f8e-2c5d8a9b1c3e_medium/dark-castle-entrance-stockcake.jpg",
    minLevel: 1,
    enemies: {
      minions: [
        { name: "💀 Esqueleto Guerrero", hp: 30, attack: 8, defense: 2, reward: { coins: 25, exp: 15 } },
        { name: "🧟 Zombie Putrefacto", hp: 40, attack: 10, defense: 3, reward: { coins: 35, exp: 20 } },
        { name: "👻 Fantasma Errante", hp: 25, attack: 12, defense: 1, reward: { coins: 30, exp: 18 } }
      ],
      bosses: [
        { name: "👑 Rey Esqueleto", hp: 120, attack: 25, defense: 8, reward: { coins: 200, exp: 80 } },
        { name: "🦇 Vampiro Ancestral", hp: 150, attack: 30, defense: 6, reward: { coins: 250, exp: 100 } }
      ]
    }
  },
  2: {
    name: "🌋 Cavernas de Fuego",
    image: "https://images.stockcake.com/public/a/2/3/a23f4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c_medium/volcanic-cave-entrance-stockcake.jpg", 
    minLevel: 5,
    enemies: {
      minions: [
        { name: "🔥 Imp de Fuego", hp: 60, attack: 15, defense: 5, reward: { coins: 60, exp: 35 } },
        { name: "🦎 Salamandra Ardiente", hp: 80, attack: 18, defense: 7, reward: { coins: 80, exp: 45 } },
        { name: "🌋 Elemental de Lava", hp: 70, attack: 20, defense: 4, reward: { coins: 70, exp: 40 } }
      ],
      bosses: [
        { name: "🐉 Dragón Menor", hp: 250, attack: 40, defense: 15, reward: { coins: 500, exp: 200 } },
        { name: "👹 Demonio de Fuego", hp: 280, attack: 45, defense: 12, reward: { coins: 600, exp: 250 } },
        { name: "🔥 Fénix Corrupto", hp: 300, attack: 38, defense: 18, reward: { coins: 550, exp: 220 } }
      ]
    }
  },
  3: {
    name: "❄️ Fortaleza Helada",
    image: "https://images.stockcake.com/public/c/4/5/c45d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f_medium/frozen-fortress-gates-stockcake.jpg",
    minLevel: 10,
    enemies: {
      minions: [
        { name: "🧊 Golem de Hielo", hp: 100, attack: 22, defense: 12, reward: { coins: 120, exp: 60 } },
        { name: "👻 Espíritu Helado", hp: 90, attack: 28, defense: 8, reward: { coins: 100, exp: 55 } },
        { name: "🐺 Lobo de Escarcha", hp: 85, attack: 25, defense: 10, reward: { coins: 110, exp: 58 } }
      ],
      bosses: [
        { name: "🧙♂️ Lich de Hielo", hp: 400, attack: 60, defense: 25, reward: { coins: 800, exp: 350 } },
        { name: "🐉 Dragón de Hielo", hp: 450, attack: 65, defense: 30, reward: { coins: 900, exp: 400 } },
        { name: "👑 Reina de Invierno", hp: 500, attack: 55, defense: 35, reward: { coins: 1000, exp: 450 } }
      ]
    }
  },
  4: {
    name: "🌑 Abismo Sombrío",
    image: "https://e0.pxfuel.com/wallpapers/243/737/desktop-wallpaper-abyss-dark-abyss.jpg",
    minLevel: 15,
    enemies: {
      minions: [
        { name: "🕷️ Araña Sombría", hp: 120, attack: 30, defense: 15, reward: { coins: 150, exp: 75 } },
        { name: "👤 Sombra Viviente", hp: 110, attack: 35, defense: 12, reward: { coins: 160, exp: 80 } },
        { name: "🦂 Escorpión del Vacío", hp: 130, attack: 32, defense: 18, reward: { coins: 170, exp: 85 } }
      ],
      bosses: [
        { name: "🕸️ Reina Araña", hp: 600, attack: 80, defense: 40, reward: { coins: 1200, exp: 500 } },
        { name: "👹 Señor de las Sombras", hp: 650, attack: 85, defense: 35, reward: { coins: 1400, exp: 600 } },
        { name: "🌑 Avatar del Vacío", hp: 700, attack: 75, defense: 45, reward: { coins: 1500, exp: 650 } }
      ]
    }
  }
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

let handler = async (m, { conn, usedPrefix, command, text }) => {
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

  
  if (text && (text.includes('atacar') || text.includes('huir') || text.includes('usar'))) {
    let args = text.split(' ')
    let action = args[0]?.toLowerCase()
    
    switch (action) {
      case 'atacar':
        return await attackEnemy(conn, m, user, usedPrefix)
      case 'huir':
        return await fleeDungeon(conn, m, user, usedPrefix)
      case 'usar':
        let item = args[1]
        return await useItem(conn, m, user, item, usedPrefix)
    }
  }

 
  let tiempoEspera = 5 * 60
  if (text && text.includes('entrar') && cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
    let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000))
    return conn.reply(m.chat, `⏱️ Debes descansar antes de entrar a otra mazmorra.\n⏳ Tiempo restante: *${tiempoRestante}*`, m)
  }

  if (!text) {
    return await showDungeonMenu(conn, m, user, usedPrefix)
  }

  let args = text.split(' ')
  let action = args[0]?.toLowerCase()
  let dungeonId = parseInt(args[1])

  switch (action) {
    case 'entrar':
      return await enterDungeon(conn, m, user, dungeonId, usedPrefix)
    case 'atacar':
      return await attackEnemy(conn, m, user, usedPrefix)
    case 'huir':
      return await fleeDungeon(conn, m, user, usedPrefix)
    case 'usar':
      let item = args[1]
      return await useItem(conn, m, user, item, usedPrefix)
    default:
      return await showDungeonMenu(conn, m, user, usedPrefix)
  }
}

async function showDungeonMenu(conn, m, user, usedPrefix) {
  let currentRank = getRank(user.rpgData.totalExp)
  let specialRankText = user.rpgData.specialRank ? `${RANKS[10].icon} ${RANKS[10].name}` : ""
  
  let menuText = `🏛️ *MAZMORRAS DE HATSUNE MIKU* 🏛️\n\n`
  menuText += `👤 *Aventurero:* ${conn.getName(m.sender)}\n`
  menuText += `⭐ *Nivel:* ${user.rpgData.level}\n`
  menuText += `${currentRank.icon} *Rango:* ${currentRank.name}\n`
  if (specialRankText) menuText += `${specialRankText}\n`
  menuText += `❤️ *HP:* ${user.rpgData.hp}/${user.rpgData.maxHp}\n`
  menuText += `💰 *Cebollines:* ${(user.coin || 0).toLocaleString()}\n\n`
  menuText += `🗡️ *Mazmorras Disponibles:*\n\n`

  Object.entries(DUNGEONS).forEach(([id, dungeon]) => {
    let status = user.rpgData.level >= dungeon.minLevel ? "✅" : "🔒"
    let levelReq = user.rpgData.level >= dungeon.minLevel ? "" : `(Nivel ${dungeon.minLevel} requerido)`
    menuText += `${status} *${dungeon.name}* ${levelReq}\n`
    menuText += `   📊 Nivel mínimo: ${dungeon.minLevel}\n`
    menuText += `   👹 Esbirros: ${dungeon.enemies.minions.length} | 💀 Jefes: ${dungeon.enemies.bosses.length}\n\n`
  })

  menuText += `🌌 *Boss Ultra Raro:* DEPOOL.EXE BINARIO (0.1% probabilidad)\n`
  menuText += `💎 *Recompensa Ultra:* 100,000 cebollines + Rango Especial\n\n`
  menuText += `💡 *Comandos:*\n`
  menuText += `• \`${usedPrefix}mazmorra entrar [1-4]\` - Entrar a mazmorra\n`
  menuText += `• \`${usedPrefix}tiendarpg\` - Ver tienda RPG\n`
  menuText += `• \`${usedPrefix}rpgstats\` - Ver estadísticas completas\n\n`
  menuText += `⚠️ *Nota:* Asegúrate de tener suficiente HP antes de entrar`

  const buttons = [
    { buttonId: `${usedPrefix}mazmorra entrar 1`, buttonText: { displayText: '🏰 Castillo (Nv.1)' }, type: 1 },
    { buttonId: `${usedPrefix}mazmorra entrar 2`, buttonText: { displayText: '🌋 Cavernas (Nv.5)' }, type: 1 },
    { buttonId: `${usedPrefix}mazmorra entrar 3`, buttonText: { displayText: '❄️ Fortaleza (Nv.10)' }, type: 1 }
  ]
  
  const moreButtons = [
    { buttonId: `${usedPrefix}mazmorra entrar 4`, buttonText: { displayText: '🌑 Abismo (Nv.15)' }, type: 1 },
    { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '🏪 Tienda RPG' }, type: 1 },
    { buttonId: `${usedPrefix}rpgstats`, buttonText: { displayText: '📊 Ver Stats' }, type: 1 }
  ]

  const buttonMessage = {
    text: menuText,
    footer: '💙 Sistema de Mazmorras - Hatsune Miku Bot',
    buttons: buttons.concat(moreButtons),
    headerType: 1
  }

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

async function enterDungeon(conn, m, user, dungeonId, usedPrefix) {
  if (!dungeonId || !DUNGEONS[dungeonId]) {
    return m.reply('❌ Mazmorra no válida. Usa: 1, 2, 3 o 4')
  }

  let dungeon = DUNGEONS[dungeonId]
  
  if (user.rpgData.level < dungeon.minLevel) {
    return m.reply(`🔒 Necesitas nivel ${dungeon.minLevel} para entrar a ${dungeon.name}`)
  }

  if (user.rpgData.hp <= 20) {
    return m.reply('❤️ Tu HP está muy bajo. Usa pociones o descansa antes de entrar.')
  }

  cooldowns[m.sender] = Date.now()
  
  
  let isUltraBoss = Math.random() < ULTRA_BOSS.probability
  let enemy
  
  if (isUltraBoss) {
    enemy = { ...ULTRA_BOSS, type: 'ultraboss' }
  } else {
    
    let isMinion = Math.random() < 0.7
    enemy = isMinion ? 
      dungeon.enemies.minions[Math.floor(Math.random() * dungeon.enemies.minions.length)] :
      dungeon.enemies.bosses[Math.floor(Math.random() * dungeon.enemies.bosses.length)]
    enemy.type = isMinion ? 'minion' : 'boss'
  }

  let battleEnemy = {
    ...enemy,
    currentHp: enemy.hp
  }

  activeDungeons[m.sender] = {
    dungeon: dungeon,
    enemy: battleEnemy,
    startTime: Date.now()
  }

  let battleText = `⚔️ *¡BATALLA EN ${dungeon.name.toUpperCase()}!* ⚔️\n\n`
  
  if (isUltraBoss) {
    battleText += `🌌 *¡BOSS ULTRA RARO APARECIÓ!* 🌌\n`
    battleText += `💎 *${enemy.name}* (ULTRA BOSS)\n`
  } else {
    battleText += `🎯 *Enemigo Encontrado:*\n`
    battleText += `${enemy.type === 'minion' ? '👹' : '💀'} **${enemy.name}** ${enemy.type === 'minion' ? '(Esbirro)' : '(JEFE)'}\n`
  }
  
  battleText += `❤️ HP: ${battleEnemy.currentHp}/${battleEnemy.hp}\n`
  battleText += `⚔️ Ataque: ${battleEnemy.attack}\n`
  battleText += `🛡️ Defensa: ${battleEnemy.defense}\n\n`
  battleText += `👤 *Tu Estado:*\n`
  battleText += `❤️ HP: ${user.rpgData.hp}/${user.rpgData.maxHp}\n`
  battleText += `⚔️ Ataque: ${user.rpgData.attack}\n`
  battleText += `🛡️ Defensa: ${user.rpgData.defense}\n\n`
  battleText += `💰 *Recompensa:* ${battleEnemy.reward.coins.toLocaleString()} cebollines, ${battleEnemy.reward.exp.toLocaleString()} EXP`

  const battleButtons = [
    { buttonId: `${usedPrefix}mazmorra atacar`, buttonText: { displayText: '⚔️ Atacar' }, type: 1 },
    { buttonId: `${usedPrefix}mazmorra huir`, buttonText: { displayText: '🏃 Huir' }, type: 1 },
    { buttonId: `${usedPrefix}mazmorra usar potion`, buttonText: { displayText: '🧪 Usar Poción' }, type: 1 }
  ]

  const battleMessage = {
    text: battleText,
    footer: isUltraBoss ? '🌌 ¡ENTIDAD CÓSMICA DETECTADA!' : '⚔️ ¡Prepárate para la batalla!',
    buttons: battleButtons,
    headerType: 1
  }

  await conn.sendMessage(m.chat, battleMessage, { quoted: m })
}

async function attackEnemy(conn, m, user, usedPrefix) {
  let battle = activeDungeons[m.sender]
  if (!battle) {
    return m.reply('❌ No estás en ninguna batalla. Usa `/mazmorra` para entrar a una.')
  }

  let { enemy } = battle
  
  
  let playerDamage = Math.max(1, user.rpgData.attack - enemy.defense + Math.floor(Math.random() * 10))
  enemy.currentHp -= playerDamage

  let battleResult = `⚔️ *COMBATE* ⚔️\n\n`
  battleResult += `💥 Atacaste a **${enemy.name}**\n`
  battleResult += `🗡️ Daño infligido: ${playerDamage}\n`
  battleResult += `❤️ HP enemigo: ${Math.max(0, enemy.currentHp)}/${enemy.hp}\n\n`

  
  if (enemy.currentHp <= 0) {
    return await victoryReward(conn, m, user, battle, usedPrefix)
  }

  
  let enemyDamage = Math.max(1, enemy.attack - user.rpgData.defense + Math.floor(Math.random() * 8))
  user.rpgData.hp -= enemyDamage

  battleResult += `👹 *${enemy.name}* contraataca\n`
  battleResult += `💢 Daño recibido: ${enemyDamage}\n`
  battleResult += `❤️ Tu HP: ${Math.max(0, user.rpgData.hp)}/${user.rpgData.maxHp}\n\n`

  
  if (user.rpgData.hp <= 0) {
    return await defeatPenalty(conn, m, user, usedPrefix)
  }

  battleResult += `🎯 *Estado de la Batalla:*\n`
  battleResult += `👤 Tu HP: ${user.rpgData.hp}/${user.rpgData.maxHp}\n`
  battleResult += `👹 ${enemy.name}: ${enemy.currentHp}/${enemy.hp}`

  const continueButtons = [
    { buttonId: `${usedPrefix}mazmorra atacar`, buttonText: { displayText: '⚔️ Atacar Otra Vez' }, type: 1 },
    { buttonId: `${usedPrefix}mazmorra huir`, buttonText: { displayText: '🏃 Huir' }, type: 1 },
    { buttonId: `${usedPrefix}mazmorra usar potion`, buttonText: { displayText: '🧪 Usar Poción' }, type: 1 }
  ]

  const continueMessage = {
    text: battleResult,
    footer: '⚔️ ¡La batalla continúa!',
    buttons: continueButtons,
    headerType: 1
  }

  await conn.sendMessage(m.chat, continueMessage, { quoted: m })
}

async function victoryReward(conn, m, user, battle, usedPrefix) {
  let { enemy, dungeon } = battle
  delete activeDungeons[m.sender]

  
  user.coin = (user.coin || 0) + enemy.reward.coins
  user.rpgData.exp += enemy.reward.exp
  user.rpgData.totalExp += enemy.reward.exp
  user.rpgData.wins += 1

  
  if (enemy.type === 'boss') user.rpgData.bossKills += 1
  if (enemy.type === 'ultraboss') user.rpgData.ultraBossKills += 1

  let victoryText = `🎉 *¡VICTORIA!* 🎉\n\n`
  
  if (enemy.type === 'ultraboss') {
    victoryText += `🌌 ¡Has derrotado a la *DEPOOL.EXE BINARIO*!\n`
    victoryText += `💎 ¡LOGRO ÉPICO DESBLOQUEADO!\n\n`
    
    
    if (!user.rpgData.specialRank) {
      user.rpgData.specialRank = true
      victoryText += `🔮 *¡RANGO ESPECIAL OBTENIDO!*\n`
      victoryText += `${RANKS[10].icon} **${RANKS[10].name}**\n\n`
    }
  } else {
    victoryText += `💀 Has derrotado a **${enemy.name}**\n`
    victoryText += `${enemy.type === 'boss' ? '👑 ¡Era un JEFE! Recompensa extra' : '👹 Esbirro eliminado'}\n\n`
  }
  
  victoryText += `🎁 *Recompensas Obtenidas:*\n`
  victoryText += `💰 +${enemy.reward.coins.toLocaleString()} cebollines\n`
  victoryText += `⭐ +${enemy.reward.exp.toLocaleString()} EXP\n\n`
  victoryText += `📊 *Estado Actual:*\n`
  victoryText += `💰 Cebollines: ${user.coin.toLocaleString()}\n`
  victoryText += `⭐ EXP Total: ${user.rpgData.totalExp.toLocaleString()}\n`
  victoryText += `🏆 Victorias: ${user.rpgData.wins}`

  
  let expNeeded = user.rpgData.level * 100
  if (user.rpgData.exp >= expNeeded) {
    user.rpgData.level += 1
    user.rpgData.exp -= expNeeded
    user.rpgData.maxHp += 20
    user.rpgData.hp = user.rpgData.maxHp
    user.rpgData.attack += 5
    user.rpgData.defense += 3
    
    victoryText += `\n\n🎊 *¡SUBISTE DE NIVEL!* 🎊\n`
    victoryText += `📈 Nuevo nivel: ${user.rpgData.level}\n`
    victoryText += `❤️ HP máximo: ${user.rpgData.maxHp}\n`
    victoryText += `⚔️ Ataque: ${user.rpgData.attack}\n`
    victoryText += `🛡️ Defensa: ${user.rpgData.defense}`
  }

  
  let newRank = getRank(user.rpgData.totalExp)
  if (newRank.level > user.rpgData.rank) {
    user.rpgData.rank = newRank.level
    victoryText += `\n\n🎖️ *¡NUEVO RANGO!* 🎖️\n`
    victoryText += `${newRank.icon} **${newRank.name}**`
  }

  const postBattleButtons = [
    { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏛️ Volver a Mazmorras' }, type: 1 },
    { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '🏪 Ir a Tienda' }, type: 1 },
    { buttonId: `${usedPrefix}rpgstats`, buttonText: { displayText: '📊 Ver Stats' }, type: 1 }
  ]

  const victoryMessage = {
    text: victoryText,
    footer: enemy.type === 'ultraboss' ? '🌌 ¡VICTORIA CÓSMICA!' : '🎉 ¡Felicidades por tu victoria!',
    buttons: postBattleButtons,
    headerType: 1
  }

  await conn.sendMessage(m.chat, victoryMessage, { quoted: m })
}

async function defeatPenalty(conn, m, user, usedPrefix) {
  delete activeDungeons[m.sender]
  
  user.rpgData.hp = 1
  user.rpgData.losses += 1
  let lostCoins = Math.floor((user.coin || 0) * 0.1)
  user.coin = Math.max(0, (user.coin || 0) - lostCoins)

  let defeatText = `💀 *¡DERROTA!* 💀\n\n`
  defeatText += `😵 Has sido derrotado en la mazmorra...\n`
  defeatText += `🏥 Te han llevado a un lugar seguro\n\n`
  defeatText += `💸 *Penalizaciones:*\n`
  defeatText += `💰 Perdiste ${lostCoins.toLocaleString()} cebollines\n`
  defeatText += `❤️ HP reducido a 1\n\n`
  defeatText += `💡 *Consejo:* Compra pociones en la tienda antes de tu próxima aventura`

  const defeatButtons = [
    { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏥 Descansar' }, type: 1 },
    { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '🏪 Comprar Pociones' }, type: 1 },
    { buttonId: `${usedPrefix}rpgstats`, buttonText: { displayText: '📊 Ver Stats' }, type: 1 }
  ]

  const defeatMessage = {
    text: defeatText,
    footer: '💀 No te rindas, inténtalo de nuevo',
    buttons: defeatButtons,
    headerType: 1
  }

  await conn.sendMessage(m.chat, defeatMessage, { quoted: m })
}

async function fleeDungeon(conn, m, user, usedPrefix) {
  if (!activeDungeons[m.sender]) {
    return m.reply('❌ No estás en ninguna batalla.')
  }

  delete activeDungeons[m.sender]
  
  let fleeText = `🏃 *¡HUIDA EXITOSA!* 🏃\n\n`
  fleeText += `💨 Lograste escapar de la mazmorra\n`
  fleeText += `😅 Mejor suerte la próxima vez\n\n`
  fleeText += `💡 *Consejo:* Mejora tu equipo en la tienda antes de volver`

  const fleeButtons = [
    { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏛️ Volver a Mazmorras' }, type: 1 },
    { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '🏪 Ir a Tienda' }, type: 1 }
  ]

  const fleeMessage = {
    text: fleeText,
    footer: '🏃 Has escapado sano y salvo',
    buttons: fleeButtons,
    headerType: 1
  }

  await conn.sendMessage(m.chat, fleeMessage, { quoted: m })
}

async function useItem(conn, m, user, item, usedPrefix) {
  if (!activeDungeons[m.sender]) {
    return m.reply('❌ Solo puedes usar objetos durante una batalla.')
  }

  if (item === 'potion') {
    if ((user.coin || 0) < 100) {
      return m.reply('❌ No tienes suficientes cebollines para una poción (100 cebollines)')
    }
    
    user.coin -= 100
    let healAmount = Math.min(50, user.rpgData.maxHp - user.rpgData.hp)
    user.rpgData.hp += healAmount
    
    let healText = `🧪 *POCIÓN USADA* 🧪\n\n`
    healText += `❤️ Recuperaste ${healAmount} HP\n`
    healText += `💚 HP actual: ${user.rpgData.hp}/${user.rpgData.maxHp}\n`
    healText += `💰 Cebollines restantes: ${user.coin.toLocaleString()}`

    const healButtons = [
      { buttonId: `${usedPrefix}mazmorra atacar`, buttonText: { displayText: '⚔️ Continuar Batalla' }, type: 1 },
      { buttonId: `${usedPrefix}mazmorra huir`, buttonText: { displayText: '🏃 Huir' }, type: 1 }
    ]

    const healMessage = {
      text: healText,
      footer: '🧪 Poción consumida',
      buttons: healButtons,
      headerType: 1
    }

    await conn.sendMessage(m.chat, healMessage, { quoted: m })
  } else {
    m.reply('❌ Objeto no válido. Usa: potion')
  }
}

function segundosAHMS(segundos) {
  let minutos = Math.floor(segundos / 60)
  let segundosRestantes = segundos % 60
  return `${minutos} minutos y ${segundosRestantes} segundos`
}

handler.tags = ['rpg']
handler.help = ['mazmorra']
handler.command = ['dungeon', 'mazmorra', 'cueva']
handler.register = true
handler.group = true

export default handler