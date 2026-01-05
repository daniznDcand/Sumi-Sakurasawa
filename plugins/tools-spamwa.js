
async function replyWithChannel(conn, chat, text, quoted = null) {
  try {
    const buttons = []
    const urls = [['🎵 Canal Oficial 💙', 'https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o']]
    
    await conn.sendNCarousel(chat, text, '💙 Hatsune Miku Bot', null, buttons, null, urls, null, quoted);
  } catch (error) {
    console.log('Error con botones, usando reply simple:', error.message);
    conn.reply(chat, `${text}\n\n🎵 *Canal Oficial:* https://www.whatsapp.com/channel/0029VajYamSIHphMAl3ABi1o`, quoted);
  }
}

const handler = async (m, {conn, text}) => {
const [nomor, pesan, jumlah] = text.split('|');

if (!nomor) return replyWithChannel(conn, m.chat, `${emoji} Por favor, ingrese un número para realizar spam.`, m);

if (!pesan) return replyWithChannel(conn, m.chat, `${emoji} Uso Correcto:\n\n> ${emoji2} #spamwa numero|texto|cantidad`, m);

if (jumlah && isNaN(jumlah)) return replyWithChannel(conn, m.chat, `${emoji2} La cantidad deve ser un numero.`, m);

const fixedNumber = nomor.replace(/[-+<>@]/g, '').replace(/ +/g, '').replace(/^[0]/g, '62') + '@s.whatsapp.net';
const fixedJumlah = jumlah ? jumlah * 1 : 10;

if (fixedJumlah > 999) return conn.reply(m.chat, `${emoji3} Minimo 50 Caracteres.`, m);

await conn.reply(m.chat, `${emoji4} Se envió con éxito el spam.`, m);
for (let i = fixedJumlah; i > 1; i--) {
if (i !== 0) conn.reply(fixedNumber, pesan.trim(), null);
}
};
handler.help = ['spamwa <number>|<mesage>|<no of messages>'];
handler.tags = ['tools'];
handler.command = ['spam', 'spamwa'];
handler.premium = true;
export default handler;

