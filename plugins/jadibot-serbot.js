import { spawn } from 'child_process'
import fs from 'fs'
import { join } from 'path'
import { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, jidNormalizedUser } from '@whiskeysockets/baileys'
import P from 'pino'

/**
 * Hatsune Miku Sub-Bot Connector
 * Creates and manages Sub-Bot connections with QR and pairing code support
 */
export async function mikuJadiBot({ pathMikuJadiBot, m, conn, args, usedPrefix, command }) {
  if (!pathMikuJadiBot) pathMikuJadiBot = global.sessions
  
  let mikuJBOptions = {
    silent: false,
    child: spawn(process.argv[0], [
      '--eval',
      `
import('./index.js').then(() => {
  console.log('🌱💙 Sub-Bot iniciado exitosamente')
}).catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
      `.trim()
    ], {
      cwd: process.cwd(),
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
  }
  
  mikuJBOptions.child.on('message', (data) => {
    if (data.type === 'close') {
      console.log('🌱💙 Sub-Bot desconectado')
    }
  })
  
  const rtx = `*⪛✰ ↫ Hatsune – Miku – Bot 🌱💙 ↬ ✰⪜*

*Con otro telefono que tengas o en la PC escanea este QR para convertirte en un Sub-Bot*

*1. Haz click en los tres puntos en la esquina superior derecha*
*2. Toca WhatsApp Web*
*3. Escanea este codigo QR*
*Este codigo QR expira en 60 segundos*

⚠️ *No me hago responsable del mal uso que se le pueda dar o si el numero se manda a soporte*
⚠️ *Tampoco me hago responsable si tienes la cuenta ya baneada o suspendida*`

  const rtx2 = `*⪛✰ ↫ Hatsune – Miku – Bot 🌱💙 ↬ ✰⪜*

*Usa este codigo de 8 digitos para conectarte como Sub-Bot*

*1. Ve a ajustes de WhatsApp*
*2. Toca dispositivos conectados*
*3. Conectar dispositivo*
*4. Conectar con numero de telefono*
*5. Introduce el codigo de abajo*

*Este codigo expira en 60 segundos*

⚠️ *No me hago responsable del mal uso que se le pueda dar o si el numero se manda a soporte*
⚠️ *Tampoco me hago responsable si tienes la cuenta ya baneada o suspendida*`

  if (!m || !conn) {
    // Auto-restore mode for stored Sub-Bots
    console.log('🌱💙 Restaurando Sub-Bot desde:', pathMikuJadiBot)
    return
  }

  if (command === 'qr') {
    await conn.reply(m.chat, rtx, m)
  } else if (command === 'code') {
    await conn.reply(m.chat, rtx2, m)
  } else {
    // Default serbot command
    await conn.reply(m.chat, '🌱💙 Selecciona el método de conexión:\n\n• Para QR: usa .qr\n• Para código: usa .code', m)
  }
}

// Backwards compatibility alias
export { mikuJadiBot as yukiJadiBot }

let handler = async (m, { conn, args, usedPrefix, command }) => {
  await mikuJadiBot({
    pathMikuJadiBot: join(process.cwd(), global.jadi, m.sender.split('@')[0]),
    m,
    conn,
    args,
    usedPrefix,
    command
  })
}

handler.help = ['qr', 'code', 'serbot']
handler.tags = ['serbot']
handler.command = ['qr', 'code', 'serbot']

export default handler