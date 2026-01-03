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
        str = `\`${name2}\` *está fumando con* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *está fumando con* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *está fumando*.`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://media.tenor.com/avjdyRYvSz4AAAPo/anime-smoke.mp4'; 
        let pp2 = 'https://media.tenor.com/26VXnb94UpkAAAPo/himeno-chainsaw-man.mp4'; 
        let pp3 = 'https://media.tenor.com/DI7x6eNuoFwAAAPo/smoke-anime.mp4';
        let pp4 = 'https://media.tenor.com/8jyJDJN6F18AAAPo/neco-arc-chaos-talking.mp4';
        let pp5 = 'https://media.tenor.com/zKmYYLGNsEUAAAPo/cyberpunk-cyberpunk-anime.mp4';
        let pp6 = 'https://media.tenor.com/taEalfrZcE4AAAPo/gachiakuta-enjin-smoking.mp4';
        let pp7 = 'https://media.tenor.com/ua_VYLJfi4YAAAPo/cowboy-bebop-spike-spiegel.mp4';
        let pp8 = 'https://media.tenor.com/S8jqkmuIt9IAAAPo/class-of-09-nicole-class-of-09.mp4';
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['smoke/fumar @tag'];
handler.tags = ['anime'];
handler.command = ['smoke', 'fumar'];
handler.group = true;
handler.register = true;
export default handler;
