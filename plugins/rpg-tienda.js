import { sendCompatibleMessage } from '../lib/compatible-messages.js'

const SHOP_ITEMS = {
  
  potion: {
    name: "🧪 Poción de Salud",
    description: "Restaura 50 HP",
    price: 100,
    effect: 'heal',
    category: 'potions',
    image: 'https://e7.pngegg.com/pngimages/282/714/png-clipart-potion-magic-magic-potion-healing-potion-health-potion.png'
  },
  megapotion: {
    name: "💉 Mega Poción",
    description: "Restaura toda la salud",
    price: 250,
    effect: 'fullheal',
    category: 'potions',
    image: 'https://png.pngtree.com/png-clipart/20221027/ourmid/pngtree-a-purple-and-shining-magician-s-potion-png-image_6390277.png'
  },
  battlepotion: {
    name: "⚡ Poción de Batalla",
    description: "Restaura HP y aumenta ataque temporalmente",
    price: 200,
    effect: 'battle',
    category: 'potions',
    image: 'https://png.pngtree.com/png-vector/20200216/ourmid/pngtree-bottle-with-health-potion-poison-and-leaf-potion-hand-drawn-illustration-png-image_2137654.jpg'
  },
  
  sword: {
    name: "🗡️ Espada de Hierro",
    description: "Aumenta ataque permanentemente +5",
    price: 800,
    effect: 'weapon_attack',
    category: 'weapons',
    image: 'https://png.pngtree.com/png-vector/20250426/ourmid/pngtree-knight-sword-icon-silhouette-isolated-ancient-swords-signs-claymore-medieval-fantasy-png-image_16117606.png'
  },
  magicsword: {
    name: "✨ Espada Mágica",
    description: "Aumenta ataque permanentemente +8",
    price: 1500,
    effect: 'magic_weapon',
    category: 'weapons',
    image: 'https://img.freepik.com/vector-premium/espada-magica-hielo-metal-magico-negro-enmarca-acero-azul-frio-hoja-helada-espada-peliculas-juegos-ciencia-ficcion-fantasia-mundo-aventura-valor_306119-1438.jpg'
  },
  legendsword: {
    name: "💎 Espada Legendaria",
    description: "Aumenta ataque permanentemente +12",
    price: 3000,
    effect: 'legend_weapon',
    category: 'weapons',
    image: 'https://www.pngarts.com/files/8/Sword-Anime-PNG-Image.png'
  },
  
  armor: {
    name: "🛡️ Armadura de Cuero",
    description: "Aumenta defensa permanentemente +3",
    price: 600,
    effect: 'armor_defense',
    category: 'armor',
    image: 'https://w7.pngwing.com/pngs/422/286/png-transparent-armour-clothing-lapel-pin-body-armor-armour-game-textile-leather.png'
  },
  chainmail: {
    name: "⛓️ Cota de Malla",
    description: "Aumenta defensa permanentemente +6",
    price: 1200,
    effect: 'chain_armor',
    category: 'armor',
    image: 'https://i.pinimg.com/1200x/f9/b3/f6/f9b3f66b09d4ac8e4f3afd41376384e9.jpg'
  },
  platearmor: {
    name: "🛡️ Armadura de Placas",
    description: "Aumenta defensa permanentemente +10",
    price: 2500,
    effect: 'plate_armor',
    category: 'armor',
    image: 'https://i.pinimg.com/474x/1d/34/45/1d3445f1c6acee1ccf9c8c4a5ccf0719.jpg'
  },
  
  vitality: {
    name: "❤️ Poción de Vitalidad",
    description: "Aumenta HP máximo permanentemente +15",
    price: 600,
    effect: 'hp',
    category: 'special',
    image: 'https://e7.pngegg.com/pngimages/282/714/png-clipart-potion-magic-magic-potion-healing-potion-health-potion.png'
  },
  experience: {
    name: "⭐ Pergamino de Experiencia",
    description: "Otorga 75 puntos de experiencia",
    price: 300,
    effect: 'exp',
    category: 'special',
    image: 'https://previews.123rf.com/images/frenta/frenta1109/frenta110900020/10515228-ancient-parchment-with-the-image-of-dragons-object-isolated-over-white.jpg'
  },
  revive: {
    name: "🌟 Cristal de Resurrección",
    description: "Revive con 50% HP si mueres en mazmorra",
    price: 800,
    effect: 'revive',
    category: 'special',
    image: 'https://i.pinimg.com/236x/6a/55/08/6a55085a4b4459944dbf46e186c2923c.jpg'
  },
  luck: {
    name: "🍀 Amuleto de Suerte",
    description: "Aumenta recompensas de mazmorra por 1 hora",
    price: 350,
    effect: 'luck',
    category: 'special',
    image: 'https://png.pngtree.com/png-vector/20251224/ourlarge/pngtree-traditional-japanese-red-omamori-amulet-for-good-luck-png-image_18328382.webp'
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
  
  const coins = user.coin || 0
  
  
  if (!text) {
    let shopMessage = `🏪 *TIENDA RPG COMPLETA* 🏪\n\n`
    shopMessage += `💰 *Tus cebollines:* ${coins.toLocaleString()}\n\n`
    shopMessage += `📋 *CATEGORÍAS DISPONIBLES:*\n\n`
    shopMessage += `🧪 *POCIONES* - Curación y efectos temporales\n`
    shopMessage += `⚔️ *ARMAS* - Aumenta tu poder de ataque\n`
    shopMessage += `🛡️ *ARMADURAS* - Mejora tu defensa\n`
    shopMessage += `✨ *ESPECIALES* - Objetos únicos y raros\n\n`
    shopMessage += `💡 *Selecciona una categoría con los botones*`
    
    const categoryButtons = [
      { buttonId: `${usedPrefix}tiendarpg categoria potions`, buttonText: { displayText: '🧪 Pociones' }, type: 1 },
      { buttonId: `${usedPrefix}tiendarpg categoria weapons`, buttonText: { displayText: '⚔️ Armas' }, type: 1 },
      { buttonId: `${usedPrefix}tiendarpg categoria armor`, buttonText: { displayText: '🛡️ Armaduras' }, type: 1 }
    ]
    
    const moreButtons = [
      { buttonId: `${usedPrefix}tiendarpg categoria special`, buttonText: { displayText: '✨ Especiales' }, type: 1 },
      { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏛️ Mazmorras' }, type: 1 },
      { buttonId: `${usedPrefix}tienda`, buttonText: { displayText: '🏪 Tienda Premium' }, type: 1 }
    ]

    return await sendCompatibleMessage(conn, m.chat, {
      text: shopMessage,
      footer: '🏪 Tienda RPG - Hatsune Miku Bot',
      buttons: categoryButtons.concat(moreButtons)
    }, { quoted: m })
  }
  
  
  if (text.startsWith('categoria ')) {
    let category = text.split(' ')[1]
    return await showCategory(conn, m, user, category, usedPrefix)
  }
  
  
  const itemKey = text.toLowerCase().trim()
  const item = SHOP_ITEMS[itemKey]
  
  if (!item) {
    return m.reply(`❌ Artículo no encontrado. Usa \`${usedPrefix}tiendarpg\` para ver la tienda.`)
  }
  
  if (coins < item.price) {
    return m.reply(`💸 No tienes suficientes cebollines.\n\n💰 *Necesitas:* ${item.price.toLocaleString()} cebollines\n💳 *Tienes:* ${coins.toLocaleString()} cebollines\n📊 *Te faltan:* ${(item.price - coins).toLocaleString()} cebollines`)
  }
  
  user.coin -= item.price
  let resultMessage = `✅ *¡Compra exitosa!* ✅\n\n`
  resultMessage += `🛍️ *Artículo:* ${item.name}\n`
  resultMessage += `💰 *Precio:* ${item.price.toLocaleString()} cebollines\n`
  resultMessage += `💳 *Saldo restante:* ${user.coin.toLocaleString()} cebollines\n\n`
  
  
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
      
    case 'weapon_attack':
      user.rpgData.attack += 5
      resultMessage += `⚔️ *Efecto:* Ataque aumentado permanentemente +5\n`
      resultMessage += `💪 *Ataque actual:* ${user.rpgData.attack}`
      break
      
    case 'magic_weapon':
      user.rpgData.attack += 8
      resultMessage += `✨ *Efecto:* Ataque aumentado permanentemente +8\n`
      resultMessage += `💪 *Ataque actual:* ${user.rpgData.attack}`
      break
      
    case 'legend_weapon':
      user.rpgData.attack += 12
      resultMessage += `💎 *Efecto:* Ataque aumentado permanentemente +12\n`
      resultMessage += `💪 *Ataque actual:* ${user.rpgData.attack}`
      break
      
    case 'armor_defense':
      user.rpgData.defense += 3
      resultMessage += `🛡️ *Efecto:* Defensa aumentada permanentemente +3\n`
      resultMessage += `🔰 *Defensa actual:* ${user.rpgData.defense}`
      break
      
    case 'chain_armor':
      user.rpgData.defense += 6
      resultMessage += `⛓️ *Efecto:* Defensa aumentada permanentemente +6\n`
      resultMessage += `🔰 *Defensa actual:* ${user.rpgData.defense}`
      break
      
    case 'plate_armor':
      user.rpgData.defense += 10
      resultMessage += `🛡️ *Efecto:* Defensa aumentada permanentemente +10\n`
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
      user.rpgData.totalExp += 75
      resultMessage += `⭐ *Efecto:* Ganaste 75 puntos de experiencia\n`
      
      const expNeeded = user.rpgData.level * 100
      if (user.rpgData.exp >= expNeeded) {
        user.rpgData.level += 1
        user.rpgData.exp -= expNeeded
        user.rpgData.maxHp += 20
        user.rpgData.hp = user.rpgData.maxHp
        user.rpgData.attack += 5
        user.rpgData.defense += 3
        
        resultMessage += `\n🎉 *¡SUBISTE DE NIVEL!* 🎉\n`
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
  }
  
  
  try {
    await conn.sendMessage(m.chat, {
      image: { url: item.image },
      caption: resultMessage,
      footer: '✅ Compra realizada con éxito',
      buttons: [
        { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '🏪 Volver a Tienda' }, type: 1 },
        { buttonId: `${usedPrefix}mazmorra`, buttonText: { displayText: '🏛️ Ir a Mazmorras' }, type: 1 },
        { buttonId: `${usedPrefix}rpgstats`, buttonText: { displayText: '📊 Ver Stats' }, type: 1 }
      ],
      headerType: 4
    }, { quoted: m })
  } catch {
    await m.reply(resultMessage)
  }
}

async function showCategory(conn, m, user, category, usedPrefix) {
  const coins = user.coin || 0
  const categoryItems = Object.entries(SHOP_ITEMS).filter(([key, item]) => item.category === category)
  
  if (categoryItems.length === 0) {
    return m.reply('❌ Categoría no válida.')
  }
  
  let categoryNames = {
    'potions': '🧪 POCIONES',
    'weapons': '⚔️ ARMAS',
    'armor': '🛡️ ARMADURAS',
    'special': '✨ ESPECIALES'
  }
  
  let categoryMessage = `${categoryNames[category]} \n\n`
  categoryMessage += `💰 *Tus cebollines:* ${coins.toLocaleString()}\n\n`
  
  categoryItems.forEach(([key, item]) => {
    categoryMessage += `**${item.name}**\n`
    categoryMessage += `💭 ${item.description}\n`
    categoryMessage += `💰 Precio: ${item.price.toLocaleString()} cebollines\n\n`
  })
  
  
  const itemButtons = categoryItems.slice(0, 3).map(([key, item]) => ({
    buttonId: `${usedPrefix}tiendarpg ${key}`,
    buttonText: { displayText: `${item.name.split(' ')[0]} (${item.price})` },
    type: 1
  }))
  
  const moreItemButtons = categoryItems.slice(3, 6).map(([key, item]) => ({
    buttonId: `${usedPrefix}tiendarpg ${key}`,
    buttonText: { displayText: `${item.name.split(' ')[0]} (${item.price})` },
    type: 1
  }))
  
  const navButtons = [
    { buttonId: `${usedPrefix}tiendarpg`, buttonText: { displayText: '⬅️ Volver a Tienda' }, type: 1 }
  ]

  const buttonMessage = {
    text: categoryMessage,
    footer: `${categoryNames[category]} - Hatsune Miku Bot`,
    buttons: itemButtons.concat(moreItemButtons).concat(navButtons),
    headerType: 1
  }

  await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

handler.help = ['tiendarpg']
handler.tags = ['rpg']
handler.command = /^(tiendarpg|shopprg)$/i
handler.register = true

export default handler