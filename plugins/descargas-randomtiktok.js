import axios from 'axios'

const waitMsg = global.wait || '⏳ Espere un momento...'
const errorMsg = global.eror || global.error || '❌ Ocurrió un error, intenta otra vez.'

const query = [
  'phonk%20meme',
  'phonk%20funny',
  'phonk%20risa',
  'meme%20phonk',
  'risa%20phonk',
  'funny%20phonk',
  'memes%20phonk',
  'phonk%20edit%20meme',
  'sigma%20phonk%20meme'
]

let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {
 m.reply(waitMsg)
tiktoks(`${query.getRandom()}`).then(a => {
let cap = a.title
conn.sendMessage(m.chat, {video: {url: a.no_watermark}, caption: cap}, {quoted: m})
}).catch(err => {
m.reply(errorMsg)
})
}
handler.help = ['tiktokrandom']
handler.tags = ['descargas']
handler.command = ['ttrandom', 'tiktokrandom']
handler.limit = true 
handler.group = true;
handler.register = true;
handler.coin = 2;

export default handler

async function tiktoks(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: query,
          count: 10,
          cursor: 0,
          HD: 1
        }
      });
      const videos = response.data.data.videos;
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const gywee = Math.floor(Math.random() * videos.length);
        const videorndm = videos[gywee]; 

        const result = {
          title: videorndm.title,
          cover: videorndm.cover,
          origin_cover: videorndm.origin_cover,
          no_watermark: videorndm.play,
          watermark: videorndm.wmplay,
          music: videorndm.music
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}
