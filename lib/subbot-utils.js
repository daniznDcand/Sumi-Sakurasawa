import chalk from 'chalk'

export function pushInternalNotification(sock, recipient, text) {
  try {
    if (!sock) return
    sock._internalNotifications = sock._internalNotifications || []
    sock._internalNotifications.push({ ts: Date.now(), recipient, text })
    if (sock._internalNotifications.length > 50) sock._internalNotifications.shift()
    console.log(chalk.cyan(`🔔 Notificación interna para +${recipient}: ${text.replace(/\n/g,' ')}`))
  } catch (e) { console.error('Error almacenando notificación interna:', e.message) }
}

export function getInternalNotifications(sock) {
  return (sock && sock._internalNotifications) ? sock._internalNotifications.slice().reverse() : []
}

export function clearSubBotIntervals(s) {
  try {
    if (!s) return
    const intervals = [
      '_keepAliveInterval',
      '_saveCredsInterval',
      '_inactivityMonitor',
      'heartbeatInterval',
      '_presenceInterval',
      'pingInterval',
      '_activityInterval'
    ]
    for (const k of intervals) {
      if (s[k]) {
        clearInterval(s[k])
        s[k] = null
      }
    }
    if (Array.isArray(s._extraIntervals)) {
      for (const id of s._extraIntervals) {
        try { clearInterval(id) } catch {}
      }
      s._extraIntervals = []
    }
  } catch (e) { console.error('Error clearing intervals:', e.message) }
}

import fs from 'fs'
import path from 'path'

export function ensureSessionAssets(sessionId) {
  try {
    const base = path.join(process.cwd(), `${global.jadi}`, sessionId, 'assets')
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true })
    return base
  } catch (e) {
    console.error('Error creando assets de sesión:', e.message)
    return null
  }
}

export function getSessionConfig(sessionId) {
  try {
    const base = ensureSessionAssets(sessionId)
    const cfgPath = path.join(base, 'config.json')
    if (!fs.existsSync(cfgPath)) return {}
    try { return JSON.parse(fs.readFileSync(cfgPath, 'utf8')) } catch (e) { return {} }
  } catch (e) { return {} }
}

export function saveSessionConfig(sessionId, cfg) {
  try {
    const base = ensureSessionAssets(sessionId)
    const cfgPath = path.join(base, 'config.json')
    fs.writeFileSync(cfgPath, JSON.stringify(cfg || {}, null, 2))
    return true
  } catch (e) {
    console.error('Error guardando config de sesión:', e.message)
    return false
  }
}
