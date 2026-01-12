import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return conn.reply(m.chat, '🔍 Usa: testapi facebook para probar la API de Facebook');
  }

  if (args[0] !== 'facebook') {
    return conn.reply(m.chat, '❌ Solo puedes probar: facebook');
  }

  await m.react('🔍');

  try {
    // Esperar a que la API esté disponible
    await new Promise(resolve => {
      const checkInterval = setInterval(() => {
        if (global.facebookAPI && global.facebookAPI.url && global.facebookAPI.key) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });

    const testUrl = `${global.facebookAPI.url}?url=https://www.facebook.com/watch?v=dQw4w9WgXcQ&key=${global.facebookAPI.key}`;
    console.log('🔍 Probando API de Facebook:', testUrl.replace(global.facebookAPI.key, '[KEY_HIDDEN]'));
    
    const startTime = Date.now();
    const response = await fetch(testUrl, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    console.log('📊 Respuesta API:', {
      status: data.status,
      responseTime: `${responseTime}ms`,
      hasData: !!data.result
    });

    let testResult = '✅ **API DE FACEBOOK FUNCIONANDO CORRECTAMENTE**\n\n';
    
    if (data.status === 200 && data.result) {
      testResult += `🟢 *Estado:* Conectado\n`;
      testResult += `⚡ *Tiempo de respuesta:* ${responseTime}ms\n`;
      testResult += `📡 *URL API:* ${global.facebookAPI.url.replace('rest.alyabotpe.xyz', 'api.alyabotpe.xyz')}\n`;
      testResult += `🔑 *Key status:* Configurada y oculta\n`;
      testResult += `📦 *Datos:* Recibidos correctamente`;
    } else {
      testResult += `🔴 *Estado:* Error de conexión\n`;
      testResult += `⏱️ *Tiempo de respuesta:* ${responseTime}ms\n`;
      testResult += `❌ *Error:* ${data.message || 'Error desconocido'}\n`;
      testResult += `📡 *URL API:* ${global.facebookAPI.url}\n`;
      testResult += `🔑 *Key status:* ${global.facebookAPI.key ? 'Configurada' : 'No configurada'}`;
    }

    testResult += `\n💙 *Bot:* Hatsune Miku\n`;
    testResult += `🕐 *Prueba realizada:* ${new Date().toLocaleString()}`;

    await conn.sendMessage(m.chat, {
      text: testResult,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          mediaUrl: global.facebookAPI.url,
          title: 'Test API Facebook',
          body: 'Verificación de conectividad',
          sourceUrl: global.facebookAPI.url
        }
      }
    }, { quoted: m });

    await m.react('✅');

  } catch (error) {
    console.error('❌ Error en prueba API:', error);
    
    const errorResult = `❌ **ERROR EN PRUEBA DE API**\n\n` +
      `🔴 *Error:* ${error.message}\n` +
      `📡 *URL:* ${global.facebookAPI?.url || 'No configurada'}\n` +
      `🔑 *Key:* ${global.facebookAPI?.key ? 'Configurada' : 'No configurada'}\n` +
      `💙 *Bot:* Hatsune Miku\n` +
      `🕐 *Falló:* ${new Date().toLocaleString()}`;

    await conn.sendMessage(m.chat, {
      text: errorResult,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 2,
          title: 'Error API Facebook',
          body: 'Fallo en la prueba',
          sourceUrl: global.facebookAPI?.url || '#'
        }
      }
    }, { quoted: m });

    await m.react('❌');
  }
};

handler.help = ['testapi'];
handler.tags = ['owner'];
handler.command = ['testapi'];
handler.owner = true;
handler.register = true;

export default handler;
