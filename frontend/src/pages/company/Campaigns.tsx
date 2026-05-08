import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Users, Pause, CheckCircle } from 'lucide-react';
import { campaignsApi, jobPositionsApi } from '../../services/api';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'Activa', color: 'var(--color-success-text)' },
  paused: { label: 'Pausada', color: 'var(--color-warning-text)' },
  closed: { label: 'Cerrada', color: 'var(--color-text-muted)' },
};

export default function Campaigns() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(null);
  const [showCompetencies, setShowCompetencies] = useState(false);
  const [form, setForm] = useState({ name: '', jobPositionId: '', linkExpiryDays: 7 });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list(),
  });

  const { data: positions } = useQuery({
    queryKey: ['job-positions'],
    queryFn: jobPositionsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: campaignsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setShowModal(false);
      setForm({ name: '', jobPositionId: '', linkExpiryDays: 7 });
      setSelectedPosition(null);
      setShowCompetencies(false);
    },
  });

  const handlePositionChange = (posId: string) => {
    const pos = positions?.find((p: any) => p.id === posId);
    setSelectedPosition(pos || null);
    setForm((f) => ({ ...f, jobPositionId: posId }));
    if (pos) setShowCompetencies(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Campañas</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nueva campaña
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted">Cargando...</p>
      ) : (campaigns?.data || []).length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p className="text-muted" style={{ marginBottom: '16px' }}>No tenés campañas activas.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Crear la primera campaña
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(campaigns?.data || []).map((c: any) => (
            <div
              key={c.id}
              className="card"
              style={{ cursor: 'pointer', padding: '20px 24px' }}
              onClick={() => navigate(`/campaigns/${c.id}/candidates`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{c.name}</p>
                  <p className="text-sm text-muted">
                    {c.jobPosition?.name || 'Sin puesto definido'} ·{' '}
                    <span
                      style={{
                        color: STATUS_MAP[c.status]?.color,
                        fontWeight: 500,
                      }}
                    >
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

      {/* Modal nueva campaña */}
      {showModal && (
        <Modal onClose={() => { setShowModal(false); setShowCompetencies(false); setSelectedPosition(null); }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
            Nueva campaña
          </h2>

          {!showCompetencies ? (
            <form onSubmit={(e) => { e.preventDefault(); if (form.jobPositionId) setShowCompetencies(true); }}>
              <div className="form-group">
                <label className="form-label">Nombre de la campaña</label>
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
                disabled={!form.name || !form.jobPositionId}
              >
                Revisar competencias <ChevronRight size={16} />
              </button>
            </form>
          ) : (
            /* Paso 2: revisión de competencias del puesto */
            <div>
              <p style={{ marginBottom: '16px', fontWeight: 500 }}>
                Competencias para <strong>{selectedPosition?.name}</strong>
              </p>
              <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                Estas son las competencias que ANDREA evaluará. Podés modificarlas desde Configuración → Puestos.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {(selectedPosition?.competencies || []).map((comp: any) => (
                  <div
                    key={comp.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px',
                      background: comp.isActive ? 'var(--color-bg)' : '#f1f5f9',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      opacity: comp.isActive ? 1 : 0.5,
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 500, fontSize: '14px' }}>{comp.name}</p>
                      <p className="text-xs text-muted">{comp.dimension}</p>
                    </div>
                    {comp.isActive ? (
                      <CheckCircle size={16} color="var(--color-success)" />
                    ) : (
                      <Pause size={16} color="var(--color-text-muted)" />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn btn-ghost w-full"
                  onClick={() => setShowCompetencies(false)}
                >
                  Modificar puesto
                </button>
                <button
                  className="btn btn-primary w-full"
                  onClick={handleCreate as any}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Creando...' : 'Confirmar y crear'}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--color-white)', borderRadius: 'var(--radius-xl)',
          padding: '32px', width: '100%', maxWidth: '480px',
          boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
