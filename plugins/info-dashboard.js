let handler = async (m, { conn, command }) => {

    if (command == 'dash' || command == 'dashboard' || command == 'views') {
        const all = /\ball\b/i.test(m.text || '')
        const botId = conn?.user?.jid
        const byBot = (!all && botId && global.db?.data?.statsByBot && global.db.data.statsByBot[botId]) ? global.db.data.statsByBot[botId] : null
        const sourceStats = byBot || (global.db?.data?.stats || {})

        let stats = Object.entries(sourceStats).map(([key, val]) => {
            let name = Array.isArray(plugins[key]?.help) ? plugins[key]?.help?.join(' , ') : plugins[key]?.help || key 

            if (/exec/.test(name)) return
            return { name, ...val }
        })

        stats = stats.sort((a, b) => b.total - a.total)
        var handlers = stats.slice(0, 10).map(({ name, total }) => {
            return `⬡ *Comando* : *${name}*\n⬡ *Usos* : ${total}`
        }).join('\n\n')

        if (!handlers) handlers = 'Sin datos de uso aún.'
        conn.reply(m.chat, handlers, m)
    }

    if (command == 'database' || command == 'usuarios' || command == 'user') {
        let totalreg = Object.keys(global.db.data.users).length
        let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length

        conn.reply(m.chat, `
🗂️ *Tengo ${rtotalreg} Usuarios Registrados*

📂 *${totalreg} No Están Registrados*`, m)
    }

}

handler.help = ['dash', 'dashboard', 'views', 'database', 'usuarios', 'user']
handler.tags = ['info']
handler.command = ['dashboard', 'dash', 'views', 'database', 'usuarios', 'user']
handler.register = true

export default handler
