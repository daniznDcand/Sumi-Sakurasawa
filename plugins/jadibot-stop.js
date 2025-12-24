import fs from 'fs'
import path from 'path'
import { clearSubBotIntervals } from '../lib/subbot-utils.js'

let handler = async (m, { conn, args, isROwner }) => {
  try {
    const targetArg = (args[0] || '').replace(/[^0-9]/g, '')
    let sessionId
    if (targetArg) sessionId = targetArg
    else sessionId = m.sender.split('@')[0]

    // allow owner to stop any session by passing number
    if (!isROwner && sessionId !== m.sender.split('@')[0]) return m.reply('Solo los creadores pueden detener sesiones de otros.')

    const jid = sessionId + '@s.whatsapp.net'
    const sub = (global.conns || []).find(s => (s?.user?.jid === jid) || ((s?.user?.jid || '').includes(sessionId)))

    if (sub) {
      try {
        sub._isBeingDeleted = true
        clearSubBotIntervals(sub)
        try { sub.ws?.close() } catch (e) {}
        try { sub.ev?.removeAllListeners() } catch (e) {}
      } catch (e) {}
      // remove from list
      global.conns = (global.conns || []).filter(s => s !== sub)
    }

    // remove session folder
    const sessPath = path.join(process.cwd(), `${global.jadi}`, sessionId)
    if (fs.existsSync(sessPath)) {
      try {
        fs.rmSync(sessPath, { recursive: true, force: true })
      } catch (e) {
        console.error('Error eliminando session dir:', e)
      }
    }

    return m.reply('✅ Sesión finalizada y eliminada para: ' + sessionId)
  } catch (e) {
    console.error(e)
    return m.reply('Error deteniendo sesión: ' + e.message)
  }
}

handler.help = ['stopsub [numero]']
handler.tags = ['serbot']
handler.command = ['stopsub','delsub','stopsession']
handler.rowner = true

export default handler
