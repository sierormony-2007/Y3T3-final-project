import { useState, useEffect } from 'react';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';
import { STEPS, STEP_ICONS } from '../data/data.js';

const STATUS_BADGE = {
  recycled:   'badge badge-recycled',
  processing: 'badge badge-processing',
  accepted:   'badge badge-processing',
  pending:    'badge badge-pending',
};
const STATUS_LABEL = {
  recycled:   'Recycled ✓',
  processing: 'Processing',
  accepted:   'Accepted',
  pending:    'Pending',
};
const STATUS_STEP = { pending: 1, accepted: 2, processing: 3, recycled: 5 };

function Stepper({ stepDone }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => {
        const done   = i < stepDone;
        const active = i === stepDone - 1;
        return (
          <div className={`step${done ? ' done' : active ? ' active' : ''}`} key={label}>
            {i > 0 && <div className={`step-line${done || active ? ' done' : ''}`} />}
            <div className="step-circle">{STEP_ICONS[i]}</div>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPickups() {
  const [pickups, setPickups] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.pickups.list()
      .then(data => {
        setPickups(data);
        if (data.length > 0) setExpanded(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="app-shell"><Header />
      <div className="main-content" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:'var(--text-secondary)' }}>Loading pickups…</div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Header />
      <div className="main-content">
        <div className="page-title">Track Pickups</div>

        {pickups.length === 0 ? (
          <div className="card" style={{ textAlign:'center', color:'var(--text-secondary)', padding:32 }}>
            No pickups yet. Schedule one to get started!
          </div>
        ) : pickups.map(p => (
          <div className="card" key={p.id} style={{ marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, cursor:'pointer' }}
              onClick={() => setExpanded(prev => prev === p.id ? null : p.id)}>
              <div className={`pickup-icon ${p.status === 'recycled' ? 'green' : p.status === 'processing' ? 'orange' : 'yellow'}`}>
                {p.status === 'recycled' ? '✅' : p.status === 'processing' ? '⚙️' : '⏱'}
              </div>
              <div className="pickup-info">
                <div className="pickup-name">
                  {p.category}
                  <span className={STATUS_BADGE[p.status] || 'badge'} style={{ marginLeft:8 }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div className="pickup-meta">#{p.id} · {p.weight} kg · {p.itemCount} item{p.itemCount > 1 ? 's' : ''}</div>
              </div>
              <div className="pickup-right">
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.date}</div>
                  <div style={{ fontSize:11, color:'var(--text-dim)' }}>{p.timeSlot}</div>
                </div>
                <span style={{ color:'var(--text-secondary)', fontSize:18 }}>{expanded === p.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === p.id && (
              <>
                <Stepper stepDone={STATUS_STEP[p.status] || 1} />
                <div className="detail-grid">
                  <div className="detail-cell"><div className="detail-label">Pickup Date</div><div className="detail-value">{p.date}</div></div>
                  <div className="detail-cell"><div className="detail-label">Time Slot</div><div className="detail-value">{p.timeSlot}</div></div>
                  <div className="detail-cell"><div className="detail-label">Weight</div><div className="detail-value">{p.weight} kg</div></div>
                  <div className="detail-cell"><div className="detail-label">Quantity</div><div className="detail-value">{p.itemCount} item{p.itemCount > 1 ? 's' : ''}</div></div>
                </div>
                <div className="detail-cell" style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:14, marginBottom:12 }}>
                  <div className="detail-label">Address</div>
                  <div className="detail-value" style={{ fontSize:14 }}>{p.street}, {p.city} {p.postal}</div>
                </div>
                {p.status !== 'pending' ? (
                  <div className="points-banner">
                    ✅ <strong>+{Math.round(p.weight * 40)} eco points earned</strong> · {p.weight} kg × 40 pts/kg
                  </div>
                ) : (
                  <div className="points-banner" style={{ color:'var(--text-secondary)' }}>
                    📦 Points will be awarded once staff accepts your request
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
