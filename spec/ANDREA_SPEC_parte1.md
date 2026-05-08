# ANDREA — SPEC COMPLETA DEL PRODUCTO
## Parte 1: Resumen Ejecutivo, Visión, Objetivos, Alcance y Personas

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Estado:** Draft para revisión de equipo  
**Responsable:** Product Management

---

## 1. RESUMEN EJECUTIVO

ANDREA es una plataforma SaaS B2B para LATAM que automatiza el proceso de screening psicotécnico inicial de candidatos laborales mediante un agente conversacional de voz impulsado por IA.

El producto permite que una empresa de RRHH envíe un link a un candidato (por WhatsApp o email), el candidato realice una entrevista estructurada por voz de 10 a 15 minutos con un agente IA, y el sistema genere de forma automática un reporte con score, fortalezas, riesgos y recomendación de avance — todo sin intervención humana.

**Problema que resuelve:** El proceso de screening inicial de candidatos es lento, costoso, inconsistente y no escalable. Las soluciones tradicionales (tests escritos, entrevistas telefónicas manuales) requieren tiempo de reclutadores, son aburridas para los candidatos y generan resultados subjetivos o difíciles de interpretar.

**Propuesta de valor central:**
> "ANDREA permite evaluar candidatos en 15 minutos mediante una entrevista psicotécnica conversacional por voz, entregando a RRHH un score claro, riesgos detectados, fortalezas y recomendación de avance."

**Mercado objetivo inicial:** LATAM (Argentina, México, Colombia, Chile, Perú). Expansión futura a España.

**Segmentos prioritarios:**
1. Call centers / BPO
2. Retail y supermercados
3. Logística y transporte
4. Seguros
5. Fintechs
6. Empresas con alto volumen de contratación operativa
7. Consultoras de RRHH que evalúan candidatos para terceros

**Competidores directos:** PsicoSmart, Psicométricas.mx, Evaluar.com, Adam Milo, Mercer Mettl, y soluciones in-house.

**Ventaja competitiva:**
- Evaluación por voz (no formularios aburridos)
- Experiencia conversacional y fluida
- 10 a 15 minutos (vs. 45 a 60 minutos de plataformas tradicionales)
- Reporte automático inmediato
- Score simple y accionable (semáforo)
- Sin necesidad de psicólogo para interpretar resultados

**Objetivo del MVP:** Validar el valor comercial con 10 empresas piloto, 1.000 evaluaciones realizadas y al menos 3 clientes pagos en 60 a 90 días de desarrollo.

---

## 2. VISIÓN DEL PRODUCTO

### 2.1 Visión a largo plazo

ANDREA será la plataforma estándar de evaluación psicotécnica por voz para procesos de selección masiva en LATAM y España. En 2 años, será la herramienta que usan reclutadores operativos para hacer screening inicial de forma rápida, confiable y auditable, reduciendo el tiempo de contratación en más del 50%.

### 2.2 Misión del MVP

Demostrar que una entrevista conversacional por voz de 15 minutos puede reemplazar el screening inicial humano con resultados consistentes, comprensibles y accionables para el equipo de RRHH.

### 2.3 Principios de diseño del producto

1. **Candidato primero:** La experiencia del candidato debe ser fluida, rápida y no intimidante. Si el candidato abandona, fallamos.
2. **Simple para el reclutador:** El reporte debe ser comprensible en 60 segundos sin formación técnica.
3. **No clínico:** ANDREA es una herramienta de apoyo a la selección laboral, no un sistema de diagnóstico psicológico.
4. **Auditable:** Todo lo que hace el sistema debe ser trazable y explicable.
5. **Neutral y no discriminatorio:** Ninguna pregunta ni evaluación debe violar derechos laborales o introducir sesgos ilegales.
6. **Consentimiento explícito:** El candidato siempre sabe qué se va a evaluar y acepta formalmente.

---

## 3. OBJETIVOS

### 3.1 Objetivos de negocio (MVP)

| # | Objetivo | Métrica | Plazo |
|---|----------|---------|-------|
| 1 | Validar demanda de mercado | 10 empresas piloto activas | 90 días |
| 2 | Validar disposición a pagar | 3 clientes con contrato pago | 90 días |
| 3 | Validar completitud | 80% tasa de completitud de evaluaciones | 90 días |
| 4 | Validar velocidad | Tiempo promedio de evaluación ≤ 15 min | 90 días |
| 5 | Validar utilidad del reporte | Reclutador entiende recomendación sin explicación | 90 días |
| 6 | Escalar evaluaciones | 1.000 evaluaciones realizadas | 90 días |
| 7 | Satisfacción cliente | NPS empresa > 40 | 90 días |
| 8 | Eficiencia recruiting | Reducción tiempo screening > 50% reportada | 90 días |

### 3.2 Objetivos técnicos (MVP)

| # | Objetivo | Métrica |
|---|----------|---------|
| 1 | Velocidad de reporte | Reporte generado < 2 minutos post evaluación |
| 2 | Disponibilidad | Uptime ≥ 99% en horario hábil |
| 3 | Latencia de voz | Respuesta del agente < 2 segundos |
| 4 | Precisión de transcripción | Error < 15% en condiciones normales de audio |
| 5 | Seguridad | 0 brechas de datos personales en MVP |
| 6 | Escalabilidad base | Soporte de 50 sesiones concurrentes |

---

## 4. ALCANCE DEL MVP

### 4.1 Incluido en el MVP

| Módulo | Descripción |
|--------|-------------|
| Portal empresa | Login, dashboard, gestión de campañas y candidatos |
| Alta de candidatos | Manual (nombre, email, teléfono, puesto) |
| Generación de links | Link único por candidato con expiración configurable |
| Evaluación conversacional por voz | Agente IA que conduce entrevista de 10-15 min |
| Consentimiento informado | Aceptación explícita con registro de timestamp |
| Transcripción | STT automático de toda la sesión |
| Análisis con IA | LLM evalúa respuestas y genera scoring estructurado |
| Scoring | Score 0-100 por dimensión y global + semáforo |
| Reporte automático | PDF descargable con resumen ejecutivo + evidencias |
| Panel de resultados | Vista de estado de candidatos y acceso a reportes |
| Grabación de audio | Almacenamiento seguro de audio de sesión |
| Administración básica | Alta de empresas y usuarios (Super Admin) |
| Seguridad básica | Auth JWT, RBAC, HTTPS, encriptación en reposo |
| Auditoría mínima | Log de acciones críticas (login, evaluaciones, reportes) |
| Métricas de uso | Evaluaciones totales, completadas, tiempo promedio |

### 4.2 Fuera del alcance del MVP

| Excluido | Justificación |
|----------|---------------|
| Marketplace de tests | Complejidad innecesaria para validación inicial |
| Integraciones ATS | Alta complejidad, bajo impacto en validación |
| Dashboard analítico avanzado | No es bloqueante para validar valor |
| Múltiples tipos de pruebas | El MVP valida con 1 tipo de evaluación |
| Evaluaciones clínicas | Fuera del posicionamiento legal del producto |
| Análisis facial | Problemas legales y éticos significativos |
| Detección emocional invasiva | Idem anterior |
| Gamificación | No agrega valor en MVP de validación |
| App mobile nativa | Web responsive es suficiente para MVP |
| WhatsApp nativo | Integración futura; email + link es suficiente para MVP |
| API pública | Post-MVP |
| Multi-idioma | Solo español neutro para LATAM en MVP |

---

## 5. PERSONAS

### 5.1 Persona 1: Valentina — Jefa de Selección (Buyer Principal)

- **Edad:** 32 años
- **Rol:** Jefa de Selección en empresa de retail con 500 empleados y 3-4 procesos de contratación masiva por año
- **Dolor principal:** Le llegan 300 CVs por proceso, tiene 2 personas en su equipo y solo pueden entrevistar 40 candidatos. El 80% de tiempo se va en llamadas de pre-screening que tienen baja tasa de conversión y son tediosas.
- **Objetivos:** Reducir el tiempo de screening, tener datos objetivos para defender decisiones a gerencia, mejorar calidad de hires.
- **Comportamiento tecnológico:** Usa LinkedIn, Google Sheets, Outlook. Es usuaria de SaaS pero no es técnica.
- **Objeción principal:** "¿Cómo sé que esto es confiable? ¿Qué le digo al candidato?"
- **Cita representativa:** *"Necesito saber en 2 minutos si un candidato vale la pena entrevistar."*

### 5.2 Persona 2: Rodrigo — Director de RRHH (Decisor de Compra)

- **Edad:** 42 años
- **Rol:** Director de RRHH en empresa de logística
- **Dolor principal:** Alto costo de contratación, alta rotación en los primeros 90 días, presión del CFO para reducir costos de selección.
- **Objetivos:** ROI claro en reducción de tiempo y rotación. Auditoría de procesos de selección para cumplimiento legal.
- **Comportamiento tecnológico:** Evalúa proveedores, lee reportes ejecutivos, no usa el sistema directamente.
- **Objeción principal:** "¿Esto está validado? ¿Tiene respaldo legal? ¿Cuánto cuesta por uso?"
- **Cita representativa:** *"Si me reduces el tiempo de screening a la mitad y mejora la calidad de hire, te firmo."*

### 5.3 Persona 3: Carlos — Recruiter Operativo (Usuario Principal)

- **Edad:** 26 años
- **Rol:** Recruiter en consultora de RRHH que evalúa para terceros
- **Dolor principal:** Tiene 50 candidatos por semana para evaluar, hace llamadas manuales de 20 min cada una, llena planillas manualmente.
- **Objetivos:** Agilizar su trabajo, tener herramientas que le den credibilidad ante sus clientes.
- **Comportamiento tecnológico:** Usuario intensivo de computadora, adopta herramientas nuevas rápido.
- **Cita representativa:** *"Si esto me saca las llamadas de screening, me libera 2 horas por día."*

### 5.4 Persona 4: Martina — Candidata (Usuario de Evaluación)

- **Edad:** 24 años
- **Rol:** Candidata a operador de call center
- **Contexto:** Recibió un mensaje de WhatsApp con un link para "completar una evaluación antes de su entrevista". Tiene acceso desde el celular.
- **Dolor principal:** No sabe qué esperar. Le da ansiedad. No quiere que "la pongan a prueba" de forma sorpresiva.
- **Necesidades:** Que sea fácil, rápido y que se explique bien qué se va a evaluar.
- **Cita representativa:** *"¿Esto es como una entrevista? ¿Cuánto dura? ¿Me graban?"*

---

## 6. USER JOURNEYS

### 6.1 Journey del Reclutador — Crear y enviar evaluación

```
[RRHH inicia proceso de contratación]
        ↓
Entra a ANDREA → Dashboard
        ↓
Selecciona puesto (Customer Support / Ventas / Backoffice / Operaciones Logísticas)
        ↓
┌─ Sistema muestra competencias predefinidas del puesto ─────────────────┐
│  Ejemplo para Customer Support:                                          │
│  ✓ Orientación al cliente  ✓ Comunicación clara  ✓ Tolerancia presión  │
│  [ Confirmar y continuar ]   [ Ir a configuración del puesto ]          │
└─────────────────────────────────────────────────────────────────────────┘
        ↓ (si confirma)
Crea campaña: nombre, fecha de vencimiento
        ↓
Carga candidato manualmente (nombre, email, teléfono)
        ↓
Sistema genera link único de evaluación
        ↓
Copia link y envía por email o WhatsApp manual
        ↓
Candidato recibe link → aparece en estado "Pendiente"
        ↓
Candidato completa evaluación (ANDREA adapta preguntas al puesto)
        → estado cambia a "Completado"
        ↓
RRHH recibe notificación → accede al reporte
        ↓
Ve score semáforo + resumen ejecutivo en 60 segundos
        ↓
Decide: Avanza / Revisar / No continúa
        ↓
Descarga PDF para expediente
```

**Puntos de fricción y mitigaciones:**
- Reclutador no conoce las competencias del puesto → Modal con resumen claro antes de confirmar
- Quiere ajustar competencias → Link directo a configuración del puesto sin perder el flujo
- No sabe qué link enviar → Botón "Copiar link" directo en pantalla
- No entiende el reporte → Diseño con semáforo visual prominente y lenguaje no técnico

### 6.2 Journey del Candidato — Completar evaluación

```
[Candidato recibe mensaje: "Completa tu evaluación aquí: [link]"]
        ↓
Abre link en browser (mobile o desktop)
        ↓
Ve pantalla de bienvenida: nombre de empresa, duración, descripción
        ↓
Lee y acepta Consentimiento Informado (checkbox explícito)
        ↓
Test de micrófono: "Decí 'hola' para verificar audio"
        ↓
[Si audio OK] → Inicia entrevista
[Si audio falla] → Instrucciones de solución o fallback
        ↓
Agente IA saluda y explica dinámica (30 segundos)
        ↓
Agente hace preguntas estructuradas (10-14 minutos)
   - Candidato habla → STT transcribe → LLM evalúa
   - Agente repregunta si respuesta es ambigua o incompleta
        ↓
Agente cierra entrevista con mensaje de agradecimiento
        ↓
Candidato ve pantalla de finalización
        ↓
Sistema procesa en background → Genera reporte en < 2 minutos
```

**Puntos de fricción y mitigaciones:**
- Ansiedad del candidato → Bienvenida cálida, explicación clara de qué NO se evalúa
- Problemas de audio → Test previo + instrucciones claras
- Abandono a mitad → Guardado parcial de sesión

### 6.3 Journey del Super Admin — Alta de empresa cliente

```
[Nuevo cliente firma contrato]
        ↓
Super Admin crea empresa: nombre, país, plan
        ↓
Crea Admin Empresa con email
        ↓
Sistema envía email de bienvenida con contraseña temporal
        ↓
Admin Empresa entra, cambia contraseña, crea recruiters
        ↓
Empresa lista para operar
```

---

*Continúa en ANDREA_SPEC_parte2.md: Historias de usuario y requerimientos funcionales*
