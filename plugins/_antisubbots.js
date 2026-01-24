import { areJidsSameUser } from '@whiskeysockets/baileys'
export async function before(m, { participants, conn }) {
    if (m.isGroup) {
        let chat = global.getChat ? global.getChat(m.chat) : global.db.data.chats[m.chat];

         if (!chat || !chat.antiBot2) {
            return true
        }


        let botJid = global.conn.user.jid 

       if (botJid === conn.user.jid) {
           return true
        } else {
           let isBotPresent = participants.some(p => areJidsSameUser(botJid, p.id))

          if (isBotPresent) {
                setTimeout(async () => {
                    await conn.reply(m.chat, `💙 En este grupo está el bot principal, el cual me saldré para no hacer spam.`, m)
                    await this.groupLeave(m.chat)
                }, 5000)
            }
        }
    }
}

