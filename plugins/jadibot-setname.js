import { getSessionConfig, saveSessionConfig, ensureSessionAssets } from '../lib/subbot-utils.js'

let handler = async (m, { conn, args, isROwner }) => {
  try {
    const cmd = (args[0] || '').toLowerCase()
    const value = args.slice(1).join(' ').trim() || (m.quoted && m.quoted.text) || m.text?.replace(/^\S+\s*/, '') || ''
    if (!cmd || !['setbotname','setname','setmenutitle','setmenutext'].includes(cmd)) {
      return m.reply('Uso:\n• setbotname <nombre> — establece nombre mostrado del SubBot\n• setmenutitle <texto> — establece título del menú del SubBot')
    }

    const runningAsSub = conn.isSubBot === true
    let sessionId = runningAsSub ? (conn.user?.jid || '').split('@')[0] : (args[1] && /\d{6,}/.test(args[1]) ? args[1].replace(/[^0-9]/g,'') : m.sender.split('@')[0])
    if (!sessionId) return m.reply('No pude determinar la sesión destino.')
    if (!isROwner && sessionId !== m.sender.split('@')[0]) return m.reply('Solo el dueño de la sesión o el creador del bot puede modificar esta sesión.')

    const base = ensureSessionAssets(sessionId)
    if (!base) return m.reply('❌ Error interno al crear carpeta de assets.')

    const cfg = getSessionConfig(sessionId) || {}

    if (cmd === 'setbotname' || cmd === 'setname') {
      if (!value) return m.reply('Envía: setbotname <nombre del SubBot>')
      cfg.botName = value
      saveSessionConfig(sessionId, cfg)
      return m.reply('✅ Nombre guardado para sesión ' + sessionId + '\nNo se modificó el bot principal.')
    }

    if (cmd === 'setmenutitle' || cmd === 'setmenutext') {
      if (!value) return m.reply('Envía: setmenutitle <texto del menú>')
      cfg.menuTitle = value
      saveSessionConfig(sessionId, cfg)
      return m.reply('✅ Título de menú guardado para sesión ' + sessionId + '\nNo se modificó el bot principal.')
    }

    return m.reply('Comando no reconocido.')
  } catch (e) {
    console.error(e)
    return m.reply('Error interno: ' + e.message)
  }
}

handler.help = ['setbotname','setmenutitle']
handler.tags = ['serbot']
handler.command = ['setbotname','setname','setmenutitle','setmenutext']

export default handler
