import { useNavigate } from 'react-router-dom'
import Header from '../component/Header.jsx'
import { ACTIVE_PICKUPS,RECENT_ACTIVITY, USERS } from "../data/data";

const currentUser =
  JSON.parse(localStorage.getItem("currentUser"));

const users =
  JSON.parse(localStorage.getItem("users")) || [];

const user = users.find(
  (u) => u.id === currentUser?.id
);

function statusBadge(status) {
  const map = {
    processing: 'badge badge-processing',
    pending:    'badge badge-pending',
    recycled:   'badge badge-recycled',
  };
  return <span className={map[status] ?? 'badge'}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <Header />

      <div className="main-content">
        <div className="page-title">Dashboard</div>

        {/* Welcome card */}
        <div className="card-lg">
          <div className="welcome-banner">
            <h1>
            Welcome {currentUser?.name}
          </h1>

          <h3>
            Points: {user?.points || 0}
          </h3>
            <button className="btn-request" style={{ width: 'auto', padding: '12px 20px', fontSize: 14 }}
              onClick={() => navigate('/schedule')}>
              + Request Pickup
            </button>
          </div>

          <div className="stat-grid">
            {[
              { icon: '♻️', value: '1,240',  label: 'Eco Points' },
              { icon: '♻',  value: '26.9 kg', label: 'Total Recycled' },
              { icon: '🌿', value: '75.3 kg', label: 'CO₂ Saved' },
            ].map(s => (
              <div className="stat-cell" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => navigate('/schedule')}>
            <span className="action-icon">+</span>New Pickup
          </button>
          <button className="action-btn" onClick={() => navigate('/track')}>
            <span className="action-icon">🚛</span>Track Status
          </button>
          <button className="action-btn" onClick={() => navigate('/rewards')}>
            <span className="action-icon">🛍</span>Rewards Store
          </button>
          <button className="action-btn" onClick={() => navigate('/impact')}>
            <span className="action-icon">📈</span>My Impact
          </button>
        </div>

        {/* Active pickups */}
        <div className="section-header">
          <div className="section-title">Active Pickups</div>
          <span className="view-all" onClick={() => navigate('/track')}>View all</span>
        </div>

        {ACTIVE_PICKUPS.map(p => (
          <div key={p.id} className="pickup-row" onClick={() => navigate('/track')}>
            <div className={`pickup-icon ${p.iconClass}`}>{p.icon}</div>
            <div className="pickup-info">
              <div className="pickup-name">{p.name}</div>
              <div className="pickup-meta">{p.weight} kg · {p.date}</div>
            </div>
            <div className="pickup-right">{statusBadge(p.status)}</div>
          </div>
        ))}

        {/* Recent activity */}
        <div className="section-header" style={{ marginTop: 28 }}>
          <div className="section-title">Recent Activity</div>
        </div>

        <div className="card">
          {RECENT_ACTIVITY.map((a, i) => (
            <div className="activity-item" key={i}>
              <div className={`activity-dot ${a.color}`} />
              <div className="activity-text">{a.text}</div>
              <div className="activity-date">{a.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
