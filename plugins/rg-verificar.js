import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'  
import fetch from 'node-fetch'

let Reg = /^(.+)[.|]\s*([0-9]+)$/i

async function checkChannelFollow(userId, conn) {
  try {
    const channelJid = '120363144038841957@newsletter'

    const chat = await conn.newsletterMetadata(channelJid).catch(() => null)
    if (!chat) return false

    const subscribers = chat.subscribers || []
    return subscribers.some(sub => sub.id === userId)
  } catch (error) {
    console.log('Error verificando canal:', error)
    return false
  }
}

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let user = global.db.data.users[m.sender]
  let name2 = (await conn.getName(m.sender)) || 'MikuFan'
  let channel = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
  let mikuImg = 'https://i.postimg.cc/QCzMhBR1/1757986334220.png'

  if (user.registered === true) return m.reply(
    `🌟 *¡Ya estás registrado en el mundo de Hatsune Miku!* 🌟\n\n💙 Si quieres eliminar tu registro, usa:\n*${usedPrefix}unreg*`
  )

  if (!user.channelVerified) {
    const buttons = [
      {
        buttonId: 'follow_channel',
        buttonText: { displayText: '📢 Seguir Canal' },
        type: 1
      },
      {
        buttonId: 'check_follow',
        buttonText: { displayText: '✅ Verificar Seguimiento' },
        type: 1
      }
    ]

    const followMessage = `🚫 *REGISTRO REQUERIDO* 🚫\n\n💙 *Para usar el bot, debes:*\n\n1️⃣ *Seguir nuestro canal oficial*\n2️⃣ *Verificar tu seguimiento*\n3️⃣ *Completar el registro*\n\n📢 *Canal oficial:*\n${channel}\n\n🎯 *Después de seguir el canal, presiona "Verificar Seguimiento"*`

    return await conn.sendMessage(m.chat, {
      text: followMessage,
      buttons: buttons,
      footer: '🌸 Sistema de Verificación - Hatsune Miku Bot'
    }, { quoted: m })
  }

  if (!Reg.test(text)) return m.reply(
    `🌸 *Registro Miku* 🌸\n\n*Formato correcto:*\n${usedPrefix + command} nombre.edad\n\n*Ejemplo:*\n${usedPrefix + command} ${name2}.18\n\n¡Haz tu registro para recibir tu tarjeta Miku!`
  )

  let [_, name, age] = text.match(Reg)
  if (!name) return m.reply('🌸 El nombre no puede estar vacío. Intenta de nuevo.')
  if (!age) return m.reply('🌸 La edad no puede estar vacía. Intenta de nuevo.')
  if (name.length >= 30) return m.reply('🌸 El nombre es muy largo. Usa menos de 30 caracteres.')
  age = parseInt(age)
  if (age > 100) return m.reply('🌸 ¡Esa edad es demasiado alta! Usa una edad real.')
  if (age < 10) return m.reply('🌸 ¡Eres muy peque para usar el bot!')

  user.name = name.trim() + ' ✨'
  user.age = age
  user.regTime = +new Date
  user.registered = true
  user.coin = (user.coin || 0) + 39
  user.exp = (user.exp || 0) + 300
  user.joincount = (user.joincount || 0) + 20

  let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  let regbot = `\n🌟 *¡REGISTRO MIKU EXITOSO!* 🌟\n\n👤 *Nombre:* ${name}\n🎂 *Edad:* ${age} años\n🆔 *ID:* ${sn}\n\n💙 *¡Bienvenido/a al universo de Hatsune Miku!* 💙\n\n🎁 *Recompensas iniciales:*\n💰 +39 monedas\n✨ +300 XP\n🎟️ +20 tickets\n\n📢 *¡No olvides seguir nuestro canal para más actualizaciones!*`

  await m.react('💙')

  let thumbBuffer = null
  try {
    const res = await fetch(mikuImg)
    thumbBuffer = Buffer.from(await res.arrayBuffer())
  } catch {}

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '🌸 Registro en Hatsune Miku Bot 🌸',
        body: '¡Tu tarjeta Miku está lista! 🎤',
        thumbnail: thumbBuffer,
        sourceUrl: channel,
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.before = async function (m, { conn }) {
  if (!m.message) return false

  let buttonId = null

  if (m.message.templateButtonReplyMessage) {
    buttonId = m.message.templateButtonReplyMessage.selectedId
  }
  if (m.message.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId
  }

  if (buttonId === 'follow_channel') {
    const channel = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
    const followMsg = `📢 *SIGUE NUESTRO CANAL OFICIAL* 📢\n\n💙 *Para continuar con el registro:*\n\n1️⃣ *Haz clic en el enlace:*\n${channel}\n\n2️⃣ *Presiona "Seguir" en el canal*\n\n3️⃣ *Vuelve aquí y presiona "Verificar Seguimiento"*\n\n🎯 *¡No podrás usar el bot hasta verificar!*`

    return await m.reply(followMsg)
  }

  if (buttonId === 'register_now') {
    const name2 = (await conn.getName(m.sender)) || 'MikuFan'
    const regMsg = `🌸 *REGISTRO MIKU* 🌸\n\n*Formato correcto:*\n.reg nombre.edad\n\n*Ejemplo:*\n.reg ${name2}.18\n\n¡Haz tu registro para recibir tu tarjeta Miku!`

    return await m.reply(regMsg)
  }

  if (buttonId === 'check_follow') {
    const userId = m.sender
    const user = global.db.data.users[userId] || {}

    if (user.channelVerified) {
      const successMsg = `🎉 *¡YA ESTÁS VERIFICADO!* 🎉\n\n✅ *Puedes proceder con el registro usando:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${conn.getName(userId) || 'MikuFan'}.18\``

      return await m.reply(successMsg)
    }

    user.channelVerified = true
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    global.db.data.users[userId].channelVerified = true

    const successMsg = `🎉 *¡VERIFICACIÓN COMPLETADA!* 🎉\n\n✅ *Se ha verificado que sigues el canal oficial*\n\n💙 *Ahora puedes completar tu registro usando:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${conn.getName(userId) || 'MikuFan'}.18\`\n\n🎁 *¡Recibirás recompensas al registrarte!*`

    return await m.reply(successMsg)
  }

  return false
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler


