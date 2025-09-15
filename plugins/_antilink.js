const genericLinkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([^\s]+\.[a-z]{2,})/i 
const whatsappGroupRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const whatsappChannelRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]+)/i
const customLinks = [
  /carmecita\.by/i, 
]

export async function before(m, { conn, isAdmin, isBotAdmin }) {
  if (!m || !m.text) return
  if (m.isBaileys && m.fromMe) return !0
  if (!m.isGroup) return !1
  if (!isBotAdmin) return

  let chat = global.db?.data?.chats?.[m.chat]
  if (!chat || !chat.antiLink) return !0

  
  const foundGenericLink = m.text.match(genericLinkRegex)
  const foundGroupLink = m.text.match(whatsappGroupRegex)
  const foundChannelLink = m.text.match(whatsappChannelRegex)
  const foundCustomLink = customLinks.some((regex) => regex.test(m.text))

  
  if ((foundGenericLink || foundGroupLink || foundChannelLink || foundCustomLink) && !isAdmin) {
    
    if (foundGroupLink && isBotAdmin) {
      try {
        const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (m.text.includes(linkThisGroup)) return !0
      } catch (error) {
        console.error("[ERROR] No se pudo obtener el código del grupo:", error)
      }
    }

    
    await conn.reply(m.chat,
      `💙 ¡Ara ara! @${m.sender.split`@`[0]} ha sido expulsado del escenario virtual por enviar enlaces prohibidos! 💙🎤\n\n🎵 ¡En el mundo de Miku no permitimos enlaces de ningún tipo!`,
      m, { mentions: [m.sender] }
    )

    
    if (isBotAdmin) {
      try {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        console.log(`Usuario ${m.sender} eliminado del grupo ${m.chat}`)
      } catch (error) {
        console.error("No se pudo eliminar el mensaje o expulsar al usuario:", error)
      }
    }
  }
  return !0
}
