import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Home } from 'lucide-react';

function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Home size={48} color="#4f46e5" />
        </div>
        <h1>RealEstate CRM</h1>
        <p>Sign in to your account</p>

        {error && (
          <div style={{ 
            padding: '12px', 
            background: '#fee2e2', 
            color: '#b91c1c', 
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ paddingRight: '40px' }}
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                opacity: 0.8
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
              role="button"
            >
              {showPassword ? (
                // Eye-off SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.584 10.587A2.25 2.25 0 0112 9.75c1.243 0 2.25 1.007 2.25 2.25 0 .414-.112.803-.308 1.134m-1.358 1.358A2.25 2.25 0 0112 14.25c-1.243 0-2.25-1.007-2.25-2.25 0-.414.112-.803.308-1.134m1.358-1.358A2.25 2.25 0 0112 9.75m0 0c3.728 0 6.75 3 6.75 3s-.857 1.03-2.25 2.25m-9-2.25s.857-1.03 2.25-2.25m0 0c-.414.112-.803.308-1.134.308m1.134-.308c.414-.112.803-.308 1.134-.308m0 0c.414.112.803.308 1.134.308" />
                </svg>
              ) : (
                // Eye SVG
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="22" height="22">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12s3.022-4.5 9.75-4.5 9.75 4.5 9.75 4.5-3.022 4.5-9.75 4.5S2.25 12 2.25 12z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>Don't have an account?</span>
          <button
            type="button"
            style={{
              marginLeft: '8px',
              color: '#4f46e5',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              textDecoration: 'underline',
              padding: 0
            }}
            onClick={() => window.location.href = '/register'}
          >
            Register
          </button>
        </div>

        <p style={{ marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Demo: admin@crm.com / password123
        </p>
      </div>
    </div>
  );
}

export default Login;