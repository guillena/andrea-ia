import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/index.css';

// ── Eval (candidato) ──────────────────────────────────────
import EvalWelcome    from './pages/eval/EvalWelcome';
import EvalConsent    from './pages/eval/EvalConsent';
import EvalMicTest    from './pages/eval/EvalMicTest';
import EvalInterview  from './pages/eval/EvalInterview';
import EvalFinished   from './pages/eval/EvalFinished';
import EvalExpired    from './pages/eval/EvalExpired';

// ── Portal empresa ────────────────────────────────────────
import Login          from './pages/company/Login';
import Dashboard      from './pages/company/Dashboard';
import Searches      from './pages/company/Searches';
import Candidates     from './pages/company/Candidates';
import CandidateReport from './pages/company/CandidateReport';
import Settings       from './pages/company/Settings';
import Users          from './pages/company/Users';

// ── Guards ────────────────────────────────────────────────
import { ProtectedRoute } from './components/ProtectedRoute';
import { PortalLayout }   from './components/PortalLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* ── Evaluación candidato (rutas públicas) ────── */}
          <Route path="/eval/:token"           element={<EvalWelcome />} />
          <Route path="/eval/:token/consent"   element={<EvalConsent />} />
          <Route path="/eval/:token/mic"       element={<EvalMicTest />} />
          <Route path="/eval/:token/interview" element={<EvalInterview />} />
          <Route path="/eval/:token/finished"  element={<EvalFinished />} />
          <Route path="/eval/:token/expired"   element={<EvalExpired />} />

          {/* ── Auth ─────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />

          {/* ── Portal empresa (protegido) ───────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PortalLayout />}>
              <Route path="/dashboard"               element={<Dashboard />} />
              <Route path="/searches"               element={<Searches />} />
              <Route path="/searches/:searchId/candidates" element={<Candidates />} />
              <Route path="/candidates/:candidateId/report"   element={<CandidateReport />} />
              <Route path="/settings"                element={<Settings />} />
              <Route path="/users"                   element={<Users />} />
            </Route>
          </Route>

          {/* ── Redirects ────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
