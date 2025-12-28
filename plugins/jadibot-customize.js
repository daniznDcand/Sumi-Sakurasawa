import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import { ensureSessionAssets, getSessionConfig, saveSessionConfig } from '../lib/subbot-utils.js'

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const isSub = this && this.isSubBot
    const who = isSub ? (this.user?.jid || '') : (m.sender || '')
    const sessionId = (who.split('@')[0])
    if (!sessionId) return m.reply('⚠️ No se pudo determinar la sesión.')

    const base = ensureSessionAssets(sessionId)
    if (!base) return m.reply('❌ Error interno creando carpeta de assets.')

    let subCmd = (args[0] || '').toLowerCase()

    
    const commandMap = {
      'menuimg': 'setmenu',
      'bgimg': 'setmenubg',
      'welcomeimg': 'setwelcomeimg',
      'misassets': 'viewassets',
      'reset': 'resetassets'
    }

    if (commandMap[subCmd]) {
      subCmd = commandMap[subCmd]
    }

    if (!subCmd || subCmd === 'help') {
      return m.reply(`🎨 *PERSONALIZA TU SUBBOT* 🎨

📱 *Comandos simples:*
• \`.menuimg\` - Cambia imagen del menú (responde imagen)
• \`.bgimg\` - Cambia fondo del menú (responde imagen)
• \`.welcomeimg\` - Cambia imagen de bienvenida (responde imagen)
• \`.welcome <texto>\` - Cambia texto de bienvenida
• \`.misassets\` - Ver personalización actual
• \`.reset\` - Borrar toda personalización

💡 *Ejemplos:*
• Responde una imagen con \`.menuimg\`
• Escribe: \`.welcome ¡Hola $user! Bienvenido a mi bot personalizado\`

Los cambios se guardan automáticamente en tu sesión.`)
    }

    if (subCmd === 'setmenu' || subCmd === 'setwelcomeimg' || subCmd === 'setmenubg') {

      let media = null
      if (m.quoted && m.quoted.mimetype && /image\//.test(m.quoted.mimetype)) media = await m.quoted.download().catch(() => null)
      else if (m.mimetype && /image\//.test(m.mimetype)) media = await m.download().catch(() => null)
      else return m.reply('Responde a una imagen con este comando o envía una imagen junto al comando.')
      if (!media) return m.reply('No se pudo descargar la imagen.')

      let filename = ''
      if (subCmd === 'setmenu') filename = 'menu.jpg'
      else if (subCmd === 'setwelcomeimg') filename = 'welcome.jpg'
      else if (subCmd === 'setmenubg') filename = 'menu_bg.jpg'

      const p = path.join(base, filename)
      fs.writeFileSync(p, media)
      return m.reply(`✅ Imagen guardada: ${filename}`)
    }

    if (subCmd === 'setwelcome') {
      const text = args.slice(1).join(' ') || m.text?.replace(/^setwelcome\s*/i, '')
      if (!text) return m.reply('Envía: setwelcome <texto de bienvenida>')
      const cfg = getSessionConfig(sessionId)
      cfg.welcomeText = text
      saveSessionConfig(sessionId, cfg)
      return m.reply('✅ Texto de bienvenida guardado.')
    }

    if (subCmd === 'viewassets') {
      const cfg = getSessionConfig(sessionId)
      const menuP = path.join(base, 'menu.jpg')
      const welcomeP = path.join(base, 'welcome.jpg')
      const menuBgP = path.join(base, 'menu_bg.jpg')
      let out = `📁 Assets para ${sessionId}:\n`
      out += `• menu: ${fs.existsSync(menuP) ? '✅' : '❌'}\n`
      out += `• menu background: ${fs.existsSync(menuBgP) ? '✅' : '❌'}\n`
      out += `• welcome image: ${fs.existsSync(welcomeP) ? '✅' : '❌'}\n`
      out += `• welcome text: ${cfg.welcomeText ? '✅' : '❌'}`
      await conn.sendMessage(m.chat, { text: out }, { quoted: m })
      if (fs.existsSync(menuP)) await conn.sendFile(m.chat, menuP, 'menu.jpg', 'Menu image', m).catch(()=>{})
      if (fs.existsSync(menuBgP)) await conn.sendFile(m.chat, menuBgP, 'menu_bg.jpg', 'Menu background', m).catch(()=>{})
      if (fs.existsSync(welcomeP)) await conn.sendFile(m.chat, welcomeP, 'welcome.jpg', 'Welcome image', m).catch(()=>{})
      if (cfg.welcomeText) {
        await conn.sendMessage(m.chat, { text: `📜 Welcome text:\n${cfg.welcomeText || ''}` }, { quoted: m })
      }
      return
    }

    if (subCmd === 'resetassets') {
      try {
        fs.rmSync(base, { recursive: true, force: true })
        return m.reply('✅ Assets reseteados para esta sesión.')
      } catch (e) {
        return m.reply('❌ Error reseteando assets: ' + e.message)
      }
    }

    return m.reply('Comando no reconocido. Usa subbot-customize help')
  } catch (e) {
    console.error(e)
    return m.reply('Error interno: ' + e.message)
  }
}

handler.help = ['subbot-customize', 'menuimg', 'bgimg', 'welcomeimg', 'welcome', 'misassets', 'reset']
handler.tags = ['serbot']
handler.command = ['subbot-customize','subbotcustomize', 'menuimg', 'bgimg', 'welcomeimg', 'welcome', 'misassets', 'reset']

export default handler
