export async function before(m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;
  if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') || m.text.includes('serbot') || m.text.includes('jadibot')) return !0;
  const chat = global.getChat ? global.getChat(m.chat) : global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};
if (m.chat === '120363315369913363@newsletter') return !0
  if (bot.antiPrivate && !isOwner && !isROwner) {
    await m.reply(`${global.emoji} Hola @${m.sender.split`@`[0]}, mi creador ha desactivado los mensajes privados. Solo el owner puede contactarme en privado. Serás bloqueado automáticamente.\n\n📞 Si necesitas ayuda, únete al grupo principal:\n${global.gp1}`, false, {mentions: [m.sender]});
    await this.updateBlockStatus(m.chat, 'block');
    return !1;
  }
  return !1;
}

