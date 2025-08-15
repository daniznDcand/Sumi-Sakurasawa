import axios from 'axios';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import {mediafiredl} from '@bochilteam/scraper';

const handler = async (m, {conn, args, usedPrefix, command}) => {
  try {
    if (!args[0]) {
      await m.reply(`*📁 < DESCARGAS - MEDIAFIRE />*\n\n*💙 Ingrese un enlace válido de MediaFire.*\n\n*[ 💡 ] Ejemplo:*\n${usedPrefix + command} https://www.mediafire.com/file/ejemplo123/archivo.pdf`);
      return; 
    }
    
   
    if (!args[0].includes('mediafire.com')) {
      await m.reply('❌ *Por favor, ingresa un enlace válido de MediaFire.*');
      return;
    }
    
    await m.reply('⏳ *Procesando enlace de MediaFire...*');
    
    try {
      const resEX = await mediafiredl(args[0]);
      const captionES = `*📁 MEDIAFIRE DESCARGA*\n
📝 *Nombre:* ${resEX.filename}
📊 *Tamaño:* ${resEX.filesizeH}
📄 *Tipo:* ${resEX.ext}

⬇️ *Descargando archivo...*`.trim();
      
      await m.reply(captionES);
      await conn.sendFile(m.chat, resEX.url, resEX.filename, '', m, null, {mimetype: resEX.ext, asDocument: true});
      
    } catch (error1) {
      console.log('Error con scraper principal:', error1.message);
      
      try {
        const res = await mediafireDl(args[0]);
        const {name, size, date, mime, link} = res;
        const caption = `*📁 MEDIAFIRE DESCARGA*\n
📝 *Nombre:* ${name}
📊 *Tamaño:* ${size}
📄 *Tipo:* ${mime}

⬇️ *Descargando archivo...*`.trim();
        
        await m.reply(caption);
        await conn.sendFile(m.chat, link, name, '', m, null, {mimetype: mime, asDocument: true});
        
      } catch (error2) {
        console.log('Error con función alternativa:', error2.message);
        await m.reply('❌ *Error al descargar el archivo de MediaFire.*\n\n• Verifica que el enlace sea válido\n• Asegúrate que el archivo no esté eliminado\n• Intenta nuevamente en unos minutos');
      }
    }
    
  } catch (mainError) {
    console.log('Error general en plugin MediaFire:', mainError.message);
    await m.reply('❌ *Ocurrió un error inesperado. Intenta nuevamente.*');
  }
};


handler.help = ['mediafire', 'mf'];
handler.tags = ['downloader'];
handler.command = /^(mediafire|mediafiredl|dlmediafire|mf)$/i;

export default handler;

async function mediafireDl(url) {
  try {
    const res = await axios.get(`https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/', '')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`);
    const $ = cheerio.load(res.data);
    const link = $('#downloadButton').attr('href');
    
    if (!link) {
      throw new Error('No se encontró el enlace de descarga');
    }
    
    const name = $('body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').attr('title')?.replaceAll(' ', '')?.replaceAll('\n', '') || 'archivo';
    const date = $('body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span').text() || 'Desconocido';
    const size = $('#downloadButton').text()?.replace('Download', '')?.replace('(', '')?.replace(')', '')?.replace(/\n/g, '')?.replace(/\s+/g, ' ')?.trim() || 'Desconocido';
    
    let mime = '';
    try {
      const rese = await axios.head(link);
      mime = rese.headers['content-type'] || 'application/octet-stream';
    } catch {
      mime = 'application/octet-stream';
    }
    
    return {name, size, date, mime, link};
  } catch (error) {
    throw new Error(`Error en mediafireDl: ${error.message}`);
  }
}
