import fs from 'fs'
import path from 'path'

const DB_DIR = path.resolve('./src/database')
const marriagesFile = path.join(DB_DIR, 'casados.json')
const proposalsFile = path.join(DB_DIR, 'proposals.json')

function ensureDbDir() {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
}

let handler

function loadJson(filePath) {
    try {
        ensureDbDir()
        if (!fs.existsSync(filePath)) return {}
        return JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}')
    } catch (e) {
        console.error('rg-marry loadJson error', e)
        return {}
    }
}

function saveJson(filePath, obj) {
    try {
        ensureDbDir()
        fs.writeFileSync(filePath, JSON.stringify(obj, null, 2))
    } catch (e) {
        console.error('rg-marry saveJson error', e)
    }
}

let marriages = loadJson(marriagesFile)
let proposals = loadJson(proposalsFile)

async function sendMarriageGif(conn, chat, sender, partner, quoted) {
    const mp4 = 'https://media.tenor.com/epaiybggZBQAAAPo/tonikaku-kawaii-kawaii-anime.mp4'
    const gif = 'https://media.tenor.com/epaiybggZBQAAAPo/tonikaku-kawaii-kawaii-anime.gif'
    try {
        const res = await fetch(mp4)
        if (!res.ok) throw new Error('download failed')
        const ab = await res.arrayBuffer()
        const buf = Buffer.from(ab)
        await conn.sendMessage(chat, { video: buf, gifPlayback: true, mimetype: 'video/mp4', caption: `💍 ¡Felicidades @${sender.split('@')[0]} y @${partner.split('@')[0]}! Se han casado 💙`, mentions: [sender, partner] }, { quoted })
    } catch (e) {
        try {
            await conn.sendMessage(chat, { video: { url: gif }, gifPlayback: true, caption: `💍 ¡Felicidades @${sender.split('@')[0]} y @${partner.split('@')[0]}! Se han casado 💙`, mentions: [sender, partner] }, { quoted })
        } catch (err) {
            console.error('rg-marry: failed sending gif fallback', err)
        }
    }
}

handler = async (m, { conn, command, usedPrefix }) => {
    try { console.log('rg-marry: invoked', { command, text: (m.text||'').slice(0,200) }) } catch {}
    try {
        const isMarry = /^(marry|casarse|boda)$/i.test(command)
        const isDivorce = /^(divorce|divorciarse)$/i.test(command)
        if (!isMarry && !isDivorce) return false

        const sender = m.sender
        if (!global.db) global.db = {}
        if (!global.db.users) global.db.users = {}
        if (!global.db.users[sender]) global.db.users[sender] = { age: 18, partner: '' }

       
        if (isDivorce) {
            if (!marriages[sender]) return await conn.reply(m.chat, '💙 No estás casado/a con nadie.', m)
            const partner = marriages[sender]
            delete marriages[sender]
            delete marriages[partner]
            saveJson(marriagesFile, marriages)
            if (global.db.users[sender]) global.db.users[sender].partner = ''
            if (global.db.users[partner]) global.db.users[partner].partner = ''
            return await conn.reply(m.chat, `💙 @${sender.split('@')[0]} y @${partner.split('@')[0]} han terminado su matrimonio.`, m, { mentions: [sender, partner] })
        }

        
        
        let mentioned = (m.mentionedJid && m.mentionedJid.length) ? m.mentionedJid[0] : null
        if (!mentioned) {
            if (m.quoted && m.quoted.sender) mentioned = m.quoted.sender
            else {
                try {
                    let text = (m.text || '').trim()
                    if (usedPrefix && text.startsWith(usedPrefix)) text = text.slice(usedPrefix.length).trim()
                    const parts = text.split(/\s+/)
                    const arg = parts.slice(1).join(' ').trim()
                    if (arg) {
                        
                        const digits = arg.replace(/\D/g, '')
                        if (digits.length >= 6) {
                            mentioned = `${digits}@s.whatsapp.net`
                        } else if (m.isGroup) {
                            const gm = await conn.groupMetadata(m.chat).catch(() => null)
                            if (gm && gm.participants) {
                                const match = gm.participants.find(p => ((p.jid || '') + (p.notify || '') + (p.name || '')).toLowerCase().includes(arg.toLowerCase()))
                                if (match) mentioned = match.jid
                            }
                        }
                    }
                } catch (e) {
                    console.error('rg-marry: error resolving target arg', e)
                }
            }
        }

        if (mentioned) {
            const target = mentioned
            if (target === sender) return await conn.reply(m.chat, '💙 No puedes casarte contigo mismo.', m)
            if (marriages[sender]) return await conn.reply(m.chat, `💙 Ya estás casado/a con @${marriages[sender].split('@')[0]}`, m, { mentions: [marriages[sender]] })
            if (marriages[target]) return await conn.reply(m.chat, `💙 @${target.split('@')[0]} ya está casado/a.`, m, { mentions: [target] })

            
            if (proposals[sender] && proposals[sender] === target) {
                delete proposals[sender]
                saveJson(proposalsFile, proposals)
                marriages[sender] = target
                marriages[target] = sender
                saveJson(marriagesFile, marriages)
                if (!global.db.users[target]) global.db.users[target] = { age: 18, partner: '' }
                if (!global.db.users[sender]) global.db.users[sender] = { age: 18, partner: '' }
                global.db.users[sender].partner = await conn.getName(target)
                global.db.users[target].partner = await conn.getName(sender)
                await sendMarriageGif(conn, m.chat, sender, target, m)
                return await conn.reply(m.chat, `💙 ¡Felicidades! Se han casado @${sender.split('@')[0]} y @${target.split('@')[0]}!`, m, { mentions: [sender, target] })
            }

           
            if (proposals[target] && proposals[target] === sender) {
                return await conn.reply(m.chat, `💙 Ya le has propuesto matrimonio a @${target.split('@')[0]}. Espera su respuesta.`, m, { mentions: [target] })
            }

           
            if (proposals[target] && proposals[target] !== sender) {
                const other = proposals[target]
                return await conn.reply(m.chat, `💙 @${target.split('@')[0]} ya tiene una propuesta pendiente de @${other.split('@')[0]}.`, m, { mentions: [target, other] })
            }

            
            proposals[target] = sender
            saveJson(proposalsFile, proposals)
            const buttons = [
                { buttonId: `marry_accept_${sender}`, buttonText: { displayText: 'Aceptar' }, type: 1 },
                { buttonId: `marry_reject_${sender}`, buttonText: { displayText: 'Rechazar' }, type: 1 }
            ]
            const text = `💙 @${target.split('@')[0]}, @${sender.split('@')[0]} te ha propuesto matrimonio~\nPresiona *Aceptar* o *Rechazar*.`
            await conn.sendMessage(m.chat, { text, footer: 'Propuesta de matrimonio', buttons, mentions: [target, sender] })
            return true
        }

        
        if (proposals[sender]) {
            const proposer = proposals[sender]
            delete proposals[sender]
            saveJson(proposalsFile, proposals)
            marriages[sender] = proposer
            marriages[proposer] = sender
            saveJson(marriagesFile, marriages)
            if (!global.db.users[proposer]) global.db.users[proposer] = { age: 18, partner: '' }
            if (!global.db.users[sender]) global.db.users[sender] = { age: 18, partner: '' }
            global.db.users[sender].partner = await conn.getName(proposer)
            global.db.users[proposer].partner = await conn.getName(sender)
            await sendMarriageGif(conn, m.chat, sender, proposer, m)
            return await conn.reply(m.chat, `💙 ¡Felicidades! Se han casado @${sender.split('@')[0]} y @${proposer.split('@')[0]}!`, m, { mentions: [sender, proposer] })
        }

        return await conn.reply(m.chat, '💔 No hay ninguna propuesta pendiente hacia ti.', m)
    } catch (e) {
        console.error('rg-marry handler error', e)
        try { await conn.reply(m.chat, '💙 Ocurrió un error al procesar el comando marry.', m) } catch {}
    }
}

handler.before = async function (m, { conn }) {
    if (!m.message) return false

    let buttonId = null
    if (m.message.templateButtonReplyMessage) buttonId = m.message.templateButtonReplyMessage.selectedId
    if (m.message.buttonsResponseMessage) buttonId = m.message.buttonsResponseMessage.selectedButtonId
    if (!buttonId) return false

    try {
        if (buttonId.startsWith('marry_accept_') || buttonId.startsWith('marry_reject_')) {
            const parts = buttonId.split('_')
            const action = parts[1]
            const proposer = parts.slice(2).join('_')
            const responder = m.sender

            if (!proposals[responder] || proposals[responder] !== proposer) {
                await conn.reply(m.chat, '💙 No hay una propuesta válida para ti de esa persona.', m)
                return true
            }

            if (action === 'accept') {
                delete proposals[responder]
                saveJson(proposalsFile, proposals)
                marriages[responder] = proposer
                marriages[proposer] = responder
                saveJson(marriagesFile, marriages)
                if (!global.db.users[proposer]) global.db.users[proposer] = { age: 18, partner: '' }
                if (!global.db.users[responder]) global.db.users[responder] = { age: 18, partner: '' }
                global.db.users[responder].partner = await conn.getName(proposer)
                global.db.users[proposer].partner = await conn.getName(responder)
                await sendMarriageGif(conn, m.chat, proposer, responder, m)
                await conn.reply(m.chat, `💙 ¡Felicidades! Se han casado @${proposer.split('@')[0]} y @${responder.split('@')[0]}!`, m, { mentions: [proposer, responder] })
                return true
            } else if (action === 'reject') {
                delete proposals[responder]
                saveJson(proposalsFile, proposals)
                await conn.reply(m.chat, `💔 @${responder.split('@')[0]} rechazó la propuesta de @${proposer.split('@')[0]}.`, m, { mentions: [responder, proposer] })
                return true
            }
        }
    } catch (e) {
        console.error('rg-marry before handler error', e)
        try { await conn.reply(m.chat, '💙 Ocurrió un error procesando el botón.', m) } catch {}
        return true
    }

    return false
}

handler.help = ['marry @user', 'divorce']
handler.tags = ['fun']
handler.command = /^(marry|casarse|boda|divorce|divorciarse)$/i
handler.group = true
handler.register = true

export default handler

