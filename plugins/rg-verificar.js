import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'  
import fetch from 'node-fetch'

let Reg = /^(.+)[.|]\s*([0-9]+)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  let user = global.db.data.users[m.sender]
  let name2 = (await conn.getName(m.sender)) || 'MikuFan'
  let channel = 'https://whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o'
  let mikuImg = 'https://i.postimg.cc/QCzMhBR1/1757986334220.png'

  if (user.registered === true) {
    return m.reply(
      `🌟 *¡YA ESTÁS REGISTRADO EN MIKU BOT!* 🌟\n\n` +
      `💙 *Nombre:* ${user.name || 'Sin nombre'}\n` +
      `🎂 *Edad:* ${user.age || 'No especificada'} años\n` +
      `📅 *Registrado el:* ${new Date(user.regTime).toLocaleDateString()}\n\n` +
      `🧧 *Consejo:* Si quieres eliminar tu registro, usa:\n*${usedPrefix}unreg*\n\n` +
      `📢 *Únete a nuestro canal:*\n${channel}`
    )
  }

  if (!Reg.test(text)) {
    return m.reply(
      `🌸 *📝 REGISTRO MIKU BOT* 🌸\n\n` +
      `*Formato requerido:*\n` +
      `*${usedPrefix + command} nombre.edad*\n\n` +
      `*Ejemplo práctico:*\n` +
      `*${usedPrefix + command} ${name2}.18*\n\n` +
      `💡 *Consejo:* Completa tu registro para desbloquear todos los comandos y recibir tu tarjeta Miku personalizada.\n\n` +
      `📢 *Únete a nuestro canal:*\n${channel}`
    )
  }

  let [_, name, age] = text.match(Reg)
  if (!name) return m.reply('❌ *Error*: El nombre no puede estar vacío. Por favor, inténtalo de nuevo.')
  if (!age) return m.reply('❌ *Error*: La edad no puede estar vacía. Por favor, inténtalo de nuevo.')
  if (name.length >= 30) return m.reply('❌ *Error*: El nombre es demasiado largo. Por favor, usa menos de 30 caracteres.')
  age = parseInt(age)
  if (age > 100) return m.reply('❌ *Error*: La edad debe ser un número real. Por favor, ingresa una edad válida.')
  if (age < 10) return m.reply('❌ *Error*: Debes tener al menos 10 años para usar este bot.')

  user.name = name.trim() + ' ✨'
  user.age = age
  user.regTime = +new Date
  user.registered = true
  user.coin = (user.coin || 0) + 39
  user.exp = (user.exp || 0) + 300
  user.joincount = (user.joincount || 0) + 20

  let sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  let regbot = `💙 *¡REGISTRO EXITOSO!* 🎵\n\n` +
  `🎤 *¡BIENVENID@ A HATSUNE MIKU BOT!* 💙\n\n` +
  `👤 *Nombre:* ${name}\n` +
  `🎂 *Edad:* ${age} años\n` +
  `🆔 *ID:* ${sn}\n\n` +
  `✨ *¡Disfruta de tu estadía en el mundo de Hatsune Miku!* ✨\n\n` +
  `🎁 *Recompensas por registro:*\n` +
  `🌱 +39 Cebollines\n` +
  `⭐ +300 XP\n` +
  `🎟️ +20 tickets\n\n` +
  `💙 *¡Ahora puedes usar todos los comandos del bot!*`

  await m.react('💙')
  
  let mikuRegisterImage = 'https://i.pinimg.com/736x/76/ec/16/76ec1693791a33594059d478ae9206f7.jpg' 
  
  await conn.sendFile(m.chat, mikuRegisterImage, 'miku_register.jpg', regbot, m, false, {
    mentions: [m.sender]
  })
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler


