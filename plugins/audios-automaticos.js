import { AUDIO_CONFIG } from './_audios.js';
let handler = async (m, { conn }) => {
    if (!m.isGroup) return;

    const groupId = m.chat;
    const chat = global.db.data.chats[groupId] || {}

    
    if (!chat.audios) return

    const messageText = (m.text || '').trim()
    if (!messageText) return

    
    if (messageText.split(/\s+/).length !== 1) return

    const rawWord = messageText
    const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase()

    if (!cleanWord) return

    if (!AUDIO_CONFIG[cleanWord]) return

    try {
        console.log(`🎵 Enviando audio para "${cleanWord}" en grupo ${groupId}`)
        await conn.sendMessage(m.chat, {
            audio: { url: AUDIO_CONFIG[cleanWord] },
            mimetype: 'audio/mp4',
            ptt: true,
            fileName: `${cleanWord}.mp3`
        })
        console.log(`✅ Audio enviado para "${cleanWord}"`)
    } catch (error) {
        console.error(`❌ Error enviando audio para "${cleanWord}":`, error && (error.stack || error.message || error))
    }
}
handler.all = true; 
handler.priority = 5; 

export default handler;