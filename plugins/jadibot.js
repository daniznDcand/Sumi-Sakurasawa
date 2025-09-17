import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
const fs = { ...fsPromises, existsSync };
import path, { join } from 'path' 
import ws from 'ws';


const emoji = '🌱'
const emoji2 = '💙'
const emoji3 = '✅'
const msm = '❌'
const jadi = 'MikuJadiBot'
const botname = 'Hatsune Miku Bot'

let handler = async (m, { conn: _envio, command, usedPrefix, args, text, isOwner}) => {
const isCommand1 = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command)  
const isCommand2 = /^(stop|pausarai|pausarbot)$/i.test(command)  
const isCommand3 = /^(bots|sockets|socket)$/i.test(command)   

async function reportError(e) {
await m.reply(`${msm} Ocurrió un error.`)
console.log(e)
}


const getConnsArray = () => {
	if (!global.conns) return []
	if (global.conns instanceof Map) return Array.from(global.conns.values())
	if (Array.isArray(global.conns)) return global.conns
	return Object.values(global.conns || {})
}

switch (true) {       
case isCommand1:
			
			let uniqid
			if (args && args[0]) {
				
				uniqid = args[0].replace(/[^0-9]/g, '')
			} else {
				let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? _envio.user.jid : m.sender
				uniqid = `${who.split`@`[0]}`
			}
			const sessionPath = `./${jadi}/${uniqid}`

		
		if (!fs.existsSync(sessionPath)) {
			await _envio.sendMessage(m.chat, { text: `${emoji} No se encontró una sesión para ese número/ID. Puedes crear una con:\n${usedPrefix}crearsesion\n\nSi tienes el ID puedes pasar: *${usedPrefix}${command}* (ID)` }, { quoted: m })
			return
		}

		
		if (global.conn && global.conn.user && global.conn.user.jid !== _envio.user.jid && !isOwner) {
			return _envio.sendMessage(m.chat, { text: `${emoji2} Este comando debe ejecutarse desde el bot principal o por un owner.` }, { quoted: m })
		}

			
			const targetConn = getConnsArray().find(c => c.user?.jid?.includes(uniqid) || (c.user && c.user.jid && c.user.jid.split('@')[0] === uniqid))

		if (targetConn) {
			try {
				
				try { targetConn.ws?.close() } catch (e) {}
				try { targetConn.ev?.removeAllListeners() } catch (e) {}
				const idx = global.conns.indexOf(targetConn)
				if (idx >= 0) {
					delete global.conns[idx]
					global.conns.splice(idx, 1)
				}
			} catch (e) {
				console.error('Error cerrando subbot:', e)
			}
		}

		
		try {
			await fs.rmdir(sessionPath, { recursive: true })
		} catch (e) {
			
			try { await fs.rm(sessionPath, { recursive: true, force: true }) } catch (er) {}
		}

		await _envio.sendMessage(m.chat, { text: `${emoji3} Sesión eliminada correctamente.` }, { quoted: m })
		break

case isCommand2:
if (global.conn.user.jid == conn.user.jid) conn.reply(m.chat, `${emoji} Si no es *Sub-Bot* comuníquese al numero principal del *Bot* para ser *Sub-Bot*.`, m)
else {
await conn.reply(m.chat, `${emoji} ${botname} desactivada.`, m)
conn.ws.close()}  
break

case isCommand3:

const users = [...new Set(getConnsArray().filter((conn) => conn.user && conn.ws?.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn))];
function convertirMsADiasHorasMinutosSegundos(ms) {
var segundos = Math.floor(ms / 1000);
var minutos = Math.floor(segundos / 60);
var horas = Math.floor(minutos / 60);
var días = Math.floor(horas / 24);
segundos %= 60;
minutos %= 60;
horas %= 24;
var resultado = "";
if (días !== 0) {
resultado += días + " días, ";
}
if (horas !== 0) {
resultado += horas + " horas, ";
}
if (minutos !== 0) {
resultado += minutos + " minutos, ";
}
if (segundos !== 0) {
resultado += segundos + " segundos";
}
return resultado;
}
const message = users.map((v, index) => `• 「 ${index + 1} 」\n📎 Wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado\n👤 Usuario: ${v.user.name || 'Sub-Bot'}\n🕑 Online: ${ v.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : 'Desconocido'}`).join('\n\n__________________________\n\n');
const replyMessage = message.length === 0 ? `No hay Sub-Bots disponible por el momento, verifique mas tarde.` : message;
const totalUsers = users.length;
const responseMessage = `${emoji} LISTA DE *SUB-BOTS* ACTIVOS\n\n${emoji2} PUEDES PEDIR PERMISO PARA QUE TE DEJEN UNIR EL BOT A TÚ GRUPO\n\n\`\`\`CADA USUARIO SUB-BOT USA SUS FUNCIONES COMO QUIERA, EL NÚMERO PRINCIPAL NO SE HACE RESPONSABLE DEL USO DEL MAL USO DE ELLA \`\`\`\n\n*SUB-BOT CONECTADOS:* ${totalUsers || '0'}\n\n${replyMessage.trim()}`.trim();
await _envio.sendMessage(m.chat, {text: responseMessage, mentions: _envio.parseMention(responseMessage)}, {quoted: m})
break   
}}

handler.tags = ['serbot']
handler.help = ['sockets', 'deletesesion', 'pausarai']
handler.command = ['deletesesion', 'deletebot', 'deletesession', 'deletesession', 'stop', 'pausarai', 'pausarbot', 'bots', 'sockets', 'socket']

export default handler
