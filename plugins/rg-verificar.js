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

  if (user.registered === true) {
    await m.react('⏳')
    const isStillFollowing = await checkChannelFollow(m.sender, conn)

    if (!isStillFollowing) {
      user.channelVerified = false
      user.registered = false

      const buttons = [
        {
          buttonId: 'follow_channel_again',
          buttonText: { displayText: '📢 Seguir Canal Nuevamente' },
          type: 1
        },
        {
          buttonId: 'check_follow_again',
          buttonText: { displayText: '✅ Verificar y Registrarme' },
          type: 1
        }
      ]

      const unfollowMsg = `🚫 *ACCESO REVOCADO* 🚫\n\n⚠️ *Detectamos que dejaste de seguir nuestro canal oficial*\n\n💙 *Para continuar usando el bot:*\n\n1️⃣ *Sigue nuevamente el canal*\n2️⃣ *Verifica tu seguimiento*\n3️⃣ *Vuelve a registrarte*\n\n📢 *Canal oficial:*\n${channel}\n\n❌ *Tu registro anterior ha sido removido*`

      await m.react('❌')
      return await conn.sendMessage(m.chat, {
        text: unfollowMsg,
        buttons: buttons,
        footer: '🌸 Sistema de Verificación - Hatsune Miku Bot'
      }, { quoted: m })
    }

    return m.reply(
      `🌟 *¡Ya estás registrado en el mundo de Hatsune Miku!* 🌟\n\n💙 Si quieres eliminar tu registro, usa:\n*${usedPrefix}unreg*`
    )
  }

  await m.react('⏳')
  const isFollowingChannel = await checkChannelFollow(m.sender, conn)

  if (!isFollowingChannel) {
    const buttons = [
      {
        buttonId: 'follow_channel_required',
        buttonText: { displayText: '📢 Seguir Canal Oficial' },
        type: 1
      },
      {
        buttonId: 'check_channel_follow',
        buttonText: { displayText: '✅ Verificar y Registrarme' },
        type: 1
      }
    ]

    const channelRequiredMsg = `🚫 *CANAL OBLIGATORIO* 🚫\n\n💙 *Antes de registrarte, debes seguir nuestro canal oficial:*\n\n📢 *CANAL REQUERIDO:*\n${channel}\n\n🎯 *Instrucciones:*\n1️⃣ *Presiona "Seguir Canal Oficial"*\n2️⃣ *Ve a WhatsApp y presiona "Seguir"*\n3️⃣ *Vuelve aquí y presiona "Verificar y Registrarme"*\n\n⚠️ *No podrás registrarte hasta verificar que sigues el canal*\n\n🛡️ *Esta verificación es permanente - si dejas de seguir, pierdes el acceso*`

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

handler.before = async function (m, { conn }) {
  if (!m.message) return false

  let buttonId = null

  if (m.message.templateButtonReplyMessage) {
    buttonId = m.message.templateButtonReplyMessage.selectedId
  }
  if (m.message.buttonsResponseMessage) {
    buttonId = m.message.buttonsResponseMessage.selectedButtonId
  }

  if (buttonId === 'follow_channel_required' || buttonId === 'follow_channel_again') {
    const channel = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
    const followMsg = `📢 *SIGUE NUESTRO CANAL OFICIAL* 📢\n\n💙 *Para ${buttonId === 'follow_channel_again' ? 'recuperar tu acceso' : 'registrarte'}:*\n\n1️⃣ *Haz clic en el enlace:*\n${channel}\n\n2️⃣ *Presiona "Seguir" en WhatsApp*\n\n3️⃣ *Vuelve aquí y presiona "Verificar y Registrarme"*\n\n🎯 *${buttonId === 'follow_channel_again' ? 'Tu acceso será restaurado' : 'Podrás completar tu registro'}*`

    return await m.reply(followMsg)
  }

  if (buttonId === 'check_channel_follow' || buttonId === 'check_follow_again') {
    const userId = m.sender
    const user = global.db.data.users[userId] || {}

    if (user.channelVerified) {
      const successMsg = `🎉 *¡YA ESTÁS VERIFICADO!* 🎉\n\n✅ *Puedes proceder con el registro usando:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${conn.getName(userId) || 'MikuFan'}.18\``

      return await m.reply(successMsg)
    }

    await m.react('⏳')

    try {
      const isFollowing = await checkChannelFollow(userId, conn)

      if (isFollowing) {
        user.channelVerified = true
        if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
        global.db.data.users[userId].channelVerified = true

        const successMsg = `🎉 *¡VERIFICACIÓN EXITOSA!* 🎉\n\n✅ *Confirmado: ¡Sigues el canal oficial!*\n\n💙 *Ahora puedes completar tu registro usando:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${conn.getName(userId) || 'MikuFan'}.18\`\n\n🎁 *¡Recibirás recompensas al registrarte!*`

        await m.react('✅')
        return await m.reply(successMsg)
      } else {
        const retryMsg = `❌ *VERIFICACIÓN FALLIDA* ❌\n\n⚠️ *No se detectó que sigas el canal oficial*\n\n📢 *Asegúrate de:*\n1️⃣ *Ir al canal*\n2️⃣ *Presionar "Seguir"*\n3️⃣ *Esperar unos segundos*\n4️⃣ *Intentar verificar de nuevo*\n\n💡 *Si el problema persiste, intenta registrarte directamente:*\n\`.reg nombre.edad\``

        await m.react('❌')
        return await m.reply(retryMsg)
      }
    } catch (error) {
      console.log('Error en verificación:', error)

      user.channelVerified = true
      if (!global.db.data.users[userId]) global.db.data.users[userId] = {}
      global.db.data.users[userId].channelVerified = true

      const fallbackMsg = `⚠️ *VERIFICACIÓN MANUAL* ⚠️\n\n💙 *No se pudo verificar automáticamente, pero te hemos marcado como verificado*\n\n🎯 *Ahora puedes completar tu registro usando:*\n\`.reg nombre.edad\`\n\n*Ejemplo:*\n\`.reg ${conn.getName(userId) || 'MikuFan'}.18\`\n\n🎁 *¡Recibirás recompensas al registrarte!*`

      await m.react('✅')
      return await m.reply(fallbackMsg)
    }
  }

  return false
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler


