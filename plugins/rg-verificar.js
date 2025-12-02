import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'  
import fetch from 'node-fetch'

let Reg = /^(.+)[.|]\s*([0-9]+)$/i

async function checkChannelFollow(userId, conn) {
  try {
    const channelJid = '120363144038841957@newsletter'

    const chat = await Promise.race([
      conn.newsletterMetadata(channelJid),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]).catch(() => null)

    if (!chat || !chat.subscribers) return false

    const subscribers = Array.isArray(chat.subscribers) ? chat.subscribers : []
    return subscribers.some(sub => sub && (sub.id === userId || sub.jid === userId))
  } catch (error) {
    console.error('Error verificando canal:', error.message)
    return false
  }
}

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let user = global.db.data.users[m.sender]
  let name2 = (await conn.getName(m.sender)) || 'MikuFan'
  let channel = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
  let mikuImg = 'https://i.postimg.cc/QCzMhBR1/1757986334220.png'

  if (user.registered === true && user.channelVerified === true) {
    return m.reply(
      `🌟 *¡Ya estás registrado en el mundo de Hatsune Miku!* 🌟\n\n💙 Si quieres eliminar tu registro, usa:\n*${usedPrefix}unreg*`
    )
  }

  if (!user.channelVerified) {
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

    const channelRequiredMsg = `🚫 *CANAL OBLIGATORIO* 🚫\n\n💙 *Antes de registrarte, debes seguir nuestro canal oficial:*\n\n📢 *CANAL REQUERIDO:*\n${channel}\n\n🎯 *Paso a paso:*\n1️⃣ *Presiona "Seguir Canal Oficial"*\n2️⃣ *Ve a WhatsApp y presiona "Seguir"*\n3️⃣ *Presiona "Verificar Estado"*\n4️⃣ *Si está OK, podrás registrarte*\n\n⚠️ *No podrás registrarte hasta verificar que sigues el canal*\n\n🛡️ *Esta verificación es permanente*`

    await m.react('❌')
    return await conn.sendMessage(m.chat, {
      text: channelRequiredMsg,
      buttons: buttons,
      footer: '🌸 Verificación de Canal Obligatoria - Hatsune Miku Bot'
    }, { quoted: m })
  }

  if (!Reg.test(text)) return m.reply(
    `🌸 *Registro Miku* 🌸\n\n*Formato correcto:*\n${usedPrefix + command} nombre.edad\n\n*Ejemplo:*\n${usedPrefix + command} ${name2}.18\n\n✅ *Ya verificamos que sigues el canal oficial*\n\n¡Completa tu registro para recibir tu tarjeta Miku!`
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

  let regbot = `\n🌟 *¡REGISTRO MIKU COMPLETADO!* 🌟\n\n👤 *Nombre:* ${name}\n🎂 *Edad:* ${age} años\n🆔 *ID:* ${sn}\n\n✅ *Canal oficial:* Verificado\n\n💙 *¡Bienvenido/a al universo de Hatsune Miku!* 💙\n\n🎁 *Recompensas iniciales:*\n💰 +39 monedas\n✨ +300 XP\n🎟️ +20 tickets\n\n🛡️ *Tu acceso está protegido mientras sigas el canal oficial*`

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

let processedMessages = new Set()

handler.before = async function (m, { conn }) {
  if (!m.message) return false

  const messageKey = m.key?.id
  if (messageKey && processedMessages.has(messageKey)) {
    return false
  }

  let buttonId = null

  if (m.message.templateButtonReplyMessage) {
    buttonId = m.message.templateButtonReplyMessage.selectedId
  }
  if (m.message.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId
  }

  if (!buttonId || !buttonId.startsWith('follow_channel') && !buttonId.startsWith('check_')) {
    return false
  }

  if (messageKey) {
    processedMessages.add(messageKey)

    setTimeout(() => {
      processedMessages.delete(messageKey)
    }, 30000)
  }

  if (buttonId === 'follow_channel_required' || buttonId === 'follow_channel_again') {
    const channel = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
    const followMsg = `📢 *SIGUE NUESTRO CANAL OFICIAL* 📢\n\n💙 *Para ${buttonId === 'follow_channel_again' ? 'recuperar tu acceso' : 'registrarte'}:*\n\n1️⃣ *Haz clic en el enlace:*\n${channel}\n\n2️⃣ *Presiona "Seguir" en WhatsApp*\n\n3️⃣ *Vuelve aquí y presiona "Ya Seguí el Canal"*\n\n🎯 *${buttonId === 'follow_channel_again' ? 'Tu acceso será restaurado' : 'Podrás completar tu registro'}*`

    return await m.reply(followMsg)
  }

  if (buttonId === 'confirm_channel_followed') {
    const userId = m.sender
    const user = global.db.data.users[userId] || {}

    await m.react('⏳')

    user.channelVerified = true
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    global.db.data.users[userId].channelVerified = true

    const name2 = (await conn.getName(userId)) || 'MikuFan'
    const successMsg = `🎉 *¡CANAL CONFIRMADO!* 🎉\n\n✅ *Gracias por seguir nuestro canal oficial*\n\n💙 *Ahora puedes completar tu registro usando:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${name2}.18\`\n\n🎁 *¡Recibirás recompensas al registrarte!*`

    await m.react('✅')
    return await m.reply(successMsg)
  }

  if (buttonId === 'check_follow_again') {
    const userId = m.sender
    const user = global.db.data.users[userId] || {}

    await m.react('⏳')

    user.channelVerified = true
    if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
    global.db.data.users[userId].channelVerified = true

    const name2 = (await conn.getName(userId)) || 'MikuFan'
    const successMsg = `🎉 *¡ACCESO RESTAURADO!* 🎉\n\n✅ *Gracias por seguir nuevamente nuestro canal*\n\n💙 *Tu acceso ha sido restaurado*\n\n🎯 *Puedes registrarte nuevamente usando:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${name2}.18\``

    await m.react('✅')
    return await m.reply(successMsg)
  }


  return false
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler


