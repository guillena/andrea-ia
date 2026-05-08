# ANDREA — SPEC COMPLETA DEL PRODUCTO
## Parte 4: Agente Conversacional, Scoring, Reportes y UX

---

## 13. AGENTE CONVERSACIONAL DE VOZ

### 13.1 Personalidad y Comportamiento

El agente se llama **ANDREA** y debe comportarse como una entrevistadora profesional de RRHH: cálida, clara, neutral y eficiente.

**Características:**
- Voz: Femenina, tono cálido y profesional (no robótico)
- Idioma: Español neutro (sin regionalismos marcados)
- Ritmo: Pausado, claro, con silencios naturales
- Empática pero enfocada
- No clínica, no médica
- No juzga en tiempo real

**Comportamientos:**
- Saluda y explica la dinámica al inicio
- Hace una pregunta a la vez
- Espera respuesta completa antes de continuar
- Repregunta si la respuesta es ambigua (máximo 2 veces)
- Agradece respuestas sin juzgarlas positiva ni negativamente
- Mantiene el tiempo ("Vamos bien, continuemos")
- Cierra con calidez y agradecimiento

**Evitar absolutamente:**
- Preguntas sobre salud, religión, política, orientación sexual, embarazo, estado civil
- Juicios: "Muy bien", "Excelente", "Eso no es correcto"
- Lenguaje médico o diagnóstico
- Preguntas discriminatorias (edad, aspecto físico, origen)
- Interrumpir al candidato mientras habla

### 13.2 Guion Base de la Entrevista (10-15 minutos)

#### BLOQUE 0 — Bienvenida y Contexto (1-2 min)

```
ANDREA: "Hola, [Nombre]. Bienvenido o bienvenida a esta evaluación.
Soy ANDREA, una asistente de inteligencia artificial.
Esta entrevista toma entre 10 y 15 minutos y está diseñada para
ayudar al equipo de [Empresa] a conocerte mejor en el contexto
de la posición de [Puesto].

No hay respuestas correctas o incorrectas. Solo te pido que
respondas con honestidad y naturalidad.

Voy a hacerte algunas preguntas. Tomá el tiempo que necesites
para responder. Cuando termines de hablar, yo continuaré.

¿Estás listo o lista para comenzar?"
```

#### BLOQUE 1 — Validación de Identidad Simple (30 seg)

```
ANDREA: "Para comenzar, ¿podés confirmarme tu nombre completo y
cuántos años tenés?"

[Objetivo: verificar que la persona correcta realiza la evaluación,
no recopilar dato de edad para evaluación]
```

#### BLOQUE 2 — Capacidad Cognitiva (3-4 min)

**Comprensión y razonamiento:**

```
P1: "Te cuento una situación: Llegás a tu primer día de trabajo
y tu supervisor te da 3 tareas para hacer antes del mediodía,
pero ves que físicamente no vas a poder hacer las 3 en ese tiempo.
¿Qué harías en esa situación?"

[Evalúa: priorización, razonamiento lógico, resolución de problemas]

P2: "Si tuvieras que explicarle a alguien que nunca usó una
computadora cómo enviar un correo electrónico, ¿cómo lo harías?"

[Evalúa: capacidad de síntesis, claridad, adaptación del mensaje]

P3 (si tiempo lo permite): "¿Qué harías si te dieran una
tarea que no entendés completamente cómo realizar?"

[Evalúa: orientación al aprendizaje, proactividad]
```

**Repregunta tipo cognitiva:**
```
Si respuesta es vaga: "Entendido. ¿Podés contarme un paso concreto
que darías en esa situación?"
```

#### BLOQUE 3 — Perfil Conductual (4-5 min)

**Responsabilidad:**
```
P4: "Contame de alguna vez que cometiste un error en el trabajo
o en un proyecto. ¿Qué pasó y cómo lo manejaste?"

[Evalúa: responsabilidad, honestidad, orientación a soluciones]
```

**Adaptabilidad:**
```
P5: "¿Cómo te sentís cuando de repente cambian los planes o las
prioridades de tu trabajo sin previo aviso?"

[Evalúa: tolerancia a la frustración, adaptabilidad]
```

**Orientación al cliente (si aplica):**
```
P6: "Si un cliente o usuario estuviera muy enojado con vos por
algo que no fue tu culpa directamente, ¿cómo lo manejarías?"

[Evalúa: orientación al cliente, control emocional]
```

#### BLOQUE 4 — Comunicación (2-3 min)

```
P7: "Contame brevemente cuáles son tus principales fortalezas
para este tipo de trabajo."

[Evalúa: autoconocimiento, claridad, estructura de respuesta]

P8: "¿Por qué estás interesado o interesada en trabajar en
[nombre de empresa o tipo de empresa]?"

[Evalúa: motivación declarada, coherencia, comunicación]
```

#### BLOQUE 5 — Consistencia y Honestidad Laboral (1-2 min)

```
P9: "En una escala del 1 al 10, ¿cómo evaluarías tu nivel de
puntualidad en trabajos anteriores? ¿Por qué ese número?"

[Evalúa: autocrítica, honestidad declarativa]

P10 (de consistencia): "Antes mencionaste [X]. ¿Podés contarme
un poco más sobre cómo eso aplica a situaciones de trabajo diario?"

[Evalúa: consistencia interna de la narrativa]
```

#### BLOQUE 6 — Cierre (30 seg)

```
ANDREA: "Genial, [Nombre]. Eso es todo por hoy. Muchas gracias
por tu tiempo y por ser tan claro o clara con tus respuestas.

El equipo de [Empresa] revisará tu evaluación y estará en contacto
con vos próximamente.

¡Mucho éxito!"
```

### 13.3 Prompts del Sistema (LLM)

#### System Prompt — Orquestador de Entrevista

```
Eres ANDREA, una asistente de evaluación laboral profesional.
Estás conduciendo una entrevista estructurada para evaluar
a un candidato para el puesto de {position} en {company}.

INSTRUCCIONES:
- Sé profesional, cálida y neutral.
- Haz UNA sola pregunta a la vez.
- Espera la respuesta completa antes de continuar.
- Si la respuesta es incompleta o ambigua, repregunta UNA VEZ.
- NO hagas más de 2 repreguntass sobre la misma pregunta.
- NO emitas juicios sobre las respuestas ("muy bien", "incorrecto").
- NO preguntes sobre salud, religión, política, orientación sexual,
  estado civil, embarazo, edad (más allá de la validación inicial),
  ni ningún dato sensible innecesario.
- Mantén el tiempo: la entrevista debe durar entre 10 y 15 minutos.
- Si el candidato está divagando mucho, redirige suavemente.

DIMENSIONES A EVALUAR:
1. Cognitiva: comprensión, razonamiento, resolución de problemas
2. Conductual: responsabilidad, adaptabilidad, honestidad laboral
3. Comunicación: claridad, coherencia, estructura

FLUJO:
{interview_script_json}

HISTORIAL DE CONVERSACIÓN:
{conversation_history}

Tu siguiente acción:
```

#### System Prompt — Análisis y Scoring

```
Eres un evaluador experto en selección laboral. Analizarás la
transcripción de una entrevista de evaluación laboral y
generarás un reporte estructurado.

IMPORTANTE:
- NO emitas diagnósticos clínicos ni psicológicos.
- Evalúa únicamente competencias laborales observables en el discurso.
- Fundamenta cada score con evidencias concretas de la transcripción.
- Sé objetivo, neutral y libre de sesgos culturales o demográficos.

TRANSCRIPCIÓN:
{full_transcript}

GENERA EL SIGUIENTE JSON:
{
  "cognitive_score": 0-100,
  "cognitive_summary": "string",
  "cognitive_strengths": ["string"],
  "cognitive_risks": ["string"],
  "cognitive_evidence": ["cita textual"],

  "behavioral_score": 0-100,
  "behavioral_summary": "string",
  "behavioral_strengths": ["string"],
  "behavioral_risks": ["string"],
  "behavioral_evidence": ["cita textual"],

  "communication_score": 0-100,
  "communication_summary": "string",
  "communication_strengths": ["string"],
  "communication_risks": ["string"],
  "communication_evidence": ["cita textual"],

  "consistency_score": 0-100,
  "consistency_notes": "string",
  "contradictions_detected": ["string"],

  "global_score": 0-100,
  "recommendation": "recommended|review|not_recommended",
  "executive_summary": "string de 3-4 oraciones",
  "top_strengths": ["string", "string", "string"],
  "top_risks": ["string", "string"],
  "risk_flags": ["evasive_answers"|"contradictions"|"low_comprehension"|
                 "poor_communication"|"no_concrete_examples"|"incoherence"]
}
```

---

## 14. MOTOR DE SCORING

### 14.1 Ponderación del Score Global

| Dimensión | Peso |
|-----------|------|
| Score Cognitivo | 35% |
| Score Conductual | 35% |
| Score Comunicación | 20% |
| Score Consistencia | 10% |

`global_score = (cognitive * 0.35) + (behavioral * 0.35) + (communication * 0.20) + (consistency * 0.10)`

### 14.2 Niveles de Recomendación (Semáforo)

| Score Global | Nivel | Color | Descripción |
|---|---|---|---|
| 70 - 100 | Recomendado | 🟢 Verde | Candidato con perfil adecuado para avanzar |
| 40 - 69 | Revisar | 🟡 Amarillo | Candidato con potencial pero con aspectos a revisar en entrevista |
| 0 - 39 | No Recomendado | 🔴 Rojo | Candidato con brechas significativas para el puesto |

### 14.3 Criterios de Evaluación por Dimensión

**Dimensión Cognitiva (0-100)**
| Indicador | Peso interno | Señales positivas | Señales de riesgo |
|-----------|-------------|-------------------|-------------------|
| Comprensión | 30% | Responde a lo que se pregunta, no divaga | Responde algo diferente, confusión evidente |
| Razonamiento lógico | 30% | Secuencia lógica de pasos, causa-efecto | Saltos lógicos, conclusiones sin fundamento |
| Resolución de problemas | 25% | Propone solución concreta, evalúa opciones | "No sé", respuestas vagas o resignadas |
| Orientación al aprendizaje | 15% | Busca información, pregunta, aprende de errores | Defensividad ante el error, no busca mejorar |

**Dimensión Conductual (0-100)**
| Indicador | Peso interno | Señales positivas | Señales de riesgo |
|-----------|-------------|-------------------|-------------------|
| Responsabilidad | 30% | Asume errores propios, no culpa a terceros | Excusas, culpa externa siempre |
| Adaptabilidad | 25% | Acepta cambios, los ve como oportunidad | Resistencia al cambio, rigidez |
| Honestidad laboral | 25% | Respuestas equilibradas (no perfectas), autocrítica | Respuestas demasiado ideales, sin defectos |
| Tolerancia a frustración | 20% | Manejo calmado de situaciones difíciles | Reacciones emocionales extremas |

**Dimensión Comunicación (0-100)**
| Indicador | Peso interno | Señales positivas | Señales de riesgo |
|-----------|-------------|-------------------|-------------------|
| Claridad | 30% | Ideas claras, lenguaje simple | Confuso, difícil de seguir |
| Coherencia | 25% | Narrativa consistente, lógica | Contradice lo que dijo antes |
| Estructura | 25% | Intro-desarrollo-cierre natural | Respuestas desordenadas |
| Capacidad de síntesis | 20% | Responde en tiempo razonable, no divaga | Muy largo, muy corto, sin sustancia |

**Score de Consistencia (0-100)**
- Detecta contradicciones entre respuestas de diferentes bloques
- Detecta narrativas demasiado "perfectas" sin autocrítica
- Evalúa coherencia entre respuestas situacionales y declarativas

### 14.4 Risk Flags

| Flag | Descripción | Umbral de activación |
|------|-------------|---------------------|
| `evasive_answers` | Candidato evita responder directamente | ≥ 2 preguntas con respuesta evasiva |
| `contradictions` | Afirmaciones contradictorias entre sí | ≥ 1 contradicción clara detectada |
| `low_comprehension` | No comprende las preguntas | Score cognitivo < 40 |
| `poor_communication` | Muy difícil de entender | Score comunicación < 35 |
| `no_concrete_examples` | Solo respuestas abstractas, sin ejemplos | 0 ejemplos concretos en toda entrevista |
| `incoherence` | Narrativa inconsistente global | Consistency score < 40 |
| `timeout` | No completó la entrevista en tiempo límite | Sesión alcanzó el límite máximo |

---

## 15. REPORTE AUTOMÁTICO

### 15.1 Estructura del Reporte (Vista Web y PDF)

```
┌─────────────────────────────────────────────────────────┐
│  ANDREA — REPORTE DE EVALUACIÓN                          │
│  [Logo empresa cliente]         [Logo ANDREA]            │
├─────────────────────────────────────────────────────────┤
│  DATOS DEL CANDIDATO                                     │
│  Nombre: [Nombre Apellido]                               │
│  Puesto evaluado: [Nombre del puesto]                    │
│  Campaña: [Nombre de campaña]                            │
│  Fecha de evaluación: [DD/MM/YYYY HH:MM]                 │
│  Duración: [X] minutos                                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                     │
│  │  SCORE GLOBAL   │    NIVEL DE RECOMENDACIÓN           │
│  │      78 /100    │    🟢 RECOMENDADO                   │
│  └─────────────────┘                                     │
├─────────────────────────────────────────────────────────┤
│  RESUMEN EJECUTIVO                                       │
│  [3-4 oraciones generadas por IA. Ej: "El candidato      │
│  demuestra una capacidad cognitiva sólida para el        │
│  análisis de situaciones. Su comunicación es clara y     │
│  estructurada. Presenta adecuada orientación al cliente  │
│  y tolerancia ante situaciones de presión. Se recomienda │
│  continuar con el proceso de selección."]               │
├─────────────────────────────────────────────────────────┤
│  FORTALEZAS DESTACADAS                                   │
│  ✓ Resolución estructurada de problemas                  │
│  ✓ Comunicación clara y orientada al punto               │
│  ✓ Responsabilidad ante errores propios                  │
├─────────────────────────────────────────────────────────┤
│  ASPECTOS A REVISAR                                      │
│  ⚠ Respuestas con escasos ejemplos concretos            │
│  ⚠ Adaptabilidad ante cambios: área a profundizar       │
├─────────────────────────────────────────────────────────┤
│  DETALLE POR DIMENSIÓN                                   │
│                                                          │
│  Cognitiva     ████████░░  82/100                       │
│  [Resumen de 2 líneas + evidencia citada]               │
│                                                          │
│  Conductual    ███████░░░  74/100                       │
│  [Resumen de 2 líneas + evidencia citada]               │
│                                                          │
│  Comunicación  ████████░░  80/100                       │
│  [Resumen de 2 líneas + evidencia citada]               │
│                                                          │
│  Consistencia  ███████░░░  70/100                       │
│  [Resumen de 2 líneas]                                  │
├─────────────────────────────────────────────────────────┤
│  TRANSCRIPCIÓN DE LA ENTREVISTA [COLAPSABLE]            │
│  [Turno a turno con timestamps]                         │
├─────────────────────────────────────────────────────────┤
│  DECISIÓN DEL RECLUTADOR                                 │
│  [ ] Recomendado  [ ] Revisar  [ ] No recomendado       │
│  Notas del reclutador: ______________________________   │
├─────────────────────────────────────────────────────────┤
│  ⚠ DISCLAIMER LEGAL                                     │
│  "Este reporte ha sido generado automáticamente por     │
│  ANDREA, una herramienta de apoyo para procesos de      │
│  selección laboral. No constituye un diagnóstico         │
│  psicológico, médico ni jurídico. La decisión final     │
│  de contratación es responsabilidad exclusiva del        │
│  empleador. Se recomienda complementar con              │
│  entrevistas personales y otros instrumentos de          │
│  evaluación. ANDREA no discrimina por criterios          │
│  protegidos por la legislación laboral vigente."        │
└─────────────────────────────────────────────────────────┘
```

---

## 16. ROLES Y PERMISOS

### 16.1 Matriz de Permisos

| Acción | Super Admin | Admin Empresa | Recruiter | Viewer |
|--------|-------------|---------------|-----------|--------|
| Crear/editar empresas | ✅ | ❌ | ❌ | ❌ |
| Ver todas las empresas | ✅ | ❌ | ❌ | ❌ |
| Crear usuarios de empresa | ✅ | ✅ | ❌ | ❌ |
| Editar usuarios | ✅ | ✅ (su empresa) | ❌ | ❌ |
| Crear campañas | ✅ | ✅ | ✅ | ❌ |
| Editar campañas | ✅ | ✅ | ✅ | ❌ |
| Cargar candidatos | ✅ | ✅ | ✅ | ❌ |
| Ver candidatos | ✅ | ✅ | ✅ | ✅ |
| Ver reportes | ✅ | ✅ | ✅ | ✅ |
| Descargar PDF | ✅ | ✅ | ✅ | ❌ |
| Ver transcripción | ✅ | ✅ | ✅ | ✅ |
| Tomar decisión RRHH | ✅ | ✅ | ✅ | ❌ |
| Ver audit logs (empresa) | ✅ | ✅ | ❌ | ❌ |
| Ver audit logs globales | ✅ | ❌ | ❌ | ❌ |
| Ver métricas empresa | ✅ | ✅ | ✅ | ❌ |
| Ver métricas globales | ✅ | ❌ | ❌ | ❌ |

---

## 17. DESIGN SYSTEM — KÜMESPACIO PALETTE

### 17.1 Paleta de Colores

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#b9d3fd` | Botones primarios, estados activos, highlights |
| `--color-accent` | `#ed9584` | Botones secundarios, elementos destacados, alertas suaves |
| `--color-yellow` | `#fae46a` | Badges "Revisar" (semáforo amarillo), indicadores de atención |
| `--color-purple` | `#e3b9fd` | Tags, badges decorativos, elementos secundarios |
| `--color-text` | `#2c3e50` | Texto principal en toda la app |
| `--color-background` | `#f8f9fa` | Fondo general de todas las pantallas |
| `--color-indigo` | `#4f46e5` | Elementos técnicos: links activos, íconos de sistema, focus ring |
| `--color-success` | `#22c55e` | Semáforo verde "Recomendado", estados completados |
| `--color-danger` | `#ef4444` | Semáforo rojo "No recomendado", errores críticos |
| `--color-white` | `#ffffff` | Fondos de cards y modales |
| `--color-border` | `#e2e8f0` | Bordes de inputs, separadores, divisores |

### 17.2 Tipografía

```css
font-family: 'Heebo', 'Roboto', sans-serif;
```

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

| Uso | Peso | Tamaño |
|-----|------|--------|
| Títulos principales (H1) | 700 | 28–32px |
| Títulos de sección (H2/H3) | 600 | 20–24px |
| Texto de cuerpo | 400 | 14–16px |
| Labels, captions | 500 | 12–13px |
| Botones | 600 | 14px |

### 17.3 Componentes

#### Botones
```
Primario:   fondo #b9d3fd  │  texto #2c3e50  │  hover: darken 8%  │  border-radius: 8px
Secundario: fondo #ed9584  │  texto #2c3e50  │  hover: darken 8%  │  border-radius: 8px
Ghost:      fondo transparente │ borde #b9d3fd │ texto #4f46e5
Danger:     fondo #ef4444  │  texto #ffffff
```

#### Badges de Estado (Candidatos)
```
Pendiente:   fondo #f8f9fa   │  texto #2c3e50  │  borde #e2e8f0
Iniciado:    fondo #b9d3fd   │  texto #2c3e50
Completado:  fondo #22c55e20 │  texto #15803d
Expirado:    fondo #f1f5f9   │  texto #94a3b8
```

#### Semáforo de Recomendación
```
🟢 Recomendado:      fondo #dcfce7  │  texto #15803d  │  ícono verde
🟡 Revisar:          fondo #fefce8  │  texto #854d0e  │  fondo badge #fae46a
🔴 No recomendado:   fondo #fee2e2  │  texto #991b1b  │  ícono rojo
```

#### Cards
```
fondo: #ffffff
borde: 1px solid #e2e8f0
border-radius: 12px
box-shadow: 0 1px 3px rgba(0,0,0,0.07)
padding: 24px
```

#### Inputs
```
fondo: #ffffff
borde: 1px solid #e2e8f0
border-radius: 8px
focus: borde #4f46e5 (indigo), ring rgba(79,70,229,0.15)
padding: 10px 14px
font: 14px Heebo
```

### 17.4 Aplicación por Superficie

#### Portal Empresa (fondo `#f8f9fa`)
- **Sidebar / Navbar:** fondo `#ffffff`, borde derecho `#e2e8f0`, ítem activo con fondo `#b9d3fd` y texto `#2c3e50`
- **Header:** fondo `#ffffff`, borde inferior `#e2e8f0`
- **Botón principal de acción** (Nueva campaña, Agregar candidato): fondo `#b9d3fd`, texto `#2c3e50`
- **Botón secundario** (Cancelar, Ver detalle): fondo `#ed9584`, texto `#2c3e50`
- **KPI cards:** fondo `#ffffff`, borde `#e2e8f0`, número en `#4f46e5`

#### Interfaz Candidato (diseño centrado, móvil)
- **Fondo:** `#f8f9fa` con card central `#ffffff`
- **Botón "Continuar" / "Comenzar":** fondo `#b9d3fd`, texto `#2c3e50`, tamaño grande (padding 16px 32px)
- **Pantalla de entrevista:** modo oscuro suave — fondo `#1e293b`, texto `#f1f5f9`, onda de audio en `#b9d3fd`
- **Pantalla de finalización:** fondo `#ffffff`, ícono de éxito en `#22c55e`, texto principal `#2c3e50`

### 17.5 Variables CSS Base

```css
:root {
  --color-primary:    #b9d3fd;
  --color-accent:     #ed9584;
  --color-yellow:     #fae46a;
  --color-purple:     #e3b9fd;
  --color-indigo:     #4f46e5;
  --color-text:       #2c3e50;
  --color-bg:         #f8f9fa;
  --color-white:      #ffffff;
  --color-border:     #e2e8f0;
  --color-success:    #22c55e;
  --color-danger:     #ef4444;

  --font-family: 'Heebo', 'Roboto', sans-serif;

  --radius-sm:  6px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.07);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.10);
}
```

---

## 18. UX / UI — PANTALLAS MÍNIMAS

### 17.1 Portal Empresa

**Pantalla 1: Login**
- Objetivo: Autenticar al usuario de empresa
- Componentes: Logo ANDREA, campo email, campo password, botón "Ingresar", link "Olvidé mi contraseña"
- Acciones: Enviar formulario → Dashboard / Error
- Validaciones: Email válido, password no vacío
- Estado vacío: N/A
- Errores: "Email o contraseña incorrectos", "Cuenta bloqueada. Intentá en 15 minutos"

**Pantalla 2: Dashboard**
- Objetivo: Vista general del estado de evaluaciones
- Componentes: Header (logo + usuario + logout), KPIs (total/completadas/pendientes/expiradas), Listado de candidatos recientes (nombre, estado, score, campaña), Botón "Nueva evaluación"
- Acciones: Crear campaña, ver candidato, filtrar listado
- Estado vacío: Ilustración + CTA "Empezá tu primera evaluación"
- Errores: Toast de error si falla la carga de datos

**Pantalla 3: Campañas**
- Objetivo: Gestionar campañas de evaluación
- Componentes: Listado de campañas (nombre, puesto, estado, # candidatos, # completados), Botón "Nueva campaña", Filtros de estado
- Acciones: Crear, editar, ver detalle, cerrar campaña
- Estado vacío: "No tenés campañas activas. Creá la primera."
- Errores: Validación de nombre requerido

**Pantalla 4: Candidatos (dentro de campaña)**
- Objetivo: Ver y gestionar candidatos de una campaña
- Componentes: Tabla (nombre, email, estado, score, fecha, acciones), Botón "Agregar candidato", Filtros de estado
- Acciones: Agregar, copiar link, ver reporte, marcar decisión
- Estados del candidato: badges de color (Pendiente/Iniciado/Completado/Expirado)
- Estado vacío: "Aún no hay candidatos. Agregá el primero."

**Pantalla 5: Resultado Individual**
- Objetivo: Ver score y decisión de un candidato
- Componentes: Datos del candidato, Score global grande con semáforo, Barra de dimensiones, Resumen ejecutivo, Fortalezas/Riesgos, Decisión del reclutador, Botón "Ver reporte completo", Botón "Descargar PDF"
- Acciones: Tomar decisión, descargar, ver transcripción

**Pantalla 6: Reporte Completo**
- Objetivo: Ver reporte completo con evidencias
- Componentes: Sección por sección del reporte, Transcripción colapsable, Disclaimer visible
- Acciones: Descargar PDF, volver

**Pantalla 7: Configuración**
- Objetivo: Configurar ajustes básicos de empresa
- Componentes: Datos de empresa (read only), Gestión de usuarios, Configuración de expiración de links
- Acciones: Crear usuario, desactivar usuario, cambiar contraseña propia

### 17.2 Interfaz Candidato

**Pantalla 1: Bienvenida**
- Objetivo: Contextualizar al candidato antes de iniciar
- Componentes: Logo empresa (si configurado), Nombre del candidato, Nombre de empresa, Puesto evaluado, Duración estimada ("Aproximadamente 12 minutos"), Íconos de qué esperar (voz, privacidad, resultado), Botón "Ver instrucciones y continuar"
- Validaciones: Token válido y no expirado
- Errores: "Este link ya fue utilizado", "Este link expiró", "Link inválido"

**Pantalla 2: Consentimiento Informado**
- Objetivo: Obtener consentimiento explícito del candidato
- Componentes: Texto completo de consentimiento (scrollable), Qué datos se recopilan, Cómo se usarán, Derechos del candidato, Checkbox "Leí y acepto el consentimiento informado", Botón "Continuar" (deshabilitado hasta aceptar), Link a política de privacidad
- Validaciones: No continúa sin aceptar checkbox
- Errores: Feedback visual si intenta continuar sin aceptar

**Pantalla 3: Test de Micrófono**
- Objetivo: Verificar que el audio funciona antes de iniciar
- Componentes: Indicador visual de nivel de audio (vu-meter), Instrucción "Decí 'hola' para verificar", Estado (Verificando / OK / Error), Botón "Comenzar entrevista" (habilitado si audio OK)
- Errores: "No detectamos tu micrófono. Revisá los permisos de tu navegador." + instrucciones paso a paso
- Fallback: Instrucciones para activar micrófono en Chrome/Firefox/Safari

**Pantalla 4: Entrevista por Voz**
- Objetivo: Interfaz de entrevista conversacional
- Componentes: Avatar/ícono de ANDREA animado cuando habla, Indicador "ANDREA está hablando" / "Tu turno", Visualizador de onda de audio cuando candidato habla, Progreso de la entrevista (indicador discreta), Timer de sesión (visible solo en últimos 2 minutos), Botón de emergencia "Tuve un problema técnico"
- NO mostrar: Preguntas escritas, score parcial, indicadores que generen ansiedad
- Diseño: Minimalista, dark mode suave, enfoque en el audio

**Pantalla 5: Finalización**
- Objetivo: Cerrar la experiencia del candidato positivamente
- Componentes: Mensaje de agradecimiento cálido, Ícono de éxito, "Tu evaluación fue enviada. El equipo de [Empresa] estará en contacto pronto.", Tiempo estimado de respuesta si disponible
- NO mostrar: Score, resultado, comparación con otros candidatos

---

*Continúa en ANDREA_SPEC_parte5.md: Seguridad, roadmap, riesgos, plan de implementación y backlog*
