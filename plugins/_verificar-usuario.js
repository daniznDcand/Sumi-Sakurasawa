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

    const buttons = [
      {
        buttonId: 'follow_channel_required',
        buttonText: { displayText: '📢 Seguir Canal Oficial' },
        type: 1
      },
      {
        buttonId: 'check_channel_status',
        buttonText: { displayText: '🔍 Verificar Estado' },
        type: 1
      }
    ]

    const restrictMsg = `🚫 *BOT RESTRINGIDO* 🚫\n\n💙 *Para usar comandos necesitas:*\n\n1️⃣ *Seguir el canal oficial*\n2️⃣ *Verificar seguimiento*\n3️⃣ *Usar .reg para registrarte*\n\n📢 *Canal:*\n${channel}\n\n🎯 *Comienza aquí:*`

    await conn.sendMessage(m.chat, {
      text: restrictMsg,
      buttons: buttons,
      footer: '🌸 Verificación Obligatoria - Hatsune Miku'
    }, { quoted: m })

    return false
  }

  return true
}

export async function handler() {
  return false
}
