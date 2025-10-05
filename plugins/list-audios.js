import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
    const audiosDir = path.join(process.cwd(), 'src', 'audios');
    
    if (!fs.existsSync(audiosDir)) {
        return conn.reply(m.chat, '❌ La carpeta de audios no existe.\n\n💡 Usa `downloadaudios all` para descargar los audios.', m);
    }
    
    const archivos = fs.readdirSync(audiosDir).filter(f => f.endsWith('.mp3'));
    
    if (archivos.length === 0) {
        return conn.reply(m.chat, '📁 La carpeta de audios está vacía.\n\n💡 Usa `downloadaudios all` para descargar los audios.', m);
    }
    
    let listText = `🎵 *AUDIOS LOCALES DISPONIBLES*\n\n📁 Ubicación: \`src/audios/\`\n📦 Total: ${archivos.length} archivos\n\n`;
    
    for (const archivo of archivos.sort()) {
        const filePath = path.join(audiosDir, archivo);
        const stats = fs.statSync(filePath);
        const tamaño = (stats.size / 1024).toFixed(2);
        const palabra = archivo.replace('.mp3', '');
        
        listText += `🔹 **${palabra}** - ${tamaño} KB\n`;
    }
    
    listText += `\n💡 Escribe cualquier palabra de la lista para activar el audio`;
    
    await conn.reply(m.chat, listText, m);
};

handler.help = ['listaudios'];
handler.tags = ['tools'];
handler.command = ['listaudios', 'listaaudios'];

export default handler;