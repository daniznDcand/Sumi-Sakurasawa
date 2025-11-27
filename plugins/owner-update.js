import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  m.reply('🎵 *Iniciando actualización...*\n└─ 🔄 Verificando cambios...');

  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      conn.reply(m.chat, `❌ *Error en la actualización*\n├─ 📝 ${err.message}\n└─ 🔧 Verifica la conexión`, m, rcanal);
      return;
    }

    if (stderr) {
      console.warn('Advertencia durante la actualización:', stderr);
    }

    if (stdout.includes('Already up to date.')) {
      conn.reply(m.chat, `✅ *Bot actualizado*\n└─ 🎶 Ya tienes la versión más reciente`, m, rcanal);
    } else {
      conn.reply(m.chat, `✨ *Actualización exitosa*\n├─ 📦 Cambios aplicados\n└─ 🔄 Reinicia el bot para cargar los cambios`, m, rcanal);
    }
  });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update'];
handler.rowner = true;

export default handler;