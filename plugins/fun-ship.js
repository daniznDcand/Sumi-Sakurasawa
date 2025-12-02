var handler = async (m, { conn, command, text }) => {

if (!text) return conn.reply(m.chat, `💙 Escribe tu nombre y el nombre de la otra persona para calcular su compatibilidad musical virtual ✨`, m, global.rcanal)
let [text1, ...text2] = text.split(' ')

text2 = (text2 || []).join(' ')
if (!text2) return conn.reply(m.chat, `🎵 Escribe el nombre de la segunda persona para crear la armonía perfecta 💫🎵`, m, global.rcanal)
let love = `💙 *${text1}* tu compatibilidad musical virtual con *${text2}* es de ${Math.floor(Math.random() * 100)}% ✨\n\n ¡Qué hermosa melodía podrían crear juntos! `

m.reply(love, null, { mentions: conn.parseMention(love) })

}
handler.help = ['ship', 'love']
handler.tags = ['fun']
handler.command = ['ship','pareja']
handler.group = true;
handler.register = true

export default handler
