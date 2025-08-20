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
        str = `\`${name2}\` *embarazó a* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *embarazó a* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *se embarazó a sí mismo >.<*`.trim();
    }
    
    if (m.isGroup) { 
        
        const videos = [
            'https://qu.ax/uaYcl.mp4',
            
        ];
        
        let mentions = [who];
        let videoSent = false;
        
        
        for (let i = 0; i < videos.length && !videoSent; i++) {
            try {
                await conn.sendMessage(m.chat, { 
                    video: { url: videos[i] }, 
                    gifPlayback: true, 
                    caption: str, 
                    mentions 
                }, { quoted: m });
                videoSent = true;
            } catch (error) {
                console.log(`Error con video ${i + 1}:`, error.message);
                
                if (i === videos.length - 1) {
                    await conn.sendMessage(m.chat, { 
                        text: str + '\n\n*[Video no disponible]*', 
                        mentions 
                    }, { quoted: m });
                }
            }
        }
    }
}

handler.help = ['preg/embarazar @tag'];
handler.tags = ['anime'];
handler.command = ['preg', 'embarazar', 'preñar'];
handler.group = true;
export default handler;
