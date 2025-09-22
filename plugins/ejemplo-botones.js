// 🔥 EJEMPLO COMPLETO DE BOTONES INTERACTIVOS PARA WHATSAPP 🔥

const handler = async (m, { conn, usedPrefix, command, args }) => {
  
  // EJEMPLO 1: BOTONES BÁSICOS DE RESPUESTA RÁPIDA
  if (command === 'botones1') {
    const buttons = [
      {
        buttonId: 'btn_opcion1',
        buttonText: { displayText: '🟢 Opción 1' },
        type: 1
      },
      {
        buttonId: 'btn_opcion2', 
        buttonText: { displayText: '🔵 Opción 2' },
        type: 1
      },
      {
        buttonId: 'btn_opcion3',
        buttonText: { displayText: '🟡 Opción 3' },
        type: 1
      }
    ]

    const buttonMessage = {
      text: '💙 *Selecciona una opción:*\n\nEste es un ejemplo de botones básicos de respuesta rápida.',
      footer: '🌱 Hatsune Miku Bot',
      buttons: buttons,
      headerType: 1
    }

    return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }

  // EJEMPLO 2: BOTONES CON IMAGEN
  if (command === 'botones2') {
    const buttons = [
      {
        buttonId: 'btn_info',
        buttonText: { displayText: 'ℹ️ Información' },
        type: 1
      },
      {
        buttonId: 'btn_ayuda',
        buttonText: { displayText: '❓ Ayuda' },
        type: 1
      },
      {
        buttonId: 'btn_contacto',
        buttonText: { displayText: '📞 Contacto' },
        type: 1
      }
    ]

    const buttonMessage = {
      image: { url: 'https://i.imgur.com/your-image.jpg' }, // Cambia por tu imagen
      caption: '🖼️ *Botones con imagen*\n\nSelecciona una opción del menú:',
      footer: '🌱 Powered by Miku',
      buttons: buttons,
      headerType: 4 // 4 = imagen
    }

    return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }

  // EJEMPLO 3: LISTA INTERACTIVA (DROPDOWN)
  if (command === 'lista') {
    const sections = [
      {
        title: '🎵 Música',
        rows: [
          {
            title: '🎧 Descargar Audio',
            description: 'Descargar música en formato MP3',
            rowId: 'list_audio'
          },
          {
            title: '🎬 Descargar Video',
            description: 'Descargar video en formato MP4', 
            rowId: 'list_video'
          }
        ]
      },
      {
        title: '🛠️ Herramientas',
        rows: [
          {
            title: '🔧 Configurar Grupo',
            description: 'Configurar funciones del grupo',
            rowId: 'list_config'
          },
          {
            title: '📊 Estadísticas',
            description: 'Ver estadísticas del bot',
            rowId: 'list_stats'
          }
        ]
      }
    ]

    const listMessage = {
      text: '📋 *MENÚ PRINCIPAL*\n\nSelecciona una categoría del menú desplegable:',
      footer: '🌱 Hatsune Miku Bot',
      title: 'Lista Interactiva',
      buttonText: '📝 Ver Opciones',
      sections
    }

    return conn.sendMessage(m.chat, listMessage, { quoted: m })
  }

  // EJEMPLO 4: BOTONES CON COMANDOS PERSONALIZADOS
  if (command === 'menuprincipal') {
    const buttons = [
      {
        buttonId: `${usedPrefix}menu musica`,
        buttonText: { displayText: '🎵 Música' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}menu herramientas`, 
        buttonText: { displayText: '🛠️ Tools' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}menu juegos`,
        buttonText: { displayText: '🎮 Juegos' },
        type: 1
      },
      {
        buttonId: `${usedPrefix}info`,
        buttonText: { displayText: 'ℹ️ Info Bot' },
        type: 1
      }
    ]

    const buttonMessage = {
      text: '🤖 *MENÚ PRINCIPAL DE MIKU BOT*\n\n' +
            '> Selecciona una categoría para explorar los comandos disponibles.\n\n' +
            '💙 *Funciones disponibles:*\n' +
            '• Descarga de música y videos\n' +
            '• Herramientas útiles\n' +
            '• Juegos interactivos\n' +
            '• Información del bot',
      footer: '🌱 Bot creado con ❤️',
      buttons: buttons,
      headerType: 1
    }

    return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
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

  // EJEMPLO DE USO DE LAS FUNCIONES AUXILIARES
  if (command === 'ejemplo_dinamico') {
    const dynamicButtons = [
      { id: 'dynamic_1', text: '🚀 Acción 1' },
      { id: 'dynamic_2', text: '⚡ Acción 2' },
      { id: 'dynamic_3', text: '🎯 Acción 3' }
    ]

    const buttonMsg = createInteractiveButtons(
      '🔥 BOTONES DINÁMICOS',
      'Estos botones se crearon usando una función auxiliar reutilizable.',
      dynamicButtons,
      '💙 Footer personalizado'
    )

    return conn.sendMessage(m.chat, buttonMsg, { quoted: m })
  }
}

// EJEMPLO AVANZADO: FUNCIÓN PARA CREAR BOTONES DINÁMICOS
export const createInteractiveButtons = (title, description, buttons, footer = '🌱 Hatsune Miku Bot') => {
  return {
    text: `${title}\n\n${description}`,
    footer: footer,
    buttons: buttons.map((btn, index) => ({
      buttonId: btn.id || `btn_${index}`,
      buttonText: { displayText: btn.text },
      type: 1
    })),
    headerType: 1
  }
}

// EJEMPLO AVANZADO: FUNCIÓN PARA CREAR LISTAS DINÁMICAS  
export const createInteractiveList = (title, description, sections, buttonText = '📝 Ver Opciones') => {
  return {
    text: `${title}\n\n${description}`,
    footer: '🌱 Hatsune Miku Bot',
    title: title,
    buttonText: buttonText,
    sections: sections
  }
}

handler.help = ['botones1', 'botones2', 'lista', 'menuprincipal', 'ejemplo_dinamico']
handler.tags = ['examples', 'buttons']
handler.command = /^(botones1|botones2|lista|menuprincipal|ejemplo_dinamico)$/i

export default handler

/* 
📋 TIPOS DE BOTONES DISPONIBLES:

1. BOTONES BÁSICOS:
   - Texto simple con ID personalizado
   - Respuesta inmediata al presionar

2. BOTONES CON IMAGEN:
   - Incluye imagen en el header
   - headerType: 4 para imagen

3. LISTAS INTERACTIVAS:
   - Menú desplegable con categorías
   - Múltiples opciones organizadas

4. BOTONES DE COMANDO:
   - Ejecutan comandos directamente
   - Útil para navegación

5. BOTONES DINÁMICOS:
   - Creados con funciones auxiliares
   - Reutilizables y personalizables

🔧 PARÁMETROS IMPORTANTES:

buttonId: ID único para identificar el botón
buttonText.displayText: Texto que aparece en el botón
type: 1 (botón normal)
headerType: 1 (texto), 4 (imagen), 6 (video)
footer: Texto inferior del mensaje
sections: Array de secciones para listas

🎯 MEJORES PRÁCTICAS:

- Usar IDs descriptivos para los botones
- Mantener texto de botones corto
- Organizar listas en secciones lógicas
- Incluir descripciones claras
- Manejar todas las respuestas posibles
*/