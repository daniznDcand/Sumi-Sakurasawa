let handler = async (m, { conn, usedPrefix, text }) => {
  let users = global.db.data.users
  let category = text?.toLowerCase() || 'level'
  
  
  let validUsers = Object.entries(users)
    .filter(([jid, user]) => user.rpgData && user.rpgData.level > 0)
    .map(([jid, user]) => ({
      jid,
      name: conn.getName(jid),
      ...user.rpgData,
      coins: user.coin || 0,
      totalBattles: (user.rpgData.wins || 0) + (user.rpgData.losses || 0),
      winRate: ((user.rpgData.wins || 0) + (user.rpgData.losses || 0)) > 0 ? 
        Math.floor(((user.rpgData.wins || 0) / ((user.rpgData.wins || 0) + (user.rpgData.losses || 0))) * 100) : 0
    }))

  if (validUsers.length === 0) {
    return m.reply('📊 No hay aventureros registrados aún.\n\n💡 Usa `/mazmorra` para comenzar tu aventura RPG!')
  }

  let sortedUsers = []
  let title = ''
  let icon = ''

  switch (category) {
    case 'level':
    case 'nivel':
      sortedUsers = validUsers.sort((a, b) => b.level - a.level)
      title = 'RANKING POR NIVEL'
      icon = '⭐'
      break
    case 'coins':
    case 'monedas':
      sortedUsers = validUsers.sort((a, b) => b.coins - a.coins)
      title = 'RANKING POR RIQUEZA'
      icon = '💰'
      break
    case 'wins':
    case 'victorias':
      sortedUsers = validUsers.sort((a, b) => b.wins - a.wins)
      title = 'RANKING POR VICTORIAS'
      icon = '🏆'
      break
    case 'winrate':
    case 'ratio':
      sortedUsers = validUsers
        .filter(user => user.totalBattles >= 5) 
        .sort((a, b) => b.winRate - a.winRate)
      title = 'RANKING POR RATIO DE VICTORIA'
      icon = '📊'
      break
    case 'battles':
    case 'batallas':
      sortedUsers = validUsers.sort((a, b) => b.totalBattles - a.totalBattles)
      title = 'RANKING POR BATALLAS'
      icon = '⚔️'
      break
    default:
      sortedUsers = validUsers.sort((a, b) => b.level - a.level)
      title = 'RANKING POR NIVEL'
      icon = '⭐'
  }

  
  let userPosition = sortedUsers.findIndex(user => user.jid === m.sender) + 1
  let currentUser = sortedUsers.find(user => user.jid === m.sender)

  let rankingText = `🏆 *${title}* 🏆\n\n`
  
  
  let topUsers = sortedUsers.slice(0, 10)
  topUsers.forEach((user, index) => {
    let position = index + 1
    let medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : `${position}.`
    let name = user.name.length > 15 ? user.name.substring(0, 15) + '...' : user.name
    
    let value = ''
    switch (category) {
      case 'level':
      case 'nivel':
        value = `Nv.${user.level}`
        break
      case 'coins':
      case 'monedas':
        value = `${user.coins} 💰`
        break
      case 'wins':
      case 'victorias':
        value = `${user.wins} 🏆`
        break
      case 'winrate':
      case 'ratio':
        value = `${user.winRate}% (${user.totalBattles} batallas)`
        break
      case 'battles':
      case 'batallas':
        value = `${user.totalBattles} ⚔️`
        break
      default:
        value = `Nv.${user.level}`
    }
    
    rankingText += `${medal} *${name}* - ${value}\n`
  })

  
  if (userPosition > 10 && currentUser) {
    rankingText += `\n━━━━━━━━━━━━━━━━━\n`
    rankingText += `${userPosition}. *Tu posición* - `
    
    switch (category) {
      case 'level':
      case 'nivel':
        rankingText += `Nv.${currentUser.level}`
        break
      case 'coins':
      case 'monedas':
        rankingText += `${currentUser.coins} 💰`
        break
      case 'wins':
      case 'victorias':
        rankingText += `${currentUser.wins} 🏆`
        break
      case 'winrate':
      case 'ratio':
        rankingText += `${currentUser.winRate}% (${currentUser.totalBattles} batallas)`
        break
      case 'battles':
      case 'batallas':
        rankingText += `${currentUser.totalBattles} ⚔️`
        break
      default:
        rankingText += `Nv.${currentUser.level}`
    }
  } else if (userPosition <= 10 && userPosition > 0) {
    rankingText += `\n🎯 *Tu posición:* #${userPosition}`
  }

  rankingText += `\n\n📊 *Categorías disponibles:*\n`
  rankingText += `• \`${usedPrefix}ranking level\` - Por nivel\n`
  rankingText += `• \`${usedPrefix}ranking coins\` - Por monedas\n`
  rankingText += `• \`${usedPrefix}ranking wins\` - Por victorias\n`
  rankingText += `• \`${usedPrefix}ranking winrate\` - Por ratio\n`
  rankingText += `• \`${usedPrefix}ranking battles\` - Por batallas\n\n`
  rankingText += `👥 *Total de aventureros:* ${validUsers.length}`

  const rankingButtons = [
    ['⭐ Por Nivel', `${usedPrefix}ranking level`],
    ['💰 Por Monedas', `${usedPrefix}ranking coins`],
    ['🏆 Por Victorias', `${usedPrefix}ranking wins`],
    ['📊 Por Ratio', `${usedPrefix}ranking winrate`]
  ]

  await conn.sendButton(m.chat, rankingText, `${icon} Ranking de Aventureros - Hatsune Miku Bot`, 'https://i.imgur.com/ranking.jpg', rankingButtons, m)
}

handler.help = ['ranking']
handler.tags = ['rpg']
handler.command = /^(ranking|rank|top|leaderboard)$/i
handler.register = true

export default handler