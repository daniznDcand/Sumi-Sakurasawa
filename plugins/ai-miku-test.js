// Test simple para Miku AI
console.log('🎵 AI-MIKU-TEST: Plugin de prueba cargado')

let handler = async (m, { conn, text, isOwner }) => {
  console.log(`🔍 TEST: Mensaje recibido: "${m?.text || 'undefined'}"`)
  
  if (!m || !m.text) {
    return
  }
  
  if (m.text.toLowerCase().includes('miku')) {
    console.log(`🎉 TEST: ¡DETECTÉ MIKU!`)
    
    try {
      await conn.reply(m.chat, 
        "🎵 *¡TEST EXITOSO!* 🎤\n\n¡Hola! Soy Hatsune Miku (versión test) 💙✨", m)
      console.log(`✅ TEST: Respuesta enviada`)
    } catch (error) {
      console.error('❌ TEST: Error:', error)
    }
  }
}

handler.all = true
handler.priority = -1 // Prioridad muy alta

export default handler
