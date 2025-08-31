import { stopSubBot } from './jadibot-serbot.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let id = `${who.split`@`[0]}`
    
    if (!global.conns || !global.conns.has(id)) {
        return m.reply('🎵 No tienes ningún Sub-Bot activo para desconectar.')
    }
    
    const subBot = global.conns.get(id)
    if (!subBot || !subBot.ws || !subBot.ws.socket || subBot.ws.socket.readyState !== 1) {
        
        global.conns.delete(id)
        global.connStatus.delete(id)
        global.reconnectAttempts.delete(id)
        return m.reply('🎵 Tu Sub-Bot ya estaba desconectado. Se limpió la sesión.')
    }
    
    try {
        await stopSubBot(id)
        m.reply('🎤 Tu Sub-Bot se ha desconectado exitosamente del concierto de Miku.\n\n💫 Usa *' + usedPrefix + 'qr* o *' + usedPrefix + 'code* para reconectar.')
    } catch (error) {
        console.error('Error deteniendo subbot:', error)
        m.reply('⚠️ Hubo un error al desconectar tu Sub-Bot. Intenta nuevamente.')
    }
}

handler.help = ['stop', 'detener']
handler.tags = ['serbot']
handler.command = /^(stop|detener)$/i

export default handler
