import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  m.reply('🎵 *Iniciando actualización...*\n└─ 🔄 Verificando cambios...');

  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      conn.reply(m.chat, `❌ *Error en la actualización*\n├─ 📝 ${err.message}\n└─ 🔧 Verifica la conexión`, m);
      return;
    }

    if (stderr) {
      console.warn('Advertencia durante la actualización:', stderr);
    }

    if (stdout.includes('Already up to date.')) {
      conn.reply(m.chat, `✅ *Bot actualizado*\n└─ 🎶 Ya tienes la versión más reciente`, m);
    } else {
      
      const lines = stdout.split('\n');
      const updatedFiles = [];

      for (const line of lines) {
        
        const fileMatch = line.match(/^ ([^|]+) \|/);
        if (fileMatch) {
          updatedFiles.push(fileMatch[1].trim());
        }
      }

      let response = `✨ *Actualización exitosa*\n├─ 📦 Cambios aplicados\n`;

      if (updatedFiles.length > 0) {
        response += `├─ 📄 Archivos actualizados:\n`;
        updatedFiles.forEach((file, index) => {
          const emoji = file.endsWith('.js') ? '📜' : file.endsWith('.json') ? '📋' : '📄';
          response += `│  ${emoji} ${file}\n`;
        });
        response += `└─ 🔄 Reinicia el bot para cargar los cambios`;
      } else {
        response += `└─ 🔄 Reinicia el bot para cargar los cambios`;
      }

      conn.reply(m.chat, response, m);
    }
  });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update'];
handler.rowner = true;

export default handler;