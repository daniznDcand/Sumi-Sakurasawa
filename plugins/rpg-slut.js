const emoji = '💋';
const emoji2 = '💸';
const emoji3 = '⏱️';
const moneda = '💵';

let cooldowns = {};

function segundosAHMS(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas > 0 ? `${horas}h ` : ''}${minutos > 0 ? `${minutos}m ` : ''}${segs}s`;
}

let handler = async (m, { conn }) => {
    try {
        if (!global.db.data) global.db.data = { users: {} };
        if (!global.db.data.users) global.db.data.users = {};
        
        const user = global.db.data.users[m.sender] || { coin: 0 };
        global.db.data.users[m.sender] = user;
        
        if (!user.name) {
            user.name = conn.getName(m.sender);
        }
        
        const tiempo = 5 * 60;
        const now = Date.now();
        
        if (cooldowns[m.sender] && now - cooldowns[m.sender] < tiempo * 1000) {
            const tiempoRestante = segundosAHMS(Math.ceil((cooldowns[m.sender] + tiempo * 1000 - now) / 1000));
            return conn.reply(m.chat, 
                `${emoji3} Debes esperar *${tiempoRestante}* para usar este comando.`,
                m,
                global.miku
            );
        }
        
        cooldowns[m.sender] = now;
        const users = global.db.data.users;
        const userList = Object.keys(users).filter(id => id !== m.sender);
        
        if (userList.length === 0) {
            return conn.reply(m.chat, 
                '❌ No hay suficientes usuarios para interactuar.',
                m,
                global.miku
            );
        }
        
        const randomUserId = userList[Math.floor(Math.random() * userList.length)];
        const randomUser = users[randomUserId];
        const amount = Math.floor(Math.random() * 36) + 15; // 15-50
        
        const options = [
            {
                message: `¡Se la chupaste a @${randomUserId.split("@")[0]} por *${amount} ${moneda}* lo dejaste bien seco`,
                coins: amount,
                mentioned: true
            },
            {
                message: `No fuiste cuidadoso y le rompiste la verga a tu cliente, se te restaron *-${amount} ${moneda}*`,
                coins: -amount,
                mentioned: false
            },
            {
                message: `Le diste unos sentones y te pagaron *${amount} ${moneda}* de @${randomUserId.split("@")[0]} lo dejaste paralitico`,
                coins: amount,
                mentioned: true
            }
        ];
        
        const selected = options[Math.floor(Math.random() * options.length)];
        
        if (selected.coins > 0) {
            user.coin = (user.coin || 0) + selected.coins;
            randomUser.coin = Math.max(0, (randomUser.coin || 0) - selected.coins);
        } else {
            user.coin = Math.max(0, (user.coin || 0) + selected.coins);
        }
        
        const replyOptions = selected.mentioned 
            ? { contextInfo: { mentionedJid: [randomUserId] } } 
            : {};
            
        await conn.reply(m.chat, 
            `${emoji} ${selected.message}\n\n${selected.coins > 0 ? 'Se suman' : 'Se restan'} *${Math.abs(selected.coins)} ${moneda}* a ${user.name}.`,
            m,
            { ...replyOptions, ...global.miku }
        );
        
        if (typeof global.saveDB === 'function') {
            await global.saveDB();
        }
        
    } catch (error) {
        console.error('Error en el comando slut:', error);
        return conn.reply(m.chat, 
            '❌ Ocurrió un error al procesar el comando. Por favor, inténtalo de nuevo.',
            m,
            global.miku
        );
    }
};

handler.help = ['slut'];
handler.tags = ['rpg'];
handler.command = ['slut', 'prostituirse'];
handler.group = true;
handler.register = true;

export default handler;
let horas = Math.floor(segundos / 3600)
let minutos = Math.floor((segundos % 3600) / 60)
let segundosRestantes = segundos % 60
return `${minutos} minutos y ${segundosRestantes} segundos`

