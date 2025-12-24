import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('./src/database/casados.json');
let proposals = {};


function loadMarriages() {
    if (fs.existsSync(marriagesFile)) {
        const data = fs.readFileSync(marriagesFile, 'utf-8');
        return JSON.parse(data);
    } else {
        return {};
    }
}


function saveMarriages(data) {
    fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));
}


function isHATSUNE_MIKU() {
    try {
        const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
        if (pkg.name !== 'HATSUNE_MIKU') return false;
        if (pkg.repository.url !== 'git+https://github.com/Brauliovh3/HATSUNE_MIKU.git') return false;
        return true;
    } catch (e) {
        console.error('💙 Error al leer package.json:', e);
        return false;
    }
}

let marriages = loadMarriages();

let handler = async (m, { conn, command, usedPrefix, args }) => {
    // Comentamos la verificación para que el comando funcione
    // if (!isHATSUNE_MIKU()) {
    //     await m.reply('💙 Comando no disponible por el momento. Espera a Miku~');
    //     return;
    // }

    // Verificar que global.db y global.db.users existen
    if (!global.db) {
        global.db = {};
    }
    if (!global.db.users) {
        global.db.users = {};
    }

    const isMarry = /^(marry|casarse|boda)$/i.test(command);
    const isDivorce = /^(divorce|divorciarse)$/i.test(command);

    async function handleError(e) {
        await m.reply('💙 Ocurrió un error, Miku lo solucionará pronto.');
        console.log(e);
    }

    switch (true) {
        case isMarry: {
            try {
                
                if (!global.db.users[m.sender]) {
                    global.db.users[m.sender] = {
                        age: 18, 
                        partner: ''
                    };
                }
                
                let senderData = global.db.users[m.sender];
                if (senderData && senderData.age < 18) {
                    await m.reply('💙 Debes ser mayor de 18 años para casarte. ¡Miku cuida de ti!');
                    return;
                }
                let sender = m.sender;

           
            if (marriages[sender]) {
                await conn.reply(
                    m.chat,
                    `💙 Ya estás casado/a con *@${marriages[sender].split('@')[0]}*\n> Si quieres terminar el matrimonio, usa *#divorce*`,
                    m,
                    { mentions: [marriages[sender]] }
                );
                return;
            }

            
            
            // Procesar propuesta o aceptación.
            // Si se menciona a alguien: puede ser propuesta (sender -> to) o aceptación (to fue quien propuso previamente)
            let to = (m.mentionedJid && m.mentionedJid.length) ? m.mentionedJid[0] : null

            if (to && marriages[to]) {
                await conn.reply(
                    m.chat,
                    `💙 @${to.split('@')[0]} ya está casado/a con: *@${marriages[to].split('@')[0]}*. ¡Busca a tu Miku ideal!`,
                    m,
                    { mentions: [to, marriages[to]] }
                );
                return;
            }

            if (to && sender === to) {
                await m.reply('💙 ¡No puedes casarte contigo mismo! Miku te anima a buscar tu pareja.');
                return;
            }
            
            if (to) {
                
                if (proposals[to] && proposals[to] === sender) {
                    
                    delete proposals[to]
                    console.log('rg-marry: proposal accepted and removed for', to)
                    let senderName = conn.getName(sender)
                    let toName = conn.getName(to)

                    if (!global.db.users[sender]) global.db.users[sender] = { age: 18, partner: '' }
                    if (!global.db.users[to]) global.db.users[to] = { age: 18, partner: '' }

                    marriages[sender] = to
                    marriages[to] = sender
                    saveMarriages(marriages)

                    try {
                        const gifUrl = 'https://media.tenor.com/epaiybggZBQAAAPo/tonikaku-kawaii-kawaii-anime.mp4'
                        const gifMessage = {
                            video: { url: gifUrl },
                            gifPlayback: true,
                            caption: `💍 ¡Felicidades @${sender.split('@')[0]} y @${to.split('@')[0]}! Se han casado 💙`,
                            mentions: [sender, to]
                        }
                        await conn.sendMessage(m.chat, gifMessage, { quoted: m })
                    } catch (e) {
                        console.error('Error sending marriage GIF:', e)
                    }

                    global.db.users[sender].partner = toName
                    global.db.users[to].partner = senderName

                    await conn.reply(
                        m.chat,
                        `💙 ｡･:*:･ﾟ💍,｡･:*:･ﾟ💍\n¡Felicidades! Se han casado 💙\n\n*•.¸💙 Esposo/a @${sender.split('@')[0]} 💙•.¸*\n*•.¸💙 Esposo/a @${to.split('@')[0]} 💙•.¸*\n\n\`¡Disfruten de su luna de miel con Miku~!\`\n\n｡･:*:･ﾟ💍,｡･:*:･ﾟ💍`,
                        m,
                        { mentions: [sender, to] }
                    )
                    return
                }

                
                if (proposals[sender] && proposals[sender] === to) {
                    await conn.reply(m.chat, `💙 Ya le has propuesto matrimonio a @${to.split('@')[0]}. Espera su respuesta.`, m, { mentions: [to] })
                    return
                }

                
                proposals[sender] = to
                console.log('rg-marry: new proposal', sender, '=>', to)
                let proposalJid = to
                await conn.reply(
                    m.chat,
                    `💙 @${proposalJid.split('@')[0]}, @${sender.split('@')[0]} te ha propuesto matrimonio~\n¿Aceptas ser su Miku? 💙\n> Para aceptar, responde: *${usedPrefix}${command} @${sender.split('@')[0]}*`,
                    m,
                    { mentions: [sender, proposalJid] }
                )
                return
            }

            
            const proposer = Object.keys(proposals).find(p => proposals[p] === sender)
            if (proposer) {
                const toAccept = proposer
                delete proposals[toAccept]
                console.log('rg-marry: auto-accept proposal from', toAccept)
                let senderName = conn.getName(sender)
                let toName = conn.getName(toAccept)

                if (!global.db.users[sender]) global.db.users[sender] = { age: 18, partner: '' }
                if (!global.db.users[toAccept]) global.db.users[toAccept] = { age: 18, partner: '' }

                marriages[sender] = toAccept
                marriages[toAccept] = sender
                saveMarriages(marriages)

                try {
                    const gifUrl = 'https://media.tenor.com/epaiybggZBQAAAPo/tonikaku-kawaii-kawaii-anime.mp4'
                    const gifMessage = {
                        video: { url: gifUrl },
                        gifPlayback: true,
                        caption: `💍 ¡Felicidades @${sender.split('@')[0]} y @${toAccept.split('@')[0]}! Se han casado 💙`,
                        mentions: [sender, toAccept]
                    }
                    await conn.sendMessage(m.chat, gifMessage, { quoted: m })
                } catch (e) {
                    console.error('Error sending marriage GIF:', e)
                }

                global.db.users[sender].partner = toName
                global.db.users[toAccept].partner = senderName

                await conn.reply(
                    m.chat,
                    `💙 ｡･:*:･ﾟ💍,｡･:*:･ﾟ💍\n¡Felicidades! Se han casado 💙\n\n*•.¸💙 Esposo/a @${sender.split('@')[0]} 💙•.¸*\n*•.¸💙 Esposo/a @${toAccept.split('@')[0]} 💙•.¸*\n\n\`¡Disfruten de su luna de miel con Miku~!\`\n\n｡･:*:･ﾟ💍,｡･:*:･ﾟ💍`,
                    m,
                    { mentions: [sender, toAccept] }
                )
                return
            }

           
            await conn.reply(m.chat, `💔 No hay ninguna propuesta pendiente hacia ti.`, m)
           break;
           } catch (error) {
               console.error('💙 Error en comando marry:', error);
               await m.reply('💙 Ocurrió un error, Miku lo solucionará pronto.');
           }
       }

       case isDivorce: {
           try {
               let sender = m.sender;
               
               
               if (!global.db.users[sender]) {
                   global.db.users[sender] = { age: 18, partner: '' };
               }
               
               if (!marriages[sender]) {
                   await conn.reply(m.chat, '💙 No estás casado/a con nadie. ¡Miku está aquí para animarte!', m);
                   return;
               }
               let partner = marriages[sender];
               
               
               if (!global.db.users[partner]) {
                   global.db.users[partner] = { age: 18, partner: '' };
               }
               
               delete marriages[sender];
               delete marriages[partner];
               saveMarriages(marriages);

               let senderName = conn.getName(sender);
               let partnerName = conn.getName(partner);

               global.db.users[sender].partner = '';
               global.db.users[partner].partner = '';

               await conn.reply(
                   m.chat,
                   `💙 @${sender.split('@')[0]} y @${partner.split('@')[0]} han terminado su matrimonio.\n¡Ánimo! Miku siempre te apoyará 💙`,
                   m,
                   { mentions: [sender, partner] }
               );
           } catch (error) {
               console.error('💙 Error en comando divorce:', error);
               await m.reply('💙 Ocurrió un error, Miku lo solucionará pronto.');
           }
           break;
       }
   }
};

handler.tags = ['miku', '💙'];
handler.command = ['marry', 'casarse', 'boda', 'divorce', 'divorciarse'];
handler.help = [
    '💙 marry *@usuario*',
    '💙 divorce'
];
handler.group = true;
handler.register = true;

export default handler;

