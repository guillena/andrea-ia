import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { evalApi } from '../../services/evalApi';

const CONSENT_TEXT = `CONSENTIMIENTO INFORMADO — EVALUACIÓN ANDREA

Al participar en esta evaluación, usted acepta lo siguiente:

1. NATURALEZA DE LA EVALUACIÓN
Esta es una evaluación de aptitudes laborales realizadas mediante un agente de inteligencia artificial conversacional. No constituye un diagnóstico psicológico ni médico.

2. DATOS QUE SE RECOPILAN
Durante la evaluación se grabarán y procesarán: su voz, la transcripción de sus respuestas y los resultados de la evaluación. No se recopilan datos sensibles sobre salud, religión, política, orientación sexual ni estado civil.

3. FINALIDAD
Los datos se utilizan exclusivamente para el proceso de selección laboral para el que fue invitado/a. No se comparten con terceros ajenos a este proceso.

4. DERECHOS
Usted tiene derecho a solicitar la eliminación de sus datos escribiendo a privacidad@andrea.app. La retención de datos es de 2 años salvo solicitud de eliminación.

5. VOLUNTARIEDAD
Su participación es voluntaria. Puede abandonar la evaluación en cualquier momento, aunque esto podría afectar el proceso de selección.

6. INTELIGENCIA ARTIFICIAL
Esta evaluación es conducida por un agente de inteligencia artificial. Usted interactuará con un sistema automático, no con una persona humana.

7. REVISIÓN HUMANA
Los resultados son revisados por el equipo de Recursos Humanos de la empresa que lo invitó. La decisión final de contratación es responsabilidad exclusiva de dicha empresa.`;

export default function EvalConsent() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Detectar si scrolleó el texto (para habilitar el checkbox)
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
        setHasScrolled(true);
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const mutation = useMutation({
    mutationFn: () =>
      evalApi.acceptConsent(token!, {
        accepted: true,
        userAgent: navigator.userAgent,
      }),
    onSuccess: () => {
      navigate(`/eval/${token}/mic`);
    },
  });

  const handleContinue = () => {
    if (!accepted) return;
    mutation.mutate();
  };

  return (
    <div className="eval-page">
      <div
        className="eval-card"
        style={{ maxWidth: '560px', padding: '32px' }}
      >
        <div className="eval-logo">ANDR<span>EA</span></div>

        <h1 className="eval-title" style={{ marginBottom: '8px' }}>
          Consentimiento informado
        </h1>
        <p className="eval-subtitle" style={{ marginBottom: '20px', fontSize: '13px' }}>
          Leé el texto completo antes de continuar.
        </p>

        {/* Texto de consentimiento */}
        <div
          ref={textRef}
          style={{
            height: '220px',
            overflowY: 'auto',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            fontSize: '12px',
            lineHeight: '1.7',
            color: 'var(--color-text)',
            whiteSpace: 'pre-wrap',
            marginBottom: '20px',
            fontFamily: 'var(--font-family)',
          }}
        >
          {CONSENT_TEXT}
        </div>

        {!hasScrolled && (
          <p className="text-xs text-muted text-center mb-4" style={{ marginBottom: '16px' }}>
            ↓ Scrolleá para leer el texto completo
          </p>
        )}

        {/* Checkbox */}
        <label
          className="checkbox-wrapper mb-6"
          style={{
            marginBottom: '24px',
            opacity: hasScrolled ? 1 : 0.4,
            pointerEvents: hasScrolled ? 'auto' : 'none',
          }}
        >
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            disabled={!hasScrolled}
          />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            Leí y acepto el consentimiento informado
          </span>
        </label>

        {mutation.isError && (
          <div className="alert alert-error mb-4" style={{ marginBottom: '16px' }}>
            Ocurrió un error. Por favor intentá de nuevo.
          </div>
        )}

        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleContinue}
          disabled={!accepted || mutation.isPending}
        >
          {mutation.isPending ? 'Procesando...' : (
            <>
              <CheckCircle size={18} />
              Aceptar y continuar
            </>
          )}
        </button>

        <p className="text-xs text-muted text-center mt-4" style={{ marginTop: '16px' }}>
          <a href="mailto:privacidad@andrea.app">Política de privacidad</a>
        </p>
      </div>
    </div>
  );
}
