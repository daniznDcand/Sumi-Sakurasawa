import fs from 'fs'
import path from 'path'
import chalk from 'chalk'


export async function autoReconnectSubBots() {
  console.log(chalk.blue('🔄 Iniciando sistema de reconexión automática de Sub-Bots...'))
  
  try {
    const jadiDir = `./${global.jadi}/`
    if (!fs.existsSync(jadiDir)) {
      console.log(chalk.yellow('📁 No existe directorio de sesiones, omitiendo reconexión automática'))
      return
    }

    const sessions = fs.readdirSync(jadiDir)
    if (sessions.length === 0) {
      console.log(chalk.yellow('📋 No hay sesiones guardadas para reconectar'))
      return
    }

    console.log(chalk.blue(`📊 Encontradas ${sessions.length} sesiones guardadas`))
    
    let reconnectedCount = 0
    const { mikuJadiBot } = await import('./plugins/jadibot-serbot.js')

    for (const session of sessions) {
      const sessionPath = path.join(jadiDir, session)
      const credsPath = path.join(sessionPath, "creds.json")
      const tokenPath = path.join(sessionPath, "token.json")
      
      
      if (!fs.existsSync(credsPath)) {
        console.log(chalk.yellow(`⚠️ Sin credenciales para sesión ${session}, omitiendo...`))
        continue
      }

      try {
        
        const credsData = JSON.parse(fs.readFileSync(credsPath, 'utf8'))
        if (!credsData || !credsData.me) {
          console.log(chalk.yellow(`⚠️ Credenciales inválidas para sesión ${session}, omitiendo...`))
          continue
        }

        
        const isAlreadyConnected = global.conns.some(subbot => 
          subbot.user && subbot.user.jid && subbot.user.jid.includes(session)
        )

        if (isAlreadyConnected) {
          console.log(chalk.green(`✅ Sesión ${session} ya está conectada`))
          continue
        }

        
        let userToken = null
        if (fs.existsSync(tokenPath)) {
          try {
            const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
            userToken = tokenData.token
          } catch (error) {
            console.log(chalk.yellow(`⚠️ Token corrupto para sesión ${session}`))
          }
        }

        console.log(chalk.blue(`🔄 Reconectando sesión ${session}...`))

        
        const mockMessage = {
          sender: `${session}@s.whatsapp.net`,
          chat: null,
          fromMe: false
        }

        const mikuJBOptions = {
          pathMikuJadiBot: sessionPath,
          m: mockMessage,
          conn: global.conn, 
          args: [],
          usedPrefix: '.',
          command: 'qr',
          fromCommand: false,
          userToken: userToken
        }

        
        mikuJadiBot(mikuJBOptions).then(() => {
          console.log(chalk.green(`✅ Sesión ${session} reconectada exitosamente`))
        }).catch((error) => {
          console.log(chalk.red(`❌ Error reconectando sesión ${session}: ${error.message}`))
        })

        reconnectedCount++
        
        
        await new Promise(resolve => setTimeout(resolve, 2000))

      } catch (error) {
        console.log(chalk.red(`❌ Error procesando sesión ${session}: ${error.message}`))
      }
    }

    console.log(chalk.green(`🎉 Sistema de reconexión iniciado para ${reconnectedCount} sesiones`))

  } catch (error) {
    console.error(chalk.red(`❌ Error en reconexión automática: ${error.message}`))
  }
}


export function startSubBotCleanupScheduler() {
  console.log(chalk.blue('🧹 Iniciando programador de limpieza de Sub-Bots...'))
  
  
  setInterval(async () => {
    console.log(chalk.blue('🧹 Ejecutando limpieza programada de sesiones inactivas...'))
    
    try {
      const jadiDir = `./${global.jadi}/`
      if (!fs.existsSync(jadiDir)) return

      const sessions = fs.readdirSync(jadiDir)
      const currentTime = Date.now()
      const maxInactiveTime = 48 * 60 * 60 * 1000 
      let cleanedCount = 0

      for (const session of sessions) {
        const sessionPath = path.join(jadiDir, session)
        const tokenPath = path.join(sessionPath, "token.json")
        const credsPath = path.join(sessionPath, "creds.json")
        
        
        const isActive = global.conns.some(subbot => 
          subbot.user?.jid?.includes(session)
        )
        
        if (!isActive) {
          let shouldClean = false
          
          if (fs.existsSync(tokenPath)) {
            try {
              const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
              const lastActivity = tokenData.lastActivity || tokenData.created
              
              if (currentTime - lastActivity > maxInactiveTime) {
                shouldClean = true
              }
            } catch (error) {
              shouldClean = true 
            }
          } else if (fs.existsSync(credsPath)) {
            
            const stats = fs.statSync(credsPath)
            if (currentTime - stats.mtime.getTime() > maxInactiveTime) {
              shouldClean = true
            }
          }
          
          if (shouldClean) {
            try {
              fs.rmSync(sessionPath, { recursive: true, force: true })
              cleanedCount++
              console.log(chalk.yellow(`🧹 Sesión limpiada automáticamente: ${session}`))
            } catch (error) {
              console.error(chalk.red(`Error limpiando sesión ${session}: ${error.message}`))
            }
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(chalk.green(`🧹 Limpieza programada completada: ${cleanedCount} sesiones eliminadas`))
      }

    } catch (error) {
      console.error(chalk.red(`❌ Error en limpieza programada: ${error.message}`))
    }
  }, 6 * 60 * 60 * 1000) 
}

// Monitoreo de salud de subbots
export function startSubBotHealthMonitor() {
  console.log(chalk.blue('💓 Iniciando monitor de salud de Sub-Bots...'))
  
  setInterval(() => {
    try {
      const activeSubBots = global.conns.filter(subbot => 
        subbot.user && subbot.ws.socket
      )

      activeSubBots.forEach(subbot => {
        const userId = subbot.user?.jid?.split('@')[0] || 'unknown'
        
        if (subbot.ws.socket.readyState === 3) { 
          console.log(chalk.yellow(`💓 Detectada conexión cerrada para +${userId}, limpiando...`))
          
          try {
            subbot.ev.removeAllListeners()
            let i = global.conns.indexOf(subbot)
            if (i >= 0) {
              delete global.conns[i]
              global.conns.splice(i, 1)
            }
          } catch (error) {
            console.error(chalk.red(`Error limpiando subbot +${userId}: ${error.message}`))
          }
        }
      })

    } catch (error) {
      console.error(chalk.red(`❌ Error en monitor de salud: ${error.message}`))
    }
  }, 60000) // Cada minuto
}

export default {
  autoReconnectSubBots,
  startSubBotCleanupScheduler,
  startSubBotHealthMonitor
}
