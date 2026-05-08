import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Clock, XCircle, TrendingUp, Plus } from 'lucide-react';
import { dashboardApi } from '../../services/api';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pendiente',  className: 'badge badge-pending' },
  started:   { label: 'Iniciado',   className: 'badge badge-started' },
  completed: { label: 'Completado', className: 'badge badge-completed' },
  expired:   { label: 'Expirado',   className: 'badge badge-expired' },
  cancelled: { label: 'Cancelado',  className: 'badge badge-cancelled' },
};

const RECOMMENDATION_BADGE: Record<string, { label: string; color: string }> = {
  recommended:     { label: '🟢 Recomendado',    color: 'var(--color-success-text)' },
  review:          { label: '🟡 Revisar',         color: 'var(--color-warning-text)' },
  not_recommended: { label: '🔴 No recomendado', color: 'var(--color-danger-text)' },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    refetchInterval: 30_000, // refrescar cada 30s
  });

  if (isLoading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>
        <p className="text-muted">Cargando...</p>
      </div>
    );
  }

  const { kpis, recentCandidates } = data || { kpis: {}, recentCandidates: [] };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/campaigns')}
        >
          <Plus size={16} />
          Nueva evaluación
        </button>
      </div>

      {/* KPIs */}
      <div className="grid-cols-4" style={{ marginBottom: '32px' }}>
        <KpiCard
          icon={<Users size={20} />}
          value={kpis.total ?? 0}
          label="Total evaluaciones"
        />
        <KpiCard
          icon={<CheckCircle size={20} color="var(--color-success)" />}
          value={kpis.completed ?? 0}
          label="Completadas"
          accent="success"
        />
        <KpiCard
          icon={<Clock size={20} color="var(--color-indigo)" />}
          value={kpis.pending ?? 0}
          label="Pendientes"
        />
        <KpiCard
          icon={<TrendingUp size={20} color="var(--color-indigo)" />}
          value={`${kpis.completionRate ?? 0}%`}
          label="Tasa de completitud"
        />
      </div>

      {/* Candidatos recientes */}
      <div className="card" style={{ padding: 0 }}>
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Candidatos recientes</h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/campaigns')}
          >
            Ver todos
          </button>
        </div>

        {recentCandidates.length === 0 ? (
          <div className="text-center" style={{ padding: '48px 24px' }}>
            <Users size={40} color="var(--color-border)" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">Todavía no hay candidatos.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/campaigns')}
            >
              Crear primera campaña
            </button>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Puesto</th>
                  <th>Estado</th>
                  <th>Score</th>
                  <th>Recomendación</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((c: any) => {
                  const score = c.session?.score;
                  const rec = score ? RECOMMENDATION_BADGE[score.recommendation] : null;
                  return (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/candidates/${c.id}/report`)}
                    >
                      <td>
                        <span style={{ fontWeight: 500 }}>
                          {c.firstName} {c.lastName}
                        </span>
                        <br />
                        <span className="text-xs text-muted">{c.email}</span>
                      </td>
                      <td className="text-sm">
                        {c.campaign?.jobPosition?.name || c.campaign?.name || '—'}
                      </td>
                      <td>
                        <span className={STATUS_BADGE[c.status]?.className || 'badge'}>
                          {STATUS_BADGE[c.status]?.label || c.status}
                        </span>
                      </td>
                      <td>
                        {score ? (
                          <span style={{ fontWeight: 700, color: 'var(--color-indigo)' }}>
                            {Math.round(score.globalScore)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {rec ? (
                          <span style={{ fontSize: '13px', color: rec.color, fontWeight: 500 }}>
                            {rec.label}
                          </span>
                        ) : (
                          <span className="text-muted text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon, value, label, accent }: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent?: 'success';
}) {
  return (
    <div className="kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span>{icon}</span>
      </div>
      <div
        className="kpi-card-value"
        style={{ color: accent === 'success' ? 'var(--color-success)' : 'var(--color-indigo)' }}
      >
        {value}
      </div>
      <div className="kpi-card-label">{label}</div>
    </div>
  );
}
