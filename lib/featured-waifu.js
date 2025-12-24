import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = path.join(__dirname, '..', 'src', 'database')
const DB_FILE = path.join(DB_DIR, 'featured_waifu.json')
let intervalHandle = null
let config = { intervalMs: 1000 * 60 * 60, // default 1 hour
  featured: null, lastUpdated: 0 }

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
}

function readFile() {
  try {
    ensureDbDir()
    if (!fs.existsSync(DB_FILE)) return null
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8') || 'null')
  } catch (e) {
    return null
  }
}

function writeFile(obj) {
  ensureDbDir()
  fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2))
}

export function getFeatured() {
  if (config.featured) return config.featured
  const file = readFile()
  if (file && file.featured) {
    config.featured = file.featured
    config.lastUpdated = file.lastUpdated || 0
    return config.featured
  }
  return null
}

export function setFeatured(waifu) {
  config.featured = waifu
  config.lastUpdated = Date.now()
  writeFile({ featured: waifu, lastUpdated: config.lastUpdated })
}

export function startRotation(getRandomWaifuFn, options = {}) {
  if (!getRandomWaifuFn || typeof getRandomWaifuFn !== 'function') return
  if (intervalHandle) return // already running
  if (options.intervalMs) config.intervalMs = options.intervalMs
  // load existing
  const existing = readFile()
  if (existing && existing.featured) config.featured = existing.featured
  // ensure there's a featured waifu
  if (!config.featured) {
    try { setFeatured(getRandomWaifuFn()) } catch (e) {}
  }
  intervalHandle = setInterval(() => {
    try {
      const next = getRandomWaifuFn()
      if (next) setFeatured(next)
    } catch (e) {}
  }, config.intervalMs)
}

export function stopRotation() {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }
}

