import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
try {
let res = await fetch('https://api.github.com/repos/Brauliovh3/HATSUNE-MIKU')

if (!res.ok) throw new Error('Error al obtener datos del repositorio virtual de Miku')
let json = await res.json()

let txt = `*🎤💙  R E P O S I T O R I O  -  V I R T U A L  💙🎤*\n\n`
txt += `🎵  *Nombre del Proyecto* : ${json.name}\n`
txt += `🌟  *Fanáticos Observando* : ${json.watchers_count}\n`
txt += `💫  *Tamaño Virtual* : ${(json.size / 1024).toFixed(2)} MB\n`
txt += `✨  *Última Actualización* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`
txt += `🎶  *Enlace del Escenario* : ${json.html_url}\n`
txt += `💙  *Versiones Derivadas* : ${json.forks_count}\n`
txt += `🎤  *Estrellas del Concierto* : ${json.stargazers_count}\n\n`
txt += `> *🎵✨ ${dev} ✨🎵*`

await conn.sendMessage(m.chat, {text: txt, contextInfo: global.miku.contextInfo}, {quoted: m})

} catch {
await conn.reply(m.chat, `🎵💙 ¡Gomen! Ocurrió un error al acceder al repositorio virtual de Miku. ✨`, m)
await m.react(error)
}}

handler.help = ['script']
handler.tags = ['main']
handler.command = ['script', 'sc']
handler.register = true

export default handler

