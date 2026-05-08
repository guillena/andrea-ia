import { Link2Off } from 'lucide-react';

export default function EvalExpired() {
  return (
    <div className="eval-page">
      <div className="eval-card text-center" style={{ maxWidth: '440px' }}>
        <Link2Off size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 20px' }} />
        <h1 className="eval-title">Este link no está disponible</h1>
        <p className="eval-subtitle">
          El link de evaluación ya fue utilizado, expiró o no es válido.
        </p>
        <p className="text-sm text-muted">
          Si creés que es un error, contactá al equipo de RRHH que te envió este link.
        </p>
      </div>
    </div>
  );
}
