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
Usa los botones de abajo o escribe el comando directamente.
📣 También puedes usar \`.menucompleto\` para ver todos los comandos

💙 ¡Disfruta de la experiencia Miku! ✨`
    
    const footer = '🌱 Powered by (ㅎㅊDEPOOLㅊㅎ)'
    const menuGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, menuGif, buttons, null, null, null, m)
  }

  if (command === 'menu_descargas' || m.text === 'menu_descargas') {
    const buttons = [
      ['⬅️ Volver al Menú', 'menu']
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

💙 *Escribe cualquier comando para usarlo*
⬅️ *O toca el botón para volver al menú principal*`
    
    const footer = '🎵 Módulo de Descargas - Hatsune Miku Bot'
    const descargasGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    return conn.sendNCarousel(m.chat, text, footer, descargasGif, buttons, null, null, null, m)
  }

  if (command === 'menu_herramientas' || m.text === 'menu_herramientas') {
    const buttons = [
      ['⬅️ Volver al Menú', 'menu']
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

💙 *Escribe cualquier comando para usarlo*
⬅️ *O toca el botón para volver al menú principal*`
    
    const herramientasGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    try {
      return await conn.sendMessage(m.chat, {
        video: { url: herramientasGif },
        caption: text,
        footer: '🔧 Módulo de Herramientas - Hatsune Miku Bot',
        gifPlayback: true,
        templateButtons: buttons.map((btn, index) => ({
          index: index + 1,
          quickReplyButton: {
            displayText: btn[0],
            id: btn[1]
          }
        }))
      }, { quoted: m })
    } catch (error) {
      console.log('Error enviando video-gif, enviando solo texto:', error)
      return await conn.sendMessage(m.chat, {
        text: text
      }, { quoted: m })
    }
  }

  if (command === 'menu_juegos' || m.text === 'menu_juegos') {
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

💙 *Escribe cualquier comando para usarlo*
⬅️ *Escribe* \`menu\` *para volver al menú principal*`
    
    const juegosGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    try {
      return await conn.sendMessage(m.chat, {
        video: { url: juegosGif },
        caption: text,
        gifPlayback: true
      }, { quoted: m })
    } catch (error) {
      console.log('Error enviando video-gif, enviando solo texto:', error)
      return await conn.sendMessage(m.chat, {
        text: text
      }, { quoted: m })
    }
  }

  if (command === 'menu_anime' || m.text === 'menu_anime') {
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

💙 *Escribe cualquier comando para usarlo*
⬅️ *Escribe* \`menu\` *para volver al menú principal*`

    const animeGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    try {
      return await conn.sendMessage(m.chat, {
        video: { url: animeGif },
        caption: text,
        gifPlayback: true
      }, { quoted: m })
    } catch (error) {
      console.log('Error enviando video-gif, enviando solo texto:', error)
      return await conn.sendMessage(m.chat, {
        text: text
      }, { quoted: m })
    }
  }

  if (command === 'menu_grupos' || m.text === 'menu_grupos') {
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

💙 *Escribe cualquier comando para usarlo*
⬅️ *Escribe* \`menu\` *para volver al menú principal*`

    const gruposGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    try {
      return await conn.sendMessage(m.chat, {
        video: { url: gruposGif },
        caption: text,
        gifPlayback: true
      }, { quoted: m })
    } catch (error) {
      console.log('Error enviando video-gif, enviando solo texto:', error)
      return await conn.sendMessage(m.chat, {
        text: text
      }, { quoted: m })
    }
  }

  if (command === 'menu_info' || m.text === 'menu_info') {
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

💙 *Escribe cualquier comando para usarlo*
⬅️ *Escribe* \`menu\` *para volver al menú principal*`

    const infoGif = 'https://media.tenor.com/aGsOxo7R4l0AAAPo/miku-channelcastation.mp4'

    try {
      return await conn.sendMessage(m.chat, {
        video: { url: infoGif },
        caption: text,
        gifPlayback: true
      }, { quoted: m })
    } catch (error) {
      console.log('Error enviando video-gif, enviando solo texto:', error)
      return await conn.sendMessage(m.chat, {
        text: text
      }, { quoted: m })
    }
  }

  // Manejo de navegación por botones
  // Some clients/interactive messages return the pressed id in different fields.
  const getPressedId = (msg) => {
    try {
      if (!msg) return null
      // common normalized text
      if (msg.text) return msg.text
      // template quick reply/button
      if (msg.selectedButtonId) return msg.selectedButtonId
      if (msg.selectedId) return msg.selectedId
      if (msg.selectedDisplayText) return msg.selectedDisplayText
      // nativeFlowResponse -> paramsJson
      const native = msg.nativeFlowResponseMessage || msg.interactiveResponseMessage || msg.nativeFlowResponse
      if (native && native.paramsJson) {
        try {
          const p = JSON.parse(native.paramsJson)
          if (p && p.id) return p.id
        } catch (e) {}
      }
      // older interactiveResponse
      if (msg.body && typeof msg.body === 'string' && msg.body.startsWith('menu_')) return msg.body
    } catch (e) {
      console.error('Error parsing pressed id:', e)
    }
    return null
  }

  const pressedId = getPressedId(m) || getPressedId(m.msg) || getPressedId(m.message) || null
  if (pressedId) {
    if (pressedId === 'menu') return await handler(m, { conn, usedPrefix, command: 'menu', args })
    if (pressedId.startsWith && pressedId.startsWith('menu_')) {
      return await handler(m, { conn, usedPrefix, command: pressedId, args })
    }
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