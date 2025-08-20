import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *embarazo a* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *embarazo a* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *se embarazó a sí mismo >.<.*`.trim();
    }
    
    if (m.isGroup) { 
        let pp = 'https://qu.ax/uaYcl.mp4';
  
        
        const videos = [pp];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['pregg/embarazar @tag'];
handler.tags = ['anime'];
handler.command = ['preg','embarazar','preñar'];
handler.group = true;

export default handler;
