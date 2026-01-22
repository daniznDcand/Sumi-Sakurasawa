import db from '../lib/database.js'


const emoji = '🎰';
const emoji2 = '🎲';
const emoji3 = '⏱️';
const moneda = global.rpgshop.emoticon('money') || '💵';
const botname = global.botname || 'Hatsune Miku Bot';

let buatall = 1;
let cooldowns = {};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let user = global.db.data.users[m.sender];
        let randomaku = Math.floor(Math.random() * 101);
        let randomkamu = Math.floor(Math.random() * 55);
        let Aku = randomaku;
        let Kamu = randomkamu;
        let count = args[0];
        let username = conn.getName(m.sender);
        let tiempoEspera = 15; 

       
        if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tiempoEspera * 1000) {
            let tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempoEspera * 1000 - Date.now()) / 1000));
            return conn.reply(m.chat, 
                `${emoji3} Ya has iniciado una apuesta recientemente, espera *⏱️ ${tiempoRestante}* para apostar nuevamente`, 
                m, 
                global.miku
            );
        }
        
        cooldowns[m.sender] = Date.now();
        
       
        count = count ? /all/i.test(count) ? Math.floor(user.coin / buatall) : parseInt(count) : args[0] ? parseInt(args[0]) : 1;
        count = Math.max(1, count);

       
        if (args.length < 1) {
            return conn.reply(m.chat, 
                `${emoji} Ingresa la cantidad de 💸 *${moneda}* que deseas apostar contra *${botname}*\n\n` +
                '`Ejemplo:`\n' +
                `> *${usedPrefix + command}* 100`,
                m
            );
        }

      
        if (user.coin < count) {
            return conn.reply(
                m.chat, 
                `No tienes suficientes *${moneda}* para apostar *${formatNumber(count)}*`,
                m,
                global.miku
            );
        }

        
        user.coin -= count;

        
        if (Aku > Kamu) {
            
            conn.reply(m.chat, 
                `${emoji2} *¡Veamos qué números tienen!*\n\n` +
                `➠ *${botname}*: ${Aku}\n` +
                `➠ *${username}*: ${Kamu}\n\n` +
                `> ${username}, *PERDISTE* ${formatNumber(count)} ${moneda}.`,
                m,
                global.miku
            );
        } else if (Aku < Kamu) {
            
            const premio = count * 2;
            user.coin += premio;
            conn.reply(m.chat, 
                `${emoji2} *¡Veamos qué números tienen!*\n\n` +
                `➠ *${botname}*: ${Aku}\n` +
                `➠ *${username}*: ${Kamu}\n\n` +
                `> ${username}, *¡GANASTE* ${formatNumber(premio)} ${moneda}!`,
                m,
                global.miku
            );
        } else {
            
            user.coin += count;
            conn.reply(m.chat, 
                `${emoji2} *¡Veamos qué números tienen!*\n\n` +
                `➠ *${botname}*: ${Aku}\n` +
                `➠ *${username}*: ${Kamu}\n\n` +
                `> ${username}, *EMPATE* - Recuperas tu apuesta de ${formatNumber(count)} ${moneda}.`,
                m,
                global.miku
            );
        }
    } catch (error) {
        console.error('Error en el comando de casino:', error);
        conn.reply(m.chat, '❌ *Error*: Ha ocurrido un error al procesar tu apuesta.', m, global.miku);
    }
};

handler.help = ['apostar *<cantidad>*'];
handler.tags = ['economy'];
handler.command = ['apostar', 'casino'];
handler.group = true;
handler.register = true;

export default handler;

function segundosAHMS(segundos) {
    let segundosRestantes = segundos % 60;
    return `${segundosRestantes} segundos`;
}

function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

