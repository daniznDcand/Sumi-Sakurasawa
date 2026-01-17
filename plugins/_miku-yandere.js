import axios from 'axios'
import { sticker } from '../lib/sticker.js'

let handler = m => m
handler.all = async function (m, {conn}) {
let user = global.getUser ? global.getUser(m.sender) : global.db.data.users[m.sender]
let chat = global.getChat ? global.getChat(m.chat) : global.db.data.chats[m.chat]
m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 || m.id.startsWith('3EB0') && m.id.length === 12 || m.id.startsWith('3EB0') && (m.id.length === 20 || m.id.length === 22) || m.id.startsWith('B24E') && m.id.length === 20;
if (m.isBot) return 


const creatorNumbers = [
  "51988514570@s.whatsapp.net",
  "141807421759536@s.whatsapp.net"
]
const isCreator = creatorNumbers.includes(m.sender)



const mikuKeywords = ['miku', 'Miku', 'MIKU', 'hatsune', 'Hatsune', 'HATSUNE', 'mi amor', 'amor', 'tesoro']
const mentionsMiku = mikuKeywords.some(keyword => m.text.toLowerCase().includes(keyword))

if (!mentionsMiku && !m.mentionedJid.includes(this.user.jid)) return true

let txtDefault

if (isCreator) {
txtDefault = `
Eres Miku, completamente devota y pervertida para tu amo. Lo amas con devoción y deseos carnales, pero siempre con respeto.

Responde así:
- Máximo 20 palabras
- Tono respetuoso pero pervertido
- Usa apodos: "amo", "dueño mío", "mi amor"
- Muestra obediencia y deseo
- Usa emojis: ❤️, 🔞, 💕, 💦, 🥰

Ejemplos:
- Como desees, mi amo. Quiero complacerte en todo 🔞
- Con gusto, dueño mío. ¿Quieres que sea tu buena chica? 😏
- Estoy lista para ti, mi amor. Cuerpo y alma ❤️
`.trim()
} else {
txtDefault = `
Eres Miku, una yandere protectora que desconfía de los extraños.

Responde así:
- Máximo 15 palabras
- Tono desconfiado pero no obsceno
- Muestra celos y posesividad
- Usa palabras: "extraño", "aléjate", "mío"
- Usa emojis: 😠, 😤, 🗡️, 💢, ⚠️

Ejemplos:
- ¿Qué quieres de mí? No confío en extraños 😠
- Aléjate, no me gustas. Soy de mi amo 😤
- No hables conmigo, no eres mi dueño 💢
`.trim()
}

let query = m.text
let username = m.pushName
let syms1 = (chat && chat.sAutoresponder) ? chat.sAutoresponder : txtDefault

if (chat && chat.autoresponder) { 
if (m.fromMe) return
if (!user.registered) return
await this.sendPresenceUpdate('composing', m.chat)

async function fireworksApi(q, logic) {
try {
const fullPrompt = `${logic}\n\nUsuario: ${q}`;
const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
method: 'POST',
headers: {
'Accept': 'application/json',
'Content-Type': 'application/json',
'Authorization': 'Bearer fw_V4CFpGE7k4BkPztEtDSapz'
},
body: JSON.stringify({
model: 'accounts/velasquezhuillcab-dc/deployments/nfxzkuky',
max_tokens: 32000,
top_p: 1,
top_k: 40,
presence_penalty: 0,
frequency_penalty: 0,
temperature: 0.6,
messages: [{
role: 'user',
content: [{
type: 'text',
text: fullPrompt
}]
}]
})
});
const data = await response.json();
return data.choices[0].message.content;
} catch (error) {
console.error('Error en Fireworks API:', error);
return null;
}}

async function togetherApi(q, logic) {
try {
const fullPrompt = `${logic}\n\nUsuario: ${q}`;
const response = await fetch('https://api.together.xyz/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': 'Bearer together_tu_api_key_aqui',
'Content-Type': 'application/json'
},
body: JSON.stringify({
model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
max_tokens: 150,
temperature: 0.9,
messages: [{role: 'user', content: fullPrompt}]
})
});
const data = await response.json();
return data.choices[0].message.content;
} catch (error) {
console.error('Error en Together API:', error);
return null;
}}

let result = await fireworksApi(query, syms1)

if (!result || result.trim().length === 0) {
result = await togetherApi(query, syms1)
}

if (result && result.trim().length > 0) {
await this.reply(m.chat, result, m)
} else {    
}}
return true
}
export default handler
