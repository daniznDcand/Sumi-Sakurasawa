import { areJidsSameUser } from '@whiskeysockets/baileys'

const delay = ms => new Promise(res => setTimeout(res, ms))

const handler = async (m, { conn, participants, isBotAdmin }) => {
  if (!isBotAdmin) throw '🤖 El bot necesita ser administrador para eliminar usuarios.'
  
  
  try {
    let groupMetadata = await conn.groupMetadata(m.chat)
    let botParticipant = groupMetadata.participants.find(p => areJidsSameUser(p.id, conn.user.jid))
    
    if (!botParticipant || (botParticipant.admin !== 'admin' && botParticipant.admin !== 'superadmin')) {
      throw 'El bot no tiene permisos de administrador en este grupo.'
    }
    
    console.log(`🤖 Bot tiene permisos de: ${botParticipant.admin}`)
  } catch (error) {
    console.error('Error verificando permisos del bot:', error)
    throw 'No se pudieron verificar los permisos del bot.'
  }
  
  let now = Date.now()
  let threshold = 1000 * 60 * 60 * 24 * 7 
  let ghosts = []
  
  console.log(`🔍 Buscando usuarios fantasmas... Total participantes: ${participants.length}`)
  
  for (let user of participants) {
    
    if (user.admin === 'admin' || user.admin === 'superadmin') continue
    
   
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
  
  
  let validGhosts = []
  for (let ghost of ghosts) {
    let stillExists = participants.find(p => areJidsSameUser(p.id, ghost))
    if (stillExists) {
      validGhosts.push(ghost)
    } else {
      console.log(`⚠️ Usuario ${ghost.split('@')[0]} ya no está en el grupo`)
    }
  }
  
  if (!validGhosts.length) {
    return conn.reply(m.chat, `🤔 Los usuarios fantasmas detectados ya no están en el grupo.`, m)
  }
  
  console.log(`✅ Usuarios válidos para eliminar: ${validGhosts.length}`)
  
  await m.reply(`👻 *DETECCIÓN DE USUARIOS FANTASMAS* 👻\n\n📋 **Lista de usuarios inactivos (más de 7 días):**\n${validGhosts.map(v => '• @' + v.replace(/@.+/, '')).join('\n')}\n\n⏳ _Iniciando proceso de eliminación..._\n_Cada eliminación tiene una pausa de 3 segundos._`, null, { mentions: validGhosts })
  
  let chat = global.db.data.chats[m.chat]
  let originalWelcome = chat.welcome
  chat.welcome = false 
  
  let eliminated = 0
  let errors = 0
  
  try {
    for (let user of validGhosts) {
      console.log(`🔍 Procesando usuario: ${user}`)
      
      let participant = participants.find(v => areJidsSameUser(v.id, user) || v.id === user)
      console.log(`👤 Participante encontrado:`, participant ? 'Sí' : 'No')
      
      const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin')
      console.log(`🛡️ Es admin:`, isAdmin)
      
      if (isAdmin) {
        await conn.reply(m.chat, `⚠️ No se puede eliminar a @${user.split('@')[0]} (es administrador)`, m, { mentions: [user] })
        continue
      }
      
      
      try {
        let currentParticipants = await conn.groupMetadata(m.chat)
        let stillInGroup = currentParticipants.participants.find(p => areJidsSameUser(p.id, user))
        
        if (!stillInGroup) {
          console.log(`ℹ️ Usuario ${user.split('@')[0]} ya no está en el grupo`)
          continue
        }
      } catch (metaError) {
        console.log(`⚠️ No se pudo verificar si ${user.split('@')[0]} está en el grupo`)
      }
      
      try {
        console.log(`🚫 Intentando eliminar usuario: ${user.split('@')[0]}`)
        
        
        const result = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        console.log(`📤 Resultado de eliminación:`, result)
        
        eliminated++
        await conn.reply(m.chat, `✅ Usuario @${user.split('@')[0]} eliminado exitosamente`, m, { mentions: [user] })
        await delay(3000) 
        
      } catch (e) {
        errors++
        console.error(`❌ Error eliminando ${user}:`, e)
        
        
        if (conn.groupRemove) {
          try {
            console.log(`🔄 Intentando método alternativo para ${user.split('@')[0]}`)
            await conn.groupRemove(m.chat, [user])
            eliminated++
            await conn.reply(m.chat, `✅ Usuario @${user.split('@')[0]} eliminado (método alternativo)`, m, { mentions: [user] })
          } catch (e2) {
            console.error(`❌ Método alternativo también falló:`, e2)
            await conn.reply(m.chat, `❌ No se pudo eliminar a @${user.split('@')[0]}\nRazón: ${e?.message || 'Error desconocido'}`, m, { mentions: [user] })
          }
        } else {
          await conn.reply(m.chat, `❌ No se pudo eliminar a @${user.split('@')[0]}\nRazón: ${e?.message || 'Error desconocido'}`, m, { mentions: [user] })
        }
      }
    }
  } finally {
    chat.welcome = originalWelcome 
  }
  
  await conn.reply(m.chat, `🏁 **PROCESO COMPLETADO**\n\n✅ Usuarios eliminados: ${eliminated}\n❌ Errores: ${errors}\n👻 Total procesados: ${validGhosts.length}`, m)
}

handler.tags = ['group']
handler.command = /^(kickfantasmas|eliminarfantasmas)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true

export default handler
