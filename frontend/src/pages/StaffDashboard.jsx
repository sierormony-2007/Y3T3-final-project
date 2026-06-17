import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';

const STATUS_LABELS = { pending:'Pending', accepted:'Accepted', processing:'Processing', recycled:'Recycled ✓' };
const STATUS_CLASS  = { pending:'badge badge-pending', accepted:'badge badge-processing', processing:'badge badge-processing', recycled:'badge badge-recycled' };
const NEXT_STATUS   = { pending:'accepted', accepted:'processing', processing:'recycled' };
const ACTION_LABEL  = { pending:'Accept', accepted:'Process', processing:'Complete', recycled:'Done' };

export default function StaffDashboard() {
  const navigate  = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  useEffect(() => {
    api.pickups.list()
      .then(setPickups)
      .catch(console.error)
      .finally(() => setLoading(false));

    api.auth.users()
      .then(setUsers)
      .catch(err => setUsersError(err.message))
      .finally(() => setUsersLoading(false));
  }, []);

  const summary = useMemo(() => ({
    total:      pickups.length,
    pending:    pickups.filter(p => p.status === 'pending').length,
    accepted:   pickups.filter(p => p.status === 'accepted').length,
    processing: pickups.filter(p => p.status === 'processing').length,
    recycled:   pickups.filter(p => p.status === 'recycled').length,
  }), [pickups]);

  const handleNextStatus = async (pickup) => {
    const next = NEXT_STATUS[pickup.status];
    if (!next) return;
    setUpdating(pickup.id);
    try {
      const updated = await api.pickups.updateStatus(pickup.id, next);
      setPickups(prev => prev.map(p => p.id === pickup.id ? updated : p));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const orderedPickups = [...pickups].sort((a, b) => {
    const order = ['pending','accepted','processing','recycled'];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  return (
    <div className="app-shell">
      <Header />
      <div className="main-content">
        <div className="page-title">Staff Dashboard</div>

        <div className="card-lg">
          <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:26, fontWeight:700 }}>Operations Center</div>
              <div style={{ color:'var(--text-secondary)', marginTop:6 }}>
                Manage pickup requests, update statuses, and confirm completed recycling jobs.
              </div>
            </div>
            <button className="btn-request" onClick={() => navigate('/dashboard')}>View User Dashboard</button>
          </div>

          <div className="stat-grid" style={{ marginTop:24 }}>
            {[
              { value: summary.total,      label: 'Total Jobs' },
              { value: summary.pending,    label: 'Pending' },
              { value: summary.accepted,   label: 'Accepted' },
              { value: summary.processing, label: 'Processing' },
              { value: summary.recycled,   label: 'Recycled' },
            ].map(s => (
              <div className="stat-cell" key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-header" style={{ marginTop:24 }}>
          <div className="section-title">Registered Users ({users.length})</div>
        </div>

        {usersLoading ? (
          <div className="card" style={{ textAlign:'center', color:'var(--text-secondary)', padding:24 }}>Loading…</div>
        ) : usersError ? (
          <div className="card" style={{ textAlign:'center', color:'var(--badge-orange)', padding:24 }}>{usersError}</div>
        ) : users.length === 0 ? (
          <div className="card" style={{ textAlign:'center', color:'var(--text-secondary)', padding:24 }}>No users registered yet.</div>
        ) : (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg-panel)' }}>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>ID</th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Name</th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Email</th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Role</th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderTop:'1px solid var(--border)' }}>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{u.id}</td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{u.name}</td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{u.email}</td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>
                      <span className={u.role === 'staff' ? 'badge badge-processing' : 'badge'}>{u.role}</span>
                    </td>
                    <td style={{ padding:'12px 16px', fontSize:13 }}>{u.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="section-header" style={{ marginTop:24 }}>
          <div className="section-title">Pickup Queue</div>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign:'center', color:'var(--text-secondary)', padding:24 }}>Loading…</div>
        ) : orderedPickups.length === 0 ? (
          <div className="card" style={{ textAlign:'center', color:'var(--text-secondary)', padding:24 }}>No pickup requests available.</div>
        ) : orderedPickups.map(pickup => (
          <div key={pickup.id} className="pickup-row" style={{ cursor:'default' }}>
            <div className={`pickup-icon ${pickup.status==='recycled'?'green':pickup.status==='processing'?'orange':'yellow'}`}>
              {pickup.status==='recycled'?'✅':pickup.status==='processing'?'🛠':'🚚'}
            </div>
            <div className="pickup-info" style={{ flex:1 }}>
              <div className="pickup-name">{pickup.userName} · {pickup.category}</div>
              <div className="pickup-meta">{pickup.weight} kg · {pickup.date || 'No date'}</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8, alignItems:'center' }}>
                <span className={STATUS_CLASS[pickup.status]||'badge'}>{STATUS_LABELS[pickup.status]}</span>
                <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{pickup.timeSlot || pickup.notes || ''}</span>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
              <button className="action-btn"
                style={{ padding:'10px 14px', fontSize:12, minWidth:120 }}
                disabled={!NEXT_STATUS[pickup.status] || updating === pickup.id}
                onClick={() => handleNextStatus(pickup)}>
                {updating === pickup.id ? '…' : ACTION_LABEL[pickup.status]}
              </button>
              {pickup.status !== 'pending' && (
                <span style={{ fontSize:12, color:'var(--green-bright)' }}>
                  +{Math.round((pickup.weight||0)*40)} pts awarded
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
