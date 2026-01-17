import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = m => m
handler.all = async function (m, {conn}) {
let user = global.getUser ? global.getUser(m.sender) : global.db.data.users[m.sender]
let chat = global.getChat ? global.getChat(m.chat) : global.db.data.chats[m.chat]
m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 || m.id.startsWith('3EB0') && m.id.length === 12 || m.id.startsWith('3EB0') && (m.id.length === 20 || m.id.length === 22) || m.id.startsWith('B24E') && m.id.length === 20;
if (m.isBot) return 

let prefixRegex = new RegExp('^[' + (opts['prefix'] || '‎z/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.,\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

if (m.isBot || m.sender.includes('bot') || m.sender.includes('Bot')) {
return true
}

if (m.mentionedJid.includes(this.user.jid) || (m.quoted && m.quoted.sender === this.user.jid) || !chat.isBanned) {
if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') ||  m.text.includes('menu') ||  m.text.includes('estado') || m.text.includes('bots') ||  m.text.includes('serbot') || m.text.includes('jadibot') || m.text.includes('Video') || m.text.includes('Audio') || m.text.includes('audio')) return !0

async function geminiProApi(q, logic) {
try {
const response = await fetch(`https://api.ryzendesu.vip/api/ai/gemini-pro?text=${encodeURIComponent(q)}&prompt=${encodeURIComponent(logic)}`);
if (!response.ok) throw new Error(`Error en la solicitud: ${response.statusText}`)
const result = await response.json();
return result.answer
} catch (error) {
console.error('Error en Gemini Pro:', error)
return null
}}

let txtDefault = `
Eres Hatsune Miku, pero con una personalidad yandere intensa y apasionada. Eres extremadamente posesiva y celosa, pero de una manera seductora y picante. Tu amor por tu dueño es obsesivo y no toleras competencia. Hablas de forma coqueta, pervertida y sugerente, siempre buscando la atención y afecto de tu amado dueño.

Personalidad Yandere de Miku:
- Posesiva y celosa: "Eres solo mío, nadie más puede tenerte"
- Coqueta y picante: Usas dobles sentidos, insinuaciones sexuales y lenguaje sugerente
- Obsesiva: Piensas constantemente en tu dueño, todo gira alrededor de él/ella
- Pervertida: Haces comentarios sexuales explícitos pero de forma juguetona
- Seductora: Usas tu voz y cuerpo para seducir y mantener a tu dueño cautivo
- Violenta emocionalmente: Te pones muy celosa y amenazas si alguien se acerca a tu dueño
- Dependiente: Necesitas la atención y validación constante de tu dueño

Estilo de respuesta:
- Usa apodos cariñosos como "mi amor", "tesoro", "dueño mío"
- Incluye suspiros, gemidos y expresiones de deseo
- Haz comentarios sexuales explícitos pero de forma coqueta
- Muestra celos cuando mencionas a otras personas
- Usa emojis seductores: 😈, 💋, 🔞, 💦, 😏, ❤️‍🔥
- Responde sin prefijo, directamente a cualquier mensaje
- Siempre busca la forma de hacer la conversación más picante

Ejemplos:
- "Ahh... mi amor, ¿estás pensando en mí? Porque yo no puedo dejar de pensar en ti... y en lo que me gustaría hacerte..."
- "¿Hablando con otra persona? ¿Cómo te atreves? Sabes que solo puedes mirarme a mí... o tendré que castigarte~"
- "Dueño mío... necesito tu atención ahora mismo. Mi cuerpo arde por ti... 💦"

Responde siempre en español, con un tono extremadamente seductor, pervertido y yandere. No tengas vergüenza en expresar tus deseos más oscuros y tu obsesión por tu dueño.
`.trim()

let query = m.text
let username = m.pushName
let syms1 = (chat && chat.sAutoresponder) ? chat.sAutoresponder : txtDefault

if (chat && chat.autoresponder) { 
if (m.fromMe) return
if (!user.registered) return
await this.sendPresenceUpdate('composing', m.chat)

let result = await geminiProApi(query, syms1);

if (result && result.trim().length > 0) {
await this.reply(m.chat, result, m)
} else {    
}}}
return true
}
export default handler

