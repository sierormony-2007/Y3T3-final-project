import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';

function statusBadge(status) {
  const map = {
    processing: 'badge badge-processing',
    pending:    'badge badge-pending',
    recycled:   'badge badge-recycled',
    accepted:   'badge badge-processing',
  };
  return <span className={map[status] ?? 'badge'}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
  const [pickups, setPickups] = useState([]);
  const [impact, setImpact]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [me, myPickups, myImpact] = await Promise.all([
          api.auth.me(),
          api.pickups.list(),
          api.impact.mine(),
        ]);
        setUser(me);
        localStorage.setItem('currentUser', JSON.stringify(me));
        setPickups(Array.isArray(myPickups) ? myPickups : myPickups.pickups || []);
        setImpact(myImpact);
      } catch (err) {
        console.error(err);
        if (err.message.includes('token') || err.message.includes('Unauthorized')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activePickups = pickups.filter(p => p.status !== 'recycled').slice(0, 3);
  const recentActivity = [...pickups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  if (loading) return (
    <div className="app-shell">
      <Header user={user} />
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading…</div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Header user={user} />
      <div className="main-content">
        <div className="page-title">Dashboard</div>

        <div className="card-lg">
          <div className="welcome-banner">
            <div>
              <h1>Welcome, {user.name}</h1>
              <h3 style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: 14 }}>
                {user.role === 'staff' ? '🛠 Staff Account' : '♻ Eco Member'}
              </h3>
            </div>
            <button className="btn-request" style={{ width: 'auto', padding: '12px 20px', fontSize: 14 }}
              onClick={() => navigate('/schedule')}>
              + Request Pickup
            </button>
          </div>

          <div className="stat-grid">
            <div className="stat-cell">
              <div className="stat-icon"> </div>
              <div className="stat-value">{(user.points || 0).toLocaleString()}</div>
              <div className="stat-label">Eco Points</div>
            </div>
            <div className="stat-cell">
              <div className="stat-icon"> </div>
              <div className="stat-value">{impact ? `${impact.totalWeight} kg` : '0 kg'}</div>
              <div className="stat-label">Total Recycled</div>
            </div>
            <div className="stat-cell">
              <div className="stat-icon"> </div>
              <div className="stat-value">{impact ? `${impact.totalCO2Saved} kg` : '0 kg'}</div>
              <div className="stat-label">CO₂ Saved</div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => navigate('/schedule')}>
            <span className="action-icon">+</span>New Pickup
          </button>
          <button className="action-btn" onClick={() => navigate('/track')}>
            <span className="action-icon"> </span>Track Status
          </button>
          <button className="action-btn" onClick={() => navigate('/rewards')}>
            <span className="action-icon"> </span>Rewards Store
          </button>
          <button className="action-btn" onClick={() => navigate('/impact')}>
            <span className="action-icon"> </span>My Impact
          </button>
        </div>

        <div className="section-header">
          <div className="section-title">Active Pickups</div>
          <span className="view-all" onClick={() => navigate('/track')}>View all</span>
        </div>

        {activePickups.length === 0 ? (
          <div className="card" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>
            No active pickups — <span style={{ color: 'var(--green-bright)', cursor: 'pointer' }} onClick={() => navigate('/schedule')}>schedule one now</span>
          </div>
        ) : activePickups.map(p => (
          <div key={p.id} className="pickup-row" onClick={() => navigate('/track')}>
            <div className={`pickup-icon ${p.status === 'processing' ? 'orange' : 'yellow'}`}>
              {p.status === 'processing' ? ' ' : ' '}
            </div>
            <div className="pickup-info">
              <div className="pickup-name">{p.category}</div>
              <div className="pickup-meta">{p.weight} kg · {p.date}</div>
            </div>
            <div className="pickup-right">{statusBadge(p.status)}</div>
          </div>
        ))}

        <div className="section-header" style={{ marginTop: 28 }}>
          <div className="section-title">Recent Activity</div>
        </div>

        <div className="card">
          {recentActivity.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 16 }}>No activity yet</div>
          ) : recentActivity.map((p, i) => (
            <div className="activity-item" key={i}>
              <div className={`activity-dot ${p.status === 'recycled' ? 'dot-green' : 'dot-orange'}`} />
              <div className="activity-text">{p.category} · {p.weight} kg{p.status === 'recycled' ? ' — Recycled ✓' : ''}</div>
              <div className="activity-date">{new Date(p.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
