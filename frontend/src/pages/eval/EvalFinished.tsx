import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function EvalFinished() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="eval-page">
      <div className="eval-card text-center" style={{ maxWidth: '480px' }}>
        <div style={{ marginBottom: '24px' }}>
          <CheckCircle size={64} color="var(--color-success)" style={{ margin: '0 auto 16px' }} />
        </div>

        <h1 className="eval-title">¡Muchas gracias!</h1>
        <p className="eval-subtitle">
          Tu evaluación fue enviada correctamente. El equipo de Recursos Humanos
          revisará los resultados y estará en contacto con vos próximamente.
        </p>

        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            marginBottom: '24px',
          }}
        >
          ¡Mucho éxito en tu proceso! 🍀
        </div>

        <p className="text-xs text-muted">
          Podés cerrar esta ventana.
        </p>
      </div>
    </div>
  );
}
