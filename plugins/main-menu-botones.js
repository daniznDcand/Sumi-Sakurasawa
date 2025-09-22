

const handler = async (m, { conn, usedPrefix, command, args }) => {
  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let _uptime = process.uptime() * 1000
  let uptime = clockString(_uptime)
  let totalreg = Object.keys(global.db.data.users).length
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length

  
  if (command === 'menu' || command === 'menú' || command === 'help') {
    const buttons = [
      ['⚠ Descargas', 'menu_descargas'],
      ['🛠️ Herramientas', 'menu_herramientas'],
      ['🎮 Juegos', 'menu_juegos'],
      ['🎌 Anime & Reacciones', 'menu_anime'],
      ['� Grupos', 'menu_grupos'],
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

💙 ¡Disfruta de la experiencia Miku! ✨`
    
    const footer = '🌱 Powered by Hatsune Miku Bot | Presiona un botón para continuar'
    const gifUrl = 'https://tenor.com/fdp0IhKSdyu.gif' 

    return conn.sendNCarousel(m.chat, text, footer, gifUrl, buttons, null, null, null, m)
  }

  
  if (command === 'menu_descargas' || m.text === 'menu_descargas') {
    const buttons = [
      ['🎵 Play YouTube', `${usedPrefix}play`],
      ['📱 TikTok', `${usedPrefix}tiktok`],
      ['📷 Instagram', `${usedPrefix}instagram`],
      ['💙 Facebook', `${usedPrefix}facebook`],
      ['📁 MediaFire', `${usedPrefix}mediafire`],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `📥 *MENÚ DE DESCARGAS*

🎵 *Música y Videos:*
• \`${usedPrefix}play [nombre]\` - YouTube
• \`${usedPrefix}ytmp3 [url]\` - YouTube MP3
• \`${usedPrefix}ytmp4 [url]\` - YouTube MP4

📱 *Redes Sociales:*
• \`${usedPrefix}tiktok [url]\` - Videos TikTok
• \`${usedPrefix}instagram [url]\` - Posts IG
• \`${usedPrefix}facebook [url]\` - Videos FB
• \`${usedPrefix}twitter [url]\` - Videos Twitter

📁 *Archivos:*
• \`${usedPrefix}mediafire [url]\` - MediaFire
• \`${usedPrefix}mega [url]\` - MEGA
• \`${usedPrefix}apk [nombre]\` - APKs

🌸 Selecciona una opción con los botones:`

    const footer = '🎵 Módulo de Descargas - Hatsune Miku Bot'
    const gifUrl = 'https://tenor.com/fdp0IhKSdyu.gif'

    return conn.sendNCarousel(m.chat, text, footer, gifUrl, buttons, null, null, null, m)
  }

  if (command === 'menu_herramientas' || m.text === 'menu_herramientas') {
    const buttons = [
      ['🌤️ Clima', `${usedPrefix}clima`],
      ['🈵 Traducir', `${usedPrefix}translate`],
      ['✨ Mejorar Imagen', `${usedPrefix}enhance`],
      ['🧮 Calculadora', `${usedPrefix}calcular`],
      ['🌟 Crear Sticker', `${usedPrefix}s`],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `🛠️ *HERRAMIENTAS ÚTILES*

🌐 *Utilidades Web:*
• \`${usedPrefix}clima [ciudad]\` - Ver clima
• \`${usedPrefix}translate [texto]\` - Traductor
• \`${usedPrefix}ss [url]\` - Screenshot

🎨 *Edición:*
• \`${usedPrefix}enhance\` - Mejorar imagen
• \`${usedPrefix}s\` - Crear sticker
• \`${usedPrefix}toimg\` - Sticker a imagen

🔧 *Conversores:*
• \`${usedPrefix}tomp3\` - Audio a MP3
• \`${usedPrefix}tovideo\` - Audio a video
• \`${usedPrefix}togif\` - Video a GIF

💫 Herramientas para facilitar tu día:`

    const footer = '🔧 Módulo de Herramientas - Hatsune Miku Bot'
    const gifUrl = 'https://tenor.com/fdp0IhKSdyu.gif'

    return conn.sendNCarousel(m.chat, text, footer, gifUrl, buttons, null, null, null, m)
  }

  
  if (command === 'menu_juegos' || m.text === 'menu_juegos') {
    const buttons = [
      ['⭕ Tres en Raya', `${usedPrefix}ttt`],
      ['✂️ Piedra/Papel/Tijera', `${usedPrefix}ppt`],
      ['🎪 Ahorcado', `${usedPrefix}ahorcado`],
      ['🎰 Casino', `${usedPrefix}casino`],
      ['⚔️ PvP', `${usedPrefix}pvp`],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `🎮 *CENTRO DE JUEGOS*

🕹️ *Juegos Clásicos:*
• \`${usedPrefix}ttt\` - Tres en raya
• \`${usedPrefix}ppt\` - Piedra/Papel/Tijera
• \`${usedPrefix}ahorcado\` - Juego del ahorcado
• \`${usedPrefix}sopa\` - Sopa de letras

🎰 *Casino & Apuestas:*
• \`${usedPrefix}casino [cantidad]\` - Apostar
• \`${usedPrefix}slot [cantidad]\` - Tragamonedas
• \`${usedPrefix}cf [cantidad]\` - Cara o cruz
• \`${usedPrefix}ruleta\` - Ruleta rusa

⚔️ *Competitivo:*
• \`${usedPrefix}pvp [@usuario]\` - Pelear
• \`${usedPrefix}matematicas\` - Quiz matemático

🎊 ¡Diviértete jugando!`

    const footer = '🎮 Módulo de Juegos - Hatsune Miku Bot'
    const gifUrl = 'https://tenor.com/fdp0IhKSdyu.gif'

    return conn.sendNCarousel(m.chat, text, footer, gifUrl, buttons, null, null, null, m)
  }

  
  if (command === 'menu_anime' || m.text === 'menu_anime') {
    const buttons = [
      ['🤗 Hug', `${usedPrefix}hug`],
      ['😘 Kiss', `${usedPrefix}kiss`],
      ['🤲 Pat', `${usedPrefix}pat`],
      ['💃 Dance', `${usedPrefix}dance`],
      ['😢 Cry', `${usedPrefix}cry`],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `🎌 *ANIME & REACCIONES*

😊 *Reacciones Positivas:*
• \`${usedPrefix}hug [@usuario]\` - Dar abrazo
• \`${usedPrefix}kiss [@usuario]\` - Dar beso
• \`${usedPrefix}pat [@usuario]\` - Acariciar
• \`${usedPrefix}happy\` - Estar feliz

💃 *Acciones:*
• \`${usedPrefix}dance\` - Bailar
• \`${usedPrefix}eat\` - Comer
• \`${usedPrefix}sleep\` - Dormir
• \`${usedPrefix}think\` - Pensar

😔 *Emociones:*
• \`${usedPrefix}cry\` - Llorar
• \`${usedPrefix}sad\` - Estar triste
• \`${usedPrefix}angry\` - Estar enojado

🌸 Expresa tus emociones con anime!`

    const footer = '🎌 Módulo Anime - Hatsune Miku Bot'
    const gifUrl = 'https://tenor.com/fdp0IhKSdyu.gif'

    return conn.sendNCarousel(m.chat, text, footer, gifUrl, buttons, null, null, null, m)
  }

  if (command === 'menu_grupos' || m.text === 'menu_grupos') {
    const buttons = [
      ['👻 Hidetag', `${usedPrefix}hidetag`],
      ['🦵 Kick', `${usedPrefix}kick`],
      ['➕ Add', `${usedPrefix}add`],
      ['🔗 Link', `${usedPrefix}link`],
      ['⚠️ Warn', `${usedPrefix}warn`],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `👥 *GESTIÓN DE GRUPOS*
_(Solo para administradores)_

👑 *Administración:*
• \`${usedPrefix}kick [@usuario]\` - Eliminar
• \`${usedPrefix}add [número]\` - Invitar
• \`${usedPrefix}promote [@usuario]\` - Dar admin
• \`${usedPrefix}demote [@usuario]\` - Quitar admin

📢 *Comunicación:*
• \`${usedPrefix}hidetag [texto]\` - Mencionar todos
• \`${usedPrefix}admins\` - Llamar admins
• \`${usedPrefix}invocar\` - Mencionar todos

⚙️ *Configuración:*
• \`${usedPrefix}group open/close\` - Abrir/cerrar
• \`${usedPrefix}link\` - Ver enlace
• \`${usedPrefix}revoke\` - Cambiar enlace

🔧 Herramientas de administración:`

    const footer = '👥 Módulo de Grupos - Hatsune Miku Bot'
    const gifUrl = 'https://tenor.com/fdp0IhKSdyu.gif'

    return conn.sendNCarousel(m.chat, text, footer, gifUrl, buttons, null, null, null, m)
  }

  
  if (command === 'menu_info' || m.text === 'menu_info') {
    const buttons = [
      ['📡 Ping', `${usedPrefix}ping`],
      ['⏱️ Uptime', `${usedPrefix}uptime`],
      ['🤖 SerBot', `${usedPrefix}serbot`],
      ['📊 Status', `${usedPrefix}status`],
      ['💻 Script', `${usedPrefix}script`],
      ['⬅️ Volver al Menú', 'volver_menu']
    ]

    const text = `ℹ️ *INFORMACIÓN DEL BOT*

🤖 *Datos del Bot:*
• \`${usedPrefix}ping\` - Velocidad de respuesta
• \`${usedPrefix}uptime\` - Tiempo activo
• \`${usedPrefix}status\` - Estado completo
• \`${usedPrefix}infobot\` - Info detallada

🔗 *Enlaces & Comunidad:*
• \`${usedPrefix}script\` - Código fuente
• \`${usedPrefix}links\` - Enlaces oficiales
• \`${usedPrefix}staff\` - Desarrolladores

🤖 *SubBots:*
• \`${usedPrefix}serbot\` - Crear SubBot
• \`${usedPrefix}qr\` - Código QR
• \`${usedPrefix}bots\` - Lista SubBots

💙 Conoce más sobre Hatsune Miku Bot!`

    const footer = 'ℹ️ Información del Bot - Hatsune Miku Bot'
    const gifUrl = 'https://tenor.com/fdp0IhKSdyu.gif'

    return conn.sendNCarousel(m.chat, text, footer, gifUrl, buttons, null, null, null, m)
  }

  
  if (m.text && (m.text.startsWith('menu_') || m.text === 'volver_menu')) {
    
    
    if (m.text === 'volver_menu') {
      return handler(m, { conn, usedPrefix, command: 'menu', args })
    }

    
    switch (m.text) {
      case 'menu_descargas':
        return handler(m, { conn, usedPrefix, command: 'menu_descargas', args })
      case 'menu_herramientas':
        return handler(m, { conn, usedPrefix, command: 'menu_herramientas', args })
      case 'menu_juegos':
        return handler(m, { conn, usedPrefix, command: 'menu_juegos', args })
      case 'menu_anime':
        return handler(m, { conn, usedPrefix, command: 'menu_anime', args })
      case 'menu_grupos':
        return handler(m, { conn, usedPrefix, command: 'menu_grupos', args })
      case 'menu_info':
        return handler(m, { conn, usedPrefix, command: 'menu_info', args })
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

export default handler

