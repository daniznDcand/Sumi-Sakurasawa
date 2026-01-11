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
        str = `\`${name2}\` *picó a* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *picó a* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *se picó a sí mismo.*`.trim();
    }
    
    if (m.isGroup) { 
        let pp = 'https://media.tenor.com/3hiW5_Mg_XEAAAPo/hatsune-miku-poke.mp4';
        let pp2 = 'https://media.tenor.com/iu_Lnd86GxAAAAPo/nekone-utawarerumono.mp4';
        let pp3 = 'https://media.tenor.com/3dOqO4vVlr8AAAPo/poke-anime.mp4';
        let pp4 = 'https://media.tenor.com/y4R6rexNEJIAAAPo/boop-anime.mp4';
        let pp5 = 'https://media.tenor.com/1YMrMsCtxLQAAAPo/anime-poke.mp4';
        let pp6 = 'https://media.tenor.com/t6ABAaRJEA0AAAPo/oreimo-ore-no-im%C5%8Dto-ga-konna-ni-kawaii-wake-ga-nai.mp4';
        let pp7 = 'https://media.tenor.com/hSP6oVG2dTMAAAPo/yonomori-kobeni-anime-girl.mp4';
        let pp8 = 'https://media.tenor.com/NFU6KXm582gAAAPo/anime-blend-s.mp4';

        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['poke/picar @tag'];
handler.tags = ['anime'];
handler.command = ['poke','picar'];
handler.group = true;
handler.register = true;
export default handler;
