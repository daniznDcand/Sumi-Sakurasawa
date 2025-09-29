# 🔧 Guía de Solución de Problemas - Hatsune Miku Bot

## ❌ Error FetchError ETIMEDOUT

### **Problema:**
```
FetchError: request to https://files.catbox.moe/xuebrr.jpg failed, reason: connect ETIMEDOUT
```

### **Causa:**
El bot intenta descargar recursos (imágenes, videos) desde servicios externos como catbox.moe, pero la conexión falla por:
- Problemas de conectividad del servidor
- Firewall bloqueando conexiones externas
- Servidor de destino caído o lento
- Timeout de red

### **Solución Implementada:**

1. **URLs Actualizadas:** Reemplazadas las URLs de catbox.moe por alternativas más confiables
2. **Manejo de Errores:** Implementado sistema de fallback automático
3. **Timeouts:** Configurados timeouts para evitar bloqueos indefinidos
4. **Función SafeFetch:** Creada función global para manejar descargas de manera robusta

### **Archivos Modificados:**
- `plugins/main-allfake.js` - Manejo robusto de iconos
- `settings.js` - URLs del banner y avatar actualizadas
- `src/database/db.json` - URLs de imágenes actualizadas

## 🛡️ Prevención de Errores Futuros

### **Al usar URLs externas:**

```javascript
// ❌ MAL - Sin manejo de errores
const response = await fetch(url)
const data = await response.buffer()

// ✅ BIEN - Con manejo de errores
try {
  const response = await safeFetch(url, {
    timeout: 8000,
    fallbackUrl: 'URL_ALTERNATIVA'
  })
  
  if (response.ok) {
    const data = await response.buffer()
    // usar data...
  }
} catch (error) {
  console.log(`Error: ${error.message}`)
  // usar valor por defecto
}
```

### **Servicios Recomendados para Hosting de Imágenes:**

1. **Pinterest** - `i.pinimg.com` (muy confiable)
2. **Imgur** - `i.imgur.com` (estable)
3. **Telegraph** - `telegra.ph` (rápido)
4. **GitHub** - `raw.githubusercontent.com` (para repos públicos)

### **Servicios a Evitar:**
- catbox.moe (intermitente)
- Servicios temporales o poco conocidos
- URLs sin HTTPS

## 🔍 Debugging

### **Para verificar conectividad:**
```bash
# En terminal
curl -I https://ejemplo.com/imagen.jpg
```

### **Logs útiles:**
El bot ahora muestra logs informativos:
- `🔄 Cargando icono desde: URL`
- `✅ Icono cargado exitosamente`
- `⚠️ Error cargando icono: mensaje`
- `🔄 Usando icono por defecto...`

## 📞 Soporte

Si continúas teniendo problemas:
1. Revisa los logs del bot
2. Verifica la conectividad del servidor
3. Considera cambiar el hosting si hay restricciones de red
4. Contacta al desarrollador con los logs específicos

---
*Última actualización: Septiembre 2025*