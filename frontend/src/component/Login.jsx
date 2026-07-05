import { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
 const location = useLocation();

const [tab, setTab] = useState(
  location.state?.tab || 'login'
);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      let data;
      if (tab === 'login') {
        data = await api.auth.login({ email: form.email, password: form.password });
      } else {
        if (!form.name) { setError('Name is required'); setLoading(false); return; }
        data = await api.auth.register({ full_name: form.name, email: form.email, password: form.password });
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      navigate(data.user.role === 'staff' ? '/staff' : '/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-logo">
          <button className="back-btn" onClick={() => navigate('LandingScreen')} >← </button>
          <div className="logo-icon">♻️</div>
          EcoRecycle
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                border: tab === t ? '1px solid var(--green-primary)' : '1px solid var(--border)',
                background: tab === t ? 'var(--green-glow)' : 'var(--bg-panel)',
                color: tab === t ? 'var(--green-bright)' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
              }}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div className="login-title">{tab === 'login' ? 'Welcome back' : 'Create account'}</div>
        <div className="login-sub">{tab === 'login' ? 'Sign in to track your e-waste impact' : 'Join EcoRecycle and start making a difference'}</div>

        {error && (
          <div style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid var(--badge-orange)', borderRadius: 'var(--radius-md)', padding: '10px 14px', color: 'var(--badge-orange)', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {tab === 'register' && (
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" name="name" placeholder="Your name"
              value={form.name} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input className="form-input" type="email" name="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" name="password" placeholder="••••••••"
            value={form.password} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        </div>

        <button className="btn-submit" onClick={handleSubmit} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color: 'var(--green-bright)', cursor: 'pointer' }} onClick={() => setTab(tab === 'login' ? 'register' : 'login')}>
            {tab === 'login' ? 'Create one free' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
}
