# ANDREA — SPEC COMPLETA DEL PRODUCTO
## Parte 2: Historias de Usuario, Requerimientos Funcionales y No Funcionales

---

## 7. HISTORIAS DE USUARIO

### 7.1 Módulo: Autenticación

| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-001 | Como recruiter, quiero iniciar sesión con email y contraseña para acceder al portal | Login exitoso redirige al dashboard. Error muestra mensaje claro. Máximo 5 intentos antes de bloqueo temporal. |
| US-002 | Como recruiter, quiero recuperar mi contraseña por email | Email de recuperación llega en < 5 minutos. Link expira en 1 hora. |
| US-003 | Como Super Admin, quiero crear cuentas de empresa con sus admin | Empresa creada recibe email de bienvenida. Admin puede loguearse en < 5 minutos. |
| US-004 | Como Admin Empresa, quiero crear y gestionar usuarios de mi empresa | Puedo crear recruiters y viewers. No puedo crear super admins. |

### 7.2 Módulo: Campañas y Candidatos

| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-010 | Como recruiter, quiero crear una campaña de evaluación con nombre y puesto | Campaña creada en < 30 segundos. Aparece en listado. |
| US-010b | Como recruiter, al seleccionar el puesto quiero ver las competencias que se van a evaluar antes de confirmar | Modal muestra listado de competencias del puesto. Puedo confirmar o ir a editar el puesto. |
| US-010c | Como Admin Empresa, quiero modificar las competencias predefinidas de un puesto para mi empresa | Cambios guardados sin afectar competencias de otras empresas. Solo Admin y Admin Empresa pueden editar. |
| US-011 | Como recruiter, quiero cargar un candidato con nombre, email y puesto | Candidato creado y vinculado a campaña. Link generado automáticamente. |
| US-012 | Como recruiter, quiero copiar el link de evaluación de un candidato con un click | Link copiado al clipboard. Toast de confirmación visible. |
| US-013 | Como recruiter, quiero ver el estado de cada candidato (pendiente/iniciado/completado/expirado) | Estado actualizado en tiempo real o con refresh. |
| US-014 | Como recruiter, quiero filtrar candidatos por estado y campaña | Filtros aplicados en < 1 segundo. Resultados precisos. |
| US-015 | Como viewer, quiero ver los resultados de candidatos sin poder editarlos | Vista de solo lectura. Sin botones de acción. |

### 7.3 Módulo: Evaluación del Candidato

| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-020 | Como candidato, quiero ver una pantalla de bienvenida clara con instrucciones | Página carga en < 3 segundos. Nombre de empresa visible. Duración estimada visible. |
| US-021 | Como candidato, quiero leer y aceptar el consentimiento informado antes de iniciar | No puedo continuar sin aceptar. Timestamp registrado en backend. |
| US-022 | Como candidato, quiero probar el micrófono antes de iniciar | Detección de audio funciona. Instrucciones claras si falla. |
| US-023 | Como candidato, quiero que el agente me explique cómo funciona la entrevista | Agente saluda en < 2 segundos. Explicación dura máximo 30 segundos. |
| US-024 | Como candidato, quiero poder hablar con fluidez sin interrupciones del agente | Agente detecta fin de habla antes de responder. No interrumpe. |
| US-025 | Como candidato, quiero recibir una confirmación al finalizar | Pantalla de cierre amigable. No promete resultado. |
| US-026 | Como candidato, quiero que el link expire si ya fue completado | Link expirado muestra mensaje claro. No permite segunda evaluación. |

### 7.4 Módulo: Reportes y Scoring

| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-030 | Como recruiter, quiero ver el score global y semáforo de un candidato en la lista | Score visible en tarjeta de candidato. Semáforo con color. |
| US-031 | Como recruiter, quiero abrir el reporte completo de un candidato | Reporte carga en < 3 segundos. Incluye resumen, dimensiones y evidencias. |
| US-032 | Como recruiter, quiero descargar el reporte en PDF | PDF generado en < 10 segundos. Formato correcto. Incluye disclaimer. |
| US-033 | Como recruiter, quiero ver la transcripción completa de la entrevista | Transcripción mostrada con timestamps. Legible. |
| US-034 | Como recruiter, quiero marcar mi decisión sobre un candidato | Opciones: Recomendado / Revisar / No recomendado. Decisión guardada con timestamp y usuario. |

### 7.5 Módulo: Administración (Super Admin)

| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-040 | Como Super Admin, quiero ver todas las empresas registradas | Listado con nombre, plan, fecha de alta, total de evaluaciones. |
| US-041 | Como Super Admin, quiero ver métricas globales de uso | Dashboard con: total evaluaciones, empresas activas, tiempo promedio, tasa de completitud. |
| US-042 | Como Super Admin, quiero deshabilitar una empresa | Empresa deshabilitada no puede crear nuevas evaluaciones. Datos se conservan. |

---

## 8. REQUERIMIENTOS FUNCIONALES

### RF-01: Autenticación y Autorización
- RF-01.1: Login con email y contraseña (JWT, expiración 8 horas)
- RF-01.2: Refresh token con expiración de 30 días
- RF-01.3: Recuperación de contraseña por email
- RF-01.4: Bloqueo de cuenta tras 5 intentos fallidos (desbloqueo automático 15 minutos)
- RF-01.5: RBAC con 5 roles: Super Admin, Admin Empresa, Recruiter, Viewer, Candidato (sistema)
- RF-01.6: Logout explícito + invalidación de token

### RF-02: Gestión de Empresas (Super Admin)
- RF-02.1: CRUD de empresas con campos: nombre, país, CUIT/RFC/NIT, plan, estado, fecha alta
- RF-02.2: Activación/desactivación de empresas
- RF-02.3: Vista de métricas por empresa: evaluaciones totales, completadas, promedio de score
- RF-02.4: Configuración de límites de evaluaciones por plan

### RF-03: Gestión de Usuarios
- RF-03.1: CRUD de usuarios vinculados a empresa
- RF-03.2: Asignación de roles por empresa
- RF-03.3: Invitación por email con contraseña temporal
- RF-03.4: Un usuario puede pertenecer solo a una empresa

### RF-04: Campañas de Evaluación
- RF-04.1: CRUD de campañas con campos: nombre, puesto, descripción, fecha de expiración, estado
- RF-04.2: Estados de campaña: activa, pausada, cerrada
- RF-04.3: Vinculación de múltiples candidatos a una campaña
- RF-04.4: Configuración de expiración de links (default: 7 días)
- RF-04.5: Al seleccionar un puesto al crear campaña, el sistema muestra las competencias configuradas para ese puesto
- RF-04.6: El reclutador puede confirmar las competencias o navegar al puesto para editarlas antes de crear la campaña

### RF-04B: Puestos de Trabajo y Competencias (MVP)

El MVP incluye 4 puestos predefinidos con competencias base. Cada empresa puede personalizar las competencias a través del Admin Empresa.

**1. Customer Support**
- Orientación al cliente (conductual)
- Tolerancia a la presión y frustración (conductual)
- Comunicación clara y empatía (comunicación)
- Resolución de problemas simples (cognitiva)
- Escucha activa (comunicación)

**2. Ventas**
- Orientación a resultados (conductual)
- Persuasión y comunicación efectiva (comunicación)
- Adaptabilidad ante el rechazo (conductual)
- Razonamiento comercial básico (cognitiva)
- Autoconfianza declarativa (conductual)

**3. Backoffice**
- Responsabilidad y orden (conductual)
- Atención al detalle (cognitiva)
- Comprensión de instrucciones (cognitiva)
- Comunicación escrita/verbal clara (comunicación)
- Honestidad laboral (conductual)

**4. Operaciones Logísticas**
- Responsabilidad y puntualidad (conductual)
- Adaptabilidad a cambios de ruta/tarea (conductual)
- Comprensión de instrucciones operativas (cognitiva)
- Trabajo bajo presión (conductual)
- Comunicación funcional (comunicación)

Reglas de configuración:
- RF-04B.1: Las competencias predefinidas son globales del sistema (seed de datos en deploy)
- RF-04B.2: Cada empresa tiene su propia copia de las competencias por puesto (editable)
- RF-04B.3: Solo Admin Empresa y Super Admin pueden editar competencias de un puesto
- RF-04B.4: Las competencias editadas aplican a nuevas campañas (no retroactivo)
- RF-04B.5: Los prompts del agente se generan dinámicamente en función de las competencias activas del puesto

### RF-05: Gestión de Candidatos
- RF-05.1: Alta manual de candidato: nombre, apellido, email, teléfono (opcional), campaña
- RF-05.2: Estados de candidato: Pendiente, Iniciado, Completado, Expirado
- RF-05.3: Generación automática de link único por candidato (UUID v4 + firma)
- RF-05.4: Botón "Copiar link" en listado y vista detalle
- RF-05.5: Filtros: por estado, campaña, fecha, score
- RF-05.6: Un candidato puede ser evaluado una sola vez por campaña

### RF-06: Motor de Evaluación (Flujo del Candidato)
- RF-06.1: Pantalla de bienvenida con datos de empresa y duración estimada
- RF-06.2: Consentimiento informado con texto legal configurable por empresa
- RF-06.3: Registro de aceptación de consentimiento (timestamp, IP, user agent)
- RF-06.4: Test de micrófono pre-entrevista con detección de nivel de audio
- RF-06.5: Inicio de sesión de voz con agente IA
- RF-06.6: Captura de audio en tiempo real (WebRTC o MediaRecorder API)
- RF-06.7: Transcripción en tiempo real o near-real-time (STT)
- RF-06.8: El agente adapta dinámicamente las preguntas según el puesto de la campaña y las competencias activas configuradas para ese puesto
- RF-06.9: Sistema de re-pregunta si respuesta es incompleta o ambigua (máximo 2 veces por pregunta)
- RF-06.10: Temporizador máximo de sesión (20 minutos hard limit)
- RF-06.11: Guardado incremental de turns de conversación
- RF-06.12: Pantalla de finalización al completar todas las preguntas o alcanzar límite de tiempo

### RF-07: Transcripción y Análisis
- RF-07.1: STT automático del audio de la sesión completa
- RF-07.2: Almacenamiento de transcripción por turn (pregunta-respuesta)
- RF-07.3: Pipeline de análisis asíncrono post-sesión
- RF-07.4: LLM evalúa cada respuesta según rubrica estructurada
- RF-07.5: Output del análisis en JSON estructurado con scores por dimensión

### RF-08: Scoring
- RF-08.1: Score cognitivo (0-100): comprensión, razonamiento, resolución de problemas
- RF-08.2: Score conductual (0-100): responsabilidad, adaptabilidad, honestidad laboral
- RF-08.3: Score comunicación (0-100): claridad, coherencia, estructura
- RF-08.4: Score consistencia (0-100): coherencia entre respuestas, detección de contradicciones
- RF-08.5: Score global (0-100): promedio ponderado configurable
- RF-08.6: Nivel de recomendación automático: Verde (70-100), Amarillo (40-69), Rojo (0-39)
- RF-08.7: Detección y registro de alertas de riesgo (respuestas evasivas, contradicciones, baja comprensión)

### RF-09: Reportes
- RF-09.1: Generación automática de reporte en < 2 minutos post-evaluación
- RF-09.2: Vista web del reporte con secciones colapsables
- RF-09.3: Descarga de PDF del reporte (server-side rendering)
- RF-09.4: Reporte incluye: datos candidato, score global, semáforo, resumen ejecutivo, fortalezas, riesgos, dimensiones, evidencias, transcripción, disclaimer legal
- RF-09.5: Disclaimer legal visible en todo reporte (no diagnóstico clínico, herramienta de apoyo)

### RF-10: Dashboard Empresa
- RF-10.1: KPIs visibles: evaluaciones totales, completadas, en curso, expiradas
- RF-10.2: Listado de candidatos recientes con estado y score
- RF-10.3: Acceso rápido a campañas activas
- RF-10.4: Notificación in-app cuando candidato completa evaluación

### RF-11: Auditoría
- RF-11.1: Log de: login/logout, creación/modificación de candidatos, acceso a reportes, descarga de PDF, cambios de estado de candidato, decisiones de recruiter
- RF-11.2: Campos de log: timestamp, user_id, action, entity_type, entity_id, ip_address
- RF-11.3: Logs disponibles para Super Admin y Admin Empresa (solo de su empresa)
- RF-11.4: Retención de logs: mínimo 1 año

### RF-12: Notificaciones
- RF-12.1: Email al recruiter cuando candidato completa evaluación
- RF-12.2: Email al candidato confirmando que fue invitado a evaluación (opcional, configurable)
- RF-12.3: Notificación in-app de evaluaciones completadas

---

## 9. REQUERIMIENTOS NO FUNCIONALES

### RNF-01: Rendimiento
- RNF-01.1: Tiempo de carga de pantallas de candidato < 3 segundos (conexión 4G)
- RNF-01.2: Latencia del agente de voz < 2 segundos entre fin de habla y respuesta
- RNF-01.3: Generación de reporte < 2 minutos post evaluación
- RNF-01.4: Generación de PDF < 10 segundos
- RNF-01.5: API REST responde < 500ms en percentil 95

### RNF-02: Disponibilidad y Confiabilidad
- RNF-02.1: Uptime ≥ 99% en horario hábil LATAM (7am-10pm, lunes a sábado)
- RNF-02.2: Mantenimiento programado fuera de horario hábil con aviso previo de 48 horas
- RNF-02.3: Sesiones de evaluación persistentes: si candidato pierde conexión, puede retomar en < 5 minutos
- RNF-02.4: Reintentos automáticos en transcripción y análisis IA

### RNF-03: Escalabilidad
- RNF-03.1: Arquitectura stateless en backend para escalar horizontalmente
- RNF-03.2: Soporte de mínimo 50 sesiones de voz concurrentes en MVP
- RNF-03.3: Diseño de base de datos con particionamiento por empresa (row-level security)

### RNF-04: Seguridad
- RNF-04.1: TLS 1.2+ para todo el tráfico
- RNF-04.2: Contraseñas hasheadas con bcrypt (factor 12)
- RNF-04.3: Audios y transcripciones encriptados en reposo (AES-256)
- RNF-04.4: Links de evaluación firmados con HMAC y expiración configurable
- RNF-04.5: Rate limiting en endpoints públicos (evaluación, auth)
- RNF-04.6: Headers de seguridad: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- RNF-04.7: CORS configurado con whitelist de dominios
- RNF-04.8: Secrets en variables de entorno, nunca en código

### RNF-05: Accesibilidad y Compatibilidad
- RNF-05.1: Interfaz candidato: Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- RNF-05.2: Mobile-first responsive (funcional desde 360px de ancho)
- RNF-05.3: WebRTC soportado en todos los browsers objetivo
- RNF-05.4: Fallback: si WebRTC no soportado, mensaje claro de browser requerido
- RNF-05.5: Portal empresa: funcional en desktop (1280px+)

### RNF-06: Mantenibilidad
- RNF-06.1: Cobertura de tests unitarios ≥ 70% en backend
- RNF-06.2: Documentación de API (OpenAPI/Swagger)
- RNF-06.3: Variables de entorno documentadas en .env.example
- RNF-06.4: Logs estructurados (JSON) con niveles: debug, info, warn, error
- RNF-06.5: Dockerización completa con docker-compose para desarrollo local

### RNF-07: Compliance y Legal
- RNF-07.1: Consentimiento informado registrado con timestamp e IP
- RNF-07.2: Política de privacidad accesible desde toda pantalla de candidato
- RNF-07.3: Términos de uso para empresas
- RNF-07.4: Datos de candidatos eliminables a solicitud (derecho al olvido — preparación para GDPR)
- RNF-07.5: Retención de datos configurable por empresa (default: 2 años)
- RNF-07.6: Disclaimer en todo reporte: "Este reporte es una herramienta de apoyo para procesos de selección laboral y no constituye un diagnóstico psicológico o médico."
- RNF-07.7: No recopilar datos sensibles: salud, religión, política, orientación sexual, estado civil, embarazo
- RNF-07.8: Explicabilidad mínima del score: breve descripción de qué evalúa cada dimensión

---

*Continúa en ANDREA_SPEC_parte3.md: Arquitectura técnica, modelo de datos y APIs*
