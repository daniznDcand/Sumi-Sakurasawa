import db from '../lib/database.js';
import { createHash } from 'crypto';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    
    if (!global.db.data.users[m.sender]) {
      global.db.data.users[m.sender] = {
        name: '',
        age: 0,
        registered: false,
        coin: 0,
        exp: 0,
        joincount: 0
      };
    }
    
    const user = global.db.data.users[m.sender];
    
    
    if (!text) {
      return conn.reply(m.chat, 
        `💙 *FORMATO DE REGISTRO* 💙\n\n` +
        `Usa: *${usedPrefix + command} nombre.edad*\n` +
        `Ejemplo: *${usedPrefix + command} miku.18*`,
        m, global.miku
      );
    }
   
    if (user.registered) {
      return conn.reply(m.chat, 
        `🧧 *¡YA ESTÁS REGISTRADO!*\n\n` +
        `💙 *Nombre:* ${user.name || 'Sin nombre'}\n` +
        `🎂 *Edad:* ${user.age} años\n` +
        `💰 *Monedas:* ${user.coin || 0}\n\n` +
        `Usa *${usedPrefix}perfil* para ver tu progreso.`,
        m, global.miku
      );
    }

    
    const match = text.match(/^(.+?)[\s.](\d+)$/);
    if (!match) {
      return conn.reply(m.chat, 
        `❌ *Formato incorrecto*\n\n` +
        `Usa: *${usedPrefix + command} nombre.edad*\n` +
        `Ejemplo: *${usedPrefix + command} miku.18*`,
        m, global.miku
      );
    }

    const [_, name, ageStr] = match;
    const age = parseInt(ageStr);
    
    
    const nameClean = name.trim();
    if (nameClean.length < 2) {
      return conn.reply(m.chat, '❌ El nombre debe tener al menos 2 caracteres.', m, global.miku);
    }
    
    if (nameClean.length > 30) {
      return conn.reply(m.chat, '❌ El nombre es demasiado largo (máx. 30 caracteres).', m, global.miku);
    }
   
    
    if (isNaN(age) || age < 10 || age > 100) {
      return conn.reply(m.chat, '❌ La edad debe ser un número entre 10 y 100 años.', m, global.miku);
    }
    
    
    user.name = nameClean;
    user.age = age;
    user.registered = true;
    user.regTime = Date.now();
    user.coin = (user.coin || 0) + 50;
    user.exp = (user.exp || 0) + 100;
    
    
    await global.db.write();
    
    
    return conn.reply(m.chat, 
      `🎉 *¡REGISTRO EXITOSO!*\n\n` +
      `👤 *Nombre:* ${nameClean}\n` +
      `🎂 *Edad:* ${age} años\n` +
      `💰 *+50 monedas*\n` +
      `✨ *+100 XP*\n\n` +
      `¡Bienvenid@ a la familia Miku! 🎵`,
      m, global.miku
    );

  } catch (error) {
    console.error('Error en el registro:', error);
    return conn.reply(m.chat, 
      '❌ *¡Ups!* Ocurrió un error en el registro.\n' +
      'Por favor, inténtalo de nuevo más tarde.',
      m, global.miku
    );
  }
};

handler.help = ['reg'];
handler.tags = ['rg'];
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar'];
handler.group = true;

export default handler;
