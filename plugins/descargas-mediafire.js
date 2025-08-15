import axios from 'axios';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import {mediafiredl} from '@bochilteam/scraper';
import crypto from 'crypto';

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
      console.log('Error con scraper principal, probando API oficial...');
      
      try {
      
        const res = await mediafireApiDownload(args[0]);
        const caption = `*📁 MEDIAFIRE DESCARGA*\n
📝 *Nombre:* ${res.name}
📊 *Tamaño:* ${res.size}
📄 *Tipo:* ${res.mime}
📅 *Fecha:* ${res.date}

⬇️ *Descargando archivo...*`.trim();
        
        await m.reply(caption);
        await conn.sendFile(m.chat, res.link, res.name, '', m, null, {mimetype: res.mime, asDocument: true});
        
      } catch (error2) {
        console.log('Error con API oficial, probando método alternativo...');
        
        try {
          // Método de scraping alternativo
          const res = await mediafireDl(args[0]);
          const caption = `*📁 MEDIAFIRE DESCARGA*\n
📝 *Nombre:* ${res.name}
📊 *Tamaño:* ${res.size}
📄 *Tipo:* ${res.mime}

⬇️ *Descargando archivo...*`.trim();
          
          await m.reply(caption);
          await conn.sendFile(m.chat, res.link, res.name, '', m, null, {mimetype: res.mime, asDocument: true});
          
        } catch (error3) {
          console.log('Todos los métodos fallaron:', error3.message);
          await m.reply('❌ *Error al descargar el archivo de MediaFire.*\n\n• Verifica que el enlace sea válido\n• Asegúrate que el archivo no esté eliminado\n• El archivo podría ser demasiado grande\n• Intenta nuevamente en unos minutos');
        }
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


async function mediafireApiDownload(url) {
  try {
 
    const fileKeyMatch = url.match(/file\/([a-zA-Z0-9]+)/);
    if (!fileKeyMatch) {
      throw new Error('No se pudo extraer la clave del archivo del enlace');
    }
    
    const fileKey = fileKeyMatch[1];
    
   
    const API_CONFIG = {
      application_id: '42511', 
      api_key: 'myapikey', 
      email: '', 
      password: '' 
    };
    
    let sessionToken = '';
    
    
    if (API_CONFIG.email && API_CONFIG.password) {
      const signature = crypto
        .createHash('sha1')
        .update(API_CONFIG.email + API_CONFIG.password + API_CONFIG.application_id + API_CONFIG.api_key)
        .digest('hex');
      
      const tokenResponse = await axios.get('https://www.mediafire.com/api/1.5/user/get_session_token.php', {
        params: {
          email: API_CONFIG.email,
          password: API_CONFIG.password,
          application_id: API_CONFIG.application_id,
          signature: signature,
          token_version: 2,
          response_format: 'json'
        }
      });
      
      if (tokenResponse.data && tokenResponse.data.response && tokenResponse.data.response.session_token) {
        sessionToken = tokenResponse.data.response.session_token;
      }
    }
    
    
    const fileInfoParams = {
      quick_key: fileKey,
      response_format: 'json'
    };
    
    if (sessionToken) {
      fileInfoParams.session_token = sessionToken;
    }
    
    const fileInfoResponse = await axios.get('https://www.mediafire.com/api/1.5/file/get_info.php', {
      params: fileInfoParams
    });
    
    if (!fileInfoResponse.data || !fileInfoResponse.data.response || !fileInfoResponse.data.response.file_info) {
      throw new Error('No se pudo obtener información del archivo');
    }
    
    const fileInfo = fileInfoResponse.data.response.file_info;
    
    
    const linksParams = {
      quick_key: fileKey,
      link_type: 'direct_download',
      response_format: 'json'
    };
    
    if (sessionToken) {
      linksParams.session_token = sessionToken;
    }
    
    const linksResponse = await axios.get('https://www.mediafire.com/api/1.5/file/get_links.php', {
      params: linksParams
    });
    
    if (!linksResponse.data || !linksResponse.data.response || !linksResponse.data.response.links) {
      throw new Error('No se pudo obtener el enlace de descarga');
    }
    
    const downloadLink = linksResponse.data.response.links[0]?.direct_download;
    
    if (!downloadLink) {
      throw new Error('Enlace de descarga no disponible');
    }
    
    return {
      name: fileInfo.filename || 'archivo',
      size: formatFileSize(parseInt(fileInfo.size) || 0),
      date: fileInfo.created || 'Desconocido',
      mime: fileInfo.mimetype || 'application/octet-stream',
      link: downloadLink
    };
    
  } catch (error) {
    throw new Error(`Error con API de MediaFire: ${error.message}`);
  }
}


async function mediafireDl(url) {
  try {
    const res = await axios.get(`https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/', '')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(res.data);
    const link = $('#downloadButton').attr('href');
    
    if (!link) {
      throw new Error('No se encontró el enlace de descarga');
    }
    
    const name = $('body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').attr('title')?.replaceAll(' ', '')?.replaceAll('\n', '') || 'archivo';
    const date = $('body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span').text() || 'Desconocido';
    const size = $('#downloadButton').text()?.replace('Download', '')?.replace('(', '')?.replace(')', '')?.replace(/\n/g, '')?.replace(/\s+/g, ' ')?.trim() || 'Desconocido';
    
    let mime = 'application/octet-stream';
    try {
      const rese = await axios.head(link, { timeout: 5000 });
      mime = rese.headers['content-type'] || 'application/octet-stream';
    } catch {
     
    }
    
    return {name, size, date, mime, link};
  } catch (error) {
    throw new Error(`Error en scraping alternativo: ${error.message}`);
  }
}


function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
