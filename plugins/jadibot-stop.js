import fs from 'fs'
import path from 'path'
import { clearSubBotIntervals, pushInternalNotification } from '../lib/subbot-utils.js'

let handler = async (m, { conn, args, isROwner }) => {
  try {
    const targetArg = (args[0] || '').replace(/[^0-9]/g, '')
    let sessionId
    if (targetArg) sessionId = targetArg
    else sessionId = m.sender.split('@')[0]

    
    if (!isROwner && sessionId !== m.sender.split('@')[0]) return m.reply('Solo los creadores pueden detener sesiones de otros.')

    const jid = sessionId + '@s.whatsapp.net'
    const sub = (global.conns || []).find(s => (s?.user?.jid === jid) || ((s?.user?.jid || '').includes(sessionId)))

    if (sub) {
      try {
        console.log('Stopping subbot session', sessionId)
        sub._isBeingDeleted = true
        sub._shouldReconnect = false
        clearSubBotIntervals(sub)
        
        try { if (sub.ws?.socket?.readyState === 1) sub.ws.socket.close(1000, 'closed by owner') } catch (e) {}
        try { sub.ws?.close?.() } catch (e) {}
        try { if (typeof sub.ws?.terminate === 'function') sub.ws.terminate() } catch (e) {}
        try { sub.ev?.removeAllListeners() } catch (e) {}
        
        global.conns = (global.conns || []).filter(s => s !== sub)
        
        try { pushInternalNotification(global.conn, m.sender, `Subbot ${sessionId} detenido por ${m.sender}`) } catch (e) {}
        try { pushInternalNotification(sub, m.sender, `Tu subbot fue detenido por el owner ${m.sender}`) } catch (e) {}
        console.log('Subbot stopped and removed from global.conns', sessionId)
      } catch (e) {
        console.error('Error while stopping subbot:', e)
      }
    }

    
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
