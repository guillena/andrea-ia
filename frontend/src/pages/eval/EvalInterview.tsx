import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import { evalApi } from '../../services/evalApi';

type Phase = 'starting' | 'agent_speaking' | 'agent_speaking_paused' | 'user_speaking' | 'processing' | 'finished' | 'error';

const STATUS_LABEL: Record<Phase, string> = {
  starting:       'Iniciando...',
  agent_speaking: 'ANDREA está hablando',
  agent_speaking_paused: 'Audio en pausa',
  user_speaking:  'Tu turno — hablá cuando quieras',
  processing:     'Procesando tu respuesta...',
  finished:       '¡Evaluación completada!',
  error:          'Ocurrió un problema',
};

export default function EvalInterview() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('starting');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const audioRef       = useRef<HTMLAudioElement | null>(null);
  const recorderRef    = useRef<MediaRecorder | null>(null);
  const chunksRef      = useRef<Blob[]>([]);
  const streamRef      = useRef<MediaStream | null>(null);

  // ── Iniciar sesión ────────────────────────────────────────
  const startMutation = useMutation({
    mutationFn: () => evalApi.startSession(token!),
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      playAgentAudio(data.introAudioUrl);
    },
    onError: () => {
      setPhase('error');
      setErrorMsg('No pudimos iniciar la evaluación. Por favor recargá la página.');
    },
  });

  // ── Enviar turno del candidato ────────────────────────────
  const turnMutation = useMutation({
    mutationFn: (audioBlob: Blob) =>
      evalApi.sendTurn(token!, sessionId!, audioBlob),
    onSuccess: (data) => {
      if (data.isFinal) {
        // Reproducir audio de cierre y luego navegar — sin habilitar grabación
        playClosingAudio(data.nextAudioUrl);
      } else {
        playAgentAudio(data.nextAudioUrl);
      }
    },
    onError: () => {
      setPhase('error');
      setErrorMsg('Error al procesar tu respuesta. Presioná "Recargar" para intentar de nuevo.');
    },
  });

  // ── Reproducir audio del agente (turno normal → habilita grabación) ─
  const playAgentAudio = useCallback((audioUrl: string) => {
    setPhase('agent_speaking');
    if (audioRef.current) { audioRef.current.pause(); }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.play().catch(() => {
      // Algunos browsers bloquean autoplay — iniciar al click
      setPhase('agent_speaking_paused');
    });
    audio.onended = () => startRecording();
  }, []);

  // ── Reproducir audio de cierre (isFinal → navegar al terminar) ───────
  const playClosingAudio = useCallback((audioUrl: string) => {
    setPhase('finished');
    if (audioRef.current) { audioRef.current.pause(); }
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    const goToFinished = () => navigate(`/eval/${token}/finished`);
    audio.onended = goToFinished;
    audio.play().catch(() => {
      // Si el autoplay falla, navegar de todos modos tras 3s
      setTimeout(goToFinished, 3000);
    });
    // Fallback: si el audio tarda más de 30s, navegar igual
    setTimeout(goToFinished, 30_000);
  }, [navigate, token]);

  // ── Grabar audio del candidato ────────────────────────────
  const startRecording = useCallback(async () => {
    setPhase('user_speaking');
    chunksRef.current = [];
    try {
      const stream = streamRef.current
        || await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setPhase('processing');
        turnMutation.mutate(blob);
      };

      recorder.start(250); // timeslice para datos continuos

      // Auto-stop a los 90s si no para antes
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 90_000);
    } catch {
      setPhase('error');
      setErrorMsg('No pudimos acceder a tu micrófono. Revisá los permisos y recargá.');
    }
  }, [turnMutation]);

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
  };

  // ── Cleanup ───────────────────────────────────────────────
  useEffect(() => {
    startMutation.mutate();
    return () => {
      audioRef.current?.pause();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="interview-page">

      {/* Avatar */}
      <div className={`interview-avatar ${phase === 'agent_speaking' ? 'speaking' : ''}`}>
        <span style={{ fontSize: '42px', userSelect: 'none' }}>🎙️</span>
      </div>

      {/* Estado */}
      <p className="interview-status">{STATUS_LABEL[phase]}</p>

      {/* Onda de audio (solo en user_speaking) */}
      <div className={`audio-wave ${phase !== 'user_speaking' ? 'idle' : ''}`}>
        {[...Array(9)].map((_, i) => (
          <div key={i} className="audio-wave-bar" />
        ))}
      </div>

      {/* Acción principal */}
      <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {phase === 'user_speaking' && (
          <button className="btn btn-primary btn-lg" onClick={stopRecording} style={{ minWidth: '200px' }}>
            Terminé de hablar ✓
          </button>
        )}
        {phase === 'agent_speaking' && (
          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center' }}>
            Escuchá a ANDREA y luego respondé...
          </p>
        )}
        {phase === 'agent_speaking_paused' && (
          <button className="btn btn-primary" onClick={() => {
            audioRef.current?.play().then(() => setPhase('agent_speaking'));
          }}>
            Escuchar mensaje ▶️
          </button>
        )}
        {phase === 'processing' && (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Analizando tu respuesta...</p>
        )}
        {phase === 'starting' && (
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Conectando con ANDREA...</p>
        )}
        {phase === 'finished' && (
          <p style={{ color: 'var(--color-primary)', fontSize: '16px', fontWeight: 600 }}>
            Generando tu reporte... ✓
          </p>
        )}
        {phase === 'error' && (
          <div
            style={{
              maxWidth: '380px', background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)',
              padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ color: '#fca5a5', fontSize: '14px', marginBottom: '12px' }}>{errorMsg}</p>
              <button
                className="btn btn-sm"
                style={{ borderColor: '#f87171', color: '#fca5a5', background: 'transparent', border: '1px solid' }}
                onClick={() => window.location.reload()}
              >
                Recargar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botón de emergencia técnica */}
      {phase !== 'error' && phase !== 'finished' && (
        <button
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius-md)', color: '#64748b',
            padding: '8px 14px', fontSize: '12px', cursor: 'pointer',
            fontFamily: 'var(--font-family)',
          }}
          onClick={() => navigate(`/eval/${token}/finished`)}
        >
          Tuve un problema técnico
        </button>
      )}
    </div>
  );
}
