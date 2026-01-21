import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat, `${global.emoji} ❌ *Este comando solo puede ser usado por el owner del bot.*`, m, global.miku)
  }

 
  const channelId = '120363315369913363@newsletter'
  const channelName = '💙HATSUNE MIKU CHANNEL💙'
  
  try {
    let quoted = m.quoted ? m.quoted : m
    let mime = (quoted.msg || quoted).mimetype || quoted.mediaType || ''
    let texto = args.join(' ')
    
    
    const isValidAudio = mime && (mime.includes('audio') || mime.includes('mpeg')) && quoted && quoted.download
    
    if (!quoted && !texto) {
      return conn.reply(m.chat, `${global.emoji} 💙 *Uso del comando*\n\n${usedPrefix}${command} [texto]\n${usedPrefix}${command} [texto] (responde a imagen/video)\n\n📝 *Ejemplos:*\n• ${usedPrefix}${command} ¡Hola a todos! 💙\n• ${usedPrefix}${command} Nueva actualización disponible (responde a imagen)\n• ${usedPrefix}${command} Video del día (responde a video)\n\n📺 *Canal destino:* ${channelName}`, m, global.miku)
    }
    
    await m.react('📤')
    conn.reply(m.chat, `${global.emoji} 📤 *Enviando mensaje al canal...*\n\n📺 *Canal:* ${channelName}\n🎯 *ID:* ${channelId}`, m, global.miku)
    
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
    } else if (quoted && isValidAudio) {
      try {
        let buffer = await quoted.download()
        
        
        if (!buffer || buffer.length === 0) {
          return conn.reply(m.chat, `${global.emoji} ❌ *No se pudo descargar el audio o el archivo está vacío. Por favor, intenta con otro archivo.*`, m, global.miku)
        }
        
        
        const tempDir = './tmp'
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }
        const tempFileName = `temp_audio_${Date.now()}.mp3`
        const tempFilePath = path.join(tempDir, tempFileName)
        fs.writeFileSync(tempFilePath, buffer)
        
        
        if (buffer && buffer.length > 0) {
          
          const audioHeader = buffer.slice(0, 12)
          const isValidFormat = audioHeader.toString('hex').startsWith('49443670') || 
                                 audioHeader.toString('hex').startsWith('6674719D') || 
                                 audioHeader.toString('hex').startsWith('41424630') || 
                                 audioHeader.toString('hex').startsWith('4D002D6F')
          
          if (!isValidFormat) {
            return conn.reply(m.chat, `${global.emoji} ❌ *Formato de audio no válido. Por favor, envía un archivo MP3, M4A o AAC válido.*`, m, global.miku)
          }
          
          
          const audioSize = buffer.length
          const maxAudioSize = 16 * 1024 * 1024 
          
          if (audioSize > maxAudioSize) {
            return conn.reply(m.chat, `${global.emoji} ❌ *El audio es muy grande (máximo 16MB). Por favor, envía un audio más corto.*`, m, global.miku)
          }
          
          
          if (mime.includes('audio/mpeg')) {
            messageContent = {
              audio: fs.readFileSync(tempFilePath),
              mimetype: 'audio/mp4',
              ptt: true,
              caption: texto || `💙 *${channelName} - Audio de Voz Oficial* 💙\n\n📅 *Fecha:* ${new Date().toLocaleString('es-MX')}\n🎵 *Publicado por:* @${m.sender.split('@')[0]}`
            }
          } else {
            messageContent = {
              audio: fs.readFileSync(tempFilePath),
              mimetype: 'audio/mpeg',
              caption: texto || `💙 *${channelName} - Audio Oficial* 💙\n\n📅 *Fecha:* ${new Date().toLocaleString('es-MX')}\n🎵 *Publicado por:* @${m.sender.split('@')[0]}`
            }
          }
        } else {
          return conn.reply(m.chat, `${global.emoji} ❌ *El archivo de audio no es válido o está corrupto. Por favor, envía un archivo de audio MP3 válido.*`, m, global.miku)
        }
      } catch (audioError) {
        console.error('Error procesando audio:', audioError)
        return conn.reply(m.chat, `${global.emoji} ❌ *Error al procesar el audio. Por favor, intenta con otro archivo.*`, m, global.miku)
      } finally {
        
        if (fs.existsSync(tempFilePath)) {
          try {
            fs.unlinkSync(tempFilePath)
            console.log(`Archivo temporal eliminado: ${tempFileName}`)
          } catch (cleanupError) {
            console.error('Error eliminando archivo temporal:', cleanupError)
          }
        }
      }
    } else {
      messageContent = {
        text: `💙 *${channelName} - Mensaje Oficial* 💙\n\n📝 *Mensaje:*\n${texto}\n\n📅 *Fecha:* ${new Date().toLocaleString('es-MX')}\n🎵 *Publicado por:* @${m.sender.split('@')[0]}\n\n━━━━━━━━━━━━━━━━━━\n🌱 *Sigue nuestro canal para más contenido!*\n\n📺 *Canal:* ${channelName}`
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
          } else if (messageContent.audio) {
            result = await conn.sendMessage(channelId, { 
              audio: messageContent.audio, 
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
        conn.reply(m.chat, `${global.emoji} ✅ *Mensaje enviado exitosamente al canal*\n\n📊 *Tipo:* ${mime.includes('image') ? 'Imagen' : mime.includes('video') ? 'Video' : 'Texto'}\n📝 *Contenido:* ${texto ? texto.substring(0, 30) + '...' : 'Sin texto'}\n📺 *Canal:* ${channelName}\n🎯 *ID:* ${channelId}\n🆔 *Message ID:* ${result.key?.id || 'N/A'}`, m, global.miku)
      } else {
        throw new Error('No se recibió respuesta del canal')
      }
      
    } catch (error) {
      console.error('Error enviando al canal:', error)
      await m.react('❌')
      conn.reply(m.chat, `${global.emoji} ❌ *Error al enviar mensaje al canal*\n\n📝 *Error:* ${error.message}\n💡 *Posibles soluciones:*\n• Verifica que el bot sea admin del canal\n• Verifica que el ID del canal sea correcto\n• Intenta reiniciar el bot\n\n📺 *Canal:* ${channelName}\n🎯 *ID:* ${channelId}`, m, global.miku)
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
