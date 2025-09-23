import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = ms => new Promise(res => setTimeout(res, ms))

const handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!isBotAdmin) throw '🤖 El bot necesita ser administrador para eliminar usuarios.'
  
  let now = Date.now()
  let threshold = 1000 * 60 * 60 * 24 * 7 
  let ghosts = []
  
  console.log(`🔍 Buscando usuarios fantasmas... Total participantes: ${participants.length}`)
  
  for (let user of participants) {
    
    if (user.admin && user.admin !== 'admin' && user.admin !== 'superadmin') continue
    
    
    if (areJidsSameUser(user.id, conn.user.jid)) continue
    
    let data = global.db.data.users[user.id] || {}
    let lastSeen = data.lastseen || data.lastSeen || data.lastchat || 0
    
    console.log(`👤 Usuario: ${user.id.split('@')[0]} - Última vez visto: ${lastSeen} - Diferencia: ${now - lastSeen} ms`)
    
    
    if (!lastSeen || (now - lastSeen > threshold)) {
      ghosts.push(user.id)
    }
  }
  
  console.log(`👻 Fantasmas encontrados: ${ghosts.length}`)
  
  if (!ghosts.length) {
    return conn.reply(m.chat, `✨ ¡Este grupo está lleno de vida! No hay usuarios fantasmas para eliminar. 👻💫`, m)
  }
  
  await m.reply(`👻 **DETECCIÓN DE USUARIOS FANTASMAS** 👻\n\n� **Lista de usuarios inactivos (más de 7 días):**\n${ghosts.map(v => '• @' + v.replace(/@.+/, '')).join('\n')}\n\n⏳ _Iniciando proceso de eliminación..._\n_Cada eliminación tiene una pausa de 3 segundos._`, null, { mentions: ghosts })
  
  let chat = global.db.data.chats[m.chat]
  let originalWelcome = chat.welcome
  chat.welcome = false 
  
  let eliminated = 0
  let errors = 0
  
  try {
    for (let user of ghosts) {
      let participant = participants.find(v => areJidsSameUser(v.id, user) || v.id === user)
      const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin')
      
      if (isAdmin) {
        await conn.reply(m.chat, `⚠️ No se puede eliminar a @${user.split('@')[0]} (es administrador)`, m, { mentions: [user] })
        continue
      }
      
      try {
        console.log(`🚫 Eliminando usuario: ${user.split('@')[0]}`)
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        eliminated++
        await conn.reply(m.chat, `✅ Usuario @${user.split('@')[0]} eliminado exitosamente`, m, { mentions: [user] })
        await delay(3000) 
      } catch (e) {
        errors++
        console.error(`❌ Error eliminando ${user}:`, e)
        await conn.reply(m.chat, `❌ No se pudo eliminar a @${user.split('@')[0]}\nRazón: ${e?.message || 'Error desconocido'}`, m, { mentions: [user] })
      }
    }
  } finally {
    chat.welcome = originalWelcome 
  }
  
  await conn.reply(m.chat, `🏁 **PROCESO COMPLETADO**\n\n✅ Usuarios eliminados: ${eliminated}\n❌ Errores: ${errors}\n👻 Total procesados: ${ghosts.length}`, m)
}

handler.tags = ['group']
handler.command = /^(kickfantasmas|eliminarfantasmas)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true


export default handler

