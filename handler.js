import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const isNumber = x => typeof x === 'number' && !isNaN(x)


const DEFAULT_PREFIXES = ['#', '!', '.', '/', '¿', '?']

export async function handler(chatUpdate) {
	const conn = this
	const opts = this.opts || global.opts || {}
	this.msgqueque = this.msgqueque || []
	this.uptime = this.uptime || Date.now()

	
	this._groupMetaCache = this._groupMetaCache || new Map()
	const getGroupMetaCached = async (jid) => {
		try {
			if (!jid) return null
			const now = Date.now()
			const cached = this._groupMetaCache.get(jid)
			if (cached && (now - cached.ts) < 10_000) return cached.meta
			const meta = await conn.groupMetadata(jid).catch(() => null)
			this._groupMetaCache.set(jid, { meta, ts: now })
			return meta
		} catch (e) { return null }
	}

	if (!chatUpdate) return
	this.pushMessage?.(chatUpdate.messages).catch(console.error)
	let m = chatUpdate.messages?.[chatUpdate.messages.length - 1]
	if (!m) return

	if (global.db?.data == null) await global.loadDatabase()

	
	global.db.data = global.db.data || {}
	global.db.data.users = global.db.data.users || {}
	global.db.data.chats = global.db.data.chats || {}
	global.db.data.settings = global.db.data.settings || {}

	try {
		m = smsg(this, m) || m
		if (!m) return
		m.exp = m.exp || 0
		m.coin = m.coin || 0

		// ensure per-message user & chat defaults exist
		if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { registered: false }
		if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
		if (!global.db.data.settings[this.user?.jid]) global.db.data.settings[this.user?.jid] = {}
		const _user = global.db.data.users[m.sender]
		const detectwhat = m.sender && m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net'
		const owners = (global.owner || []).map(([number]) => (number || '').replace(/[^0-9]/g, '') + detectwhat)
		const isROwner = owners.includes(m.sender)
		const isOwner = isROwner || m.fromMe
		const isMods = isROwner || (global.mods || []).map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
		const isPrems = isROwner || (global.prems || []).map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender) || _user?.premium === true

		if (m.isBaileys) return
		if (opts['nyimak']) return
		if (!isROwner && opts['self']) return
		if (opts['swonly'] && m.chat !== 'status@broadcast') return
		if (typeof m.text !== 'string') m.text = ''

		m.exp += Math.ceil(Math.random() * 10)

		async function getLidFromJid(id) {
			if (!id) return id
			if (id.endsWith && id.endsWith('@lid')) return id
			const res = await conn.onWhatsApp?.(id).catch(() => [])
			return res?.[0]?.jid || id
		}

		const senderLid = await getLidFromJid(m.sender)
		const botLid = await getLidFromJid(conn.user?.jid)
		const groupMetadata = m.isGroup ? ((conn.chats?.[m.chat] || {}).metadata || await getGroupMetaCached(m.chat).catch(() => null)) : {}
		const participants = m.isGroup ? (groupMetadata?.participants || []) : []
		const user = participants.find(p => p.id === senderLid || p.id === m.sender) || {}
		const bot = participants.find(p => p.id === botLid || p.id === conn.user?.jid) || {}
		const isRAdmin = user?.admin === 'superadmin'
		const isAdmin = isRAdmin || user?.admin === 'admin'
		const isBotAdmin = !!bot?.admin

	
		const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
		if (!this._pluginCache) {
			const str2Regex = str => String(str).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
			this._pluginCache = Object.keys(global.plugins || {}).map(name => {
				const plugin = global.plugins[name]
				if (!plugin) return null
				
				const _prefix = plugin.customPrefix ?? DEFAULT_PREFIXES
				let prefixRegexes = []
				if (_prefix instanceof RegExp) prefixRegexes = [_prefix]
				else if (Array.isArray(_prefix)) prefixRegexes = _prefix.map(p => p instanceof RegExp ? p : new RegExp('^' + str2Regex(p)))
				else prefixRegexes = [new RegExp('^' + str2Regex(_prefix))]
				return { name, plugin, prefixRegexes, rawPrefix: _prefix }
			}).filter(Boolean)
		}

	
		for (const item of this._pluginCache) {
			const { name, plugin, prefixRegexes } = item
			if (!plugin) continue
			if (plugin.disabled) continue
			const __filename = join(___dirname, name)

			if (typeof plugin.all === 'function') {
				try {
					const t0 = (global.performance || performance).now()
					await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
					const t1 = (global.performance || performance).now()
					if ((t1 - t0) > 50) console.log(`plugin.all slow: ${name} ${(t1 - t0).toFixed(1)}ms`)
				} catch (e) { console.error(e) }
			}

			if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) continue

			
			let match = null
			let usedPrefix = null
			for (const re of prefixRegexes) {
				const exec = re.exec(m.text.trim())
				if (exec) { match = exec; usedPrefix = exec[0]; break }
			}

			try {
				if (typeof plugin.before === 'function') {
					if (await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename })) continue
				}
			} catch (e) { console.error(e); continue }

			if (typeof plugin !== 'function' && typeof plugin !== 'object') continue

			if (match && usedPrefix != null) {
				const noPrefix = m.text.trim().slice(usedPrefix.length)
				let [command, ...args] = noPrefix.trim().split(/\s+/).filter(Boolean)
				args = args || []
				const _args = noPrefix.trim().split(/\s+/).slice(1)
				const text = _args.join(' ')
				command = (command || '').toLowerCase()
				const fail = plugin.fail || global.dfail
				const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false

				global.comando = command
				if (!isAccept) continue
				m.plugin = name

				const extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }
				try {
					
					console.log(chalk.green(`[CMD] ${command} | plugin: ${name} | by: ${m.sender}`))
					await plugin.call(this, m, extra)
				} catch (e) {
					m.error = e
					console.error(e)
					try {
						let errText = format(e)
						for (let key of Object.values(global.APIKeys || {})) errText = errText.replace(new RegExp(key, 'g'), 'Administrador')
						m.reply?.(errText)
					} catch (e) { /* ignore */ }
				} finally {
					if (typeof plugin.after === 'function') try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }
				}
				break
			}
		}

	} catch (e) {
		console.error(e)
	} finally {
		try {
			if (opts['queque'] && m?.text) {
				const quequeIndex = this.msgqueque.indexOf(m.id || (m.key && m.key.id))
				if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
			}
			if (m?.plugin) {
				const now = Date.now()
				const stats = global.db.data.stats = global.db.data.stats || {}
				let stat = stats[m.plugin]
				if (!stat) stat = stats[m.plugin] = { total: 0, success: 0, last: now, lastSuccess: 0 }
				stat.total += 1
				stat.last = now
				if (!m.error) { stat.success += 1; stat.lastSuccess = now }
			}
			if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
		} catch (e) { console.log(e) }
	}
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }

global.dfail = (type, m, usedPrefix, comando, conn) => {
	const edadaleatoria = ['10','28','20','40','18','21','15','11','9','17','25'][Math.floor(Math.random() * 11)]
	const user2 = m?.pushName || 'Anónimo'
	const verifyaleatorio = ['reg','verificar','verify','register'][Math.floor(Math.random() * 4)]
	const msg = {
		rowner: `💙 El comando *${comando}* solo puede ser usado por el creador de la bot \n(ㅎㅊDEPOOLㅊㅎ).`,
		owner: `💙 El comando *${comando}* solo puede ser usado por los desarrolladores del bot.`,
		mods: `💙 El comando *${comando}* solo puede ser usado por los moderadores del bot.`,
		premium: `💙 El comando *${comando}* solo puede ser usado por los usuarios premium.`,
		group: `💙 El comando *${comando}* solo puede ser usado en grupos.`,
		private: `💙 El comando *${comando}* solo puede ser usado al chat privado del bot.`,
		admin: `💙 El comando *${comando}* solo puede ser usado por los administradores del grupo.`,
		botAdmin: `💙 Para ejecutar el comando *${comando}* debo ser administrador del grupo.`,
		unreg: `💙 El comando *${comando}* solo puede ser usado por los usuarios registrado, registrate usando:\n> » #${verifyaleatorio} ${user2}.${edadaleatoria}`,
		restrict: `💙 Esta caracteristica está desactivada.`
	}[type]
	if (msg) return m?.reply?.(msg).then?.(_ => m?.react?.('✖️'))
}


const file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
	unwatchFile(file)
	console.log(chalk.magenta("Se actualizo 'handler.js'"))
	if (global.conns) {
		const getConnsArray = () => {
			if (!global.conns) return []
			if (global.conns instanceof Map) return Array.from(global.conns.values())
			if (Array.isArray(global.conns)) return global.conns
			return Object.values(global.conns || {})
		}
		const connsArr = getConnsArray()
		if (connsArr.length > 0) {
			const users = [...new Set(connsArr.filter(c => c && c.user && c.subreloadHandler).map(c => c))]
			for (const userr of users) userr.subreloadHandler?.(false)
		}
	}
})

