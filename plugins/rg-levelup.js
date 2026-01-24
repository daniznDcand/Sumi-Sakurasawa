import { canLevelUp, xpRange } from '../lib/levelling.js';
import db from '../lib/database.js';

let handler = async (m, { conn }) => {
    let mentionedUser = m.mentionedJid[0];
    let citedMessage = m.quoted ? m.quoted.sender : null;
    let who = mentionedUser || citedMessage || m.sender; 
    let name = conn.getName(who) || 'Usuario';
    let user = global.db.data.users[who];

    if (!user) {
        await conn.sendMessage(m.chat, "No se encontraron datos del usuario.", { quoted: m });
        return true;
    }

    let { min, xp } = xpRange(user.level, global.multiplier);
    
    let before = user.level * 1;
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++;

    if (before !== user.level) {
        let txt = `🎵✨ *¡LEVEL UP! HATSUNE MIKU CONCERT* ✨🎵\n\n`;
        txt += `💙 *¡FELICIDADES!* Has subido de nivel 💙\n\n`;
        txt += `🔌 *${before}* ➞ *${user.level}* [ ${user.role} ]\n\n`;
        txt += `📈 *Nivel anterior* : ${before}\n`;
        txt += `🎉 *Nuevo nivel* : ${user.level}\n`;
        txt += `📅 *Fecha* : ${new Date().toLocaleString('es-ES', { timeZone: 'America/Mexico_City' })}\n\n`;
        txt += `🎶 *Sigue interactuando con Miku para subir más niveles!* 🎶`;
        
        
       
        const videos = [
            'https://media.tenor.com/AespzecEc6wAAAPo/miku.mp4',
            'https://media.tenor.com/BQ5qLEfhiQYAAAPo/hatsune-miku-bluescreen.mp4',
            'https://media.tenor.com/4rGH_-GnqZQAAAPo/miku-head-shake-miku.mp4',
            'https://media.tenor.com/TuBV7odxKU8AAAPo/miku-angry-meme-goku-angry.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];
        
        console.log('Intentando enviar video:', video);
        
        try {
           
            await conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: txt, mentions: [who] }, { quoted: m });
            console.log('Video enviado con éxito');
        } catch (e) {
            console.error('Error al enviar video:', e);
            
            await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
        }
    } else {
        let users = Object.entries(global.db.data.users).map(([key, value]) => {
            return { ...value, jid: key };
        });

        let sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0));
        let rank = sortedLevel.findIndex(u => u.jid === who) + 1;

        let txt = `*💙 Usuario* ◢ ${name} ◤\n\n`;
        txt += `📈 Nivel » *${user.level}*\n`;
        txt += `🔌 Experiencia » *${user.exp}*\n`;
        txt += `🚂 Rango » ${user.role}\n`;
        txt += `💎 Progreso » *${user.exp - min} => ${xp}* _(${Math.floor(((user.exp - min) / xp) * 100)}%)_\n`;
        txt += `🎉 Puesto » *${rank}* de *${sortedLevel.length}*\n`;
        txt += `🎶 Comandos totales » *${user.commands || 0}*`;

        await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
    }
}

handler.help = ['levelup', 'lvl @user']
handler.tags = ['rpg']
handler.command = ['nivel', 'lvl', 'level', 'levelup']
handler.register = true
handler.group = true

export default handler

