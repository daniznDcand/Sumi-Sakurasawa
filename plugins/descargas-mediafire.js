import fetch from 'node-fetch'
import cheerio from 'cheerio'
import { basename } from 'path'

let handler = async (m, { conn, text }) => {
  if (!text) throw m.reply('Por favor, ingresa un link de MediaFire.')
  conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

 
  let res = await fetch(text)
  if (!res.ok) throw m.reply('No se pudo acceder al enlace de MediaFire.')
  let html = await res.text()
  let $ = cheerio.load(html)

  
  let downloadLink = $('#downloadButton').attr('href')
  if (!downloadLink) {
    downloadLink = $("a[aria-label='Download file']").attr('href')
    if (!downloadLink) throw m.reply('No se pudo extraer el enlace de descarga de MediaFire.')
  }


  let fileName = $('.filename').first().text().trim()
  if (!fileName) fileName = basename(downloadLink).split('?')[0]
  let fileSize = $('.dl-info > span').eq(1).text().trim() ||
                 $('.download_fileinfo').text().replace(/.*\((.*)\).*/, '$1').trim() ||
                 'Desconocido'


  let fileRes = await fetch(downloadLink)
  if (!fileRes.ok) throw m.reply('Error descargando el archivo.')
  let buffer = await fileRes.buffer()

  
  await conn.sendFile(m.chat, buffer, fileName, 
    `乂  *¡MEDIAFIRE - DESCARGAS!*  乂
💙 *Nombre* : ${fileName}
💙 *Peso* : ${fileSize}
💙 *Enlace directo* : ${downloadLink}`)

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
}
handler.help = ['mediafire']
handler.tags = ['descargas']
handler.command = ['mf', 'mediafire']
handler.coin = 10
handler.register = true
handler.group = true

export default handler
