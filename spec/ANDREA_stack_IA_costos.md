# ANDREA — Stack de IA y Costos
## Análisis: Azure vs. OpenAI Directo

**Fecha:** Mayo 2026  
**Contexto:** Evaluación de proveedores de IA para ANDREA MVP

---

## 1. RESPUESTA DIRECTA: ¿Se puede usar Azure?

**SÍ, se puede.** Azure ofrece los tres servicios que necesitamos:

| Servicio | Azure | Alternativa Directa |
|---------|-------|---------------------|
| **STT** | Azure AI Speech (Speech-to-Text) | OpenAI Whisper API |
| **TTS** | Azure Neural TTS | OpenAI TTS / ElevenLabs |
| **LLM** | Azure OpenAI (GPT-4o) | OpenAI API directa |

Los servicios de Azure son REST APIs que se llaman desde cualquier backend, incluyendo Railway. **No hay incompatibilidad técnica.**

---

## 2. COMPARATIVA DE PRECIOS POR SERVICIO

### STT (Speech-to-Text)

| Proveedor | Servicio | Precio | Costo en 8 min de audio |
|-----------|---------|--------|------------------------|
| **Azure AI Speech** | Real-Time Transcription | $1.00 / hora audio | **$0.133** |
| **Azure AI Speech** | Batch Transcription | $0.18 / hora audio | **$0.024** |
| **OpenAI** | Whisper / gpt-4o-transcribe | $0.006 / minuto | **$0.048** |
| **OpenAI** | gpt-4o-mini-transcribe | $0.003 / minuto | **$0.024** |

> **Nota:** Para ANDREA, el audio del candidato dura ~8 min por evaluación (el agente no se transcribe, solo el candidato). El modo batch de Azure es comparable a Whisper en precio, pero agrega latencia. El modo real-time de Azure es 2.8x más caro que Whisper.

---

### TTS (Text-to-Speech) — Voz del Agente ANDREA

El agente genera ~3.000–4.500 caracteres de audio por evaluación (bienvenida + preguntas + repreguntas).

| Proveedor | Servicio | Precio | Costo en 4.000 chars |
|-----------|---------|--------|----------------------|
| **Azure Neural TTS** | Standard Neural | $15.00 / 1M chars | **$0.060** |
| **Azure Neural TTS** | Neural HD (más natural) | $22.00 / 1M chars | **$0.088** |
| **OpenAI TTS** | tts-1 | $15.00 / 1M chars | **$0.060** |
| **OpenAI TTS** | tts-1-hd (más natural) | $30.00 / 1M chars | **$0.120** |
| **ElevenLabs** | Scale ($330/mo, 2M chars) | $0.165 / 1K chars | **$0.66** |
| **ElevenLabs** | Pro ($99/mo, 500K chars) | $0.198 / 1K chars | **$0.79** |

> ⚠️ **ElevenLabs es significativamente más caro** para el volumen del MVP. Tiene mejor calidad de voz, pero el costo es 10x mayor. Recomendado solo si la calidad de voz es un diferenciador crítico en los pilotos.

---

### LLM (Análisis Conversacional + Scoring)

Consumo estimado por evaluación:
- Conversación (10 turns): ~7.000 tokens input + 3.000 tokens output
- Análisis + Scoring post-sesión: ~10.000 tokens input + 3.000 tokens output
- **Total por evaluación: ~17.000 input tokens + 6.000 output tokens**

| Proveedor | Modelo | Input / 1M | Output / 1M | Costo por eval |
|-----------|--------|-----------|------------|----------------|
| **Azure OpenAI** | GPT-4o | $2.50 | $10.00 | **$0.103** |
| **OpenAI Directo** | GPT-4o | $2.50 | $10.00 | **$0.103** |
| **Azure OpenAI** | GPT-4o mini | $0.15 | $0.60 | **$0.006** |
| **OpenAI Directo** | GPT-4o mini | $0.15 | $0.60 | **$0.006** |

> 💡 **Azure OpenAI y OpenAI directo tienen el mismo precio de modelo.** La diferencia está en compliance, SLA y dónde residen los datos.

> 💡 **Estrategia de ahorro:** Usar **GPT-4o mini para la conversación** (turns del agente, más simples) y **GPT-4o para el análisis final** (más complejo). Reducción de costo LLM ~40-50%.

---

## 3. COSTO TOTAL POR EVALUACIÓN

### Escenario A: 100% Azure

| Componente | Servicio Azure | Costo |
|-----------|---------------|-------|
| STT (8 min) | Azure Speech Real-Time | $0.133 |
| TTS (4.000 chars) | Azure Neural TTS HD | $0.088 |
| LLM conversación | GPT-4o mini vía Azure OpenAI | $0.003 |
| LLM análisis final | GPT-4o vía Azure OpenAI | $0.068 |
| **TOTAL** | | **~$0.29 / evaluación** |

### Escenario B: OpenAI Directo (opción actual de la SPEC)

| Componente | Servicio | Costo |
|-----------|---------|-------|
| STT (8 min) | Whisper / gpt-4o-transcribe | $0.048 |
| TTS (4.000 chars) | OpenAI TTS (tts-1) | $0.060 |
| LLM conversación | GPT-4o mini directo | $0.003 |
| LLM análisis final | GPT-4o directo | $0.068 |
| **TOTAL** | | **~$0.18 / evaluación** |

### Escenario C: Híbrido Optimizado (RECOMENDADO)

| Componente | Servicio | Costo |
|-----------|---------|-------|
| STT (8 min) | Whisper / gpt-4o-mini-transcribe | **$0.024** |
| TTS (4.000 chars) | Azure Neural TTS Standard | **$0.060** |
| LLM conversación | GPT-4o mini (Azure o directo) | **$0.003** |
| LLM análisis final | GPT-4o (Azure o directo) | **$0.068** |
| **TOTAL** | | **~$0.155 / evaluación** |

---

## 4. PROYECCIÓN DE COSTOS DE IA POR VOLUMEN

| Evaluaciones/mes | Azure Puro | OpenAI Directo | Híbrido Optimizado |
|-----------------|-----------|----------------|-------------------|
| 100 (piloto) | $29 | $18 | $15.50 |
| 500 | $145 | $90 | $77.50 |
| 1.000 | $290 | $180 | $155 |
| 5.000 | $1.450 | $900 | $775 |
| 10.000 | $2.900 | $1.800 | $1.550 |

> **En el MVP (1.000 evaluaciones), la diferencia entre Azure y el híbrido optimizado es solo $135/mes.** No es una diferencia crítica para decidir proveedor en esta etapa.

---

## 5. CUÁNDO ELEGIR AZURE

| Criterio | Ventaja Azure | Relevancia MVP |
|----------|--------------|----------------|
| **Compliance empresarial** | SOC 2, ISO 27001, GDPR certificado. Clientes corporativos exigen esto. | ⭐ Alta si vas a cerrar cuentas enterprise |
| **Residencia de datos** | Puedes elegir región (Brazil South, etc.) para que los datos NO salgan de LATAM | ⭐⭐ Alta para regulación local |
| **Una sola factura** | STT + TTS + LLM en un solo billing de Azure | Bajo (admins pueden manejar 2-3 facturas) |
| **SLA garantizado** | SLAs enterprise con créditos si no se cumplen | Media |
| **Networking privado** | Azure Virtual Network, evita tráfico público | Innecesario en MVP |
| **Clientes con Azure credits** | Si clientes enterprise te piden que uses su suscripción Azure | Media a largo plazo |

## 6. CUÁNDO ELEGIR OPENAI DIRECTO

| Criterio | Ventaja OpenAI Directo | Relevancia MVP |
|----------|----------------------|----------------|
| **Menor costo STT** | Whisper es ~60% más barato que Azure Speech RT | ⭐ Alta |
| **Simplicidad** | Una sola cuenta, menos configuración | ⭐⭐ Alta para MVP rápido |
| **Integración nativa** | STT + TTS + LLM del mismo proveedor, mismo SDK | ⭐⭐ Alta |
| **Modelos más nuevos** | OpenAI lanza modelos antes que Azure OpenAI | Media |
| **Sin configuración de recursos** | No hay que crear Resource Groups, endpoints, etc. | ⭐ Alta para MVP |

---

## 7. RECOMENDACIÓN PARA EL MVP

### Stack Recomendado para MVP con Railway

```
STT:  OpenAI gpt-4o-mini-transcribe  → $0.003/min (más barato, buena calidad)
TTS:  Azure Neural TTS Standard      → $15/1M chars (voz natural, precio razonable)
LLM:  OpenAI GPT-4o (análisis)       → $2.50/$10 por 1M tokens
      OpenAI GPT-4o mini (turns)     → $0.15/$0.60 por 1M tokens
```

**Justificación:**
- OpenAI STT: más barato, excelente español LATAM, sin configuración
- Azure TTS: voz en español de excelente calidad, precio igual a OpenAI TTS, más voces disponibles (puedes probar `es-MX-DaliaNeural`, `es-AR-TomasNeural`, etc.)
- OpenAI LLM: más simple de integrar, mismos precios que Azure OpenAI

### Si un cliente enterprise exige Azure por compliance:
Migrar STT a **Azure Speech Batch** (~$0.024, misma latencia para procesamiento post-sesión) y LLM a **Azure OpenAI** (mismos modelos, mismo precio).

La arquitectura ya prevé esta abstracción (capa de servicio intercambiable).

---

## 8. NOTA SOBRE RAILWAY + STORAGE

Railway ahora tiene **Railway Buckets** (storage S3-compatible nativo):
- **$0.015 / GB / mes**
- Egress gratuito ilimitado
- URLs presignadas para acceso temporal seguro
- Sin configuración adicional (integrado en Railway)

**Recomendación:** Usar Railway Buckets para MVP (audios, PDFs, transcripciones).  
No necesitás S3, Cloudflare R2 ni Azure Blob Storage para el MVP.  
Migrá a S3/Cloudflare R2 si superás los 100GB o necesitás CDN global.

---

## 9. PREGUNTA PENDIENTE: ¿ANDREA ES MULTITENANT?

**Sí, ANDREA es multitenant por diseño.**

- Una sola instancia del producto sirve a múltiples empresas (tenants)
- Aislamiento por `company_id` en todas las tablas
- Row-Level Security en PostgreSQL evita que una empresa vea datos de otra
- Cada empresa tiene sus usuarios, campañas, candidatos y reportes aislados
- El Super Admin ve todo; el Admin Empresa solo ve su empresa

**No es multi-instancia** (no se despliega una instancia separada por empresa). El modelo SaaS estándar es un solo deployment que sirve a todos los tenants.

---

*Actualizado: Mayo 2026*
