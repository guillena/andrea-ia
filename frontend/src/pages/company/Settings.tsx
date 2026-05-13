import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings2, ChevronRight, X, Save, ToggleLeft, ToggleRight, AlertCircle, HelpCircle } from 'lucide-react';
import { jobPositionsApi, authApi } from '../../services/api';

// ── Tipos ────────────────────────────────────────────────────

interface Competency {
  id: string;
  name: string;
  dimension: 'cognitiva' | 'conductual' | 'comunicacion';
  weight: number;
  isActive: boolean;
}

interface JobPosition {
  id: string;
  name: string;
  description?: string;
  basePositionKey: string;
  competencies: Competency[];
}

// ── Descripciones detalladas de competencias ────────────────

const COMPETENCY_DESCRIPTIONS: Record<string, string> = {
  // Customer Support
  'cs-1': 'Prioriza las necesidades del cliente en cada interacción, mantiene actitud positiva frente a reclamos y busca soluciones que generen satisfacción real, incluso en situaciones complejas.',
  'cs-2': 'Mantiene el desempeño y la calma ante clientes difíciles, picos de trabajo o situaciones de frustración. No deja que el estrés afecte la calidad de atención.',
  'cs-3': 'Se expresa con claridad y adapta el lenguaje al nivel del cliente. Transmite empatía genuina y hace que el cliente se sienta escuchado y comprendido.',
  'cs-4': 'Identifica rápidamente la causa de problemas frecuentes y aplica soluciones conocidas de forma autónoma, sin necesidad de escalar cada consulta.',
  'cs-5': 'Presta atención genuina al mensaje del cliente sin interrupciones, comprende el contexto completo antes de responder y da retroalimentación apropiada.',
  // Ventas
  'vt-1': 'Tiene motivación intrínseca para alcanzar y superar metas. No necesita supervisión constante: se autogestiona con foco en el logro y la mejora continua.',
  'vt-2': 'Presenta beneficios de forma convincente, maneja objeciones con seguridad y adapta su discurso al perfil y necesidades del cliente en cada conversación.',
  'vt-3': 'Mantiene energía y actitud positiva después de negativas o fracasos. No se desanima con facilidad y retoma el proceso de venta con la misma motivación.',
  'vt-4': 'Comprende conceptos básicos de negocio como margen, beneficio y valor del cliente, lo que le permite argumentar precios y condiciones de forma coherente.',
  'vt-5': 'Transmite seguridad y conviccion al presentar productos o servicios. El cliente percibe que cree en lo que vende, lo que genera confianza y facilita el cierre.',
  // Backoffice
  'bo-1': 'Cumple con plazos y entregables de forma consistente. Organiza sus tareas con criterio de prioridad y maneja con cuidado la documentación e información administrativa.',
  'bo-2': 'Detecta errores, inconsistencias o datos faltantes en documentos o sistemas antes de que generen problemas. Revisa su propio trabajo con rigor.',
  'bo-3': 'Lee, interpreta y ejecuta correctamente procedimientos escritos o verbales. No requiere múltiples aclaraciones para completar una tarea bien definida.',
  'bo-4': 'Redacta correos e informes de forma precisa y sin ambigüedades. Se expresa con claridad en reuniones o llamadas internas, facilitando la coordinación del equipo.',
  'bo-5': 'Actúa con integridad en el manejo de información confidencial, recursos de la empresa y situaciones de conflicto de interés. No omite errores ni manipula datos.',
  // Operaciones Logísticas
  'ol-1': 'Cumple horarios, rutas y entregas en tiempo y forma de manera consistente. Asume con seriedad los compromisos operativos que se le asignan.',
  'ol-2': 'Acepta cambios de último momento con flexibilidad y reorganiza prioridades sin perder la eficiencia. Se adapta bien a imprevistos operativos del día a día.',
  'ol-3': 'Interpreta y ejecuta órdenes de trabajo, guías de proceso o indicaciones del supervisor de manera precisa, sin omitir pasos ni cometer errores por falta de comprensión.',
  'ol-4': 'Mantiene ritmo y calidad de trabajo en contextos de alto volumen, urgencias o condiciones adversas. No baja el rendimiento cuando aumenta la presión.',
  'ol-5': 'Reporta novedades, incidentes o estado de tareas de forma clara y oportuna a superiores o compañeros, asegurando que la información operativa fluya correctamente.',
};


const DIM_LABEL: Record<string, string> = {
  cognitiva:    'Cognitiva',
  conductual:   'Conductual',
  comunicacion: 'Comunicación',
};

const DIM_COLOR: Record<string, string> = {
  cognitiva:    'var(--color-indigo)',
  conductual:   '#0891b2',
  comunicacion: '#7c3aed',
};

const canEdit = (role: string) =>
  role === 'super_admin' || role === 'admin_empresa';

// ── Componente principal ─────────────────────────────────────

export default function Settings() {
  const queryClient = useQueryClient();
  const [selectedPosition, setSelectedPosition] = useState<JobPosition | null>(null);
  const [localCompetencies, setLocalCompetencies] = useState<Competency[]>([]);
  const [saved, setSaved] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    staleTime: 1000 * 60 * 10,
  });

  const { data: positions, isLoading } = useQuery<JobPosition[]>({
    queryKey: ['job-positions'],
    queryFn: jobPositionsApi.list,
  });

  if (!isLoading && me && !canEdit(me.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      jobPositionsApi.updateCompetencies(selectedPosition!.id, localCompetencies),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-positions'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const openPosition = (pos: JobPosition) => {
    setSelectedPosition(pos);
    setLocalCompetencies(JSON.parse(JSON.stringify(pos.competencies))); // deep clone
    setSaved(false);
  };

  const closeDrawer = () => {
    setSelectedPosition(null);
    setSaved(false);
  };

  const toggleCompetency = (id: string) => {
    setLocalCompetencies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    setSaved(false);
  };

  const updateWeight = (id: string, weight: number) => {
    setLocalCompetencies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, weight } : c))
    );
    setSaved(false);
  };

  const isDirty =
    selectedPosition &&
    JSON.stringify(localCompetencies) !== JSON.stringify(selectedPosition.competencies);

  const userRole = me?.role ?? '';
  const editable = canEdit(userRole);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Puestos y competencias</h1>
      </div>

      {/* ── Sección puestos ─────────────────────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Settings2 size={18} color="var(--color-indigo)" />
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Puestos y Competencias</h2>
        </div>
        <p className="text-sm text-muted" style={{ marginBottom: '20px' }}>
          Estas son las competencias que ANDREA evalúa para cada puesto. Los cambios aplican a las búsquedas que se creen a partir de ahora.
          {!editable && (
            <span style={{ display: 'block', marginTop: '6px', color: 'var(--color-warning-text)' }}>
              Solo el Administrador de empresa puede modificar las competencias.
            </span>
          )}
        </p>

        {isLoading ? (
          <p className="text-muted">Cargando puestos...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(positions || []).map((pos) => {
              const active = pos.competencies.filter((c) => c.isActive).length;
              const total = pos.competencies.length;
              return (
                <div
                  key={pos.id}
                  className="card"
                  style={{ cursor: 'pointer', padding: '18px 20px' }}
                  onClick={() => openPosition(pos)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '3px' }}>
                        {pos.name}
                      </p>
                      {pos.description && (
                        <p className="text-sm text-muted">{pos.description}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className="text-sm text-muted">
                        {active}/{total} competencias activas
                      </span>
                      <ChevronRight size={16} color="var(--color-text-muted)" />
                    </div>
                  </div>

                  {/* Mini pills de dimensiones */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {(['cognitiva', 'conductual', 'comunicacion'] as const).map((dim) => {
                      const count = pos.competencies.filter(
                        (c) => c.dimension === dim && c.isActive
                      ).length;
                      if (count === 0) return null;
                      return (
                        <span
                          key={dim}
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: `${DIM_COLOR[dim]}18`,
                            color: DIM_COLOR[dim],
                          }}
                        >
                          {DIM_LABEL[dim]} · {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Drawer lateral ──────────────────────────────────── */}
      {selectedPosition && (
        <Drawer onClose={closeDrawer}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>
                {selectedPosition.name}
              </h3>
              {selectedPosition.description && (
                <p className="text-sm text-muted">{selectedPosition.description}</p>
              )}
            </div>
            <button
              onClick={closeDrawer}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} color="var(--color-text-muted)" />
            </button>
          </div>

          {/* Aviso modo lectura */}
          {!editable && (
            <div className="alert alert-warning" style={{ marginBottom: '16px' }}>
              <AlertCircle size={15} />
              <p className="text-sm">
                Solo el Administrador de empresa puede editar las competencias.
              </p>
            </div>
          )}

          {/* Lista de competencias */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {localCompetencies.map((comp) => (
              <div
                key={comp.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: comp.isActive ? 'var(--color-white)' : 'var(--color-bg)',
                  opacity: comp.isActive ? 1 : 0.6,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <p
                          style={{
                            fontWeight: 500,
                            fontSize: '14px',
                            color: comp.isActive ? 'var(--color-text)' : 'var(--color-text-muted)',
                          }}
                        >
                          {comp.name}
                        </p>
                        {COMPETENCY_DESCRIPTIONS[comp.id] && (
                          <CompetencyTooltip description={COMPETENCY_DESCRIPTIONS[comp.id]} />
                        )}
                      </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '1px 7px',
                        borderRadius: '999px',
                        background: `${DIM_COLOR[comp.dimension]}18`,
                        color: DIM_COLOR[comp.dimension],
                      }}
                    >
                      {DIM_LABEL[comp.dimension]}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px' }}>
                    {/* Peso */}
                    {editable && comp.isActive && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="text-xs text-muted">Peso</span>
                        <select
                          className="select"
                          style={{ padding: '2px 6px', fontSize: '12px', width: 'auto', minWidth: '60px' }}
                          value={comp.weight}
                          onChange={(e) => updateWeight(comp.id, parseFloat(e.target.value))}
                        >
                          {[0.5, 0.8, 1.0, 1.1, 1.2, 1.3, 1.5, 2.0].map((w) => (
                            <option key={w} value={w}>{w}x</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Toggle */}
                    {editable ? (
                      <button
                        onClick={() => toggleCompetency(comp.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                        title={comp.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {comp.isActive ? (
                          <ToggleRight size={24} color="var(--color-indigo)" />
                        ) : (
                          <ToggleLeft size={24} color="var(--color-text-muted)" />
                        )}
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: comp.isActive ? 'var(--color-success-text)' : 'var(--color-text-muted)' }}>
                        {comp.isActive ? '✓ Activa' : 'Inactiva'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer con botón guardar */}
          {editable && (
            <div>
              {saved && (
                <div className="alert alert-success" style={{ marginBottom: '12px' }}>
                  ✓ Cambios guardados correctamente
                </div>
              )}
              <button
                className="btn btn-primary w-full"
                disabled={!isDirty || saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                <Save size={15} />
                {saveMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
              </button>
              {isDirty && (
                <p className="text-xs text-muted text-center" style={{ marginTop: '8px' }}>
                  Tenés cambios sin guardar
                </p>
              )}
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
}

// ── Drawer component ─────────────────────────────────────────

// ── CompetencyTooltip ────────────────────────────────────────

function CompetencyTooltip({ description }: { description: string }) {
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const show = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const tooltipWidth = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const left = Math.max(8, Math.min(rect.left - tooltipWidth / 2 + 7, window.innerWidth - tooltipWidth - 8));
    if (spaceBelow >= 130) {
      setPos({ top: rect.bottom + 6, left });
    } else {
      setPos({ bottom: window.innerHeight - rect.top + 6, left });
    }
  };

  const hide = () => setPos(null);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        ref={btnRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={(e) => { e.stopPropagation(); pos ? hide() : show(); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0', display: 'flex', alignItems: 'center',
          color: 'var(--color-text-muted)', flexShrink: 0,
        }}
      >
        <HelpCircle size={13} />
      </button>

      {pos && (
        <div
          style={{
            position: 'fixed',
            top: pos.top,
            bottom: pos.bottom,
            left: pos.left,
            zIndex: 9999,
            width: '220px',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '12px',
            lineHeight: '1.65',
            padding: '10px 12px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}


// ── Drawer component ─────────────────────────────────────────

function Drawer({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: '420px',
          maxWidth: '100vw',
          background: 'var(--color-white)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
          padding: '28px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </>
  );
}
