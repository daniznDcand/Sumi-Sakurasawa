const SHOP_ITEMS = {
  
  potion: {
    name: "🧪 Poción de Salud",
    description: "Restaura 50 HP",
    price: 100,
    effect: 'heal',
    category: 'basic'
  },
  megapotion: {
    name: "💉 Mega Poción",
    description: "Restaura toda la salud",
    price: 250,
    effect: 'fullheal',
    category: 'basic'
  },
  strength: {
    name: "⚔️ Poción de Fuerza",
    description: "Aumenta ataque permanentemente +3",
    price: 500,
    effect: 'attack',
    category: 'basic'
  },
  defense: {
    name: "🛡️ Poción de Defensa", 
    description: "Aumenta defensa permanentemente +2",
    price: 400,
    effect: 'defense',
    category: 'basic'
  },
  vitality: {
    name: "❤️ Poción de Vitalidad",
    description: "Aumenta HP máximo permanentemente +15",
    price: 600,
    effect: 'hp',
    category: 'basic'
  },
  experience: {
    name: "⭐ Pergamino de Experiencia",
    description: "Otorga 75 puntos de experiencia",
    price: 300,
    effect: 'exp',
    category: 'basic'
  },
 
  battlepotion: {
    name: "⚡ Poción de Batalla",
    description: "Restaura HP y aumenta ataque temporalmente",
    price: 200,
    effect: 'battle',
    category: 'special'
  },
  revive: {
    name: "🌟 Cristal de Resurrección",
    description: "Revive con 50% HP si mueres en mazmorra",
    price: 800,
    effect: 'revive',
    category: 'special'
  },
  luck: {
    name: "🍀 Amuleto de Suerte",
    description: "Aumenta recompensas de mazmorra por 1 hora",
    price: 350,
    effect: 'luck',
    category: 'special'
  },
  shield: {
    name: "🔰 Escudo Mágico",
    description: "Reduce daño recibido en próxima batalla",
    price: 150,
    effect: 'shield',
    category: 'special'
  }
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
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
      lastAdventure: 0
    }
  }
  
  const coins = user.coin || 0
  
  
  if (!text) {
    let shopMessage = `🏪 *TIENDA RPG COMPLETA* 🏪\n\n`
    shopMessage += `💰 *Tus monedas:* ${coins}\n\n`
    
   
    shopMessage += `📋 *OBJETOS BÁSICOS:*\n\n`
    Object.entries(SHOP_ITEMS).filter(([key, item]) => item.category === 'basic').forEach(([key, item]) => {
      shopMessage += `*${item.name}*\n`
      shopMessage += `💭 ${item.description}\n`
      shopMessage += `💰 Precio: ${item.price} monedas\n\n`
    })
    
    shopMessage += `✨ *OBJETOS ESPECIALES:*\n\n`
    Object.entries(SHOP_ITEMS).filter(([key, item]) => item.category === 'special').forEach(([key, item]) => {
      shopMessage += `*${item.name}*\n`
      shopMessage += `💭 ${item.description}\n`
      shopMessage += `💰 Precio: ${item.price} monedas\n\n`
    })
    
    shopMessage += `💡 *Usa los botones para comprar rápidamente*\n`
    shopMessage += `🎮 *Otros comandos:*\n`
    shopMessage += `• \`${usedPrefix}mazmorra\` - Explorar mazmorras\n`
    shopMessage += `• \`${usedPrefix}rpgstats\` - Ver tu perfil`
    
   
    const basicButtons = [
      { buttonId: `${usedPrefix}tiendarpg potion`, buttonText: { displayText: '🧪 Poción (100)' }, type: 1 },
      { buttonId: `${usedPrefix}tiendarpg megapotion`, buttonText: { displayText: '💉 Mega (250)' }, type: 1 },
      { buttonId: `${usedPrefix}tiendarpg strength`, buttonText: { displayText: '⚔️ Fuerza (500)' }, type: 1 }
    ]
    
    const moreButtons = [
      { buttonId: `${usedPrefix}tiendarpg defense`, buttonText: { displayText: '🛡️ Defensa (400)' }, type: 1 },
      { buttonId: `${usedPrefix}tiendarpg battlepotion`, buttonText: { displayText: '⚡ Batalla (200)' }, type: 1 },
      { buttonId: `${usedPrefix}tiendarpg revive`, buttonText: { displayText: '🌟 Revivir (800)' }, type: 1 }
    ]
    
    const extraButtons = [
      { buttonId: `${usedPrefix}tiendarpg luck`, buttonText: { displayText: '🍀 Suerte (350)' }, type: 1 },
      { buttonId: `${usedPrefix}tienda`, buttonText: { displayText: '🏪 Tienda Premium' }, type: 1 },
      { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏛️ Mazmorras' }, type: 1 }
    ]

    const buttonMessage = {
      text: shopMessage,
      footer: '🏪 Tienda RPG Completa - Hatsune Miku Bot',
      buttons: basicButtons.concat(moreButtons).concat(extraButtons),
      headerType: 1
    }

    return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }
  
 
  const itemKey = text.toLowerCase().trim()
  const item = SHOP_ITEMS[itemKey]
  
  if (!item) {
    return m.reply(`❌ Artículo no encontrado. Usa \`${usedPrefix}tiendarpg\` para ver la tienda.`)
  }
  
  
  if (coins < item.price) {
    return m.reply(`💸 No tienes suficientes monedas.\n\n💰 *Necesitas:* ${item.price} monedas\n💳 *Tienes:* ${coins} monedas\n📊 *Te faltan:* ${item.price - coins} monedas`)
  }
  
  
  user.coin -= item.price
  let resultMessage = `✅ *¡Compra exitosa!* ✅\n\n`
  resultMessage += `🛍️ *Artículo:* ${item.name}\n`
  resultMessage += `💰 *Precio:* ${item.price} monedas\n`
  resultMessage += `💳 *Saldo restante:* ${user.coin} monedas\n\n`
  
  
  switch (item.effect) {
    case 'heal':
      const healAmount = Math.min(50, user.rpgData.maxHp - user.rpgData.hp)
      user.rpgData.hp += healAmount
      resultMessage += `❤️ *Efecto:* Recuperaste ${healAmount} HP\n`
      resultMessage += `🩺 *HP actual:* ${user.rpgData.hp}/${user.rpgData.maxHp}`
      break
      
    case 'fullheal':
      const fullHealAmount = user.rpgData.maxHp - user.rpgData.hp
      user.rpgData.hp = user.rpgData.maxHp
      resultMessage += `💚 *Efecto:* Recuperaste ${fullHealAmount} HP (Salud completa)\n`
      resultMessage += `🩺 *HP actual:* ${user.rpgData.hp}/${user.rpgData.maxHp}`
      break
      
    case 'attack':
      user.rpgData.attack += 3
      resultMessage += `⚔️ *Efecto:* Ataque aumentado permanentemente +3\n`
      resultMessage += `💪 *Ataque actual:* ${user.rpgData.attack}`
      break
      
    case 'defense':
      user.rpgData.defense += 2
      resultMessage += `🛡️ *Efecto:* Defensa aumentada permanentemente +2\n`
      resultMessage += `🔰 *Defensa actual:* ${user.rpgData.defense}`
      break
      
    case 'hp':
      user.rpgData.maxHp += 15
      user.rpgData.hp += 15 
      resultMessage += `❤️ *Efecto:* HP máximo aumentado permanentemente +15\n`
      resultMessage += `💓 *HP máximo actual:* ${user.rpgData.maxHp}`
      break
      
    case 'exp':
      user.rpgData.exp += 75
      resultMessage += `⭐ *Efecto:* Ganaste 75 puntos de experiencia\n`
      
      
      const expNeeded = user.rpgData.level * 100
      if (user.rpgData.exp >= expNeeded) {
        user.rpgData.level += 1
        user.rpgData.exp -= expNeeded
        user.rpgData.maxHp += 20
        user.rpgData.hp = user.rpgData.maxHp
        user.rpgData.attack += 5
        user.rpgData.defense += 3
        
        resultMessage += `\n🎉 *¡SUBISTE DE NIVEL!** 🎉\n`
        resultMessage += `📊 *Nuevo nivel:* ${user.rpgData.level}\n`
        resultMessage += `❤️ *HP máximo:* ${user.rpgData.maxHp}\n`
        resultMessage += `⚔️ *Ataque:* ${user.rpgData.attack}\n`
        resultMessage += `🛡️ *Defensa:* ${user.rpgData.defense}`
      } else {
        resultMessage += `📈 *EXP actual:* ${user.rpgData.exp}/${user.rpgData.level * 100}`
      }
      break
      
    case 'battle':
      const battleHeal = Math.min(30, user.rpgData.maxHp - user.rpgData.hp)
      user.rpgData.hp += battleHeal
      user.rpgData.tempAttack = (user.rpgData.tempAttack || 0) + 10
      user.rpgData.tempAttackExpiry = Date.now() + (30 * 60 * 1000) 
      resultMessage += `⚡ *Efecto:* Recuperaste ${battleHeal} HP y +10 ataque temporal\n`
      resultMessage += `💪 *Ataque temporal:* ${user.rpgData.attack + user.rpgData.tempAttack} (30 min)`
      break
      
    case 'revive':
      user.rpgData.reviveToken = true
      resultMessage += `🌟 *Efecto:* Tienes un cristal de resurrección activo\n`
      resultMessage += `💫 *Protección:* Si mueres en mazmorra, revivirás con 50% HP`
      break
      
    case 'luck':
      user.rpgData.luckBoost = Date.now() + (60 * 60 * 1000) 
      resultMessage += `🍀 *Efecto:* Amuleto de suerte activo por 1 hora\n`
      resultMessage += `💰 *Bonus:* +50% recompensas en mazmorras`
      break
      
    case 'shield':
      user.rpgData.magicShield = 3 
      resultMessage += `🔰 *Efecto:* Escudo mágico activo\n`
      resultMessage += `🛡️ *Protección:* Reduce 50% del daño en próximas 3 batallas`
      break
  }
  
  
  const postPurchaseButtons = [
    { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '🏪 Volver a Tienda' }, type: 1 },
    { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏛️ Ir a Mazmorras' }, type: 1 },
    { buttonId: `${usedPrefix}rpgstats`, buttonText: { displayText: '📊 Ver Stats' }, type: 1 }
  ]

  const purchaseMessage = {
    text: resultMessage,
    footer: '✅ Compra realizada con éxito',
    buttons: postPurchaseButtons,
    headerType: 1
  }

  await conn.sendMessage(m.chat, purchaseMessage, { quoted: m })
}

handler.help = ['tiendarpg']
handler.tags = ['rpg']
handler.command = /^(tiendarpg|shopprg)$/i
handler.register = true

export default handler

