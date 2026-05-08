import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Mic, Shield, ChevronRight } from 'lucide-react';
import { evalApi } from '../../services/evalApi';

export default function EvalWelcome() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['eval-session', token],
    queryFn: () => evalApi.getSession(token!),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="eval-page">
        <div className="eval-card text-center">
          <div className="eval-logo">ANDR<span>EA</span></div>
          <p className="text-muted mt-4">Cargando tu evaluación...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    navigate(`/eval/${token}/expired`);
    return null;
  }

  if (data.status === 'expired' || data.status === 'completed') {
    navigate(`/eval/${token}/expired`);
    return null;
  }

  const handleStart = () => {
    navigate(`/eval/${token}/consent`);
  };

  return (
    <div className="eval-page">
      <div className="eval-card">
        {/* Header */}
        <div className="eval-logo">ANDR<span>EA</span></div>
        <p className="eval-company">
          Evaluación para <strong>{data.companyName}</strong>
        </p>

        {/* Título */}
        <h1 className="eval-title">Hola, {data.candidateFirstName} 👋</h1>
        <p className="eval-subtitle">
          Te invitamos a completar una evaluación para la posición de{' '}
          <strong>{data.positionName}</strong>.<br />
          Es una conversación por voz, corta y sencilla.
        </p>

        {/* Info cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          <InfoRow
            icon={<Clock size={18} />}
            title="Duración aproximada"
            desc="Entre 10 y 15 minutos"
          />
          <InfoRow
            icon={<Mic size={18} />}
            title="Necesitás micrófono"
            desc="La evaluación es por voz. Buscá un lugar tranquilo."
          />
          <InfoRow
            icon={<Shield size={18} />}
            title="Tus datos están protegidos"
            desc="La información es confidencial y se usa solo para este proceso."
          />
        </div>

        {/* Disclaimer suave */}
        <p className="text-xs text-muted text-center mb-6">
          Esta es una herramienta de apoyo para la selección laboral, no un diagnóstico psicológico.
          Vas a hablar con una inteligencia artificial.
        </p>

        {/* CTA */}
        <button className="btn btn-primary btn-lg w-full" onClick={handleStart}>
          Ver instrucciones y continuar <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '14px',
        background: 'var(--color-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}
    >
      <span style={{ color: 'var(--color-indigo)', marginTop: '2px', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 600, fontSize: '14px' }}>{title}</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{desc}</p>
      </div>
    </div>
  );
}
