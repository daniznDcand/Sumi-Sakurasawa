import fetch from 'node-fetch'
import cheerio from 'cheerio'
import { basename } from 'path'

let handler = async (m, { conn, text }) => {
  if (!text) throw m.reply('Por favor, ingresa un link de MediaFire.')
  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })

  const apikey = '' 
  
  
  const apis = [
    {
      name: "zahwazein",
      url: (url) => `https://api.zahwazein.xyz/downloader/mediafire?url=${encodeURIComponent(url)}&apikey=${apikey}`,
      parse: (json) => json.result?.url ? {
        url: json.result.url,
        filename: json.result.filename,
        size: json.result.size,
      } : null
    },
    {
      name: "enznoz",
      url: (url) => `https://enznoz-api-7prl.vercel.app/api/mediafire?url=${encodeURIComponent(url)}`,
      parse: (json) => json.url ? {
        url: json.url,
        filename: json.filename,
        size: json.size,
      } : null
    },
    {
      name: "latam-api",
      url: (url) => `https://latam-api.vercel.app/api/mediafire?url=${encodeURIComponent(url)}`,
      parse: (json) => json.url ? {
        url: json.url,
        filename: json.filename,
        size: json.size,
      } : null
    }
  ]

  let info = null
  for (let api of apis) {
    try {
      let res = await fetch(api.url(text))
      let json = await res.json()
      info = api.parse(json)
      if (info) break
    } catch (e) {}
  }

 
  if (!info) {
    try {
      let res = await fetch(text)
      let html = await res.text()
      let $ = cheerio.load(html)
      let downloadLink = $('#downloadButton').attr('href') || $("a[aria-label='Download file']").attr('href')
      let fileName = $('.filename').first().text().trim() || basename(downloadLink).split('?')[0]
      let fileSize = $('.dl-info > span').eq(1).text().trim() || $('.download_fileinfo').text().replace(/.*\((.*)\).*/, '$1').trim() || 'Desconocido'
      if (downloadLink) info = { url: downloadLink, filename: fileName, size: fileSize }
    } catch (e) {}
  }

  if (!info?.url) throw m.reply('No se pudo obtener el archivo de MediaFire con ninguna API.')

 
  let fileRes = await fetch(info.url)
  if (!fileRes.ok) throw m.reply('Error descargando el archivo.')
  let buffer = await fileRes.buffer()
  await conn.sendFile(m.chat, buffer, info.filename, 
    `乂  *¡MEDIAFIRE - DESCARGAS!* 乂
💙 *Nombre* : ${info.filename}
💙 *Peso* : ${info.size}
💙 *Enlace directo* : ${info.url}`)
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
}

handler.help = ['mediafire']
handler.tags = ['descargas']
handler.command = ['mf', 'mediafire']
handler.coin = 10
handler.register = true
handler.group = true

export default handler
