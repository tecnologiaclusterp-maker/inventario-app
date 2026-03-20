# ⚙️ Configuración de Nodemailer con Gmail

Tu sistema ya está preparado para enviar emails con **Nodemailer + Gmail**. Solo falta agregar las credenciales como secretos de Replit.

## 📝 Pasos para Configurar

### 1. Abre el panel de "Secrets" en Replit
- En la barra lateral izquierda, busca el ícono de **"Secrets"** (candado)
- O usa el atajo: **Ctrl+K** y busca "secrets"

### 2. Agrega las dos variables de entorno:

**Variable 1:**
```
GMAIL_USER=tecnologiaclusterp@gmail.com
```

**Variable 2:**
```
GMAIL_PASS=vehc tudk sacm lpqt
```

### 3. Reinicia la aplicación
- Una vez agregados los secretos, reinicia el workflow **"Start application"**

---

## ✅ Cómo Verificar que Funciona

1. **Abre tu app** en el navegador
2. Ve a **"Olvidar Contraseña"** en la pantalla de login
3. Ingresa tu correo
4. Haz clic en **"Enviar"**
5. **Revisa tu bandeja de entrada** - deberías recibir el email con la contraseña temporal

### En caso de no recibir el email:
1. Revisa **Spam** o **Correo no deseado**
2. Si tampoco está ahí, abre la consola del servidor y busca mensajes `[EMAIL ERROR]` o `[EMAIL SENT]`
3. Contacta a IT si persiste el problema

---

## 🔧 Cómo Funciona Internamente

El sistema en `server/auth.ts`:
- ✅ **Genera** una contraseña temporal aleatoria
- ✅ **Guarda** la contraseña hasheada en la base de datos
- ✅ **Intenta enviar** por email con Nodemailer
- ✅ **Si el email falla**, el usuario sigue pudiendo iniciar sesión (la contraseña está guardada)
- ✅ **Al cambiar contraseña**, se cierra la sesión y obliga re-login

---

## 📧 Variables Configuradas

| Variable | Valor |
|----------|-------|
| `GMAIL_USER` | tecnologiaclusterp@gmail.com |
| `GMAIL_PASS` | vehc tudk sacm lpqt |

**Nota:** Esta contraseña es una **"Contraseña de Aplicación"** de Gmail. No es tu contraseña de cuenta de Google regular. Es más segura para aplicaciones.

---

## 🚀 Listo

Una vez agregados los secretos, tu sistema estará **100% funcional** con envío de emails automáticos.
