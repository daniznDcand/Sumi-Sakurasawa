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

  
 
  if (!user || user.registered !== true) {
    const userId = m.sender
    const now = Date.now()
    const lastMessage = restrictionCooldowns.get(userId) || 0
    const cooldownTime = 10 * 60 * 1000 

    if (now - lastMessage < cooldownTime) {
      return false
    }

    restrictionCooldowns.set(userId, now)

    const friendlyMsg = `*REGISTRO*\n\n` +
      `🍭 *¡Hola!* Usa este comando para registrarte:\n` +
      `*.reg nombre.edad*\n` +
      `Ejemplo: *.reg ${m.name || 'Daniel'}.18*\n\n`

    await m.reply(friendlyMsg, null, global.miku)
    return false
  }

  return true
}

export async function handler() {
  return false
}
