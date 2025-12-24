import fs from 'fs'
import path from 'path'
import { ensureSessionAssets } from '../lib/subbot-utils.js'

let handler = async (m, { conn, args, isROwner }) => {
  try {
    const isSub = conn.isSubBot === true
    
    let sessionId = null
    if (!isSub && args && args[0] && /\d{6,}/.test(args[0])) sessionId = args[0].replace(/[^0-9]/g, '')
    if (!sessionId) sessionId = isSub ? (conn.user?.jid || '').split('@')[0] : (m.quoted && m.quoted.sender ? m.quoted.sender.split('@')[0] : m.sender.split('@')[0])
    if (!sessionId) return m.reply('⚠️ No pude determinar la sesión destino.')
    const base = ensureSessionAssets(sessionId)
    if (!base) return m.reply('❌ Error interno creando carpeta de assets.')

    
    if (!isROwner && sessionId !== m.sender.split('@')[0]) return m.reply('Solo el dueño de la sesión o el creador del bot puede modificar esta sesión.')

    let media = null
    if (m.quoted && m.quoted.mimetype && /image\//.test(m.quoted.mimetype)) {
      media = await m.quoted.download?.().catch(() => null)
    } else if (m.mimetype && /image\//.test(m.mimetype)) {
      media = await m.download?.().catch(() => null)
    } else {
      return m.reply('Responde a una imagen con este comando o envía una imagen junto al comando.')
    }
    if (!media) return m.reply('No pude descargar la imagen.')
    const p = path.join(base, 'menu.jpg')
    fs.writeFileSync(p, media)
    return m.reply('✅ Imagen de menú guardada correctamente para la sesión: ' + sessionId)
  } catch (e) {
    console.error(e)
    return m.reply('Error guardando imagen: ' + e.message)
  }
}

handler.help = ['setmenu']
handler.tags = ['serbot']
handler.command = ['setmenu']

export default handler
