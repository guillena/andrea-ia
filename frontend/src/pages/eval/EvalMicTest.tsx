import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, CheckCircle, AlertCircle } from 'lucide-react';

type MicStatus = 'idle' | 'testing' | 'ok' | 'error';

export default function EvalMicTest() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<MicStatus>('idle');
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startTest = async () => {
    setStatus('testing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      let detectedSound = false;

      const measure = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setLevel(Math.min(100, Math.round(avg * 3)));
        if (avg > 10) detectedSound = true;
        animFrameRef.current = requestAnimationFrame(measure);
      };
      measure();

      // Después de 3 segundos, evaluar si hubo sonido
      setTimeout(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        stream.getTracks().forEach((t) => t.stop());
        setStatus(detectedSound ? 'ok' : 'error');
        setLevel(0);
      }, 3000);
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleContinue = () => {
    navigate(`/eval/${token}/interview`);
  };

  return (
    <div className="eval-page">
      <div className="eval-card" style={{ maxWidth: '480px' }}>
        <div className="eval-logo">ANDR<span>EA</span></div>

        <h1 className="eval-title">Probemos tu micrófono</h1>
        <p className="eval-subtitle">
          Antes de comenzar, verificamos que podamos escucharte bien.
        </p>

        {/* Indicador */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            margin: '32px 0',
          }}
        >
          {/* Ícono */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background:
                status === 'ok'
                  ? 'var(--color-success-bg)'
                  : status === 'error'
                  ? 'var(--color-danger-bg)'
                  : 'var(--color-bg)',
              border: '2px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.3s ease',
            }}
          >
            {status === 'ok' ? (
              <CheckCircle size={36} color="var(--color-success)" />
            ) : status === 'error' ? (
              <MicOff size={36} color="var(--color-danger)" />
            ) : status === 'testing' ? (
              <Mic size={36} color="var(--color-indigo)" />
            ) : (
              <Mic size={36} color="var(--color-text-muted)" />
            )}
          </div>

          {/* Barra de nivel */}
          {status === 'testing' && (
            <div style={{ width: '100%' }}>
              <div className="score-bar-track">
                <div
                  className="score-bar-fill"
                  style={{ width: `${level}%`, transition: 'width 100ms linear' }}
                />
              </div>
              <p className="text-xs text-muted text-center mt-2">
                Hablá o hacé algún sonido...
              </p>
            </div>
          )}

          {/* Mensaje de estado */}
          {status === 'idle' && (
            <p className="text-muted text-center">
              Presioná el botón para probar el micrófono.
            </p>
          )}
          {status === 'ok' && (
            <div className="alert alert-success" style={{ width: '100%' }}>
              <CheckCircle size={18} />
              <span>¡Perfecto! Tu micrófono funciona correctamente.</span>
            </div>
          )}
          {status === 'error' && (
            <div style={{ width: '100%' }}>
              <div className="alert alert-error" style={{ marginBottom: '12px' }}>
                <AlertCircle size={18} />
                <span>No detectamos audio. Revisá los permisos de tu micrófono.</span>
              </div>
              <div
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                }}
              >
                <p className="font-medium" style={{ marginBottom: '8px', color: 'var(--color-text)' }}>
                  ¿Cómo habilitarlo?
                </p>
                <ol style={{ paddingLeft: '16px', lineHeight: '1.8' }}>
                  <li>Chrome: click en el candado 🔒 en la barra de dirección</li>
                  <li>Buscá "Micrófono" y cambialo a "Permitir"</li>
                  <li>Recargá la página</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        {(status === 'idle' || status === 'error') && (
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={startTest}
          >
            <Mic size={18} />
            {status === 'error' ? 'Intentar de nuevo' : 'Probar micrófono'}
          </button>
        )}

        {status === 'ok' && (
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={handleContinue}
          >
            <CheckCircle size={18} />
            Comenzar entrevista
          </button>
        )}
      </div>
    </div>
  );
}
