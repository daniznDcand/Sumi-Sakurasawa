import db from '../lib/database.js';
import MessageType from '@whiskeysockets/baileys';

let impts = 0;

let handler = async (m, { conn, text }) => {
    let who;
    if (m.isGroup) {
        if (m.mentionedJid.length > 0) {
            who = m.mentionedJid[0];
        } else {
            const quoted = m.quoted ? m.quoted.sender : null;
            who = quoted ? quoted : m.chat;
        }
    } else {
        who = m.chat;
    }
    
    if (!who) return m.reply(`🎤💙 Por favor, menciona al fanático o cita un mensaje en el concierto virtual ✨`);
    
    let txt = text.replace('@' + who.split`@`[0], '').trim();
    if (!txt) return m.reply(`🎤💙 Por favor, ingresa la cantidad de notas musicales que deseas añadir al concierto virtual ✨🎵`);
    if (isNaN(txt)) return m.reply(`🎤💙 Solo números son válidos en el mundo virtual de Miku ✨💫`);
    
    let dmt = parseInt(txt);
        let cebollines = dmt;
        let pjk = Math.ceil(dmt * impts);
        cebollines += pjk;
    
        if (cebollines < 1) return m.reply(`� El mínimo es *1* cebollín para regalar �`);
    
    let users = global.db.data.users;
        users[who].cebollines = (users[who].cebollines || 0) + dmt;
    
    m.reply(`🎤� *Notas Musicales Añadidas al Concierto Virtual:*
» ${dmt} 💎\n@${who.split('@')[0]}, recibiste ${dmt} notas musicales en el mundo virtual de Miku ✨🎵�`, null, { mentions: [who] });
};

handler.help = ['addcoins *<@user>*'];
    handler.help = ['addcebollines *<@user>*'];
handler.tags = ['owner'];
handler.command = ['añadircoin', 'addcoin', 'addcoins']; 
handler.rowner = true;

export default handler;


