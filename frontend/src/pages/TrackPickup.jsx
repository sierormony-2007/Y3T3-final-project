import { useState, useEffect } from 'react';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';
import { STEPS, STEP_ICONS } from '../data/data.js';

const STATUS_BADGE = {
  pending:   'badge badge-pending',
  accepted: 'badge badge-accepted',
  in_transit:  'badge badge-processing',
  completed: 'badge badge-recycled',
  cancelled: 'badge badge-cancelled',
};
const STATUS_LABEL = {
  pending:    'Pending',
  confirmed:  'Confirmed',
  in_transit:  'Picked Up',
  completed:   'Recycled',
  cancelled:   'Cancelled',
};
const STATUS_STEP = { pending: 1, confirmed: 2, in_transit: 3, completed: 5, cancelled: 1 };
function mapPickup(p){
  const categories = (p.RequestDevices || []).map(d => d.DeviceCategory?.name).filter(Boolean);
  return{
    id: p.request_id,
    status: p.status,
    ccategory: categories.length ? categories.join(', ') : 'E-Wast pickup',
    weight: Number(p.total_weight_kg) || 0,
    itemCount: Number(p.total_devices) || 0,
    date: p.preferred_date,
    timeSlot: p.time_window_start && p.time_window_end? `${String(p.time_window_start).slice(0, 5)} - ${String(p.time_window_end).slice(0, 5)}`: '', address: p.pickup_address,
    phone: p.phone, mapLink: p.link,
  };
}
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

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this pickup?')) return;
    try {
      await api.pickups.cancel(id);
      setPickups(prev => prev.map(p => p.id === id ? { ...p, status: 'cancelled' } : p));
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const currentUserId = currentUser.user_id;
    api.pickups.list()
      .then(data => {
        const all = Array.isArray(data) ? data : [];
        // Filter to only show the current user's pickups
        const myOnly = currentUserId
          ? all.filter(p => p.user_id === currentUserId)
          : all;
        const mapped = myOnly.map(mapPickup);
        setPickups(mapped);
        if (mapped.length > 0) setExpanded(mapped[0].id);
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
              <div className={`pickup-icon ${p.status === 'completed' ? 'green' : (p.status === 'confirmed' || p.status === 'in_transit') ? 'orange' : 'yellow'}`}>
                {p.status === 'completed' ? 'Done' : (p.status === 'confirmed' || p.status === 'in_transit') ? 'Active' : 'Wait'}
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
                  <div className="detail-value" style={{ fontSize:14 }}>{p.address}</div>
                </div>
                {(p.phone || p.mapLink) && (
                  <div className="detail-cell" style={{ border:'1px solid var(--border)', borderRadius:'var(--radius-md)', padding:14, marginBottom:12, display:'flex', gap:20, flexWrap:'wrap' }}>
                    {p.phone && (
                      <div>
                        <div className="detail-label">Contact Phone</div>
                        <div className="detail-value" style={{ fontSize:14 }}>{p.phone}</div>
                      </div>
                    )}
                    {p.mapLink && (
                      <div>
                        <div className="detail-label">Map Link</div>
                        <a href={p.mapLink} target="_blank" rel="noopener noreferrer" style={{ fontSize:14, color:'var(--green-bright)' }}>
                          View location ↗
                        </a>
                      </div>
                    )}
                  </div>
                )}
                {p.status !== 'pending' ? (
                  <div className="points-banner">
                      <strong>+{Math.round(p.weight * 40)} eco points earned</strong> · {p.weight} kg × 40 pts/kg
                  </div>
                ) : (
                  <>
                    <div className="points-banner" style={{ color:'var(--text-secondary)' }}>
                        Points will be awarded once staff accepts your request
                    </div>
                    <button 
                      className="btn-secondary" 
                      style={{ marginTop: 12, background: 'var(--badge-orange)', color: '#fff', border: 'none' }}
                      onClick={(e) => { e.stopPropagation(); handleCancel(p.id); }}
                    >
                      Cancel Pickup
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
