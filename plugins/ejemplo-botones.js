// 🔥 EJEMPLO COMPLETO DE BOTONES INTERACTIVOS PARA WHATSAPP 🔥
// ✅ Actualizado para usar nativeFlowMessage (Baileys moderno)

const handler = async (m, { conn, usedPrefix, command, args }) => {
  
  // EJEMPLO 1: BOTONES BÁSICOS DE RESPUESTA RÁPIDA
  if (command === 'botones1') {
    const buttons = [
      ['🟢 Opción 1', 'btn_opcion1'],
      ['🔵 Opción 2', 'btn_opcion2'],
      ['🟡 Opción 3', 'btn_opcion3']
    ]

    const text = '💙 *Selecciona una opción:*\n\nEste es un ejemplo de botones básicos de respuesta rápida.'
    const footer = '🌱 Hatsune Miku Bot'

    return conn.sendNCarousel(m.chat, text, footer, null, buttons, null, null, null, m)
  }

  // EJEMPLO 2: BOTONES CON IMAGEN
  if (command === 'botones2') {
    const buttons = [
      ['ℹ️ Información', 'btn_info'],
      ['❓ Ayuda', 'btn_ayuda'],
      ['📞 Contacto', 'btn_contacto']
    ]

    const text = '🖼️ *Botones con imagen*\n\nSelecciona una opción del menú:'
    const footer = '🌱 Powered by Miku'
    const image = 'https://i.imgur.com/VIkbTqR.jpeg' // Imagen de Miku

    return conn.sendNCarousel(m.chat, text, footer, image, buttons, null, null, null, m)
  }

  // EJEMPLO 3: LISTA INTERACTIVA (DROPDOWN)
  if (command === 'lista') {
    const sections = [
      [
        '🎵 Música',
        [
          ['🎧 Descargar Audio', 'list_audio', 'Descargar música en formato MP3'],
          ['🎬 Descargar Video', 'list_video', 'Descargar video en formato MP4']
        ]
      ],
      [
        '🛠️ Herramientas',
        [
          ['🔧 Configurar Grupo', 'list_config', 'Configurar funciones del grupo'],
          ['📊 Estadísticas', 'list_stats', 'Ver estadísticas del bot']
        ]
      ]
    ]

    const text = '📋 *MENÚ PRINCIPAL*\n\nSelecciona una categoría del menú desplegable:'
    const footer = '🌱 Hatsune Miku Bot'
    const title = 'Lista Interactiva'
    const buttonText = '📝 Ver Opciones'

    return conn.sendList(m.chat, title, text, footer, buttonText, null, sections, m)
  }

  // EJEMPLO 4: BOTONES CON COMANDOS PERSONALIZADOS (MENÚ PRINCIPAL)
  if (command === 'menuprincipal') {
    const buttons = [
      ['🎵 Música', `${usedPrefix}menu musica`],
      ['🛠️ Tools', `${usedPrefix}menu herramientas`],
      ['🎮 Juegos', `${usedPrefix}menu juegos`],
      ['ℹ️ Info Bot', `${usedPrefix}info`]
    ]

    const text = '🤖 *MENÚ PRINCIPAL DE MIKU BOT*\n\n' +
          '> Selecciona una categoría para explorar los comandos disponibles.\n\n' +
          '💙 *Funciones disponibles:*\n' +
          '• Descarga de música y videos\n' +
          '• Herramientas útiles\n' +
          '• Juegos interactivos\n' +
          '• Información del bot'
    
    const footer = '🌱 Bot creado con ❤️'

    return conn.sendNCarousel(m.chat, text, footer, null, buttons, null, null, null, m)
  }

  // EJEMPLO 5: RESPUESTA A BOTONES PRESIONADOS
  if (m.text && m.text.startsWith('btn_')) {
    const buttonId = m.text

    switch (buttonId) {
      case 'btn_opcion1':
        return m.reply('✅ Has seleccionado la *Opción 1*\n\n🎯 Ejecutando acción correspondiente...')
        
      case 'btn_opcion2':
        return m.reply('🔵 Has seleccionado la *Opción 2*\n\n⚡ Procesando tu solicitud...')
        
      case 'btn_opcion3':
        return m.reply('🟡 Has seleccionado la *Opción 3*\n\n🚀 Iniciando proceso...')
        
      case 'btn_info':
        return m.reply('ℹ️ *INFORMACIÓN DEL BOT*\n\n' +
                      '🤖 Nombre: Hatsune Miku Bot\n' +
                      '📅 Versión: 3.0\n' +
                      '💙 Desarrollador: Tu nombre\n' +
                      '🌱 Estado: Online')
        
      case 'btn_ayuda':
        return m.reply('❓ *CENTRO DE AYUDA*\n\n' +
                      '📖 Usa los comandos:\n' +
                      '• `.menu` - Ver menú principal\n' +
                      '• `.help` - Lista de comandos\n' +
                      '• `.info` - Información del bot')
        
      case 'btn_contacto':
        return m.reply('📞 *CONTACTO*\n\n' +
                      '💬 WhatsApp: +1234567890\n' +
                      '📧 Email: contact@miku.bot\n' +
                      '🌐 Web: www.mikubot.com')
    }
  }

  // RESPUESTA A LISTAS INTERACTIVAS
  if (m.text && m.text.startsWith('list_')) {
    const listId = m.text

    switch (listId) {
      case 'list_audio':
        return m.reply('🎧 *DESCARGA DE AUDIO*\n\n' +
                      `Usa: \`${usedPrefix}play [nombre de la canción]\`\n\n` +
                      'Ejemplo: `.play Despacito`')
        
      case 'list_video':
        return m.reply('🎬 *DESCARGA DE VIDEO*\n\n' +
                      `Usa: \`${usedPrefix}video [nombre del video]\`\n\n` +
                      'Ejemplo: `.video Despacito`')
        
      case 'list_config':
        return m.reply('🔧 *CONFIGURACIÓN DEL GRUPO*\n\n' +
                      '> Funciones disponibles:\n' +
                      '• `.enable antilink` - Activar anti-enlaces\n' +
                      '• `.enable welcome` - Activar bienvenidas\n' +
                      '• `.enable antiarabes` - Activar anti-spam')
        
      case 'list_stats':
        return m.reply('📊 *ESTADÍSTICAS DEL BOT*\n\n' +
                      '👥 Usuarios activos: 1,234\n' +
                      '🏘️ Grupos activos: 56\n' +
                      '⚡ Comandos ejecutados: 9,876\n' +
                      '🕒 Uptime: 24h 30m')
    }
  }

  // RESPUESTA A BOTONES DINÁMICOS
  if (m.text && m.text.startsWith('dynamic_')) {
    const buttonId = m.text
    switch (buttonId) {
      case 'dynamic_1':
        return m.reply('🚀 *Acción 1 ejecutada!*\n\n✨ Has presionado el botón dinámico 1')
      case 'dynamic_2':
        return m.reply('⚡ *Acción 2 ejecutada!*\n\n🎯 Has presionado el botón dinámico 2')
      case 'dynamic_3':
        return m.reply('🎯 *Acción 3 ejecutada!*\n\n💥 Has presionado el botón dinámico 3')
    }
  }

  // EJEMPLO DE USO DE LAS FUNCIONES AUXILIARES
  if (command === 'ejemplo_dinamico') {
    const dynamicButtons = [
      ['🚀 Acción 1', 'dynamic_1'],
      ['⚡ Acción 2', 'dynamic_2'],
      ['🎯 Acción 3', 'dynamic_3']
    ]

    const text = '🔥 BOTONES DINÁMICOS\n\nEstos botones se crearon usando una función auxiliar reutilizable.'
    const footer = '💙 Footer personalizado'

    return conn.sendNCarousel(m.chat, text, footer, null, dynamicButtons, null, null, null, m)
  }
}

// EJEMPLO AVANZADO: FUNCIÓN PARA CREAR BOTONES DINÁMICOS
export const createInteractiveButtons = (title, description, buttons, footer = '🌱 Hatsune Miku Bot') => {
  return buttons.map(btn => [btn.text || btn[0], btn.id || btn[1]])
}

// EJEMPLO AVANZADO: FUNCIÓN PARA CREAR LISTAS DINÁMICAS  
export const createInteractiveList = (title, description, sections, buttonText = '📝 Ver Opciones') => {
  return sections.map(section => [
    section.title,
    section.rows.map(row => [row.title, row.rowId, row.description])
  ])
}

handler.help = ['botones1', 'botones2', 'lista', 'menuprincipal', 'ejemplo_dinamico']
handler.tags = ['examples', 'buttons']
handler.command = /^(botones1|botones2|lista|menuprincipal|ejemplo_dinamico)$/i

export default handler

/* 
📋 TIPOS DE BOTONES DISPONIBLES:

1. BOTONES BÁSICOS (sendNCarousel):
   - Formato: [['Texto', 'id'], ['Texto2', 'id2']]
   - Respuesta inmediata al presionar

2. BOTONES CON IMAGEN (sendNCarousel):
   - Incluye imagen como buffer/URL
   - Mismo formato de botones

3. LISTAS INTERACTIVAS (sendList):
   - Formato: [['Título', [['Opción', 'id', 'descripción']]]]
   - Menú desplegable con categorías

4. BOTONES DE COMANDO:
   - Ejecutan comandos directamente
   - Útil para navegación

5. BOTONES DINÁMICOS:
   - Creados con funciones auxiliares
   - Reutilizables y personalizables

🔧 MÉTODOS IMPORTANTES:

conn.sendNCarousel(jid, text, footer, buffer, buttons, copy, urls, list, quoted)
- jid: Chat ID
- text: Mensaje principal
- footer: Texto inferior
- buffer: Imagen/video (opcional)
- buttons: Array de botones [['texto', 'id']]

conn.sendList(jid, title, text, footer, buttonText, buffer, sections, quoted)
- sections: [['Título', [['opción', 'id', 'descripción']]]]

🎯 MEJORES PRÁCTICAS:

- Usar IDs descriptivos para los botones
- Mantener texto de botones corto
- Organizar listas en secciones lógicas
- Incluir descripciones claras
- Manejar todas las respuestas posibles

⚠️ IMPORTANTE:
Este archivo usa nativeFlowMessage, compatible con versiones modernas de Baileys.
Los métodos antiguos (sendMessage con buttons) ya no funcionan.
*/