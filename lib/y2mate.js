import fetch from 'node-fetch'
import cheerio from 'cheerio'

const ytv = async (yutub) => {
  try {
    function post(url, formdata) {
      return fetch(url, {
        method: 'POST',
        headers: {
          accept: "*/*",
          'accept-language': "en-US,en;q=0.9",
          'content-type': "application/x-www-form-urlencoded; charset=UTF-8",
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams(Object.entries(formdata))
      })
    }
    
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
    let ytId = ytIdRegex.exec(yutub)
    
    if (!ytId || !ytId[1]) {
      throw new Error('URL de YouTube inválida')
    }
    
    let url = 'https://youtu.be/' + ytId[1]
    let res = await post(`https://www.y2mate.com/mates/en68/analyze/ajax`, {
      url,
      q_auto: 0,
      ajax: 1
    })
    
    if (!res.ok) {
      throw new Error('Error al analizar el video')
    }
    
    const mela = await res.json()
    
    if (!mela.result) {
      throw new Error('No se pudo obtener información del video')
    }
    
    const $ = cheerio.load(mela.result)
    const hasil = []
    
    let thumb = $('div').find('.thumbnail.cover > a > img').attr('src')
    let title = $('div').find('.thumbnail.cover > div > b').text()
    let quality = $('div').find('#mp4 > table > tbody > tr:nth-child(4) > td:nth-child(3) > a').attr('data-fquality') || '360p'
    let tipe = $('div').find('#mp4 > table > tbody > tr:nth-child(3) > td:nth-child(3) > a').attr('data-ftype') || 'mp4'
    let output = `${title}.` + tipe
    let size = $('div').find('#mp4 > table > tbody > tr:nth-child(2) > td:nth-child(2)').text()
    
    let idMatch = /var k__id = "(.*?)"/.exec(mela.result)
    if (!idMatch) {
      throw new Error('No se pudo obtener el ID del video')
    }
    
    let id = idMatch[1]
    let res2 = await post(`https://www.y2mate.com/mates/en68/convert`, {
      type: 'youtube',
      _id: id,
      v_id: ytId[1],
      ajax: '1',
      token: '',
      ftype: tipe,
      fquality: quality
    })
    
    if (!res2.ok) {
      throw new Error('Error al convertir el video')
    }
    
    const meme = await res2.json()
    const supp = cheerio.load(meme.result)
    let link = supp('div').find('a').attr('href')
    
    if (!link) {
      throw new Error('No se pudo obtener el enlace de descarga')
    }
    
    hasil.push({ thumb, title, quality, tipe, size, output, link})
    return hasil[0]
  } catch (error) {
    console.error('Error en ytv:', error.message)
    throw error
  }
}


const yta = async (yutub) => {
  try {
    function post(url, formdata) {
      return fetch(url, {
        method: 'POST',
        headers: {
          accept: "*/*",
          'accept-language': "en-US,en;q=0.9",
          'content-type': "application/x-www-form-urlencoded; charset=UTF-8",
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams(Object.entries(formdata))
      })
    }
    
    const ytIdRegex = /(?:http(?:s|):\/\/|)(?:(?:www\.|)youtube(?:\-nocookie|)\.com\/(?:watch\?.*(?:|\&)v=|embed\/|v\/)|youtu\.be\/)([-_0-9A-Za-z]{11})/
    let ytId = ytIdRegex.exec(yutub)
    
    if (!ytId || !ytId[1]) {
      throw new Error('URL de YouTube inválida')
    }
    
    let url = 'https://youtu.be/' + ytId[1]
    let res = await post(`https://www.y2mate.com/mates/en68/analyze/ajax`, {
      url,
      q_auto: 0,
      ajax: 1
    })
    
    if (!res.ok) {
      throw new Error('Error al analizar el audio')
    }
    
    const mela = await res.json()
    
    if (!mela.result) {
      throw new Error('No se pudo obtener información del audio')
    }
    
    const $ = cheerio.load(mela.result)
    const hasil = []
    
    let thumb = $('div').find('.thumbnail.cover > a > img').attr('src')
    let title = $('div').find('.thumbnail.cover > div > b').text()
    let size = $('div').find('#mp3 > table > tbody > tr > td:nth-child(2)').text()
    let tipe = $('div').find('#mp3 > table > tbody > tr > td:nth-child(3) > a').attr('data-ftype') || 'mp3'
    let output = `${title}.` + tipe
    let quality = $('div').find('#mp3 > table > tbody > tr > td:nth-child(3) > a').attr('data-fquality') || '128'
    
    let idMatch = /var k__id = "(.*?)"/.exec(mela.result)
    if (!idMatch) {
      throw new Error('No se pudo obtener el ID del audio')
    }
    
    let id = idMatch[1]
    let res2 = await post(`https://www.y2mate.com/mates/en68/convert`, {
      type: 'youtube',
      _id: id,
      v_id: ytId[1],
      ajax: '1',
      token: '',
      ftype: tipe,
      fquality: quality
    })
    
    if (!res2.ok) {
      throw new Error('Error al convertir el audio')
    }
    
    const meme = await res2.json()
    const supp = cheerio.load(meme.result)
    let link = supp('div').find('a').attr('href')
    
    if (!link) {
      throw new Error('No se pudo obtener el enlace de descarga')
    }
    
    hasil.push({ thumb, title, quality, tipe, size, output, link})
    return hasil[0]
  } catch (error) {
    console.error('Error en yta:', error.message)
    throw error
  }
}

export {
 yta, 
ytv
}
/*
by https://instabio.cc/fg98ff
*/
