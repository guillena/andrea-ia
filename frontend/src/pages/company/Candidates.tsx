import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Copy, Check, ExternalLink, X } from 'lucide-react';
import { candidatesApi, searchesApi } from '../../services/api';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendiente',  className: 'badge badge-pending' },
  started:   { label: 'Iniciado',   className: 'badge badge-started' },
  completed: { label: 'Completado', className: 'badge badge-completed' },
  expired:   { label: 'Expirado',   className: 'badge badge-expired' },
};

const RECOMMENDATION: Record<string, string> = {
  recommended:     '🟢',
  review:          '🟡',
  not_recommended: '🔴',
};

export default function Candidates() {
  const { searchId } = useParams<{ searchId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDrawer, setShowDrawer] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const { data: search } = useQuery({
    queryKey: ['search', searchId],
    queryFn: () => searchesApi.get(searchId!),
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', searchId],
    queryFn: () => candidatesApi.list({ campaignId: searchId }),
    refetchInterval: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => candidatesApi.create({ ...data, campaignId: searchId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', searchId] });
      // No cerramos el drawer — el reclutador puede querer agregar varios seguidos
      setForm({ firstName: '', lastName: '', email: '', phone: '' });
    },
  });

  const handleCopyLink = async (evalToken: string) => {
    const link = `${window.location.origin}/eval/${evalToken}`;
    await navigator.clipboard.writeText(link);
    setCopied(evalToken);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '' });
    createMutation.reset();
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{search?.name || 'Cargando...'}</h1>
          <p className="text-sm text-muted">
            {search?.jobPosition?.name || ''} · {candidates?.meta?.total ?? 0} candidatos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/searches')}
          >
            ← Búsquedas
          </button>
          <button className="btn btn-primary" onClick={() => setShowDrawer(true)}>
            <UserPlus size={16} /> Agregar candidato
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted">Cargando candidatos...</p>
      ) : (candidates?.data || []).length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p className="text-muted" style={{ marginBottom: '16px' }}>
            Aún no hay candidatos. Agregá el primero.
          </p>
          <button className="btn btn-primary" onClick={() => setShowDrawer(true)}>
            <UserPlus size={16} /> Agregar candidato
          </button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Estado</th>
                <th>Score</th>
                <th>Link</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(candidates?.data || []).map((c: any) => {
                const score = c.session?.score;
                return (
                  <tr key={c.id}>
                    <td>
                      <p style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </td>
                    <td>
                      <span className={STATUS_BADGE[c.status]?.className || 'badge'}>
                        {STATUS_BADGE[c.status]?.label || c.status}
                      </span>
                    </td>
                    <td>
                      {score ? (
                        <span style={{ fontWeight: 700, color: 'var(--color-indigo)' }}>
                          {RECOMMENDATION[score.recommendation]} {Math.round(score.globalScore)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleCopyLink(c.evalToken)}
                        title="Copiar link de evaluación"
                      >
                        {copied === c.evalToken ? <Check size={14} /> : <Copy size={14} />}
                        {copied === c.evalToken ? 'Copiado' : 'Copiar link'}
                      </button>
                    </td>
                    <td>
                      {c.status === 'completed' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/candidates/${c.id}/report`)}
                        >
                          <ExternalLink size={14} /> Ver reporte
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Drawer agregar candidato ──────────────────────────── */}
      {showDrawer && (
        <Drawer onClose={closeDrawer} title="Agregar candidato">
          {/* Éxito: mostrar aviso y opción de agregar otro */}
          {createMutation.isSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              ✓ Candidato creado. Copiá el link desde la tabla para enviárselo.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  className="input" placeholder="María"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input
                  className="input" placeholder="González"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className="input" placeholder="candidato@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono (opcional)</label>
              <input
                className="input" placeholder="+54 11 1234-5678"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            {createMutation.isError && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                {(createMutation.error as any)?.response?.data?.message || 'Error al crear candidato'}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear y generar link'}
              </button>
              {createMutation.isSuccess && (
                <button
                  type="button"
                  className="btn btn-ghost w-full"
                  onClick={() => { createMutation.reset(); setForm({ firstName: '', lastName: '', email: '', phone: '' }); }}
                >
                  + Agregar otro candidato
                </button>
              )}
            </div>
          </form>
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
