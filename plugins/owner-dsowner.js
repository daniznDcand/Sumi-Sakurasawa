import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs'
import path from 'path'

var handler = async (m, { conn, usedPrefix }) => {

if (global.conn.user.jid !== conn.user.jid) {
return conn.reply(m.chat, `${emoji} Utiliza este comando directamente en el número principal del Bot.`, m)
}
await conn.reply(m.chat, `${emoji2} Iniciando proceso de eliminación de todos los archivos de sesión, excepto el archivo creds.json...`, m)
m.react(rwait)

let sessionPath = `./${sessions}/`

try {

if (!existsSync(sessionPath)) {
return await conn.reply(m.chat, `${emoji} La carpeta está vacía.`, m)
}

async function deleteRecursively(dirPath) {
  let filesDeleted = 0
  const items = await fs.readdir(dirPath)
  for (const item of items) {
    const itemPath = path.join(dirPath, item)
    const stat = await fs.stat(itemPath)
    if (stat.isDirectory()) {
      filesDeleted += await deleteRecursively(itemPath)
      await fs.rmdir(itemPath)
    } else if (item !== 'creds.json') {
      await fs.unlink(itemPath)
      filesDeleted++
    }
  }
  return filesDeleted
}

let filesDeleted = await deleteRecursively(sessionPath)
if (filesDeleted === 0) {
await conn.reply(m.chat, `${emoji2} La carpeta esta vacía.`, m)
} else {
m.react(done)
await conn.reply(m.chat, `${emoji} Se eliminaron ${filesDeleted} archivos de sesión, excepto el archivo creds.json.`, m)
conn.reply(m.chat, `${emoji} *¡Hola! ¿logras verme?*`, m)

}
} catch (err) {
console.error('Error al leer la carpeta o los archivos de sesión:', err);
await conn.reply(m.chat, `${msm} Ocurrió un fallo.`, m)
}

}
handler.help = ['dsowner']
handler.tags = ['owner']
handler.command = ['delai', 'dsowner', 'clearallsession']
handler.rowner = true;

export default handler

