import axios from 'axios';
import cheerio from 'cheerio';
import { lookup } from 'mime-types';

const tradutor = {
  texto2: [
    '✅ *DESCARGA EXITOSA*',
    '📄 *Nombre:*',
    '📊 *Tamaño:*', 
    '🗂️ *Tipo:*',
    '⬇️ *Descargando...*'
  ],
  texto3: '❌ Error al descargar el archivo de MediaFire.'
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) throw `_*< DESCARGAS - MEDIAFIRE />*_\n\n*[ ℹ️ ] Ingrese un enlace de MediaFire.*\n\n*[ 💡 ] Ejemplo:* ${usedPrefix + command} http://www.mediafire.com/file/7a28wroqlhtfws7/FgsiRestAPI_1754243494124_fgsi_1754243490723.jpeg`;
  
  try {
    const res = await mediafireDl(args[0]);
    const {name, size, date, mime, link} = res;
    const caption = `${tradutor.texto2[0]}\n\n${tradutor.texto2[1]} ${name}\n${tradutor.texto2[2]} ${size}\n${tradutor.texto2[3]} ${mime}\n\n${tradutor.texto2[4]}`.trim();
    await m.reply(caption);

    
    try {
      const fileResponse = await axios.get(link, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': args[0]
        },
        maxRedirects: 5,
        timeout: 60000
      });

      if (fileResponse.data && Buffer.isBuffer(fileResponse.data) && fileResponse.data.length > 0) {
        const fileBuffer = Buffer.from(fileResponse.data);

        
        if (fileBuffer.length > 25 * 1024 * 1024) {
          throw new Error('El archivo es demasiado grande (máximo 25MB)');
        }

        const docMessage = {
          document: fileBuffer,
          mimetype: mime || fileResponse.headers['content-type'] || 'application/octet-stream',
          fileName: name,
          caption: `📁 *Archivo descargado de MediaFire*\n\n📄 *Nombre:* ${name}\n📊 *Tamaño:* ${size}\n🗂️ *Tipo:* ${mime || 'Desconocido'}\n\n💙 *Descargado por Hatsune Miku Bot*`,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              mediaType: 2,
              mediaUrl: args[0],
              title: name,
              body: `📁 MediaFire | 💙 Hatsune Miku Bot`,
              sourceUrl: args[0]
            }
          }
        };

        await conn.sendMessage(m.chat, docMessage, { quoted: m });
      } else {
        throw new Error('No se pudo obtener el contenido del archivo');
      }
    } catch (downloadError) {
      console.error('Error descargando archivo:', downloadError.message);
      
      await conn.sendMessage(m.chat, {
        text: `❌ Error al descargar directamente. Enlace alternativo: ${link}`,
        quoted: m
      });
    }
  } catch (error) {
    console.error('Error en MediaFire:', error);
    await m.reply(tradutor.texto3);
  }
}

handler.command = /^(mediafire|mediafiredl|dlmediafire|mf)$/i;
handler.register = true;
export default handler;

async function mediafireDl(url) {
  try {
    if (!url.includes('mediafire.com')) throw new Error('URL de MediaFire inválida');
    
    const apiUrl = `${global.mediafireAPI.url}?url=${encodeURIComponent(url)}&key=${global.mediafireAPI.key}`;
    
    console.log('Consultando API de MediaFire...');
    
    const response = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.data || response.data.status !== 200) {
      throw new Error(response.data.message || 'La API no respondió correctamente');
    }
    
    const data = response.data.result;
    const name = data.filename || data.name || 'archivo_descargado';
    const size = data.filesize || data.size || 'Tamaño no disponible';
    const mime = data.mimetype || lookup(name.split('.').pop()) || 'application/octet-stream';
    const link = data.download || data.url || data.link;
    
    if (!link) {
      throw new Error('No se encontró enlace de descarga en la respuesta');
    }
    
    console.log('Datos obtenidos de la API:', { name, size, mime: mime.split('/')[0] });
    
    return { name, size, date: new Date().toLocaleString(), mime, link };
    
  } catch (error) {
    console.error('Error en mediafireDl (API):', error.message);
    
     try {
      console.log('Intentando con método original como fallback...');
      return await mediafireDlOriginal(url);
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError.message);
      throw new Error(`Error al procesar MediaFire: ${error.message}`);
    }
  }
}


async function mediafireDlOriginal(url) {
  try {
    if (!url.includes('www.mediafire.com')) throw new Error('URL de MediaFire inválida');
    let res;
    let $;
    let link = null;
    try {
      res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }});
      $ = cheerio.load(res.data);
      const downloadButton = $('#downloadButton');
      link = downloadButton.attr('href');
      if (!link || link.includes('javascript:void(0)')) { 
        link = downloadButton.attr('data-href') || downloadButton.attr('data-url') || downloadButton.attr('data-link');
        const scrambledUrl = downloadButton.attr('data-scrambled-url');
        if (scrambledUrl) {
          try {
            link = atob(scrambledUrl);
          } catch (e) {
            console.log('Error decodificando scrambled URL:', e.message);
          }
        }
        if (!link || link.includes('javascript:void(0)')) {
          const htmlContent = res.data;
          const linkMatch = htmlContent.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/);
          if (linkMatch) {
            link = linkMatch[1];
          } else {
            const altMatch = htmlContent.match(/"(https:\/\/[^"]*mediafire[^"]*\.(zip|rar|pdf|jpg|jpeg|png|gif|mp4|mp3|exe|apk|txt)[^"]*)"/i);
            if (altMatch) {
              link = altMatch[1];
            }
          }
        }
      }
    } catch (directError) {
      const translateUrl = `https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/', '')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`;
      res = await axios.get(translateUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }});
      $ = cheerio.load(res.data);
      const downloadButton = $('#downloadButton');
      link = downloadButton.attr('href');
      if (!link || link.includes('javascript:void(0)')) {
        const scrambledUrl = downloadButton.attr('data-scrambled-url');
        if (scrambledUrl) {
          try {
            link = atob(scrambledUrl);
          } catch (e) {}
        }
      }
    }
    if (!link || link.includes('javascript:void(0)')) throw new Error('No se pudo encontrar el enlace de descarga válido');
    const name = $('body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').attr('title')?.replace(/\s+/g, '')?.replace(/\n/g, '') || $('.dl-btn-label').attr('title') || $('.filename').text().trim() || 'archivo_descargado';
    const date = $('body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span').text().trim() || $('.details li:nth-child(2) span').text().trim() || 'Fecha no disponible';
    const size = $('#downloadButton').text().replace('Download', '').replace(/[()]/g, '').replace(/\n/g, '').replace(/\s+/g, ' ').trim() || $('.details li:first-child span').text().trim() || 'Tamaño no disponible';
    let mime = '';
    const ext = name.split('.').pop()?.toLowerCase();
    mime = lookup(ext) || 'application/octet-stream';
    if (!link.startsWith('http')) throw new Error('Enlace de descarga inválido');
    return { name, size, date, mime, link };
  } catch (error) {
    console.error('Error en mediafireDl original:', error.message);
    throw new Error(`Error al procesar MediaFire: ${error.message}`);
  }
}

