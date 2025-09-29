# 🔄 APIs Agregadas - descargas-play.js

## ✅ Cambios Realizados

### **Para Descargas de Video (getVideoUrl):**
Se agregaron las siguientes APIs:

1. **Xyro** - `${global.APIs.xyro.url}/download/youtubemp4` (calidad 360p)
2. **Yupra** - `${global.APIs.yupra.url}/api/downloader/ytmp4` 
3. **Vreden** - `${global.APIs.vreden.url}/api/ytmp4`
4. **Delirius** - `${global.APIs.delirius.url}/download/ytmp4`
5. **ZenzzXD** - `${global.APIs.zenzxz.url}/downloader/ytmp4`
6. **ZenzzXD v2** - `${global.APIs.zenzxz.url}/downloader/ytmp4v2`
7. **ZenzzXD Legacy** - `https://api.zenzxz.my.id/downloader/ytmp4` (URL fija)
8. **Delirius Legacy** - `https://delirius-apiofc.vercel.app/download/ytmp4` (URL fija)

### **Para Descargas de Audio (getAudioUrl):**
Se agregaron APIs equivalentes para MP3:

1. **Xyro** - `${global.APIs.xyro.url}/download/youtubemp3`
2. **Yupra** - `${global.APIs.yupra.url}/api/downloader/ytmp3`
3. **Vreden** - `${global.APIs.vreden.url}/api/ytmp3`
4. **Delirius** - `${global.APIs.delirius.url}/download/ytmp3`
5. **ZenzzXD** - `${global.APIs.zenzxz.url}/downloader/ytmp3`
6. **ZenzzXD v2** - `${global.APIs.zenzxz.url}/downloader/ytmp3v2`
7. **ZenzzXD Legacy** - `https://api.zenzxz.my.id/downloader/ytmp3` (URL fija)

## 🛡️ Protecciones Implementadas

### **v2.0 - Manejo Seguro de APIs**
- ✅ **Validación de global.APIs** - No causa errores si no está definido
- ✅ **URLs por defecto** - Fallback automático a URLs predeterminadas  
- ✅ **Conditional loading** - Solo carga APIs que estén correctamente configuradas
- ✅ **APIs legacy** - Siempre disponibles como respaldo final
- ✅ **Error handling** - Tolerante a fallos de configuración

### **Error Corregido:**
```
❌ ANTES: TypeError: Cannot read properties of undefined (reading 'xyro')
✅ AHORA: Funciona incluso sin global.APIs configurado
```

## 🔧 Características

- **Total de APIs para Video:** 8 APIs (antes 2)
- **Total de APIs para Audio:** 8 APIs (antes 2) 
- **Tolerancia a fallos:** El sistema intentará todas las APIs hasta encontrar una que funcione
- **URLs dinámicas:** Utiliza `global.APIs` para URLs configurables
- **URLs de respaldo:** Mantiene URLs fijas como fallback
- **Configuración opcional:** Funciona sin configuración adicional

## 🎯 Beneficios

- ✅ **Mayor disponibilidad** - Más opciones si una API falla
- ✅ **Mejor rendimiento** - APIs alternativas si una es lenta
- ✅ **Flexibilidad** - URLs configurables desde `global.APIs`
- ✅ **Compatibilidad** - Mantiene APIs legacy como respaldo
- ✅ **Plug & Play** - Funciona inmediatamente sin configuración
- ✅ **Error-proof** - No se rompe por configuración faltante

## ⚙️ Configuración (Opcional)

Si quieres personalizar las URLs de las APIs, agrega esto a tu configuración:

```javascript
global.APIs = {
  xyro: { url: 'https://api.xyro.com' },
  yupra: { url: 'https://api.yupra.com' },
  vreden: { url: 'https://api.vreden.com' },
  delirius: { url: 'https://api.delirius.com' },
  zenzxz: { url: 'https://api.zenzxz.my.id' }
}
```

**Nota:** Si no configuras `global.APIs`, el bot usará URLs por defecto y funcionará normalmente.

---
*Actualización: Septiembre 2025 - v2.0 Error-proof*