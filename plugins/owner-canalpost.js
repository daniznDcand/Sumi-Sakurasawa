import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, `${global.emoji} ❌ *Este comando solo puede ser usado por el owner del bot.*`, m)
  }

 
  const channelId = '120363315369913363@newsletter'
  const channelName = '💙HATSUNE MIKU CHANNEL💙'
  
  try {
    let quoted = m.quoted ? m.quoted : m
    let mime = (quoted.msg || quoted).mimetype || quoted.mediaType || ''
    let texto = args.join(' ')
    
    if (!quoted && !texto) {
      return conn.reply(m.chat, `${global.emoji} 💙 *Uso del comando*\n\n${usedPrefix}${command} [texto]\n${usedPrefix}${command} [texto] (responde a imagen/video)\n\n📝 *Ejemplos:*\n• ${usedPrefix}${command} ¡Hola a todos! 💙\n• ${usedPrefix}${command} Nueva actualización disponible (responde a imagen)\n• ${usedPrefix}${command} Video del día (responde a video)\n\n📺 *Canal destino:* ${channelName}`, m)
    }
    
    await m.react('📤')
    conn.reply(m.chat, `${global.emoji} 📤 *Enviando mensaje al canal...*\n\n📺 *Canal:* ${channelName}\n🎯 *ID:* ${channelId}`, m)
    
    let messageContent = {}
    
    
    if (quoted && (mime.includes('image') || mime.includes('video'))) {
      let buffer = await quoted.download()
      
      if (mime.includes('image')) {
        messageContent = {
          image: buffer,
          caption: texto || `💙 *${channelName} - Publicación Oficial* 💙\n\n📅 *Fecha:* ${new Date().toLocaleString('es-MX')}\n🎵 *Publicado por:* @${m.sender.split('@')[0]}`
        }
      } else if (mime.includes('video')) {
        messageContent = {
          video: buffer,
          caption: texto || `💙 *${channelName} - Video Oficial* 💙\n\n📅 *Fecha:* ${new Date().toLocaleString('es-MX')}\n🎵 *Publicado por:* @${m.sender.split('@')[0]}`
        }
      }
    } 
    
    else {
      messageContent = {
        text: `💙 *${channelName} - Mensaje Oficial* 💙\n\n📝 *Mensaje:*\n${texto}\n\n📅 *Fecha:* ${new Date().toLocaleString('es-MX')}\n🎵 *Publicado por:* @${m.sender.split('@')[0]}\n\n━━━━━━━━━━━━━━━━━━━━\n🌱 *Sigue nuestro canal para más contenido!*\n\n📺 *Canal:* ${channelName}`
      }
    }
    
    
    try {
      
      let result = null
      
     
      try {
        result = await conn.sendMessage(channelId, messageContent)
      } catch (e1) {
        console.log('Método 1 falló, intentando método 2:', e1.message)
        
        
        try {
          if (messageContent.image) {
            result = await conn.sendMessage(channelId, { 
              image: messageContent.image, 
              caption: messageContent.caption 
            })
          } else if (messageContent.video) {
            result = await conn.sendMessage(channelId, { 
              video: messageContent.video, 
              caption: messageContent.caption 
            })
          } else {
            result = await conn.sendMessage(channelId, { 
              text: messageContent.text 
            })
          }
        } catch (e2) {
          console.log('Método 2 falló, intentando método 3:', e2.message)
          
          
          try {
            const msg = await conn.prepareMessageFromContent(channelId, messageContent, {})
            result = await conn.relayMessage(channelId, msg.message, { messageId: msg.key.id })
          } catch (e3) {
            throw new Error('Todos los métodos de envío fallaron: ' + e3.message)
          }
        }
      }
      
      if (result) {
        await m.react('✅')
        conn.reply(m.chat, `${global.emoji} ✅ *Mensaje enviado exitosamente al canal*\n\n📊 *Tipo:* ${mime.includes('image') ? 'Imagen' : mime.includes('video') ? 'Video' : 'Texto'}\n📝 *Contenido:* ${texto ? texto.substring(0, 30) + '...' : 'Sin texto'}\n📺 *Canal:* ${channelName}\n🎯 *ID:* ${channelId}\n🆔 *Message ID:* ${result.key?.id || 'N/A'}`, m)
      } else {
        throw new Error('No se recibió respuesta del canal')
      }
      
    } catch (error) {
      console.error('Error enviando al canal:', error)
      await m.react('❌')
      conn.reply(m.chat, `${global.emoji} ❌ *Error al enviar mensaje al canal*\n\n📝 *Error:* ${error.message}\n💡 *Posibles soluciones:*\n• Verifica que el bot sea admin del canal\n• Verifica que el ID del canal sea correcto\n• Intenta reiniciar el bot\n\n📺 *Canal:* ${channelName}\n🎯 *ID:* ${channelId}`, m)
    }
    
  } catch (error) {
    console.error('Error general:', error)
    await m.react('❌')
    conn.reply(m.chat, `${global.emoji} ❌ *Ocurrió un error inesperado*\n\n📝 *Error:* ${error.message}`, m)
  }
}

handler.help = ['canalpost', 'postcanal', 'canalmsg']
handler.tags = ['owner']
handler.command = ['canalpost', 'postcanal', 'canalmsg']
handler.owner = true

export default handler
