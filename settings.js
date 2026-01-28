import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.botNumber = '' 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.owner = [
// <-- Número @s.whatsapp.net -->
  ['51994143761', 'Daniel', true],
  ['51900105468', 'Cande', true],
  
// <-- Número @lid -->
  ['27664438030530', 'Daniel', true]
];

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.mods = []
global.suittag = ['51994143761'] 
global.prems = []

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17' 
global.vs = '2.2.5'
global.nameqr = 'sumi Sakurasawa'
global.namebot = 'Sumi Sakurasawa'
global.sessions = 'Sessions'
global.jadi = 'JadiBots' 


//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.packname = 'Sumi Sakurasawa 🍭'
global.botname = 'Sumi Sakurasawa 🍭 '
global.wm = '🎵◟Hαƚsυɳҽ Mιƙυ◞🎵'
global.author = 'Dev.Daniel 🇦🇱'
global.dev = '© Powered By Daniel 🇦🇱'
global.textbot = 'Sumi Sakurasawa'
global.etiqueta = 'Daniel 🇦🇱'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.moneda = 'Dulces'
global.welcom1 = '💙 ¡Konnichiwa! Bienvenido al mundo virtual de Hatsune Miku! 💙 \n✨ Aquí podrás disfrutar de la magia musical ✨ \n🎶 Edita este mensaje con setwelcome 🎶'
global.welcom2 = '💫 ¡Sayonara! Gracias por cantar con nosotros 🌟 \n🎵 ¡Esperamos verte pronto en el escenario virtual! 🎵 \n🎤 Edita este mensaje con setbye 🎤'
global.banner = 'https://i.pinimg.com/736x/30/42/b8/3042b89ced13fefda4e75e3bc6dc2a57.jpg'
global.avatar = 'https://i.pinimg.com/736x/30/42/b8/3042b89ced13fefda4e75e3bc6dc2a57.jpg'

global.api = {
  url: 'https://api.stellarwa.xyz',
  key: 'Angelithixyz'
}

global.youtubeApiKey = 'AIzaSyCq64mln2364GHr3gzKZoRpOZ3K_F2Wq7I'

global.playlistApiKey = 'f9e54e5c6amsh8b4dfc0bfb94abap19bab2jsne8b65338207e'
global.rapidApiKey = 'f9e54e5c6amsh8b4dfc0bfb94abap19bab2jsne8b65338207e'


global.apikey = 'adonix-key'
global.APIKeys = {
  'https://api.xteam.xyz': 'YOUR_XTEAM_KEY',
  'https://api.lolhuman.xyz': 'API_KEY',
  'https://api.betabotz.eu.org': 'API_KEY',
  'https://mayapi.ooguy.com': 'may-f53d1d49'
}

global.APIs = {
  ryzen: 'https://api.ryzendesu.vip',
  xteam: 'https://api.xteam.xyz',
  lol: 'https://api.lolhuman.xyz',
  delirius: 'https://delirius-apiofc.vercel.app',
  siputzx: 'https://api.siputzx.my.id',
  mayapi: 'https://mayapi.ooguy.com'
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.gp1 = 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38'
global.comunidad1 = 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38'
global.channel = 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38'
global.channel2 = 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38'
global.md = 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38'
global.correo = 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.miku = { 
  contextInfo: { 
    isForwarded: true, 
    forwardedNewsletterMessageInfo: { 
      newsletterJid: "120363407087260811@newsletter", 
      serverMessageId: 100, 
      newsletterName: "Sumi Sakurasawa 🍭"
    },
    externalAdReply: {
      mediaUrl: null,
      description: 'Sumi Sakurasawa',
      previewType: "PHOTO",
      thumbnailUrl: global.banner || 'https://i.pinimg.com/736x/30/42/b8/3042b89ced13fefda4e75e3bc6dc2a57.jpg',
      sourceUrl: global.channel || 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38',
      mediaType: 1,
      renderLargerThumbnail: false
    }
  }
}

global.redes = 'https://whatsapp.com/channel/0029VbCRM6SKWEKhvvQzJT38'
global.dev = 'Powered By Daniel 🇦🇱'

global.emoji = '🍭'
global.emoji2 = '🍭'
global.emoji3 = '🍭'

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.catalogo = fs.readFileSync('./src/catalogo.jpg');
global.estilo = { key: {  fromMe: false, participant: `0@s.whatsapp.net`, ...(false ? { remoteJid: "5219992095479-1625305606@g.us" } : {}) }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: packname, orderTitle: 'Bang', thumbnail: catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.ch = {
ch1: '120363315369913363@newsletter',
}
global.multiplier = 60

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.cheerio = cheerio
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment





global.opts = {
  ...global.opts,
  autoread: true,  
  queque: false 
}


 

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'settings.js'"))
  import(`${file}?update=${Date.now()}`)
})
