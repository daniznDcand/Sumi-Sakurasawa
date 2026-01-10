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
        str = `\`${name2}\` *está corriendo de* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *esta huyendo de* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *esta corriendo.*`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/cvzwv1MgTzUAAAPo/nice-try-miku-nice-try.mp4'; 
        let pp2 = 'https://media.tenor.com/AxoMmJmmaZQAAAPo/miku-run.mp4'; 
        let pp3 = 'https://media.tenor.com/lm2L1EEUpf0AAAPo/hatsune-miku.mp4';
        let pp4 = 'https://media.tenor.com/HqLbiAuWSJwAAAPo/miku-hatsune-miku.mp4';
        
        const videos = [pp, pp2, pp3, pp4];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['run/correr @tag'];
handler.tags = ['anime'];
handler.command = ['run', 'correr'];
handler.group = true;
handler.register = true;
export default handler;
