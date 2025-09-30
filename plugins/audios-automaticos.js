import { AUDIO_CONFIG } from './_audios.js';

let handler = async (m, { conn }) => {
    if (!m.isGroup) return;

    const groupId = m.chat;

    
    if (!global.db) return
    if (!global.db.data) return
    if (!global.db.data.chats) return
    if (!global.db.data.chats[groupId]) global.db.data.chats[groupId] = {}
    const chat = global.db.data.chats[groupId]

    
    if (!chat.audios) {
        
        return
    }

   
    let messageText = (m.text || '')
    try { messageText = messageText.normalize('NFKC') } catch (e) {}
    messageText = messageText.trim()
    if (!messageText) return

    
    if (messageText.split(/\s+/).length !== 1) return

    const rawWord = messageText
    const cleanWord = rawWord.replace(/^[^\w]+|[^\w]+$/g, '').toLowerCase()
    if (!cleanWord) return

    const audioUrl = AUDIO_CONFIG[cleanWord]
    if (!audioUrl) return

    try {
        console.log(`🎵 Enviando audio para "${cleanWord}" en grupo ${groupId} - URL: ${audioUrl}`)
        await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
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