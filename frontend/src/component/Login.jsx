import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USERS } from "../data/data";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = async () => {
    const users =
      JSON.parse(localStorage.getItem("users")) || USERS;

    const user = users.find(
      (u) =>
        u.email === form.email &&
        u.password === form.password
    );

    if (!user) {
      setError("Invalid email or password");
      return;
    }

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );

    if (user.role === "staff") {
      navigate("/staff");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">♻️</div>
          EcoRecycle
        </div>

        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to track your e-waste impact</div>

        {error && (
          <div style={{
            background: 'rgba(234,88,12,0.15)',
            border: '1px solid var(--badge-orange)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: 'var(--badge-orange)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email address</label>
          <input
            className="form-input"
            type="email"
            name="email"
            placeholder="alice@example.com"
            value={form.email}
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            className="form-input"
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'20px' }}>
          <span style={{ fontSize:'12px', color:'var(--green-bright)', cursor:'pointer' }}>
            Forgot password?
          </span>
        </div>

        <button
          className="btn-submit"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 0 }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div style={{ textAlign:'center', fontSize:'12px', color:'var(--text-secondary)', marginTop:'20px' }}>
          Don't have an account?{' '}
          <span style={{ color:'var(--green-bright)', cursor:'pointer' }}>Create one free</span>
        </div>

        {/* Social login */}
        <div style={{
          marginTop:'28px',
          paddingTop:'20px',
          borderTop:'1px solid var(--border)',
          textAlign:'center',
        }}>
          <div style={{ fontSize:'11px', color:'var(--text-secondary)', marginBottom:'14px' }}>
            Or continue with
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            {['🔵 Google', '⚫ Apple'].map(label => (
              <button
                key={label}
                style={{
                  flex: 1,
                  background: 'var(--bg-panel)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
