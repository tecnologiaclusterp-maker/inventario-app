# 📖 Instructivo de Uso - IT Helpdesk

**Sistema de Gestión de Tickets y Inventario IT**

---

## 📋 Tabla de Contenidos

1. [Acceso al Sistema](#acceso-al-sistema)
2. [Recuperar Contraseña](#recuperar-contraseña)
3. [Para Usuarios Normales](#para-usuarios-normales)
4. [Para Analistas IT](#para-analistas-it)
5. [Para Administradores](#para-administradores)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🔐 Acceso al Sistema

### Primer Acceso

1. Dirígete a la dirección de la app
2. Verás la pantalla de **Inicio de Sesión**
3. Ingresa tu:
   - **Usuario**: Tu nombre de usuario asignado
   - **Contraseña**: La contraseña que te proporcionó IT

### Cambiar Contraseña (Primer Acceso)

Si es tu primer acceso:
1. Inicia sesión con la contraseña temporal
2. **Automáticamente se abre** la pantalla de "Cambiar Contraseña"
3. Ingresa tu **nueva contraseña** (mínimo 6 caracteres)
4. Confirma la nueva contraseña
5. Haz clic en **"Guardar"**
6. ¡Listo! Serás redirigido al Dashboard

---

## 🔑 Recuperar Contraseña

Si **olvidaste tu contraseña**:

1. En la pantalla de login, haz clic en **"¿Olvidó su contraseña?"**
2. Ingresa tu **correo electrónico** registrado
3. Haz clic en **"Enviar"**
4. **Recibirás un correo** con una contraseña temporal
5. Copia la contraseña temporal y úsala para iniciar sesión
6. Una vez dentro, **deberás cambiar tu contraseña** a una nueva

---

## 👤 Para Usuarios Normales

Los **usuarios normales** pueden crear y ver sus propios tickets de soporte.

### Crear un Nuevo Ticket

1. Desde el **Dashboard**, haz clic en el botón **"Crear Ticket"** o ve a la pestaña **"Tickets"**
2. Completa el formulario:
   - **Título**: Descripción corta del problema (ej: "La impresora no funciona")
   - **Descripción**: Explica el problema en detalle
   - **Prioridad**: Selecciona si es baja, media o alta
   - **Categoría**: Tipo de problema (Hardware, Software, Red, etc.)
   - **Subida de Imagen**: Opcionalmente, sube una foto del problema
3. Haz clic en **"Crear"**
4. Tu ticket aparecerá en la lista con estado **"Abierto"**

### Ver Mis Tickets

1. Dirígete a la pestaña **"Tickets"**
2. Verás todos tus tickets creados
3. Haz clic en cualquier ticket para ver:
   - Estado actual
   - Quién lo está atendiendo (si está asignado)
   - Notas de resolución
   - Evidencia de solución

### Estados de un Ticket

| Estado | Significado |
|--------|-------------|
| **Abierto** | Tu ticket fue creado, esperando asignación |
| **Asignado** | Un analista IT está trabajando en él |
| **Resuelto** | El problema fue solucionado |
| **Cerrado** | Confirmaste que el problema está arreglado |

---

## 👨‍💻 Para Analistas IT

Los **analistas** pueden ver todos los tickets, asignarlos a sí mismos y resolverlos.

### Ver Todos los Tickets

1. Ve a la pestaña **"Tickets"**
2. Verás una lista de **todos los tickets del sistema**
3. Puedes filtrar por:
   - **Estado** (Abierto, Asignado, Resuelto, Cerrado)
   - **Prioridad** (Baja, Media, Alta)
   - **Creador** (Qué usuario lo creó)

### Asignar un Ticket

1. Haz clic en el ticket que quieres atender
2. En la sección **"Asignar"**, haz clic en el campo de asignación
3. Selecciona tu nombre (para asignártelo a ti)
4. Haz clic en **"Actualizar"**
5. El estado cambia automáticamente a **"Asignado"**

### Resolver un Ticket

1. Abre el ticket que estás atendiendo
2. En la sección **"Resolver Ticket"**, verás:
   - **Notas de Resolución**: Escribe aquí cómo solucionaste el problema
   - **Subir Evidencia**: Sube una foto de la solución (si aplica)
3. Haz clic en **"Resolver"**
4. El estado cambia a **"Resuelto"**
5. El usuario podrá confirmar que está resuelto

### Ver Inventario

1. Ve a la pestaña **"Inventario"**
2. Verás todos los equipos registrados
3. Puedes filtrar por **categoría**:
   - Computadoras
   - Monitores
   - Impresoras
   - Teléfonos
   - Tablets
   - Routers
   - Licencias
   - SIM Cards

4. Haz clic en cualquier equipo para ver:
   - Especificaciones técnicas
   - Historial de movimientos
   - Historial de asignaciones

---

## 👨‍⚖️ Para Administradores

Los **administradores** tienen acceso total al sistema: gestión de tickets, inventario, usuarios y reportes.

### Crear Usuarios

1. Ve a la pestaña **"Usuarios"**
2. Haz clic en **"Crear Usuario"**
3. Completa:
   - **Nombre de Usuario**: Identificador único
   - **Nombre Completo**: Nombre real del usuario
   - **Correo**: Email corporativo
   - **Código de Registro**:
     - `DESK2026` o `HELPDESK2026` → Crea administrador
     - `ANALYST2026` → Crea analista
     - Cualquier otro código → Crea usuario normal
4. Haz clic en **"Crear"**
5. Se genera una **contraseña temporal** - notifica al usuario

### Resetear Contraseña de Usuario

1. Ve a la pestaña **"Usuarios"**
2. Busca el usuario
3. Haz clic en el botón **"Resetear Contraseña"**
4. Se genera una **nueva contraseña temporal**
5. Cópiala y entrégala al usuario
6. El usuario deberá cambiarla al siguiente login

### Gestionar Inventario

#### Ver Inventario Completo

1. Ve a la pestaña **"Inventario"**
2. Haz clic en **"Dashboard"** para ver:
   - Gráficos de equipos por categoría
   - Total de activos
   - Equipo más reciente
   - Equipo más antiguo

#### Crear/Agregar Equipo

1. Ve a **"Inventario"** → **"Agregar Equipo"**
2. Selecciona la **categoría** del equipo
3. Rellena:
   - **Nombre/Modelo**: Ej: "Lenovo ThinkPad X1"
   - **Especificaciones**: Procesador, RAM, Disco, etc.
   - **Ubicación**: Dónde está el equipo
   - **Asignado A**: Usuario responsable (si aplica)
   - **Estado**: Disponible, En Uso, En Mantenimiento, etc.
4. Haz clic en **"Guardar"**

#### Editar Equipo

1. Abre el equipo desde la lista
2. Haz clic en **"Editar"**
3. Modifica los campos necesarios
4. Haz clic en **"Guardar Cambios"**

#### Asignar Equipo a Usuario

1. Abre el equipo
2. En la sección **"Asignado A"**, selecciona el usuario
3. Haz clic en **"Actualizar"**
4. Se registra automáticamente en el historial

### Reportes y Exportación

1. Ve a la pestaña **"Reportes"**
2. Verás la opción **"Descargar Reporte de Tickets"**
3. Haz clic en el botón
4. Se descarga un archivo **CSV** con:
   - Todos los tickets
   - Creador
   - Asignado a
   - Estado actual
   - Fecha de creación
5. Puedes abrirlo en Excel o Google Sheets para análisis

---

## ❓ Preguntas Frecuentes

### P: No recibí el email de contraseña temporal
**R:** Los emails pueden tardar 2-3 minutos. Revisa tu carpeta de **Spam**. Si aún no llega, contacta a IT.

### P: Mi contraseña temporal no funciona
**R:** Cópialaperfectamente, incluyendo mayúsculas y números. Si aún falla, pide un reseteo a IT.

### P: ¿Puedo ver tickets de otros usuarios?
**R:** 
- **Usuario Normal**: No, solo los tuyos
- **Analista**: Sí, todos los tickets del sistema
- **Admin**: Sí, todos los tickets + acceso total

### P: Se me olvidó asignarle equipo a un usuario
**R:** Ve a **"Inventario"** → abre el equipo → haz clic en **"Editar"** → asigna el usuario → **"Guardar"**

### P: ¿Dónde veo el historial de cambios en inventario?
**R:** Abre cualquier equipo y mira la sección **"Historial de Movimientos"**

### P: ¿Cómo exporto todos los tickets?
**R:** Ve a **"Reportes"** (solo para Administradores) → **"Descargar Reporte"** → se descarga un CSV

### P: La app se ve lenta
**R:** 
1. Intenta **F5** (recargar página)
2. Borra el caché (Ctrl+Shift+Del)
3. Si persiste, contacta a IT

### P: Necesito reportar un error/bug
**R:** Captura una pantalla y envíala a IT con:
   - Qué paso hiciste
   - Qué esperabas que pasara
   - Qué pasó en su lugar

---

## 📞 Contacto IT

Para soporte, contacta a tu equipo IT:
- **Email**: it@company.com
- **Teléfono**: Ext. 1234
- **En Persona**: Oficina 3B

---

**Última actualización:** 16 de Marzo de 2026  
**Versión del Sistema:** 1.0
