# 🚀 Guía de Despliegue en Render - IT Helpdesk

## Variables de Entorno Requeridas

Para que tu app funcione en Render, **DEBES configurar estas variables de entorno**:

### 1️⃣ Accede a tu proyecto en Render

- Ve a https://dashboard.render.com
- Selecciona tu app (helpdesk)
- Ve a **Settings** → **Environment**

### 2️⃣ Configura estas variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Tu URL de PostgreSQL (ya debe estar) |
| `SESSION_SECRET` | Cualquier string aleatorio | Para firmar sesiones (ya debe estar) |
| `GMAIL_USER` | `tecnologiaclusterp@gmail.com` | Tu correo de Gmail |
| `GMAIL_PASS` | `vehc tudk sacm lpqt` | Tu contraseña de aplicación |
| `NODE_ENV` | `production` | Modo de producción |

### 3️⃣ Pasos exactos en Render:

1. En la página de tu servicio, haz scroll hasta **"Environment"**
2. Haz clic en **"Add Environment Variable"**
3. Copia y pega EXACTAMENTE:
   ```
   GMAIL_USER=tecnologiaclusterp@gmail.com
   GMAIL_PASS=vehc tudk sacm lpqt
   ```
4. Haz clic en **"Save"**
5. Render automáticamente **reiniciará tu app** con las nuevas variables

### 4️⃣ Verifica que funciona:

Una vez guardadas las variables:
1. Abre tu app en Render
2. Ve a **"Olvidar Contraseña"**
3. Ingresa tu email: `juan.zorro@Ocarrava.com` (con mayúscula O)
4. Haz clic en **"Enviar"**
5. **Deberías recibir el email en 2-3 minutos**

### ❓ Si aún no funciona:

**Verifica el estado en Render:**
- Ve a **"Logs"** en tu servicio
- Busca mensajes que digan:
  - ✅ `[EMAIL SENT]` → Email se envió correctamente
  - ❌ `[EMAIL ERROR]` → Hay un error
  - ⚠️ `[EMAIL] GMAIL_USER` → Variables NO están configuradas

**Posible solución:**
- Si los variables no aparecen en Logs, **Render no las está cargando**
- Intenta:
  1. Ir a **Settings** → **Redeploy** → **Deploy latest commit**
  2. Espera 3-5 minutos a que reinicie completamente

---

## 📱 Resumen de Variables

```
GMAIL_USER=tecnologiaclusterp@gmail.com
GMAIL_PASS=vehc tudk sacm lpqt
DATABASE_URL=postgresql://... (ya existe)
SESSION_SECRET=... (ya existe)
NODE_ENV=production
```

Una vez agregues `GMAIL_USER` y `GMAIL_PASS`, **tu sistema estará 100% funcional** en Render.

---

## 🆘 Debugging

Si quieres verificar que las variables están configuradas:

1. Abre tu app en Render
2. Ve a la URL: `https://tu-app.onrender.com/api/debug/email-config`
3. Deberías ver:
   ```json
   {
     "gmailUserConfigured": true,
     "gmailPassConfigured": true,
     "gmailUserValue": "tec***"
   }
   ```

Si aparece `false`, las variables NO están en Render.
