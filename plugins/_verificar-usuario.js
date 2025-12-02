let restrictionCooldowns = new Map()

export async function before(m, { conn, isBotAdmin, isAdmin, usedPrefix }) {
  if (m.isBaileys || m.fromMe || m.chat?.endsWith('@g.us')) return true

  const user = global.db.data.users[m.sender] || {}

  const comandosPermitidos = [
    'reg', 'register', 'registrar', 'verify', 'verificar',
    'menu', 'help', 'ayuda', 'start', 'ping', 'p', 'info', 'infobot',
    'estado', 'status', 'uptime', 'speed', 'speedtest'
  ]

  const comando = m.text?.slice(1)?.split(' ')?.[0]?.toLowerCase() || ''
  const esComandoPermitido = comandosPermitidos.some(cmd => comando.includes(cmd))

  if (esComandoPermitido) return true

  if (!user.registered || !user.channelVerified) {
    const userId = m.sender
    const now = Date.now()
    const lastMessage = restrictionCooldowns.get(userId) || 0
    const cooldownTime = 5 * 60 * 1000

    if (now - lastMessage < cooldownTime) {
      return false
    }

    restrictionCooldowns.set(userId, now)

    const channel = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'

    const restrictMsg = `🚫 *ACCESO RESTRINGIDO* 🚫\n\n💙 *Para usar el bot, necesitas estar registrado*\n\n📝 *Comando de registro:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${conn.getName(userId) || 'MikuFan'}.18\`\n\n📢 *El registro incluye verificación del canal oficial*`

    await m.reply(restrictMsg)

    return false
  }

  return true
}

export async function handler() {
  return false
}
