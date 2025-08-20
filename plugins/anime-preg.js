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
        
        try {
            
            await conn.sendMessage(m.chat, { 
                video: { url: videos[0] }, 
                gifPlayback: true,
                caption: str, 
                mentions,
                mimetype: 'video/mp4'
            }, { quoted: m });
            videoSent = true;
        } catch (error1) {
            console.log('Error método GIF:', error1.message);
            
            try {
                // Método 2: Como video normal
                await conn.sendMessage(m.chat, { 
                    video: { url: videos[0] }, 
                    caption: str, 
                    mentions,
                    mimetype: 'video/mp4'
                }, { quoted: m });
                videoSent = true;
            } catch (error2) {
                console.log('Error método video:', error2.message);
                
                try {
                    
                    await conn.sendMessage(m.chat, { 
                        document: { url: videos[0] },
                        fileName: 'embarazar.mp4',
                        mimetype: 'video/mp4',
                        caption: str,
                        mentions
                    }, { quoted: m });
                    videoSent = true;
                } catch (error3) {
                    console.log('Error método documento:', error3.message);
                    
                   
                    await conn.sendMessage(m.chat, { 
                        text: str + '\n\n🤰 *¡Felicidades!*', 
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
