import fetch from 'node-fetch'
import cheerio from 'cheerio'

let handler = async (m, { conn, text }) => {
  if (!text) throw m.reply('Por favor, ingresa un link de mediafire.')
  conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } })


  let res = await fetch(text)
  if (!res.ok) throw m.reply('No se pudo acceder al enlace de MediaFire.')
  let html = await res.text()
  let $ = cheerio.load(html)

  let downloadLink = $('#downloadButton').attr('href')
  let fileName = $('.filename').text() || 'archivo'
  let fileSize = $('.dl-info > span').eq(1).text() || ''
  
  if (!downloadLink) throw m.reply('No se pudo obtener el enlace de descarga.')

  await conn.sendFile(m.chat, downloadLink, fileName, 
    `乂  *¡MEDIAFIRE - DESCARGAS!*  乂
💙 *Nombre* : ${fileName}
💙 *Peso* : ${fileSize}
💙 *Enlace* : ${downloadLink}`)

  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key }})
}
handler.help = ['mediafire']
handler.tags = ['descargas']
handler.command = ['mf', 'mediafire']
handler.coin = 10
handler.register = true
handler.group = true

export default handler
