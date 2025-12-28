import { setTimeout } from 'timers/promises'


const RPG_CONFIG = {
  cooldown: 300000,
  minReward: 50,
  maxReward: 300,
  criticalChance: 0.15,
  escapeChance: 0.25,
  bossChance: 0.05
}

const BOSS_IMAGES = {
  '🐲 Dragón Celestial': 'https://files.catbox.moe/08cwr0.jpg',
  '👺 Demonio Infernal': 'https://files.catbox.moe/2cqu1i.jpg',
  '🔥 Fénix Sagrado': 'https://files.catbox.moe/apn7le.jpg',
  '⚡ Titán de Tormenta': 'https://files.catbox.moe/zy94fx.jpg',
  '🌑 Señor de la Oscuridad': 'https://wallpapers.com/images/hd/dark-anime-background-jdl3d31eid9z7owa.jpg',
  '🧙 Archimago': 'https://wallpapers.com/images/hd/gojo-sataru-k0ug6jgabsaxbcns.jpg'
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function getExpNeeded(level) {
  return Math.floor(90 * Math.pow(level, 1.45) + 110)
}

function scaleEnemy(enemy, level, isBoss) {
  const lvl = Math.max(1, level || 1)
  const base = isBoss ? 1.18 : 1.10
  const factor = Math.pow(base, lvl - 1)

  const hp = Math.floor(enemy.hp * factor)
  const attack = Math.floor(enemy.attack * factor)

  const minR = Math.floor(enemy.reward[0] * factor)
  const maxR = Math.floor(enemy.reward[1] * factor)
  return {
    ...enemy,
    hp,
    attack,
    reward: [Math.max(1, minR), Math.max(Math.max(2, minR + 1), maxR)]
  }
}


const ENEMIES = {
  common: [
    { name: "🐺 Lobo Salvaje", hp: 80, attack: 25, reward: [50, 100] },
    { name: "🕷️ Araña Gigante", hp: 60, attack: 20, reward: [40, 80] },
    { name: "🐍 Serpiente Venenosa", hp: 70, attack: 30, reward: [60, 120] },
    { name: "🦇 Murciélago Vampiro", hp: 50, attack: 35, reward: [45, 90] },
    { name: "🐻 Oso Feroz", hp: 120, attack: 40, reward: [80, 160] }
  ],
  boss: [
    { name: "🐲 Dragón Celestial", hp: 350, attack: 85, reward: [600, 900] },
    { name: "👺 Demonio Infernal", hp: 320, attack: 95, reward: [650, 950] },
    { name: "🔥 Fénix Sagrado", hp: 330, attack: 80, reward: [620, 850] },
    { name: "⚡ Titán de Tormenta", hp: 370, attack: 90, reward: [700, 1100] },
    { name: "🌑 Señor de la Oscuridad", hp: 400, attack: 100, reward: [800, 1200] },
    { name: "🧙 Archimago", hp: 340, attack: 88, reward: [680, 1000] }
  ]
}


const LOCATIONS = [
  "🌲 Bosque Encantado",
  "🏔️ Montañas Heladas",
  "🏜️ Desierto Ardiente",
  "🏰 Ruinas Antiguas",
  "🌊 Costas Brumosas",
  "🏋️ Volcán Activo",
  "❄️ Glaciar Eterno",
  "🗡️ Campo de Batalla"
]


const SPECIAL_EVENTS = [
  {
    name: "💎 Tesoro Encontrado",
    description: "¡Encuentras un cofre del tesoro!",
    reward: [200, 400],
    chance: 0.1
  },
  {
    name: "🍄 Poción Mágica",
    description: "¡Bebes una poción que te da energía!",
    reward: [100, 200],
    chance: 0.15
  },
  {
    name: "⚔️ Arma Legendaria",
    description: "¡Encuentras un arma que vendes por buen precio!",
    reward: [300, 500],
    chance: 0.05
  }
]

let handler = async (m, { conn, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]


  if (!user.rpgData) {
    user.rpgData = {
      level: 1,
      hp: 100,
      maxHp: 100,
      attack: 20,
      defense: 10,
      exp: 0,
      wins: 0,
      losses: 0,
      lastExpedition: 0
    }
  }


  const now = Date.now()
  const cooldownTime = user.rpgData.lastExpedition + RPG_CONFIG.cooldown

  if (now < cooldownTime) {
    const remaining = Math.ceil((cooldownTime - now) / 1000 / 60)
    return m.reply(`⏰ Debes esperar ${remaining} minutos antes de tu próxima expedición.`)
  }


  if (user.rpgData.hp < user.rpgData.maxHp) {
    user.rpgData.hp = user.rpgData.maxHp
  }

  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]


  for (let event of SPECIAL_EVENTS) {
    if (Math.random() < event.chance) {
      const reward = Math.floor(Math.random() * (event.reward[1] - event.reward[0] + 1)) + event.reward[0]
      user.coin = (user.coin || 0) + reward
      user.rpgData.lastExpedition = now

      return m.reply(
        `🎲 *EXPEDICIÓN RPG* 🎲\n\n` +
        `📍 *Ubicación:* ${location}\n\n` +
        `${event.name}\n` +
        `${event.description}\n\n` +
        `💰 *Recompensa:* ${reward} monedas\n` +
        `💳 *Saldo:* ${user.coin} monedas`
      )
    }
  }


  const bossChance = clamp(RPG_CONFIG.bossChance + (user.rpgData.level - 1) * 0.002, 0.05, 0.12)
  const isBoss = Math.random() < bossChance
  const enemyList = isBoss ? ENEMIES.boss : ENEMIES.common
  const enemyBase = enemyList[Math.floor(Math.random() * enemyList.length)]
  const enemy = scaleEnemy(enemyBase, user.rpgData.level, isBoss)


  const battleEnemy = {
    ...enemy,
    hp: enemy.hp
  }

  if (isBoss) {
    const bossTitle = battleEnemy.name
    const bossImage = BOSS_IMAGES[bossTitle]
    const bossText = `👑 *¡JEFE ENCONTRADO!* 👑\n\n🆚 *Enemigo:* ${battleEnemy.name}\n❤️ HP: ${battleEnemy.hp} | ⚔️ ATK: ${battleEnemy.attack}`
    if (bossImage) {
      await conn.sendMessage(m.chat, { image: { url: bossImage }, caption: bossText }, { quoted: m })
    } else {
      await m.reply(bossText)
    }
    await setTimeout(800)
  }

  let battleLog = []
  battleLog.push(`🎲 *EXPEDICIÓN RPG* 🎲`)
  battleLog.push(`📍 *Ubicación:* ${location}`)
  battleLog.push(``)
  battleLog.push(`⚔️ *¡COMBATE!* ⚔️`)
  battleLog.push(`${isBoss ? "👑 *¡JEFE ENCONTRADO!* 👑" : ""}`)
  battleLog.push(`🆚 *Enemigo:* ${battleEnemy.name}`)
  battleLog.push(`❤️ HP: ${battleEnemy.hp} | ⚔️ ATK: ${battleEnemy.attack}`)
  battleLog.push(``)


  let turn = 1
  let playerWon = false

  while (user.rpgData.hp > 0 && battleEnemy.hp > 0 && turn <= 10) {
    battleLog.push(`🔸 *Turno ${turn}*`)


    let playerDamage = user.rpgData.attack + Math.floor(Math.random() * 20) - 10
    const isCritical = Math.random() < RPG_CONFIG.criticalChance

    if (isCritical) {
      playerDamage = Math.floor(playerDamage * 1.5)
      battleLog.push(`💥 *¡GOLPE CRÍTICO!*`)
    }

    playerDamage = Math.max(1, playerDamage)
    battleEnemy.hp -= playerDamage

    battleLog.push(`⚔️ Atacas por ${playerDamage} de daño`)
    battleLog.push(`❤️ ${battleEnemy.name}: ${Math.max(0, battleEnemy.hp)} HP`)

    if (battleEnemy.hp <= 0) {
      playerWon = true
      break
    }


    let enemyDamage = battleEnemy.attack + Math.floor(Math.random() * 15) - 7
    enemyDamage = Math.max(1, enemyDamage - user.rpgData.defense)

    user.rpgData.hp -= enemyDamage

    battleLog.push(`🗡️ ${battleEnemy.name} te ataca por ${enemyDamage} de daño`)
    battleLog.push(`❤️ Tu HP: ${Math.max(0, user.rpgData.hp)}`)
    battleLog.push(``)

    turn++
  }


  user.rpgData.lastExpedition = now

  if (playerWon) {
    const baseReward = Math.floor(Math.random() * (enemy.reward[1] - enemy.reward[0] + 1)) + enemy.reward[0]
    const bossBonus = isBoss ? Math.floor(baseReward * 0.5) : 0
    const totalReward = baseReward + bossBonus

    user.coin = (user.coin || 0) + totalReward

    const baseExp = isBoss ? 65 : 30
    const expGain = Math.floor(baseExp + (user.rpgData.level * (isBoss ? 6 : 3)))
    user.rpgData.exp += expGain
    user.rpgData.wins += 1


    let leveledUp = false
    while (user.rpgData.exp >= getExpNeeded(user.rpgData.level)) {
      user.rpgData.exp -= getExpNeeded(user.rpgData.level)
      user.rpgData.level += 1
      user.rpgData.maxHp += 25
      user.rpgData.hp = user.rpgData.maxHp
      user.rpgData.attack += 6
      user.rpgData.defense += 4
      leveledUp = true
    }

    if (leveledUp) {
      battleLog.push(`🎉 *¡SUBISTE DE NIVEL!* 🎉`)
      battleLog.push(`📊 *Nivel:* ${user.rpgData.level}`)
      battleLog.push(`❤️ *HP Máximo:* ${user.rpgData.maxHp}`)
      battleLog.push(`⚔️ *Ataque:* ${user.rpgData.attack}`)
      battleLog.push(`🛡️ *Defensa:* ${user.rpgData.defense}`)
      battleLog.push(``)
    }

    battleLog.push(`🎉 *¡VICTORIA!* 🎉`)
    battleLog.push(`💰 *Recompensa:* ${totalReward} monedas ${bossBonus > 0 ? `(+${bossBonus} bonus jefe)` : ''}`)
    battleLog.push(`💳 *Saldo:* ${user.coin} monedas`)
    battleLog.push(`⭐ *EXP:* +${expGain} (${user.rpgData.exp}/${getExpNeeded(user.rpgData.level)})`)

  } else {
    user.rpgData.losses += 1
    user.rpgData.hp = 0

    battleLog.push(`💀 *¡DERROTA!* 💀`)
    battleLog.push(`😵 Has sido derrotado...`)
    battleLog.push(`🏥 Tu HP se restaurará en la próxima expedición`)
  }


  battleLog.push(``)
  battleLog.push(`📊 *TUS ESTADÍSTICAS*`)
  battleLog.push(`🏆 Nivel: ${user.rpgData.level}`)
  battleLog.push(`❤️ HP: ${user.rpgData.hp}/${user.rpgData.maxHp}`)
  battleLog.push(`⚔️ ATK: ${user.rpgData.attack} | 🛡️ DEF: ${user.rpgData.defense}`)
  battleLog.push(`✅ Victorias: ${user.rpgData.wins} | ❌ Derrotas: ${user.rpgData.losses}`)

  await m.reply(battleLog.join('\n'))
}

handler.help = ['expedicion', 'rpg2']
handler.tags = ['rpg']
handler.command = /^(aventura|rpgaventure)$/i
handler.group = true
handler.register = true

export default handler
