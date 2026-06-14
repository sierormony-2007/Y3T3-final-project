import { useState } from 'react';
import Header from '../component/Header.jsx'
import { PICKUPS, STEPS, STEP_ICONS, STATUS_BADGE, STATUS_LABEL } from '../data/data.js';

function Stepper({ stepDone }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => {
        const done   = i < stepDone;
        const active = i === stepDone - 1 || (stepDone === 0 && i === 0);
        const cls    = done ? 'step done' : active ? 'step active' : 'step';
        return (
          <div className={cls} key={label}>
            {i > 0 && <div className={`step-line${done || active ? ' done' : ''}`} />}
            <div className="step-circle">{STEP_ICONS[i]}</div>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function PointsBanner({ pickup }) {
  if (pickup.pts)
    return (
      <div className="points-banner">
        ✅ <strong>+{pickup.pts} eco points earned</strong> · {pickup.weight} kg × 40 pts/kg
      </div>
    );
  if (pickup.status === 'processing')
    return (
      <div className="points-banner" style={{ color: 'var(--badge-gold)' }}>
        ⏳ Awaiting recycling completion to earn points
      </div>
    );
  return (
    <div className="points-banner" style={{ color: 'var(--text-secondary)' }}>
      📦 Pickup not yet collected — points awarded after recycling
    </div>
  );
}

export default function TrackPickups() {
  const [expanded, setExpanded] = useState('PU-1001');

  const toggle = id => setExpanded(prev => (prev === id ? null : id));

  return (
    <div className="app-shell">
      <Header />

      <div className="main-content">
        <div className="page-title">Track Pickups</div>

        {PICKUPS.map(p => (
          <div className="card" key={p.id} style={{ marginBottom: 10 }}>
            {/* Row header */}
            <div
              style={{ display:'flex', alignItems:'center', gap:14, cursor:'pointer' }}
              onClick={() => toggle(p.id)}
            >
              <div className={`pickup-icon ${p.iconClass}`}>{p.icon}</div>
              <div className="pickup-info">
                <div className="pickup-name">
                  {p.name}
                  <span className={STATUS_BADGE[p.status]} style={{ marginLeft: 8 }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div className="pickup-meta">
                  {p.id} · {p.weight} kg · {p.items} item{p.items > 1 ? 's' : ''}
                </div>
              </div>
              <div className="pickup-right">
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.date}</div>
                  <div style={{ fontSize:11, color:'var(--text-dim)' }}>{p.time}</div>
                </div>
                <span style={{ color:'var(--text-secondary)', fontSize:18 }}>
                  {expanded === p.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {/* Expandable detail */}
            {expanded === p.id && (
              <>
                <Stepper stepDone={p.stepDone} />

                <div className="detail-grid">
                  <div className="detail-cell">
                    <div className="detail-label">Pickup Date</div>
                    <div className="detail-value">{p.date}</div>
                  </div>
                  <div className="detail-cell">
                    <div className="detail-label">Time Slot</div>
                    <div className="detail-value">{p.time}</div>
                  </div>
                  <div className="detail-cell">
                    <div className="detail-label">Weight</div>
                    <div className="detail-value">{p.weight} kg</div>
                  </div>
                  <div className="detail-cell">
                    <div className="detail-label">Quantity</div>
                    <div className="detail-value">{p.items} item{p.items > 1 ? 's' : ''}</div>
                  </div>
                </div>

                <div className="detail-cell" style={{
                  border:'1px solid var(--border)',
                  borderRadius:'var(--radius-md)',
                  padding:14,
                  marginBottom:12,
                }}>
                  <div className="detail-label">Address</div>
                  <div className="detail-value" style={{ fontSize:14 }}>{p.address}</div>
                </div>

                <PointsBanner pickup={p} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
