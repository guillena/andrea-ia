import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authApi } from '../../services/api';
import loginBg from '../../assets/loginBG.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-1px' }}>
            ANDR<span style={{ color: 'var(--color-indigo)' }}>EA</span>
          </h1>
          <p className="text-muted" style={{ fontSize: '14px', marginTop: '4px' }}>
            Evaluaciones psicotécnicas por voz
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
            Ingresar
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '36px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
              style={{ padding: '12px', fontSize: '15px' }}
            >
              {loading ? 'Ingresando...' : (
                <>
                  <LogIn size={16} />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <a
              href="#"
              className="text-sm"
              style={{ color: 'var(--color-indigo)' }}
              onClick={(e) => { e.preventDefault(); }}
            >
              Olvidé mi contraseña
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          © 2026 ANDREA · Herramienta de apoyo a la selección laboral
        </p>
      </div>
    </div>
  );
}
