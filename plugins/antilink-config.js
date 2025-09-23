// 🔧 Comando para probar y configurar antilink
let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos')
  if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando')
  
  const chat = global.db.data.chats[m.chat]
  
  if (args[0] === 'test') {
    // 🧪 Modo prueba - mostrar información de configuración
    let status = `🔗 *ESTADO DEL ANTILINK*\n\n`
    status += `📊 *Configuración actual:*\n`
    status += `• antiLink (grupos/canales): ${chat.antiLink ? '✅ Activado' : '❌ Desactivado'}\n`
    status += `• antiLink2 (todos): ${chat.antiLink2 ? '✅ Activado' : '❌ Desactivado'}\n\n`
    status += `🤖 *Permisos del bot:*\n`
    status += `• Es administrador: ${isBotAdmin ? '✅ Sí' : '❌ No'}\n\n`
    status += `👤 *Tu estado:*\n`
    status += `• Eres administrador: ${isAdmin ? '✅ Sí' : '❌ No'}\n\n`
    
    if (!isBotAdmin) {
      status += `⚠️ *PROBLEMA DETECTADO:*\nEl bot NO es administrador del grupo.\nPara que antilink funcione, el bot debe ser administrador.\n\n`
    }
    
    status += `🧪 *Para probar:*\n`
    status += `• Envía un enlace de WhatsApp\n`
    status += `• Revisa los logs en consola\n\n`
    status += `⚙️ *Comandos:*\n`
    status += `• ${usedPrefix}antilink on - Activar antilink básico\n`
    status += `• ${usedPrefix}antilink2 on - Activar antilink completo\n`
    status += `• ${usedPrefix}antilink off - Desactivar todo`
    
    return m.reply(status)
  }
  
  if (args[0] === 'on') {
    chat.antiLink = true
    return m.reply('✅ Antilink básico (grupos/canales) activado')
  }
  
  if (args[0] === 'off') {
    chat.antiLink = false
    chat.antiLink2 = false
    return m.reply('❌ Antilink desactivado completamente')
  }
  
  // Mostrar ayuda por defecto
  return m.reply(`🔗 *ANTILINK CONFIGURACIÓN*\n\n*Uso:*\n• ${usedPrefix + command} on - Activar\n• ${usedPrefix + command} off - Desactivar\n• ${usedPrefix + command} test - Información de diagnóstico\n\n*Estado actual:*\n• Básico: ${chat.antiLink ? '✅' : '❌'}\n• Completo: ${chat.antiLink2 ? '✅' : '❌'}`)
}

handler.help = ['antilink']
handler.tags = ['group']
handler.command = /^antilink$/i
handler.group = true
handler.admin = true

export default handler