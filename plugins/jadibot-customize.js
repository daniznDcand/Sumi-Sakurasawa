import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    const isSub = this && this.isSubBot
    const who = isSub ? (this.user?.jid || '') : (m.sender || '')
    const sessionId = (who.split('@')[0])
    if (!sessionId) return m.reply('⚠️ No se pudo determinar la sesión.')

    const base = path.join(process.cwd(), `${global.jadi}`, sessionId, 'assets')
    if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true })

    const subCmd = (args[0] || '').toLowerCase()

    if (!subCmd || subCmd === 'help') {
      return m.reply(`Comandos de SubBot-Customize:\n- setmenu (responde imagen)\n- setwelcomeimg (responde imagen)\n- setwelcome (texto)\n- viewassets\n- resetassets`)    
    }

    if (subCmd === 'setmenu' || subCmd === 'setwelcomeimg') {
      // require quoted image
      if (!m.quoted || !m.quoted.mimetype || !/image\//.test(m.quoted.mimetype)) {
        return m.reply('Responde a una imagen con este comando.')
      }
      const media = await m.quoted.download().catch(() => null)
      if (!media) return m.reply('No se pudo descargar la imagen.')
      const filename = subCmd === 'setmenu' ? 'menu.jpg' : 'welcome.jpg'
      const p = path.join(base, filename)
      fs.writeFileSync(p, media)
      return m.reply(`✅ Imagen guardada: ${filename}`)
    }

    if (subCmd === 'setwelcome') {
      const text = args.slice(1).join(' ') || m.text?.replace(/^setwelcome\s*/i, '')
      if (!text) return m.reply('Envía: setwelcome <texto de bienvenida>')
      const cfgPath = path.join(base, 'config.json')
      let cfg = {}
      if (fs.existsSync(cfgPath)) cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
      cfg.welcomeText = text
      fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))
      return m.reply('✅ Texto de bienvenida guardado.')
    }

    if (subCmd === 'viewassets') {
      const cfgPath = path.join(base, 'config.json')
      const menuP = path.join(base, 'menu.jpg')
      const welcomeP = path.join(base, 'welcome.jpg')
      let out = `📁 Assets para ${sessionId}:\n`
      out += `• menu: ${fs.existsSync(menuP) ? '✅' : '❌'}\n`
      out += `• welcome image: ${fs.existsSync(welcomeP) ? '✅' : '❌'}\n`
      out += `• welcome text: ${fs.existsSync(cfgPath) ? '✅' : '❌'}`
      await conn.sendMessage(m.chat, { text: out }, { quoted: m })
      if (fs.existsSync(menuP)) await conn.sendFile(m.chat, menuP, 'menu.jpg', 'Menu image', m).catch(()=>{})
      if (fs.existsSync(welcomeP)) await conn.sendFile(m.chat, welcomeP, 'welcome.jpg', 'Welcome image', m).catch(()=>{})
      if (fs.existsSync(cfgPath)) {
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
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

handler.help = ['subbot-customize']
handler.tags = ['serbot']
handler.command = ['subbot-customize','subbotcustomize']

export default handler
