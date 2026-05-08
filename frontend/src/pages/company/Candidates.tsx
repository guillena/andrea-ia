import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Copy, Check, ExternalLink } from 'lucide-react';
import { candidatesApi, campaignsApi } from '../../services/api';

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
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.get(campaignId!),
  });

  const { data: candidates, isLoading } = useQuery({
    queryKey: ['candidates', campaignId],
    queryFn: () => candidatesApi.list({ campaignId }),
    refetchInterval: 15_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => candidatesApi.create({ ...data, campaignId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates', campaignId] });
      setShowModal(false);
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

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '8px' }}
          onClick={() => navigate('/campaigns')}
        >
          ← Campañas
        </button>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="page-title">{campaign?.name || 'Cargando...'}</h1>
            <p className="text-sm text-muted">
              {campaign?.jobPosition?.name || ''} · {candidates?.meta?.total ?? 0} candidatos
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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

      {/* Modal agregar candidato */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            style={{
              background: 'var(--color-white)', borderRadius: 'var(--radius-xl)',
              padding: '32px', width: '100%', maxWidth: '440px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>
              Agregar candidato
            </h2>
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
              {createMutation.isSuccess && (
                <div className="alert alert-success" style={{ marginBottom: '16px' }}>
                  ✓ Candidato creado. Copiá el link de la tabla para enviárselo.
                </div>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-ghost w-full" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creando...' : 'Crear y generar link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
