# ANDREA — SPEC COMPLETA DEL PRODUCTO
## Parte 5: Seguridad, Roadmap, Riesgos, Plan de Implementación y Backlog

---

## 18. SEGURIDAD Y COMPLIANCE

### 18.1 Principios de Seguridad

| Capa | Medida |
|------|--------|
| Transporte | TLS 1.2+ en todos los endpoints. HSTS habilitado. |
| Autenticación | JWT con expiración 8h. Refresh token 30d. Bcrypt factor 12. |
| Autorización | RBAC por rol + Row-Level Security por company_id en BD |
| Links | Firmados con HMAC-SHA256. Expiración configurable. Un solo uso. |
| Almacenamiento | AES-256 en reposo para audios, transcripciones, reportes en Railway Buckets |
| API | Rate limiting: 5 req/s en /eval (público), 100 req/s en /api autenticada |
| Headers | CSP, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy |
| Secrets | Variables de entorno. Nunca en código ni logs. Railway Secrets en prod. |
| Logs | Logs estructurados, sin PII sensible en texto plano |
| Auditoría | Toda acción crítica logueada (ver RF-11) |

### 18.2 Consentimiento y Privacidad

- **Consentimiento explícito:** Texto claro, checkbox activo, registro de timestamp + IP + user_agent + hash del texto aceptado.
- **Política de privacidad:** Accesible desde toda pantalla del candidato. Redactada en español claro (no legalés).
- **Términos de uso:** Aceptados por empresa al registrarse.
- **Derecho al olvido:** Endpoint para eliminar todos los datos de un candidato a solicitud (soft delete + purge job).
- **Datos mínimos:** Solo se recopilan los datos estrictamente necesarios. Sin salud, religión, política, orientación sexual, estado civil, embarazo.
- **Retención:** Configurable por empresa. Default: 2 años. Después de retención: anonimización o eliminación.

### 18.3 Compliance LATAM / GDPR (preparación futura)

| Regulación | País | Preparación MVP | Acción Futura |
|------------|------|-----------------|---------------|
| Ley 25.326 (Habeas Data) | Argentina | Consentimiento + eliminación bajo pedido | DPO, registro de bases |
| LFPDPPP | México | Consentimiento + aviso de privacidad | Actualización de aviso |
| Ley 1581 | Colombia | Consentimiento explícito | Registro ante SIC |
| Ley 19.628 | Chile | Consentimiento explícito | Monitorear nueva ley en progreso |
| GDPR | España (futuro) | Arquitectura preparada para portabilidad y eliminación | DPO + Data Processing Agreements |

### 18.4 Consideraciones Éticas y Legales del Producto

1. **No diagnóstico clínico:** ANDREA es explícitamente una herramienta de apoyo a la selección. Disclaimer en todo reporte.
2. **Explicabilidad:** El score incluye siempre un resumen en lenguaje natural y evidencias de la conversación. No es una caja negra.
3. **Revisión humana recomendada:** El reporte recomienda explícitamente que la decisión final sea tomada por una persona.
4. **No discriminación:** El sistema no evalúa ni registra: edad (más allá de la validación mínima), género, raza, religión, orientación sexual, estado civil, embarazo.
5. **Validez psicométrica:** El MVP debe comunicarse como "herramienta de apoyo" (no como test validado psicométricamente). Validación formal post-MVP.
6. **Candidato informado:** El candidato siempre sabe que está hablando con una IA y qué se va a evaluar.

---

## 19. ROADMAP POST-MVP

### Fase 0: MVP (0 a 3 meses)
- ✅ Agente de voz conversacional
- ✅ Scoring automático con semáforo
- ✅ Reporte PDF descargable
- ✅ Portal empresa básico
- ✅ 3 dimensiones de evaluación
- ✅ Consentimiento y auditoría

### Fase 1: Consolidación (3 a 6 meses)
- Benchmark de scores por puesto/industria
- Mejora de calidad de reportes (más personalización por empresa)
- Configuración de evaluación por empresa (seleccionar preguntas, ajustar pesos)
- Integración con WhatsApp para envío de links
- Analítica básica (histórico de scores, evolución, distribución)
- Email de invitación automático al candidato
- Soporte multi-campaña avanzado

### Fase 2: Expansión (6 a 12 meses)
- Integraciones ATS (Workday, Greenhouse, BambooHR, ADP — API)
- Modelos de scoring ajustados por industria (call center vs. retail vs. logística)
- Validación psicométrica formal con psicólogos expertos
- API pública para integraciones de clientes
- Multi-país mejorado (detección de acento, terminología regional)
- Panel de analítica avanzado (cohortes, funnel de selección)
- Cumplimiento avanzado GDPR para España

### Fase 3: Plataforma (12 a 24 meses)
- Marketplace de evaluaciones (diferentes tipos de tests por perfil)
- Modelos predictivos de rotación temprana
- Copiloto para recruiters (sugerencias post-evaluación)
- Expansión a España con cumplimiento local
- Certificaciones de producto (ISO 27001, SOC 2)
- White label para consultoras de RRHH

---

## 20. KPIs Y MÉTRICAS

### 20.1 KPIs de Negocio

| KPI | Meta MVP (90 días) | Frecuencia de medición |
|-----|-------------------|----------------------|
| Empresas piloto activas | 10 | Semanal |
| Clientes con contrato pago | 3 | Mensual |
| Evaluaciones realizadas | 1.000 | Semanal |
| MRR | > $0 (primer contrato) | Mensual |
| Tasa de conversión piloto → pago | > 30% | Mensual |
| NPS empresa | > 40 | Al mes 3 |

### 20.2 KPIs de Producto

| KPI | Meta | Frecuencia |
|-----|------|-----------|
| Tasa de completitud de evaluaciones | ≥ 80% | Diaria |
| Tiempo promedio de evaluación | ≤ 15 min | Diaria |
| Tiempo de generación de reporte | < 2 min | Diaria |
| % de reportes descargados | > 60% | Semanal |
| Tasa de abandono en consentimiento | < 5% | Semanal |
| Tasa de abandono en test de micrófono | < 10% | Semanal |
| % de evaluaciones con error técnico | < 3% | Diaria |

### 20.3 KPIs de Calidad de IA

| KPI | Meta | Frecuencia |
|-----|------|-----------|
| WER (Word Error Rate) STT | < 15% | Semanal |
| % de reportes marcados como útiles | > 80% | Semanal |
| Correlación score ANDREA vs. decisión recruiter | > 0.7 | Mensual |
| % de scores cuestionados por empresa | < 5% | Mensual |

---

## 21. RIESGOS Y MITIGACIONES

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---|--------|-------------|---------|-----------|
| R-01 | **Legal**: Claims de discriminación o diagnóstico no autorizado | Media | Alto | Disclaimer explícito. Consultoría legal pre-lanzamiento. No evaluar criterios protegidos. Posicionar como "herramienta de apoyo". |
| R-02 | **Sesgo de IA**: El modelo favorece ciertos perfiles culturales o socioeconómicos | Media | Alto | Auditoría de sesgos en scoring. Revisión de rubrica con psicólogos. Test con grupos diversos. Ajustes de prompt. |
| R-03 | **Baja aceptación de candidatos**: Rechazan hacer la entrevista por voz | Alta | Alto | UX de bienvenida muy clara. Explicar que es IA (no persona). Duración corta. Lenguaje amigable. Piloto con encuesta post-evaluación. |
| R-04 | **Calidad de audio**: Ruido, mala conexión, micrófonos deficientes | Alta | Medio | Test de micrófono previo. Instrucciones de entorno. STT tolerante al ruido. Permitir retomar sesión. |
| R-05 | **Confiabilidad del scoring**: Resultados poco consistentes entre evaluaciones similares | Media | Alto | Rubrica estructurada en prompt. Output forzado a JSON. Validación de consistencia con casos de prueba. Ajuste iterativo. |
| R-06 | **Dependencia de APIs externas**: OpenAI, ElevenLabs, etc. pueden cambiar precios o APIs | Media | Medio | Abstracción de proveedores (capa de servicio intercambiable). Monitoreo de costos. Plan de contingencia con alternativas (Whisper local, modelos open source). |
| R-07 | **Claims psicométricos**: Clientes esperan validez psicométrica formal del MVP | Alta | Medio | Comunicación clara: MVP es herramienta de apoyo, no test validado. Roadmap de validación formal documentado para clientes. |
| R-08 | **Competencia rápida**: Competidores grandes replican la propuesta | Media | Medio | Velocidad de ejecución. Foco en nicho LATAM. Relaciones con clientes piloto. Precio accesible. |
| R-09 | **Costo de IA**: Costo por evaluación más alto de lo planificado | Media | Medio | Monitoreo de tokens por sesión. Optimización de prompts. Límites de sesión. Modelo de pricing por evaluación. |
| R-10 | **Privacidad de datos de audio**: Candidatos preocupados por grabaciones | Media | Medio | Consentimiento explícito. Política de retención clara. Opción de eliminación. Encriptación visible en comunicación. |

---

## 22. PLAN DE IMPLEMENTACIÓN (60-90 DÍAS)

### FASE 1: Discovery y Fundamentos (Semanas 1-2)

**Objetivos:** Alinear equipo, validar supuestos, definir arquitectura técnica final, preparar guion de entrevista.

| Tarea | Responsable | Entregable |
|-------|-------------|-----------|
| Kick-off y alineación de equipo | PM | Acta de kick-off, backlog inicial |
| Entrevistas con 5 potenciales clientes (validar propuesta de valor) | PM + Founder | Insights documentados |
| Definición de arquitectura técnica final | Tech Lead | ADR (Arquitectura Decision Record) |
| Elección de proveedores de IA (STT, TTS, LLM) | Tech Lead + IA | Providers seleccionados, cuentas creadas |
| Diseño de guion base de entrevista | IA + PM + Psicólogo asesor | Guion v1 aprobado |
| Diseño de prompts v1 (orquestador + análisis) | IA Engineer | Prompts testeados en Playground |
| Wireframes de pantallas principales | UX | Wireframes validados con PM |
| Modelo de datos v1 | Backend | Schema PostgreSQL inicial |
| Setup del repo y entorno de desarrollo | DevOps | Repos GitHub, Docker Compose funcional |

### FASE 2: Construcción Core (Semanas 3-6)

**Objetivos:** Tener un flujo end-to-end funcionando (aunque sea rudo).

| Tarea | Responsable | Semana |
|-------|-------------|--------|
| Backend: Auth + RBAC + modelos base | Backend | S3 |
| Backend: CRUD empresas, usuarios, campañas, candidatos | Backend | S3-S4 |
| Backend: Generación y validación de links | Backend | S4 |
| Frontend empresa: Login, dashboard, campañas, candidatos | Frontend | S3-S5 |
| Frontend candidato: Bienvenida, consentimiento, test mic | Frontend | S4-S5 |
| Integración STT: Azure Speech SDK con audio del browser | IA + Backend | S4-S5 |
| Integración TTS: Azure Neural TTS | IA + Backend | S4 |
| Motor conversacional: Loop pregunta → STT → LLM → TTS | IA + Backend | S5-S6 |
| Frontend candidato: Pantalla de entrevista | Frontend | S5-S6 |
| Storage: Railway Buckets para audios y transcripciones | DevOps + Backend | S5 |
| Pipeline de análisis asíncrono: Bull + Worker | Backend + IA | S6 |

### FASE 3: Scoring, Reportes y Refinamiento (Semanas 7-10)

**Objetivos:** Motor de scoring funcional, reporte generado, piloto interno.

| Tarea | Responsable | Semana |
|-------|-------------|--------|
| Prompt de análisis y scoring v1 | IA Engineer | S7 |
| Motor de scoring: Cálculo + rubrica | Backend + IA | S7-S8 |
| Generación de reporte: Vista web | Frontend + Backend | S8 |
| Generación de PDF del reporte | Backend | S8-S9 |
| Notificaciones por email (SendGrid) | Backend | S9 |
| Auditoría: Log de acciones críticas | Backend | S9 |
| Testing end-to-end del flujo completo | QA | S9-S10 |
| Evaluaciones internas (equipo como candidatos) | Todo el equipo | S10 |
| Ajuste de prompts y scoring basado en resultados internos | IA | S10 |
| Hardening básico de seguridad | DevOps + Backend | S10 |

### FASE 4: Piloto y Lanzamiento (Semanas 11-12)

**Objetivos:** Onboarding de primeras empresas piloto, métricas en marcha.

| Tarea | Responsable | Semana |
|-------|-------------|--------|
| Deploy en producción (Railway) | DevOps | S11 |
| Onboarding de 3-5 empresas piloto | PM + Founder | S11 |
| Capacitación de usuarios empresa (30 min por empresa) | PM | S11 |
| Primeras evaluaciones reales | Clientes piloto | S11-S12 |
| Revisión de calidad de primeros reportes con clientes | PM + IA | S12 |
| Ajustes urgentes basados en feedback | Equipo | S12 |
| Setup de métricas y dashboard de monitoreo | DevOps + PM | S12 |
| Encuesta NPS a clientes piloto | PM | S12 |

---

## 23. BACKLOG PRIORIZADO (PARA SPRINT PLANNING)

### Epic 1: Autenticación y Administración
| ID | Historia | Puntos | Prioridad |
|----|----------|--------|-----------|
| US-001 | Login con email/password | 3 | 🔴 P0 |
| US-002 | Recuperar contraseña | 2 | 🔴 P0 |
| US-003 | Super Admin crea empresa | 3 | 🔴 P0 |
| US-004 | Admin crea usuarios de empresa | 3 | 🔴 P0 |
| US-005 | RBAC completo por rol | 5 | 🔴 P0 |

### Epic 2: Campañas, Candidatos y Puestos
| ID | Historia | Puntos | Prioridad |
|----|----------|--------|-----------|
| US-010 | Crear campaña | 3 | 🔴 P0 |
| US-010b | Vista de competencias del puesto al crear campaña | 3 | 🔴 P0 |
| US-010c | Admin edita competencias de un puesto | 5 | 🟡 P1 |
| US-011 | Cargar candidato manualmente | 2 | 🔴 P0 |
| US-012 | Generar y copiar link único | 3 | 🔴 P0 |
| US-013 | Ver estado de candidato en tiempo real | 3 | 🔴 P0 |
| US-014 | Filtrar candidatos por estado/campaña | 2 | 🟡 P1 |
| US-015 | Vista de solo lectura para Viewer | 2 | 🟡 P1 |

### Epic 3: Evaluación del Candidato
| ID | Historia | Puntos | Prioridad |
|----|----------|--------|-----------|
| US-020 | Pantalla de bienvenida con datos de empresa | 3 | 🔴 P0 |
| US-021 | Consentimiento informado con registro | 3 | 🔴 P0 |
| US-022 | Test de micrófono funcional | 5 | 🔴 P0 |
| US-023 | Agente IA explica dinámica | 5 | 🔴 P0 |
| US-024 | Loop conversacional completo (STT→LLM→TTS) | 13 | 🔴 P0 |
| US-025 | Detección de fin de habla | 5 | 🔴 P0 |
| US-026 | Pantalla de finalización | 2 | 🔴 P0 |
| US-027 | Guardado incremental de turns | 3 | 🔴 P0 |
| US-028 | Límite de tiempo de sesión (20 min hard) | 3 | 🔴 P0 |
| US-029 | Link expirado / ya usado | 2 | 🔴 P0 |

### Epic 4: Análisis y Scoring
| ID | Historia | Puntos | Prioridad |
|----|----------|--------|-----------|
| US-030 | Pipeline de análisis asíncrono post-sesión | 8 | 🔴 P0 |
| US-031 | Scoring por dimensión con rubrica IA | 8 | 🔴 P0 |
| US-032 | Score global + nivel de recomendación | 3 | 🔴 P0 |
| US-033 | Detección de risk flags | 5 | 🟡 P1 |

### Epic 5: Reportes
| ID | Historia | Puntos | Prioridad |
|----|----------|--------|-----------|
| US-040 | Reporte web por candidato | 8 | 🔴 P0 |
| US-041 | Descarga de PDF | 5 | 🔴 P0 |
| US-042 | Transcripción completa en reporte | 3 | 🔴 P0 |
| US-043 | Disclaimer legal visible en reporte | 1 | 🔴 P0 |
| US-044 | Decisión del reclutador en reporte | 2 | 🔴 P0 |

### Epic 6: Infraestructura y Calidad
| ID | Historia | Puntos | Prioridad |
|----|----------|--------|-----------|
| INF-001 | Docker Compose para desarrollo local | 5 | 🔴 P0 |
| INF-002 | Deploy producción en Railway | 8 | 🔴 P0 |
| INF-003 | Railway Buckets para audios y PDFs | 5 | 🔴 P0 |
| INF-004 | Logs estructurados | 3 | 🟡 P1 |
| INF-005 | Audit log de acciones críticas | 3 | 🟡 P1 |
| INF-006 | Notificaciones por email (evaluación completada) | 3 | 🟡 P1 |
| INF-007 | Rate limiting en endpoints públicos | 3 | 🟡 P1 |
| INF-008 | Tests unitarios backend (70% cobertura) | 8 | 🟡 P1 |
| INF-009 | Tests E2E del flujo de evaluación | 8 | 🟡 P1 |

---

## 24. CRITERIOS DE ACEPTACIÓN GLOBALES DEL MVP

| Criterio | Condición de Aceptación |
|----------|------------------------|
| Flujo candidato completo | Un candidato puede completar la evaluación desde el link hasta el mensaje de cierre sin asistencia humana |
| Flujo empresa completo | Un recruiter puede crear campaña, agregar candidato, obtener link, ver reporte y tomar decisión sin asistencia |
| Reporte comprensible | Un recruiter que nunca vio ANDREA entiende la recomendación en < 60 segundos sin instrucciones adicionales |
| Tiempo de evaluación | 80% de evaluaciones completadas duran entre 10 y 17 minutos |
| Tiempo de reporte | Reporte disponible en < 2 minutos para el 95% de los casos |
| Consentimiento | 100% de evaluaciones tienen consentimiento registrado |
| Seguridad | 0 datos accesibles sin autenticación (salvo endpoints públicos de evaluación que requieren token válido) |
| Disponibilidad | 0 caídas > 10 minutos durante horario hábil en el piloto |
| PDF | PDF generado correctamente para el 99% de evaluaciones completadas |
| Disclaimer | Disclaimer legal presente en 100% de los reportes generados |
| Auditoría | Todas las acciones críticas (login, acceso a reporte, download PDF, decisión recruiter) logueadas |

---

## APÉNDICE: CONVENCIONES Y DECISIONES DE DISEÑO

### Convenciones de Código
- Backend: TypeScript estricto, NestJS con módulos por dominio
- Frontend: React funcional con hooks, TypeScript
- Naming: camelCase JS/TS, snake_case SQL
- API versioning: /api/v1/
- Fechas: ISO 8601, UTC en BD, conversión a timezone local en frontend

### Decisiones Clave de Arquitectura

| Decisión | Opción elegida | Razón |
|----------|-----------------|-------|
| Procesamiento de voz | Near-real-time (turn por turn) | Mejor balance entre latencia y costo vs. streaming puro |
| Generación de reporte | Asíncrona post-sesión | Permite análisis más profundo; 2 min es aceptable |
| STT | Azure AI Speech (Real-Time) | Suscripción Azure activa, excelente español LATAM |
| TTS | Azure Neural TTS (`es-MX-DaliaNeural`) | Voz natural, mismo vendor que STT, precio razonable |
| LLM turns | Azure OpenAI GPT-4o mini | Menor costo en turns conversacionales simples |
| LLM análisis | Azure OpenAI GPT-4o | Mayor profundidad en análisis de scoring final |
| Cloud | Railway | Simplicidad operativa, sin gestión de infra, precio predecible |
| Storage | Railway Buckets | S3-compatible, integrado en Railway, egress gratuito |
| Queue | BullMQ + Redis | Probado, confiable, fácil de implementar con NestJS |
| PDF | Puppeteer (headless Chrome) | HTML → PDF de alta calidad con diseño del reporte |

---

**FIN DE LA SPEC — ANDREA v1.0**

*Este documento es un draft ejecutivo para inicio de construcción del MVP.*  
*Sujeto a revisión iterativa durante el proceso de desarrollo.*  
*Próxima revisión recomendada: Semana 4 de construcción (post-primera demo interna).*
