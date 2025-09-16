# 🤖 Comandos de Gestión de SubBots

## 📋 **Lista Completa de Comandos**

### 🔐 **Creación de SubBots:**
- **`.qr`** - Crear SubBot con código QR
- **`.code`** - Crear SubBot con código de 8 dígitos

### 🔄 **Gestión de Conexiones:**
- **`.reconnect <token>`** - Reconectar usando token guardado
- **`.substats`** - Ver estadísticas del sistema (solo owner)
- **`.diagnosis`** - Diagnóstico completo del sistema (solo owner)

### 🗑️ **Eliminación de Sesiones:**
- **`.deletebot`** - Eliminar sesión propia (con confirmación)
- **`.deletesesion`** - Alias de deletebot
- **`.forcedelete <id|all>`** - Eliminar forzadamente (solo owner)
- **`.killsession <id|all>`** - Alias de forcedelete (solo owner)

### 📊 **Monitoreo:**
- **`.subbots`** - Listar SubBots activos
- **`.stopsubbots`** - Detener todos los SubBots

## 🛠️ **Comandos de Eliminación Detallados**

### 📱 **Para Usuarios Regulares:**

#### `.deletebot` o `.deletesesion`
```
.deletebot
```
- ✅ Elimina tu propia sesión
- ⚠️ Requiere confirmación (responder "si" o "confirmar")
- 🔒 Solo puede eliminar tu propia sesión
- ⏱️ Tiempo límite de confirmación: 30 segundos
- 📁 Elimina sesión, respaldos y actualiza logs

### 👑 **Para Propietarios (Owner):**

#### `.forcedelete <id>` - Eliminar sesión específica
```
.forcedelete 1234567890
```
- 🔥 Eliminación inmediata sin confirmación
- 🎯 Especifica el número de teléfono/ID
- 📁 Elimina sesión, respaldos y logs
- ⚡ Cierra conexión activa si existe

#### `.forcedelete all` - Eliminar todas las sesiones
```
.forcedelete all
```
- 🔥 Elimina TODAS las sesiones de SubBots
- 💥 Cierra todas las conexiones activas
- 🧹 Limpia completamente el sistema
- ⚠️ Úselo con precaución - no hay vuelta atrás

## 🔍 **Diagnóstico de Problemas**

### Usar `.diagnosis` para detectar:
- 🚨 **Sesiones problemáticas** (muchas reconexiones)
- 🔗 **Conexiones inestables** 
- 📦 **Dependencias faltantes**
- 💾 **Problemas de almacenamiento**
- ⚡ **Estado general del sistema**

### Ejemplo de salida de diagnóstico:
```
🚨 Sesiones Problemáticas:
1. ID: 1234567890 | Token: SUBBOT_ABC123...
   Problemas: Muchas reconexiones, Conexión inestable

💡 Sugerencia: Use .forcedelete 1234567890 para eliminar sesiones problemáticas
```

## 🔧 **Casos de Uso Comunes**

### 🆘 **Sesión No Responde:**
1. `.diagnosis` - Verificar el problema
2. `.deletebot` - Eliminar tu sesión
3. `.qr` o `.code` - Crear nueva sesión

### 🔄 **Reconexión Fallida:**
1. `.substats` - Ver estado de conexiones
2. `.reconnect <tu_token>` - Intentar reconectar
3. Si falla: `.deletebot` + crear nueva sesión

### 🧹 **Limpieza del Sistema (Solo Owner):**
1. `.diagnosis` - Identificar sesiones problemáticas
2. `.forcedelete <id>` - Eliminar sesiones específicas
3. `.forcedelete all` - Limpiar todo el sistema

### 📊 **Monitoreo Regular:**
1. `.substats` - Ver estadísticas rápidas
2. `.diagnosis` - Diagnóstico completo
3. `.subbots` - Listar conexiones activas

## ⚠️ **Advertencias Importantes**

### 🔒 **Seguridad:**
- Los comandos `forcedelete` solo están disponibles para owners
- Siempre confirme antes de usar `forcedelete all`
- Los tokens se invalidan al eliminar sesiones

### 💾 **Datos:**
- **`.deletebot`** preserva logs para auditoría
- **`.forcedelete`** elimina completamente todos los datos
- Los respaldos se eliminan permanentemente

### 🔄 **Reconexión:**
- Después de eliminar una sesión, necesitará vincular nuevamente
- Los tokens antiguos no funcionarán después de la eliminación
- Use `.qr` o `.code` para crear nuevas sesiones

## 🎯 **Flujo Recomendado**

### Para solucionar problemas:
1. **Diagnóstico** → `.diagnosis`
2. **Evaluación** → Revisar sesiones problemáticas
3. **Acción** → `.deletebot` o `.forcedelete <id>`
4. **Recreación** → `.qr` o `.code`
5. **Verificación** → `.substats`

### Para limpieza rutinaria:
1. **Monitoreo** → `.substats` (diario)
2. **Diagnóstico** → `.diagnosis` (semanal)
3. **Limpieza** → `.forcedelete <sesiones_problemáticas>` (según necesidad)

---
**📝 Nota:** Todos los comandos respetan la configuración `jadibotmd` y solo funcionan cuando está habilitada.