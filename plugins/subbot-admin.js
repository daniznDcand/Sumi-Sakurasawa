import { getInternalNotifications } from '../lib/subbot-utils.js'

let handler = async (m, { conn, args, text, usedPrefix }) => {
    const sender = m.sender
    const owners = [...global.owner.map(o => Array.isArray(o) ? o[0] : o)].map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
    const isOwner = owners.includes(sender) || m.fromMe
    if (!isOwner) return m.reply('🚫 Acceso denegado. Solo administradores pueden usar este comando.')

    const cmd = (args[0] || '').toLowerCase()
    if (!cmd || cmd === 'list' || cmd === 'show') {
        const items = (global.conns || []).filter(s => s && s.user)
        if (!items.length) return m.reply('⚠️ No hay SubBots conectados actualmente.')
        let out = '*📋 SubBots conectados:*\n'
        for (const s of items) {
            const jid = s.user?.jid || 'unknown'
            const num = jid.split('@')[0]
            const uptime = s.sessionStartTime ? Math.floor((Date.now() - s.sessionStartTime)/1000) : 0
            const ready = (s.ws && s.ws.socket && s.ws.socket.readyState === 1) ? 'online' : 'offline'
            out += `\n• ${num} — ${jid} — ${uptime}s — ${ready}`
        }
        return conn.sendMessage(m.chat, { text: out }, { quoted: m })
    }

    if (cmd === 'disconnect' || cmd === 'stop' || cmd === 'remove') {
        const target = args[1]
        if (!target) return m.reply('Uso: subbot disconnect <numero_o_jid>')
        const sub = global.conns.find(s => (s.user?.jid || '').includes(target) || (s.user?.jid || '') === target || (s.user?.jid||'').startsWith(target))
        if (!sub) return m.reply('⚠️ SubBot no encontrado.')
        try {
            sub._shouldDelete = true
            sub._isBeingDeleted = true
            try { sub.ev.removeAllListeners() } catch {}
            try { sub.ws && sub.ws.close() } catch {}
            const i = global.conns.indexOf(sub)
            if (i >= 0) { delete global.conns[i]; global.conns.splice(i,1) }
            return m.reply(`✅ SubBot +${(sub.user?.jid||'unknown').split('@')[0]} desconectado.`)
        } catch (e) {
            return m.reply('❌ Error desconectando SubBot: ' + e.message)
        }
    }

    if (cmd === 'notifications' || cmd === 'notes') {
        const target = args[1]
        if (!target) return m.reply('Uso: subbot notifications <numero_o_jid>')
        const sub = global.conns.find(s => (s.user?.jid || '').includes(target) || (s.user?.jid || '') === target || (s.user?.jid||'').startsWith(target))
        if (!sub) return m.reply('⚠️ SubBot no encontrado.')
        const notes = getInternalNotifications(sub) || []
        if (!notes.length) return m.reply('ℹ️ No hay notificaciones internas para ese SubBot.')
        const last = notes.slice(-20).map(n => `- ${new Date(n.ts).toLocaleString()}: ${n.text}` ).join('\n')
        return conn.sendMessage(m.chat, { text: `📌 Notificaciones (últimas ${Math.min(20, notes.length)}):\n${last}` }, { quoted: m })
    }

    return m.reply('Comando inválido. Usar:\n- subbots\n- subbot disconnect <numero>\n- subbot notifications <numero>')
}

handler.help = ['subbots','subbot']
handler.tags = ['admin']
handler.command = ['subbots','subbot']

export default handler
