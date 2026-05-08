# ANDREA — SPEC COMPLETA DEL PRODUCTO
## Parte 3: Arquitectura Técnica, Modelo de Datos y APIs

---

## 10. ARQUITECTURA TÉCNICA

### 10.1 Stack Tecnológico

**Frontend — Portal Empresa**
- React 18 + Vite
- TailwindCSS o Bootstrap 5
- React Query (manejo de estado servidor)
- Axios (HTTP client)
- React Router v6
- Recharts (métricas básicas)
- jsPDF / react-pdf (previsualización de reportes)

**Frontend — Interfaz Candidato**
- React 18 (SPA separada o rutas separadas)
- WebRTC API / MediaRecorder API (captura de audio)
- Web Speech API o socket con backend STT
- CSS puro o Tailwind (ultra-liviano, sin librerías pesadas)

**Backend — API**
- Node.js 20 + NestJS (TypeScript)
- PostgreSQL 15 (base de datos principal)
- Redis 7 (sesiones de evaluación activas, rate limiting, cache)
- Bull/BullMQ (cola de trabajos para análisis asíncrono)
- Prisma ORM (type-safe, migraciones)
- JWT + Passport.js (autenticación)
- Multer / S3 SDK (manejo de archivos)

**IA y Voz**
- STT: **Azure AI Speech** (Speech-to-Text Real-Time)
- TTS: **Azure Neural TTS** (voces: `es-MX-DaliaNeural`, `es-AR-TomasNeural`)
- LLM (conversación - turns): **Azure OpenAI GPT-4o mini** (balance costo/calidad)
- LLM (análisis + scoring): **Azure OpenAI GPT-4o** (mayor profundidad de análisis)
- Prompt orchestration: implementación propia con templates JSON estructurados
- Evaluación estructurada: output forzado a JSON con function calling / structured outputs de Azure OpenAI
- SDK: `@azure/cognitiveservices-speech-sdk`, `openai` (Azure endpoint)

**Infraestructura (MVP)**
- Cloud: **Railway** (PaaS, contenedores gestionados)
- Deploy: Docker containers via Railway (sin necesidad de ECS/Cloud Run)
- Storage: **Railway Buckets** (S3-compatible, $0.015/GB/mes, egress gratuito)
- Emails: SendGrid
- Logs: Railway Logs + estructurados en JSON (nivel info/warn/error)
- Monitoreo: Uptime Robot (MVP) → Datadog post-MVP
- CI/CD: GitHub Actions → deploy automático a Railway en push a main

### 10.2 Diagrama Lógico de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                  │
└──────────┬────────────────────────────────────────┬─────────────┘
           │                                        │
     ┌─────▼──────┐                         ┌──────▼──────┐
     │  Portal     │                         │  Interfaz   │
     │  Empresa    │                         │  Candidato  │
     │  (React)    │                         │  (React)    │
     └─────┬──────┘                         └──────┬──────┘
           │  HTTPS/REST                           │  HTTPS/REST
           │                                       │  WebSocket (voz)
     ┌─────▼───────────────────────────────────────▼──────┐
     │                    API Gateway / Load Balancer        │
     └─────────────────────────┬────────────────────────────┘
                               │
     ┌─────────────────────────▼────────────────────────────┐
     │                   NestJS API Backend                    │
     │                                                         │
     │  ┌──────────┐ ┌────────────┐ ┌──────────────────────┐ │
     │  │  Auth    │ │  Companies │ │  Evaluation Engine   │ │
     │  │  Module  │ │  & Users   │ │  (Voice + Analysis)  │ │
     │  └──────────┘ └────────────┘ └──────────────────────┘ │
     │                                                         │
     │  ┌──────────┐ ┌────────────┐ ┌──────────────────────┐ │
     │  │  Reports │ │  Scoring   │ │  Notifications       │ │
     │  │  Module  │ │  Module    │ │  Module              │ │
     │  └──────────┘ └────────────┘ └──────────────────────┘ │
     └────┬──────────────┬──────────────┬─────────────────────┘
          │              │              │
    ┌─────▼──┐    ┌──────▼───┐   ┌─────▼─────────┐
    │ Postgres│    │  Redis   │   │  Bull Queue   │
    │   DB   │    │  Cache   │   │  (Jobs async) │
    └─────────┘    └──────────┘   └───────┬───────┘
                                          │
                               ┌──────────▼──────────┐
                               │   Worker Process     │
                               │                      │
                               │  1. STT (Azure Speech)     │
                               │  2. LLM Analysis (GPT-4o)   │
                               │  3. Scoring                 │
                               │  4. Report PDF              │
                               └──────────┬──────────┘
                                          │
                    ┌─────────────────────▼─────────────────────┐
                    │            External APIs (Azure)              │
                    │                                             │
                    │  Azure OpenAI GPT-4o  Azure Neural TTS     │
                    │  Azure Speech STT     SendGrid Email        │
                    └─────────────────────────────────────────────┘

                     ┌───────────────────────┐
                     │  Railway Buckets      │
                     │  audios / PDFs /      │
                     │  transcripciones      │
                     └───────────────────────┘
```

### 10.3 Flujo de Evaluación (Diagrama de Secuencia)

```
Candidato         Frontend          Backend API         Worker          External APIs
    │                 │                  │                 │                  │
    │── abre link ──► │                  │                 │                  │
    │                 │── GET /session ─►│                 │                  │
    │                 │◄── session data ─│                 │                  │
    │── acepta consent│                  │                 │                  │
    │                 │── POST /consent ►│                 │                  │
    │                 │◄── ok ──────────│                 │                  │
    │── test mic ─────│                  │                 │                  │
    │── inicia ───────│                  │                 │                  │
    │                 │── POST /start ──►│                 │                  │
    │                 │◄── intro audio ──│────── TTS ─────────────────────►  │
    │◄── audio agente─│                  │                 │◄── mp3 audio ───│
    │                 │                  │                 │                  │
    │── habla ────────│                  │                 │                  │
    │                 │── audio chunk ──►│                 │                  │
    │                 │                 │── STT job ──────►│                  │
    │                 │                 │                 │── Whisper API ──►│
    │                 │                 │                 │◄── transcript ───│
    │                 │                 │◄── transcript ──│                  │
    │                 │                 │── LLM decide ──►│                  │
    │                 │                 │                 │── GPT-4o ───────►│
    │                 │                 │                 │◄── next question─│
    │                 │◄── audio resp. ─│                 │                  │
    │◄── agente habla─│                 │                 │                  │
    │                 │                 │                 │                  │
    │  [... más turns ...]              │                 │                  │
    │                 │                 │                 │                  │
    │── último turn ──│                 │                 │                  │
    │                 │── POST /end ───►│                 │                  │
    │                 │                 │── analysis job ►│                  │
    │◄── pantalla fin ─│               │                 │── full analysis ─►│
    │                 │                 │                 │◄── scores JSON ──│
    │                 │                 │                 │── gen PDF ──────►│
    │                 │                 │◄── report done ─│                  │
    │                 │                 │── notify RRHH ──────────────────────
```

### 10.4 Estados de una Evaluación

```
CREATED ──► LINK_SENT ──► CONSENT_ACCEPTED ──► IN_PROGRESS ──► COMPLETED
    │                                                │
    │                                               ERROR (reintentar)
    │
EXPIRED (si no se usa antes de fecha límite)
CANCELLED (si admin la cancela)
```

---

## 11. MODELO DE DATOS

### 11.1 Entidades Principales

#### Company
```sql
companies
─────────────────────────────────────────
id              UUID        PK
name            VARCHAR(200) NOT NULL
country         VARCHAR(10)  NOT NULL  -- AR, MX, CO, CL, PE
tax_id          VARCHAR(50)           -- CUIT, RFC, NIT
plan            ENUM('pilot','starter','growth','enterprise')
status          ENUM('active','suspended','cancelled')
max_evaluations INT         DEFAULT 100
settings        JSONB                 -- configuraciones específicas
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### User
```sql
users
─────────────────────────────────────────
id              UUID        PK
company_id      UUID        FK → companies.id (null si super admin)
email           VARCHAR(254) UNIQUE NOT NULL
password_hash   VARCHAR(255) NOT NULL
first_name      VARCHAR(100) NOT NULL
last_name       VARCHAR(100) NOT NULL
role            ENUM('super_admin','admin_empresa','recruiter','viewer')
status          ENUM('active','inactive','pending')
last_login_at   TIMESTAMPTZ
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### JobPosition
```sql
job_positions
─────────────────────────────────────────
id              UUID        PK
company_id      UUID        FK → companies.id
base_position_key VARCHAR(50) NOT NULL  -- 'customer_support'|'ventas'|'backoffice'|'operaciones_logisticas'
name            VARCHAR(200) NOT NULL
description     TEXT
competencies    JSONB       NOT NULL    -- array de competencias activas configuradas
                                       -- [{ id, name, dimension, weight, is_active }]
is_active       BOOLEAN     DEFAULT true
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

-- Nota: el sistema crea una copia por empresa al hacer el seed inicial.
-- Ej. de competencies:
-- [
--   { "id": "uuid", "name": "Orientación al cliente", "dimension": "conductual", "weight": 1.0, "is_active": true },
--   { "id": "uuid", "name": "Comunicación clara", "dimension": "comunicacion", "weight": 1.0, "is_active": true }
-- ]
```

#### EvaluationCampaign
```sql
evaluation_campaigns
─────────────────────────────────────────
id              UUID        PK
company_id      UUID        FK → companies.id
job_position_id UUID        FK → job_positions.id (nullable)
name            VARCHAR(200) NOT NULL
description     TEXT
status          ENUM('active','paused','closed')
link_expiry_days INT        DEFAULT 7
created_by      UUID        FK → users.id
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### Candidate
```sql
candidates
─────────────────────────────────────────
id              UUID        PK
company_id      UUID        FK → companies.id
campaign_id     UUID        FK → evaluation_campaigns.id
first_name      VARCHAR(100) NOT NULL
last_name       VARCHAR(100) NOT NULL
email           VARCHAR(254) NOT NULL
phone           VARCHAR(30)
status          ENUM('pending','started','completed','expired','cancelled')
eval_token      VARCHAR(64)  UNIQUE NOT NULL  -- token del link
token_expires_at TIMESTAMPTZ NOT NULL
recruiter_decision ENUM('recommended','review','not_recommended')
decision_at     TIMESTAMPTZ
decision_by     UUID        FK → users.id
created_by      UUID        FK → users.id
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### Consent
```sql
consents
─────────────────────────────────────────
id              UUID        PK
candidate_id    UUID        FK → candidates.id UNIQUE
accepted        BOOLEAN     NOT NULL
accepted_at     TIMESTAMPTZ NOT NULL
ip_address      VARCHAR(45)
user_agent      TEXT
consent_version VARCHAR(10)  DEFAULT 'v1'
consent_text_hash VARCHAR(64) -- hash del texto aceptado
```

#### EvaluationSession
```sql
evaluation_sessions
─────────────────────────────────────────
id              UUID        PK
candidate_id    UUID        FK → candidates.id UNIQUE
status          ENUM('created','in_progress','completed','error','timeout')
started_at      TIMESTAMPTZ
completed_at    TIMESTAMPTZ
duration_seconds INT
turn_count      INT         DEFAULT 0
audio_url       VARCHAR(500)   -- URL en Railway Buckets del audio completo
analysis_status ENUM('pending','processing','completed','failed')
error_message   TEXT
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### ConversationTurn
```sql
conversation_turns
─────────────────────────────────────────
id              UUID        PK
session_id      UUID        FK → evaluation_sessions.id
turn_number     INT         NOT NULL
speaker         ENUM('agent','candidate')
content_text    TEXT        NOT NULL      -- texto del turno
audio_url       VARCHAR(500)              -- URL audio del turno (candidato)
dimension       VARCHAR(50)               -- cognitiva/conductual/comunicacion
question_type   VARCHAR(50)               -- situacional/directa/consistencia
raw_stt_text    TEXT                      -- texto crudo STT antes de corrección
stt_confidence  FLOAT
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### Score
```sql
scores
─────────────────────────────────────────
id              UUID        PK
session_id      UUID        FK → evaluation_sessions.id UNIQUE
cognitive_score     FLOAT   CHECK (cognitive_score BETWEEN 0 AND 100)
behavioral_score    FLOAT   CHECK (behavioral_score BETWEEN 0 AND 100)
communication_score FLOAT   CHECK (communication_score BETWEEN 0 AND 100)
consistency_score   FLOAT   CHECK (consistency_score BETWEEN 0 AND 100)
global_score        FLOAT   CHECK (global_score BETWEEN 0 AND 100)
recommendation      ENUM('recommended','review','not_recommended')
risk_flags      JSONB       -- array de alertas detectadas
strengths       JSONB       -- array de fortalezas detectadas
dimension_details JSONB     -- detalle completo por dimensión
raw_analysis    JSONB       -- output completo del LLM
model_version   VARCHAR(50) -- versión del modelo usado
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### Report
```sql
reports
─────────────────────────────────────────
id              UUID        PK
session_id      UUID        FK → evaluation_sessions.id UNIQUE
score_id        UUID        FK → scores.id
executive_summary TEXT      NOT NULL
pdf_url         VARCHAR(500)   -- URL en Railway Buckets
pdf_generated_at TIMESTAMPTZ
view_count      INT         DEFAULT 0
download_count  INT         DEFAULT 0
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

#### AuditLog
```sql
audit_logs
─────────────────────────────────────────
id              UUID        PK
company_id      UUID        FK → companies.id (nullable para super admin)
user_id         UUID        FK → users.id (nullable para acciones de sistema)
action          VARCHAR(100) NOT NULL   -- e.g. 'report.viewed', 'candidate.created'
entity_type     VARCHAR(50)            -- e.g. 'candidate', 'report'
entity_id       UUID
metadata        JSONB                  -- datos adicionales de la acción
ip_address      VARCHAR(45)
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()

INDEX: (company_id, created_at DESC)
INDEX: (user_id, created_at DESC)
INDEX: (action, created_at DESC)
```

---

## 12. APIs PRINCIPALES

### 12.1 Autenticación

```
POST   /api/v1/auth/login
Body:  { email, password }
Resp:  { access_token, refresh_token, user: { id, role, company_id } }

POST   /api/v1/auth/refresh
Body:  { refresh_token }
Resp:  { access_token }

POST   /api/v1/auth/logout
Auth:  Bearer token
Resp:  { success: true }

POST   /api/v1/auth/forgot-password
Body:  { email }
Resp:  { message: "Email enviado si existe" }

POST   /api/v1/auth/reset-password
Body:  { token, new_password }
Resp:  { success: true }
```

### 12.2 Empresas (Super Admin)

```
GET    /api/v1/companies
Auth:  Super Admin
Resp:  { data: [Company], meta: { total, page } }

POST   /api/v1/companies
Auth:  Super Admin
Body:  { name, country, tax_id, plan }
Resp:  { company }

GET    /api/v1/companies/:id
PATCH  /api/v1/companies/:id
DELETE /api/v1/companies/:id  (soft delete)
```

### 12.3 Usuarios

```
GET    /api/v1/users              -- usuarios de la empresa del caller
POST   /api/v1/users
Body:  { email, first_name, last_name, role }
Resp:  { user }  -- envía email de invitación

GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### 12.4 Campañas

```
GET    /api/v1/campaigns
POST   /api/v1/campaigns
Body:  { name, job_position_id, description, link_expiry_days }
Resp:  { campaign }

GET    /api/v1/campaigns/:id
PATCH  /api/v1/campaigns/:id
GET    /api/v1/campaigns/:id/stats
Resp:  { total, pending, completed, expired, avg_score }
```

### 12.4B Puestos y Competencias

```
GET    /api/v1/job-positions
-- Retorna los 4 puestos configurados para la empresa del caller
Auth:  Recruiter+
Resp:  { data: [JobPosition] }

GET    /api/v1/job-positions/:id
Auth:  Recruiter+
Resp:  { job_position }  -- incluye competencias activas

PATCH  /api/v1/job-positions/:id/competencies
Auth:  Admin Empresa, Super Admin
Body:  { competencies: [{ id, name, dimension, weight, is_active }] }
Resp:  { job_position }  -- competencias actualizadas
-- Solo aplica a nuevas campañas
```

### 12.5 Candidatos

```
GET    /api/v1/candidates?campaign_id=&status=&page=
POST   /api/v1/candidates
Body:  { first_name, last_name, email, phone, campaign_id }
Resp:  { candidate, eval_link }

GET    /api/v1/candidates/:id
PATCH  /api/v1/candidates/:id/decision
Body:  { decision: 'recommended'|'review'|'not_recommended' }

GET    /api/v1/candidates/:id/report
GET    /api/v1/candidates/:id/transcript
```

### 12.6 Evaluación (Endpoints Públicos — Candidato)

```
GET    /api/v1/eval/:token
-- Valida token, retorna datos de empresa y campaña
Resp:  { company_name, position, duration_estimate, status }

POST   /api/v1/eval/:token/consent
Body:  { accepted: true, ip_address, user_agent }
Resp:  { consent_id, session_id }

POST   /api/v1/eval/:token/start
Resp:  { session_id, intro_audio_url }
-- Genera TTS de bienvenida del agente

POST   /api/v1/eval/:token/turn
Body:  { session_id, audio_file (multipart) }
Resp:  { transcript, next_audio_url, is_final }
-- STT del audio → LLM decide respuesta → TTS → retorna audio

POST   /api/v1/eval/:token/end
Body:  { session_id }
Resp:  { message: "Evaluación completada", process_eta: 120 }
-- Encola job de análisis completo
```

### 12.7 Reportes y Scores

```
GET    /api/v1/reports/:candidate_id
Auth:  Recruiter, Viewer, Admin
Resp:  { report, score, candidate }

GET    /api/v1/reports/:candidate_id/pdf
Auth:  Recruiter, Admin
Resp:  Binary PDF (application/pdf)

GET    /api/v1/scores/:candidate_id
Auth:  Recruiter, Viewer, Admin
Resp:  { score }
```

### 12.8 Dashboard y Métricas

```
GET    /api/v1/dashboard
Auth:  Recruiter+
Resp:  { total_evaluations, completed, pending, avg_score, recent_candidates }

GET    /api/v1/dashboard/metrics
Auth:  Admin+
Resp:  { daily_completions[], avg_duration, completion_rate, score_distribution }
```

### 12.9 Auditoría

```
GET    /api/v1/audit-logs?page=&action=&user_id=&from=&to=
Auth:  Admin+
Resp:  { data: [AuditLog], meta }
```

---

*Continúa en ANDREA_SPEC_parte4.md: Agente conversacional, scoring, reportes, UX y roadmap*
