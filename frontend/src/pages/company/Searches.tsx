import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, CheckCircle, Settings, X } from 'lucide-react';
import { searchesApi, jobPositionsApi } from '../../services/api';

const DIM_COLOR: Record<string, string> = {
  cognitiva:    'var(--color-indigo)',
  conductual:   '#0891b2',
  comunicacion: '#7c3aed',
};
const DIM_LABEL: Record<string, string> = {
  cognitiva:    'Cognitiva',
  conductual:   'Conductual',
  comunicacion: 'Comunicación',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'Activa', color: 'var(--color-success-text)' },
  paused: { label: 'Pausada', color: 'var(--color-warning-text)' },
  closed: { label: 'Cerrada', color: 'var(--color-text-muted)' },
};

export default function Searches() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [showCompetencies, setShowCompetencies] = useState(false);
  const [form, setForm] = useState({ name: '', jobPositionId: '', linkExpiryDays: 7 });

  const { data: searches, isLoading } = useQuery({
    queryKey: ['searches'],
    queryFn: () => searchesApi.list(),
  });

  const { data: positions } = useQuery({
    queryKey: ['job-positions'],
    queryFn: jobPositionsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: searchesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searches'] });
      closeDrawer();
    },
  });

  const closeDrawer = () => {
    setShowDrawer(false);
    setShowCompetencies(false);
    setSelectedPosition(null);
    setForm({ name: '', jobPositionId: '', linkExpiryDays: 7 });
  };

  const handlePositionChange = (posId: string) => {
    const pos = positions?.find((p: any) => p.id === posId);
    setSelectedPosition(pos || null);
    setForm((f) => ({ ...f, jobPositionId: posId }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Búsquedas</h1>
        <button className="btn btn-primary" onClick={() => setShowDrawer(true)}>
          <Plus size={16} /> Nueva búsqueda
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted">Cargando...</p>
      ) : (searches?.data || []).length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p className="text-muted" style={{ marginBottom: '16px' }}>No tenés búsquedas activas.</p>
          <button className="btn btn-primary" onClick={() => setShowDrawer(true)}>
            Crear la primera búsqueda
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(searches?.data || []).map((c: any) => (
            <div
              key={c.id}
              className="card"
              style={{ cursor: 'pointer', padding: '20px 24px' }}
              onClick={() => navigate(`/searches/${c.id}/candidates`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{c.name}</p>
                  <p className="text-sm text-muted">
                    {c.jobPosition?.name || 'Sin puesto definido'} ·{' '}
                    <span style={{ color: STATUS_MAP[c.status]?.color, fontWeight: 500 }}>
                      {STATUS_MAP[c.status]?.label}
                    </span>
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div className="text-center">
                    <p style={{ fontWeight: 700, fontSize: '20px', color: 'var(--color-indigo)' }}>
                      {c._count?.candidates ?? 0}
                    </p>
                    <p className="text-xs text-muted">candidatos</p>
                  </div>
                  <ChevronRight size={18} color="var(--color-text-muted)" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Drawer nueva búsqueda ─────────────────────────────── */}
      {showDrawer && (
        <Drawer onClose={closeDrawer} title="Nueva búsqueda">
          {!showCompetencies ? (
            /* Paso 1: datos de la búsqueda */
            <form onSubmit={(e) => { e.preventDefault(); if (form.jobPositionId) setShowCompetencies(true); }}>
              <div className="form-group">
                <label className="form-label">Nombre de la búsqueda</label>
                <input
                  className="input"
                  placeholder="Ej: Atención al Cliente Q2"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Puesto a evaluar</label>
                <select
                  className="select"
                  value={form.jobPositionId}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  required
                >
                  <option value="">— Seleccioná un puesto —</option>
                  {(positions || []).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Expiración del link (días)</label>
                <input
                  type="number" className="input" min={1} max={30}
                  value={form.linkExpiryDays}
                  onChange={(e) => setForm((f) => ({ ...f, linkExpiryDays: +e.target.value }))}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                style={{ marginTop: '8px' }}
                disabled={!form.name || !form.jobPositionId}
              >
                Revisar competencias <ChevronRight size={16} />
              </button>
            </form>
          ) : (
            /* Paso 2: confirmar competencias */
            <div>
              <p style={{ marginBottom: '4px', fontWeight: 600, fontSize: '15px' }}>
                Competencias a evaluar
              </p>
              <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                ANDREA usará estas competencias para evaluar a los candidatos de esta búsqueda.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                {(selectedPosition?.competencies || []).filter((c: any) => c.isActive).map((comp: any) => (
                  <div
                    key={comp.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--color-bg)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CheckCircle size={14} color="var(--color-success)" style={{ flexShrink: 0 }} />
                      <p style={{ fontWeight: 500, fontSize: '14px' }}>{comp.name}</p>
                    </div>
                    <span
                      style={{
                        fontSize: '11px', fontWeight: 500,
                        padding: '2px 8px', borderRadius: '999px',
                        background: `${DIM_COLOR[comp.dimension] ?? '#666'}18`,
                        color: DIM_COLOR[comp.dimension] ?? '#666',
                        flexShrink: 0, marginLeft: '8px',
                      }}
                    >
                      {DIM_LABEL[comp.dimension] ?? comp.dimension}
                    </span>
                  </div>
                ))}
                {(selectedPosition?.competencies || []).filter((c: any) => !c.isActive).length > 0 && (
                  <p className="text-xs text-muted" style={{ paddingLeft: '4px' }}>
                    {(selectedPosition?.competencies || []).filter((c: any) => !c.isActive).length} competencia(s) inactiva(s) no serán evaluadas.
                  </p>
                )}
              </div>

              <button
                className="btn btn-ghost btn-sm"
                style={{ marginBottom: '20px', fontSize: '12px' }}
                onClick={() => { closeDrawer(); navigate('/settings'); }}
              >
                <Settings size={13} /> Modificar competencias del puesto
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleCreate as any}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creando...' : 'Confirmar y crear búsqueda'}
                </button>
                <button className="btn btn-ghost w-full" onClick={() => setShowCompetencies(false)}>
                  ← Volver
                </button>
              </div>
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────

function Drawer({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: '420px', maxWidth: '100vw',
          background: 'var(--color-white)',
          boxShadow: '-4px 0 32px rgba(0,0,0,0.12)',
          padding: '28px 24px',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            <X size={18} color="var(--color-text-muted)" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
