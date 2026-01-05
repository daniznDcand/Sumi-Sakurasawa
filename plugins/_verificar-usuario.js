let restrictionCooldowns = new Map()

export async function before(m, { conn, isBotAdmin, isAdmin, usedPrefix }) {
  if (m.isBaileys || m.fromMe || m.chat?.endsWith('@g.us')) return true

  const user = global.db.data.users[m.sender]

  const comandosPermitidos = [
    'reg', 'register', 'registrar', 'verify', 'verificar',
    'menu', 'help', 'ayuda', 'start', 'ping', 'p', 'info', 'infobot',
    'estado', 'status', 'uptime', 'speed', 'speedtest'
  ]

  const comando = m.text?.slice(1)?.split(' ')?.[0]?.toLowerCase() || ''
  const esComandoPermitido = comandosPermitidos.some(cmd => comando.includes(cmd))

  if (esComandoPermitido) return true

  
  if (!user || !user.registered) {
    const userId = m.sender
    const now = Date.now()
    const lastMessage = restrictionCooldowns.get(userId) || 0
    const cooldownTime = 10 * 60 * 1000 

    if (now - lastMessage < cooldownTime) {
      return false
    }

    restrictionCooldowns.set(userId, now)

    const friendlyMsg = `╭─「 🎵 *HATSUNE MIKU BOT* 🎵 」─╮
┃ 💫 *¡Hola! Para usar este comando necesitas registrarte* 💫
┃╰─────────────────────────────────────────╯

🌸 *📝 REGISTRO GRATIS* 🌸

🎯 *Usa este comando para registrarte:*
${usedPrefix}reg nombre.edad

📝 *Ejemplo práctico:*
${usedPrefix}reg ${m.name || 'MikuFan'}.18

🎁 *¿Qué obtienes al registrarte?*
💰 • Monedas para comprar en la tienda
⭐ • Experiencia y niveles
🎟️ • Tickets exclusivos
🎤 • Acceso a todos los comandos

🌱 *¡Únete a la familia Miku!*
📢 Canal oficial: https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o

╰─「 💙 *¡Te esperamos!* 💙 」─╯

💫 *Escribe ${usedPrefix}reg para comenzar tu aventura* 💫`

    await m.reply(friendlyMsg)
    return false
  }

  return true
}

export async function handler() {
  return false
}
