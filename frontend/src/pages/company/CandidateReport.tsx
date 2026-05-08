import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, MessageSquare, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { candidatesApi } from '../../services/api';

const DIM_LABEL: Record<string, string> = {
  cognitive: 'Cognitiva',
  behavioral: 'Conductual',
  communication: 'Comunicación',
  consistency: 'Consistencia',
};

export default function CandidateReport() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showTranscript, setShowTranscript] = useState(false);
  const [decision, setDecision] = useState('');
  const [notes, setNotes] = useState('');
  const [decisionSaved, setDecisionSaved] = useState(false);

  const { data: candidate, isLoading } = useQuery({
    queryKey: ['candidate-report', candidateId],
    queryFn: () => candidatesApi.report(candidateId!),
  });

  const { data: transcript } = useQuery({
    queryKey: ['transcript', candidateId],
    queryFn: () => candidatesApi.transcript(candidateId!),
    enabled: showTranscript,
  });

  const decisionMutation = useMutation({
    mutationFn: () => candidatesApi.decision(candidateId!, decision, notes),
    onSuccess: () => {
      setDecisionSaved(true);
      queryClient.invalidateQueries({ queryKey: ['candidate-report', candidateId] });
    },
  });

  if (isLoading) return <div><p className="text-muted">Cargando reporte...</p></div>;
  if (!candidate) return <div><p className="text-muted">Candidato no encontrado.</p></div>;

  const score = candidate.session?.score;
  const report = candidate.session?.report;
  const details = score?.dimensionDetails || {};

  const getRec = () => {
    if (!score) return null;
    const map = {
      recommended:     { label: 'RECOMENDADO',     className: 'recommendation recommendation-recommended' },
      review:          { label: 'REVISAR',          className: 'recommendation recommendation-review' },
      not_recommended: { label: 'NO RECOMENDADO',  className: 'recommendation recommendation-not-recommended' },
    };
    return map[score.recommendation as keyof typeof map];
  };

  const rec = getRec();

  const getScoreClass = (s: number) =>
    s >= 70 ? 'high' : s >= 40 ? 'medium' : 'low';

  return (
    <div style={{ maxWidth: '800px' }}>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={() => navigate(-1)}>
        ← Volver
      </button>

      {/* Header del candidato */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-sm text-muted">{candidate.email}</p>
            <p className="text-sm text-muted" style={{ marginTop: '4px' }}>
              {candidate.campaign?.jobPosition?.name || candidate.campaign?.name}
            </p>
          </div>
          {score && (
            <div className="text-center">
              <div
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--color-bg)', border: '3px solid var(--color-indigo)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-indigo)', lineHeight: 1 }}>
                  {Math.round(score.globalScore)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>/100</span>
              </div>
              {rec && <span className={rec.className} style={{ marginTop: '8px', fontSize: '12px' }}>{rec.label}</span>}
            </div>
          )}
        </div>
      </div>

      {!score ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p className="text-muted">
            {candidate.session?.analysisStatus === 'processing'
              ? '⏳ El reporte se está generando...'
              : candidate.session?.analysisStatus === 'failed'
              ? '❌ Error al generar el reporte. El equipo fue notificado.'
              : 'El candidato aún no completó la evaluación.'}
          </p>
        </div>
      ) : (
        <>
          {/* Resumen ejecutivo */}
          {report?.executiveSummary && (
            <div className="card" style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>Resumen ejecutivo</h2>
              <p style={{ lineHeight: '1.7', color: 'var(--color-text)' }}>{report.executiveSummary}</p>
            </div>
          )}

          {/* Score por dimensión */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>Score por dimensión</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { key: 'cognitive',     score: score.cognitiveScore },
                { key: 'behavioral',    score: score.behavioralScore },
                { key: 'communication', score: score.communicationScore },
                { key: 'consistency',   score: score.consistencyScore },
              ].map(({ key, score: s }) => (
                <div key={key}>
                  <div className="score-bar-label">
                    <span style={{ fontWeight: 500 }}>{DIM_LABEL[key]}</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-indigo)' }}>{Math.round(s)}/100</span>
                  </div>
                  <div className="score-bar-track" style={{ marginTop: '6px' }}>
                    <div
                      className={`score-bar-fill ${getScoreClass(s)}`}
                      style={{ width: `${s}%` }}
                    />
                  </div>
                  {details[key]?.summary && (
                    <p className="text-sm text-muted" style={{ marginTop: '6px' }}>
                      {details[key].summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Risk flags */}
          {(score.riskFlags as string[])?.length > 0 && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <div>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Indicadores a revisar</p>
                {(score.riskFlags as string[]).map((f: string) => (
                  <p key={f} className="text-sm">• {f.replace(/_/g, ' ')}</p>
                ))}
              </div>
            </div>
          )}

          {/* Decisión del reclutador */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '16px' }}>
              Decisión del reclutador
            </h2>
            {decisionSaved || candidate.recruiterDecision ? (
              <div className="alert alert-success">
                ✓ Decisión registrada: <strong>{candidate.recruiterDecision || decision}</strong>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { value: 'recommended',     label: '🟢 Recomendado' },
                    { value: 'review',          label: '🟡 Revisar' },
                    { value: 'not_recommended', label: '🔴 No recomendado' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={`btn btn-sm ${decision === opt.value ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setDecision(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="textarea"
                  placeholder="Notas del reclutador (opcional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ marginBottom: '12px' }}
                />
                <button
                  className="btn btn-primary"
                  disabled={!decision || decisionMutation.isPending}
                  onClick={() => decisionMutation.mutate()}
                >
                  Guardar decisión
                </button>
              </>
            )}
          </div>

          {/* Transcripción colapsable */}
          <div className="card">
            <button
              className="btn btn-ghost w-full"
              style={{ justifyContent: 'space-between' }}
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} /> Transcripción de la entrevista
              </span>
              {showTranscript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTranscript && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(transcript || []).map((t: any) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: t.speaker === 'agent' ? 'var(--color-bg)' : 'rgba(79,70,229,0.06)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <p className="text-xs" style={{ fontWeight: 600, marginBottom: '4px', color: t.speaker === 'agent' ? 'var(--color-indigo)' : 'var(--color-text-muted)' }}>
                      {t.speaker === 'agent' ? 'ANDREA' : 'Candidato'}
                    </p>
                    <p className="text-sm">{t.contentText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted text-center" style={{ marginTop: '24px', lineHeight: '1.6' }}>
            ⚠ Este reporte fue generado automáticamente por ANDREA y no constituye un diagnóstico psicológico
            ni médico. La decisión final de contratación es responsabilidad exclusiva del empleador.
          </p>
        </>
      )}
    </div>
  );
}
