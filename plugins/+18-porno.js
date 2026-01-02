import axios from 'axios';
import fetch from 'node-fetch';
const handler = async (m, {command, conn}) => {
  if (!db.data.chats[m.chat].nsfw && m.isGroup) {
    return m.reply(`💙 El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *.enable nsfw*`);
    }

  if (command == 'nsfwloli') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfwloli.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfwfoot') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfwfoot.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfwass') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfwass.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfwbdsm') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfwbdsm.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfwcum') {
    const res = `${global.MyApiRestBaseUrl}/api/nsfw/nsfwcum&apikey=${global.MyApiRestApikey}`;
    conn.sendMessage(m.chat, {image: {url: res}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfwero') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfwero.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfwfemdom') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfwfemdom.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfwglass') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfwglass.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'hentai') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/hentai.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'nsfworgy') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/nsfworgy.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const haha = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: haha}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'tetas') {
    const resError = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/tetas.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    let res = await conn.getFile(`https://api-fgmods.ddns.net/api/nsfw/boobs?apikey=fg-dylux`).data;
    if (res == '' || !res || res == null) res = await resError[Math.floor(resError.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: res}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'booty') {
    const resError = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/booty.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    let res = await conn.getFile(`https://api-fgmods.ddns.net/api/nsfw/ass?apikey=fg-dylux`).data;
    if (res == '' || !res || res == null) res = await resError[Math.floor(resError.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: res}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'ecchi') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/ecchi.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const url = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'furro') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/furro.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const url = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'trapito') {
    const res = await fetch(`https://api.waifu.pics/nsfw/trap`);
    const json = await res.json();
    const url = json.url;
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'imagenlesbians') {
    const resError = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/imagenlesbians.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    let res = await conn.getFile(`https://api-fgmods.ddns.net/api/nsfw/lesbian?apikey=fg-dylux`).data;
    if (res == '' || !res || res == null) res = await resError[Math.floor(resError.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: res}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'panties') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/panties.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const url = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'pene') {
    const res = `${global.MyApiRestBaseUrl}/api/adult/pene?apikey=${global.MyApiRestApikey}`;
    conn.sendMessage(m.chat, {image: {url: res}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'porno') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/porno.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const url = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'randomxxx') {
    const rawjsonn = ['https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/tetas.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ', 'https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/booty.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ', 'https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/imagenlesbians.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ', 'https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/panties.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ', 'https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/porno.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ'];
    const rawjson = await rawjsonn[Math.floor(rawjsonn.length * Math.random())];
    const res = (await axios.get(rawjson)).data;
    const url = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'pechos') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/pechos.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const url = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'yaoi') {
    const res = await fetch(`https://nekobot.xyz/api/image?type=yaoi`);
    const json = await res.json();
    const url = json.message;
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'yaoi2') {
    const res = await fetch(`https://purrbot.site/api/img/nsfw/yaoi/gif`);
    const json = await res.json();
    const url = json.link;
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'yuri') {
    const res = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/yuri.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const url = await res[Math.floor(res.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }

  if (command == 'yuri2') {
    const resError = (await axios.get(`https://raw.githubusercontent.com/Brauliovh3/cloud-bvh3/refs/heads/main/src/yuri.json?token=GHSAT0AAAAAADQNSQW36NB4FL24V5O4JUH62KXBYWQ`)).data;
    const res = await fetch(`https://purrbot.site/api/img/nsfw/yuri/gif`);
    const json = await res.json();
    let url = json.link;
    if (url == '' || !url || url == null) url = await resError[Math.floor(resError.length * Math.random())];
    conn.sendMessage(m.chat, {image: {url: url}, caption: `_${command}_`.trim()}, {quoted: m});
  }
};
handler.help = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];
handler.command = ['nsfwloli', 'nsfwfoot', 'nsfwass', 'nsfwbdsm', 'nsfwcum', 'nsfwero', 'nsfwfemdom', 'nsfwfoot', 'nsfwglass', 'nsfworgy', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 'panties', 'tetas', 'booty', 'ecchi', 'furro', 'hentai', 'trapito', 'imagenlesbians', 'pene', 'porno', 'randomxxx', 'pechos'];
handler.tags = ['nsfw'];
export default handler;

