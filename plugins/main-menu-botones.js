const handler = async (m, { conn, usedPrefix, command, args }) => {
  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let _uptime = process.uptime() * 1000
  let uptime = clockString(_uptime)
  let totalreg = Object.keys(global.db.data.users).length
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length
  
  
  usedPrefix = '.'

  if (command === 'menu' || command === 'menú' || command === 'help') {
    const buttons = [
      ['📥 Descargas', 'menu_descargas'],
      ['🛠️ Herramientas', 'menu_herramientas'],
      ['🎮 Juegos', 'menu_juegos'],
      ['🎌 Anime & Reacciones', 'menu_anime'],
      ['👥 Grupos', 'menu_grupos'],
      ['ℹ️ Info Bot', 'menu_info']
    ]

    const text = `╭━━━━━━━━━━━━━━━━━━━╮
┃ 🎤 *HATSUNE MIKU BOT* 🎤 ┃
╰━━━━━━━━━━━━━━━━━━━╯

🌸 ¡Konnichiwa, @${userId.split('@')[0]}! 🌸

┏━━━━━━━━━━━━━━━━┓
┃ 💙 *Estado:* ${(conn.user.jid == global.conn.user.jid ? 'Principal ⚡️' : 'Sub-Bot 🔌')}
┃ ⏰ *Activo:* ${uptime}
┃ 👥 *Usuarios:* ${totalreg}
┃ 📊 *Comandos:* ${totalCommands}
┗━━━━━━━━━━━━━━━━┛

🎵 *Selecciona una categoría:*
Usa los botones de abajo para navegar por las diferentes funciones del bot.
📣 Usa .menucompleto para ver todos los comandos

💙 ¡Disfruta de la experiencia Miku! ✨`
    
    const footer = '🌱 Powered by (ㅎㅊDEPOOLㅊㅎ)'
    const menuGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    
    const templateButtons = buttons.map((btn, index) => ({
      index: index + 1,
      quickReplyButton: {
        displayText: btn[0],
        id: btn[1]
      }
    }))

    return conn.sendMessage(m.chat, {
      video: { url: menuGif },
      caption: text,
      footer: footer,
      gifPlayback: true,
      templateButtons: templateButtons
    }, { quoted: m })
  }

  if (command === 'menu_descargas' || m.text === 'menu_descargas') {
    const buttons = [
      ['🎵 Play YouTube', 'exec_play'],
      ['📱 TikTok', 'exec_tiktok'],
      ['📷 Instagram', 'exec_instagram'],
      ['💙 Facebook', 'exec_facebook'],
      ['📁 MediaFire', 'exec_mediafire'],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `📥 *MENÚ DE DESCARGAS*

🎵 ═══ *MÚSICA Y VIDEOS* ═══ 🎵
🎼 \`.play [nombre]\` - YouTube Music
🎥 \`.ytmp3 [url]\` - YouTube a MP3
📹 \`.ytmp4 [url]\` - YouTube a MP4

📱 ═══ *REDES SOCIALES* ═══ 📱
🎬 \`.tiktok [url]\` - Videos TikTok
📸 \`.instagram [url]\` - Posts IG
💙 \`.facebook [url]\` - Videos FB
🐦 \`.twitter [url]\` - Videos Twitter

📁 ═══ *ARCHIVOS* ═══ 📁
💾 \`.mediafire [url]\` - MediaFire
☁️ \`.mega [url]\` - MEGA
📱 \`.apk [nombre]\` - APKs

🌸 *Presiona un botón para probar:*`

    const footer = '🎵 Módulo de Descargas - Hatsune Miku Bot'
    
    const descargasGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, descargasGif, buttons, null, null, null, m)
  }

  if (command === 'menu_herramientas' || m.text === 'menu_herramientas') {
    const buttons = [
      ['🌤️ Clima', 'exec_clima'],
      ['🈵 Traducir', 'exec_translate'],
      ['✨ Mejorar Imagen', 'exec_enhance'],
      ['🧮 Calculadora', 'exec_calcular'],
      ['🌟 Crear Sticker', 'exec_sticker'],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `🛠️ *HERRAMIENTAS ÚTILES*

🌸 ═══ 🌐 *UTILIDADES WEB* 🌐 ═══ 🌸
🌤️ \`.clima [ciudad]\` - Ver clima
🈵 \`.translate [texto]\` - Traductor  
📷 \`.ss [url]\` - Screenshot

💙 ═══ 🎨 *EDICIÓN* 🎨 ═══ 💙
✨ \`.enhance\` - Mejorar imagen
🌟 \`.s\` - Crear sticker
🖼️ \`.toimg\` - Sticker a imagen

🎵 ═══ 🔧 *CONVERSORES* 🔧 ═══ 🎵
🎵 \`.tomp3\` - Audio a MP3
🎬 \`.tovideo\` - Audio a video
🎞️ \`.togif\` - Video a GIF

💫 *Presiona un botón para usar:*`

    const footer = '🔧 Módulo de Herramientas - Hatsune Miku Bot'
    
    const herramientasGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, herramientasGif, buttons, null, null, null, m)
  }

  if (command === 'menu_juegos' || m.text === 'menu_juegos') {
    const buttons = [
      ['⭕ Tres en Raya', 'exec_ttt'],
      ['✂️ Piedra/Papel/Tijera', 'exec_ppt'],
      ['🎪 Ahorcado', 'exec_ahorcado'],
      ['🎰 Casino', 'exec_casino'],
      ['⚔️ PvP', 'exec_pvp'],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `🎮 *CENTRO DE JUEGOS*

🕹️ ═══ *JUEGOS CLÁSICOS* ═══ 🕹️
⭕ \`.ttt\` - Tres en raya
✂️ \`.ppt\` - Piedra/Papel/Tijera
🎪 \`.ahorcado\` - Juego del ahorcado
🔤 \`.sopa\` - Sopa de letras

🎰 ═══ *CASINO & APUESTAS* ═══ 🎰
🎲 \`.casino [cantidad]\` - Apostar
🎰 \`.slot [cantidad]\` - Tragamonedas
🪙 \`.cf [cantidad]\` - Cara o cruz
🔫 \`.ruleta\` - Ruleta rusa

⚔️ ═══ *COMPETITIVO* ═══ ⚔️
🥊 \`.pvp [@usuario]\` - Pelear
🧠 \`.matematicas\` - Quiz matemático

🎊 *Presiona un botón para jugar:*`

    const footer = '🎮 Módulo de Juegos - Hatsune Miku Bot'
    
    const juegosGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, juegosGif, buttons, null, null, null, m)
  }

  if (command === 'menu_anime' || m.text === 'menu_anime') {
    const buttons = [
      ['🤗 Hug', 'exec_hug'],
      ['😘 Kiss', 'exec_kiss'],
      ['🤲 Pat', 'exec_pat'],
      ['💃 Dance', 'exec_dance'],
      ['😢 Cry', 'exec_cry'],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `🎌 *ANIME & REACCIONES*

😊 ═══ *REACCIONES POSITIVAS* ═══ 😊
🤗 \`.hug [@usuario]\` - Dar abrazo
😘 \`.kiss [@usuario]\` - Dar beso  
🤲 \`.pat [@usuario]\` - Acariciar
😊 \`.happy\` - Estar feliz

💃 ═══ *ACCIONES* ═══ 💃
💃 \`.dance\` - Bailar
🍽️ \`.eat\` - Comer
😴 \`.sleep\` - Dormir
🤔 \`.think\` - Pensar

😔 ═══ *EMOCIONES* ═══ 😔
😢 \`.cry\` - Llorar
😞 \`.sad\` - Estar triste
😠 \`.angry\` - Estar enojado

🌸 *Presiona un botón para reaccionar:*`

    const footer = '🎌 Módulo Anime - Hatsune Miku Bot'
    
    const animeGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, animeGif, buttons, null, null, null, m)
  }

  if (command === 'menu_grupos' || m.text === 'menu_grupos') {
    const buttons = [
      ['👻 Hidetag', 'exec_hidetag'],
      ['🦵 Kick', 'exec_kick'],
      ['➕ Add', 'exec_add'],
      ['🔗 Link', 'exec_link'],
      ['⚠️ Warn', 'exec_warn'],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `👥 *GESTIÓN DE GRUPOS*
_(Solo para administradores)_

👑 ═══ *ADMINISTRACIÓN* ═══ 👑
🦵 \`.kick [@usuario]\` - Eliminar
➕ \`.add [número]\` - Invitar
👑 \`.promote [@usuario]\` - Dar admin
👤 \`.demote [@usuario]\` - Quitar admin

📢 ═══ *COMUNICACIÓN* ═══ 📢
👻 \`.hidetag [texto]\` - Mencionar todos
📣 \`.admins\` - Llamar admins
📢 \`.invocar\` - Mencionar todos

⚙️ ═══ *CONFIGURACIÓN* ═══ ⚙️
🔓 \`.group open/close\` - Abrir/cerrar
🔗 \`.link\` - Ver enlace
🔄 \`.revoke\` - Cambiar enlace

🔧 *Presiona un botón para usar las herramientas:*`

    const footer = '👥 Módulo de Grupos - Hatsune Miku Bot'
    
    const gruposGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, gruposGif, buttons, null, null, null, m)
  }

  if (command === 'menu_info' || m.text === 'menu_info') {
    const buttons = [
      ['📡 Ping', 'exec_ping'],
      ['⏱️ Uptime', 'exec_uptime'],
      ['🤖 SerBot', 'exec_serbot'],
      ['📊 Status', 'exec_status'],
      ['💻 Script', 'exec_script'],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `ℹ️ *INFORMACIÓN DEL BOT*

🤖 ═══ *DATOS DEL BOT* ═══ 🤖
📡 \`.ping\` - Velocidad de respuesta
⏱️ \`.uptime\` - Tiempo activo
📊 \`.status\` - Estado completo
ℹ️ \`.infobot\` - Info detallada

🔗 ═══ *ENLACES & COMUNIDAD* ═══ 🔗
💻 \`.script\` - Código fuente
🔗 \`.links\` - Enlaces oficiales
👥 \`.staff\` - Desarrolladores

🤖 ═══ *SUBBOTS* ═══ 🤖
🤖 \`.serbot\` - Crear SubBot
📱 \`.qr\` - Código QR
🤖 \`.bots\` - Lista SubBots

💙 *Presiona un botón para ejecutar:*`

    const footer = 'ℹ️ Información del Bot - Hatsune Miku Bot'
    
    const infoGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, infoGif, buttons, null, null, null, m)
  }

  
  if (m.text && (m.text.startsWith('menu_') || m.text === 'volver_menu' || m.text.startsWith('exec_'))) {
    
    
    if (m.text === 'volver_menu') {
      return await handler(m, { conn, usedPrefix, command: 'menu', args })
    }

   
    if (m.text.startsWith('menu_')) {
      const menuCommand = m.text
      return await handler(m, { conn, usedPrefix, command: menuCommand, args })
    }

    
    if (m.text.startsWith('exec_')) {
      switch (m.text) {
        
        case 'exec_play':
          return conn.reply(m.chat, `🎵 *Ejemplo de uso:*\n\nEscribe: \`.play World is Mine\`\n\nO simplemente envía el nombre de una canción que quieras descargar.`, m)
        
        case 'exec_tiktok':
          return conn.reply(m.chat, `📱 *Para descargar de TikTok:*\n\n1. Copia el enlace del video de TikTok\n2. Escribe: \`.tiktok [enlace]\`\n\nEjemplo:\n\`.tiktok https://vm.tiktok.com/abc123\``, m)
        
        case 'exec_instagram':
          return conn.reply(m.chat, `📷 *Para descargar de Instagram:*\n\n1. Copia el enlace del post\n2. Escribe: \`.instagram [enlace]\`\n\nFunciona con fotos, videos y reels.`, m)
        
        case 'exec_facebook':
          return conn.reply(m.chat, `💙 *Para descargar de Facebook:*\n\n1. Copia el enlace del video\n2. Escribe: \`.facebook [enlace]\`\n\nSolo funciona con videos públicos.`, m)
        
        case 'exec_mediafire':
          return conn.reply(m.chat, `📁 *Para descargar de MediaFire:*\n\n1. Copia el enlace de MediaFire\n2. Escribe: \`.mediafire [enlace]\`\n\nDescarga archivos hasta 100MB.`, m)

         
        case 'exec_clima':
          return conn.reply(m.chat, `🌤️ *Consultar el clima:*\n\nEscribe: \`${usedPrefix}clima [ciudad]\`\n\nEjemplos:\n• \`${usedPrefix}clima Lima\`\n• \`${usedPrefix}clima Tokyo\`\n• \`${usedPrefix}clima Buenos Aires\``, m)
        
        case 'exec_translate':
          return conn.reply(m.chat, `🈵 *Traducir texto:*\n\nEscribe: \`${usedPrefix}translate [texto]\`\n\nEjemplos:\n• \`${usedPrefix}translate Hello world\`\n• \`${usedPrefix}translate こんにちは\`\n\nTraduce automáticamente a español.`, m)
        
        case 'exec_enhance':
          return conn.reply(m.chat, `✨ *Mejorar imagen:*\n\n1. Envía o reenvía una imagen\n2. Responde con: \`${usedPrefix}enhance\`\n\nMejora la calidad y resolución de tus fotos.`, m)
        
        case 'exec_calcular':
          return conn.reply(m.chat, `🧮 *Calculadora:*\n\nEscribe: \`${usedPrefix}calc [operación]\`\n\nEjemplos:\n• \`${usedPrefix}calc 25 + 37\`\n• \`${usedPrefix}calc 15 * 8\`\n• \`${usedPrefix}calc sqrt(144)\``, m)
        
        case 'exec_sticker':
          return conn.reply(m.chat, `🌟 *Crear sticker:*\n\n1. Envía una imagen o video (máx 10 seg)\n2. Responde con: \`${usedPrefix}s\`\n\n¡Convierte cualquier imagen en sticker!`, m)

        
        case 'exec_ttt':
          
          const tttMsg = { 
            ...m, 
            text: `${usedPrefix}ttt`,
            body: `${usedPrefix}ttt`
          }
          
          return conn.reply(m.chat, `⭕ *Tres en Raya iniciado!*\n\nEscribe \`${usedPrefix}ttt\` para comenzar una nueva partida.`, m).then(() => {
            
            setTimeout(() => {
              conn.handler && conn.handler.call(conn, { ...tttMsg, sender: m.sender, chat: m.chat })
            }, 500)
          })
        
        case 'exec_ppt':
          return conn.reply(m.chat, `✂️ *Piedra, Papel o Tijera:*\n\nEscribe: \`${usedPrefix}ppt [opción]\`\n\nOpciones:\n• \`${usedPrefix}ppt piedra\`\n• \`${usedPrefix}ppt papel\`\n• \`${usedPrefix}ppt tijera\`\n\n¡Reta al bot!`, m)
        
        case 'exec_ahorcado':
          const fakeMsgAhorcado = { 
            ...m, 
            text: `${usedPrefix}ahorcado`,
            body: `${usedPrefix}ahorcado`
          }
          return global.plugins['game-ahorcado'].default.call(this, fakeMsgAhorcado, { conn, usedPrefix, command: 'ahorcado', args: [] })
        
        case 'exec_casino':
          return conn.reply(m.chat, `🎰 *Casino:*\n\nEscribe: \`${usedPrefix}casino [cantidad]\`\n\nEjemplos:\n• \`${usedPrefix}casino 100\`\n• \`${usedPrefix}casino 500\`\n\nApuesta tus ${global.moneda || 'monedas'} y prueba tu suerte.`, m)
        
        case 'exec_pvp':
          return conn.reply(m.chat, `⚔️ *Player vs Player:*\n\nEscribe: \`${usedPrefix}pvp [@usuario]\`\n\nEjemplo:\n\`${usedPrefix}pvp @amigo\`\n\nReta a otro usuario a una batalla épica.`, m)

        
        case 'exec_hug':
          const fakeMsgHug = { 
            ...m, 
            text: `${usedPrefix}hug`,
            body: `${usedPrefix}hug`
          }
          return global.plugins['anime-hug'].default.call(this, fakeMsgHug, { conn, usedPrefix, command: 'hug', args: [] })
        
        case 'exec_kiss':
          const fakeMsgKiss = { 
            ...m, 
            text: `${usedPrefix}kiss`,
            body: `${usedPrefix}kiss`
          }
          return global.plugins['anime-kiss'].default.call(this, fakeMsgKiss, { conn, usedPrefix, command: 'kiss', args: [] })
        
        case 'exec_pat':
          const fakeMsgPat = { 
            ...m, 
            text: `${usedPrefix}pat`,
            body: `${usedPrefix}pat`
          }
          return global.plugins['anime-pat'].default.call(this, fakeMsgPat, { conn, usedPrefix, command: 'pat', args: [] })
        
        case 'exec_dance':
          const fakeMsgDance = { 
            ...m, 
            text: `${usedPrefix}dance`,
            body: `${usedPrefix}dance`
          }
          return global.plugins['anime-dance'].default.call(this, fakeMsgDance, { conn, usedPrefix, command: 'dance', args: [] })
        
        case 'exec_cry':
          const fakeMsgCry = { 
            ...m, 
            text: `${usedPrefix}cry`,
            body: `${usedPrefix}cry`
          }
          return global.plugins['anime-cry'].default.call(this, fakeMsgCry, { conn, usedPrefix, command: 'cry', args: [] })

        
        case 'exec_hidetag':
          return conn.reply(m.chat, `👻 *Hidetag:*\n\nEscribe: \`${usedPrefix}hidetag [mensaje]\`\n\nEjemplo:\n\`${usedPrefix}hidetag ¡Hola a todos!\`\n\nMenciona a todos sin mostrar la lista.\n\n⚠️ Solo para admins.`, m)
        
        case 'exec_kick':
          return conn.reply(m.chat, `🦵 *Eliminar usuario:*\n\nEscribe: \`${usedPrefix}kick [@usuario]\`\n\nEjemplo:\n\`${usedPrefix}kick @usuario\`\n\nElimina un usuario del grupo.\n\n⚠️ Solo para admins.`, m)
        
        case 'exec_add':
          return conn.reply(m.chat, `➕ *Agregar usuario:*\n\nEscribe: \`${usedPrefix}add [número]\`\n\nEjemplo:\n\`${usedPrefix}add 1234567890\`\n\nInvita un usuario al grupo.\n\n⚠️ Solo para admins.`, m)
        
        case 'exec_link':
          const fakeMsgLink = { 
            ...m, 
            text: `${usedPrefix}link`,
            body: `${usedPrefix}link`
          }
          return global.plugins['grupo-link'].default.call(this, fakeMsgLink, { conn, usedPrefix, command: 'link', args: [] })
        
        case 'exec_warn':
          return conn.reply(m.chat, `⚠️ *Advertir usuario:*\n\nEscribe: \`${usedPrefix}warn [@usuario] [razón]\`\n\nEjemplo:\n\`${usedPrefix}warn @usuario spam\`\n\nAdvierte a un usuario (3 = expulsión).\n\n⚠️ Solo para admins.`, m)

        
        case 'exec_ping':
          const fakeMsgPing = { 
            ...m, 
            text: `${usedPrefix}ping`,
            body: `${usedPrefix}ping`
          }
          return global.plugins['info-ping'].default.call(this, fakeMsgPing, { conn, usedPrefix, command: 'ping', args: [] })
        
        case 'exec_uptime':
          return conn.reply(m.chat, `⏱️ *TIEMPO ACTIVO*\n\n🔥 *Uptime:* ${uptime}\n💙 *Estado:* ${(conn.user.jid == global.conn.user.jid ? 'Bot Principal' : 'Sub-Bot')}\n⚡ *Funcionando sin problemas*`, m)
        
        case 'exec_serbot':
          return conn.reply(m.chat, `🤖 *Crear SubBot:*\n\nEscribe: \`${usedPrefix}serbot\`\n\nPasos:\n1. Escanea el código QR\n2. Espera la conexión\n3. ¡Ya tienes tu bot!\n\nEl SubBot funcionará con tu número.`, m)
        
        case 'exec_status':
          return conn.reply(m.chat, `📊 *ESTADO DEL BOT*\n\n👥 *Usuarios:* ${totalreg}\n📊 *Comandos:* ${totalCommands}\n⏰ *Activo:* ${uptime}\n💙 *Versión:* ${global.vs || '2.0'}\n🔧 *Librería:* ${global.libreria || 'Baileys'}\n✨ *Estado:* Online`, m)
        
        case 'exec_script':
          const fakeMsgScript = { 
            ...m, 
            text: `${usedPrefix}script`,
            body: `${usedPrefix}script`
          }
          return global.plugins['main-script'].default.call(this, fakeMsgScript, { conn, usedPrefix, command: 'script', args: [] })
        
        default:
          return conn.reply(m.chat, '❌ Opción no válida. Usa el menú principal.', m)
      }
    }
  }

  
  
  if (m.text && m.text.startsWith(usedPrefix)) {
    
    return
  }
}


function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}

handler.help = ['menu', 'menú', 'help']
handler.tags = ['main', 'menu']
handler.command = /^(menu|menú|help|menu_descargas|menu_herramientas|menu_juegos|menu_anime|menu_grupos|menu_info)$/i
handler.before = async function (m, { conn, usedPrefix }) {
  
  if (!usedPrefix) {
    usedPrefix = global.prefix || '.'
  }
  
  
  if (m.text && (m.text.startsWith('menu_') || m.text === 'volver_menu' || m.text.startsWith('exec_'))) {
    
    if (m.text === 'volver_menu' || m.text.startsWith('menu_')) {
      const command = m.text === 'volver_menu' ? 'menu' : m.text
      return handler.call(this, m, { conn, usedPrefix, command, args: [] })
    }
  }
}

export default handler
