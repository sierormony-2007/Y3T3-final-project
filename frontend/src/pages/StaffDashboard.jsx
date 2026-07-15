import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';

const getFallbackImage = (name) => {
  const map = {
    'Strawberry Tote Bag': '/rewards/strawberry-tote-bag.jpg',
    'Rosca Insulated Bottle': '/rewards/rosca-water-bottle.jpg',
    'Bamboo Water Bottle': '/rewards/rosca-water-bottle.jpg',
    'Reusable Coffee Cup': '/rewards/coffee-cup.jpg',
    'Organic Cotton Tote Bag': '/rewards/strawberry-tote-bag.jpg',
    '$5 Brown Coffee Voucher': '/rewards/coffee-voucher.jpg',
    '1-Month Aeon Mall Parking': '/rewards/parking-voucher.jpg',
    'Recycled Notebook Set': '/rewards/Rifle Paper Co_ (@riflepaperco) • Instagram photos and videos.jpg',
    'Recycled Notebook': '/rewards/Rifle Paper Co_ (@riflepaperco) • Instagram photos and videos.jpg',
    'Plant-Based Cleaning Kit': '/rewards/coffee-cup.jpg',
    'Seed Bomb Set': '/rewards/strawberry-tote-bag.jpg',
    'Compostable Phone Case': '/rewards/parking-voucher.jpg',
    'Solar Phone Charger': '/rewards/coffee-voucher.jpg',
    'Beeswax Food Wraps (3-pack)': '/rewards/coffee-cup.jpg'
  };
  return map[name] || '/rewards/rosca-water-bottle.jpg';
};

const STATUS_LABELS = { pending:'Pending', confirmed:'Confirmed', in_transit:'Picked Up', completed:'Recycled ✓', cancelled:'Cancelled' };
const STATUS_CLASS  = { pending:'badge badge-pending', confirmed:'badge badge-processing', in_transit:'badge badge-processing', completed:'badge badge-recycled', cancelled:'badge badge-cancelled' };
const NEXT_STATUS   = { pending:'confirmed', confirmed:'in_transit', in_transit:'completed' };
const ACTION_LABEL  = { pending:'Accept', confirmed:'Mark Picked Up', in_transit:'Complete', completed:'Done', cancelled:'Cancelled' };

const EMPTY_REWARD_FORM = { name: '', description: '', points_cost: '', category: '', emoji: '', image_url: '', stock: '' };

export default function StaffDashboard() {
  const navigate  = useNavigate();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');

  // Current logged-in staff member — used to gate admin-only actions
  // (adding/deleting Rewards Store items) away from regular operators.
  const [me, setMe] = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
  const isAdmin = me.role === 'staff' && me.staff_role === 'admin';

  // ── Rewards Store management ──────────────────────────────────────────
  const [rewards, setRewards] = useState([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [rewardsError, setRewardsError] = useState('');
  const [rewardForm, setRewardForm] = useState(EMPTY_REWARD_FORM);
  const [editingId, setEditingId] = useState(null); // reward_id currently being edited, or null = add mode
  const [savingReward, setSavingReward] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  const loadRewards = () => api.rewards.list()
    .then(setRewards)
    .catch(err => setRewardsError(err.message))
    .finally(() => setRewardsLoading(false));

  useEffect(() => {
    api.auth.me()
      .then(m => { setMe(m); localStorage.setItem('currentUser', JSON.stringify(m)); })
      .catch(console.error);

    api.pickups.list()
      .then(setPickups)
      .catch(console.error)
      .finally(() => setLoading(false));

    api.auth.users()
      .then(setUsers)
      .catch(err => setUsersError(err.message))
      .finally(() => setUsersLoading(false));

    loadRewards();
  }, []);

  const handleRewardFormChange = (e) => {
    const { name, value } = e.target;
    setRewardForm(prev => ({ ...prev, [name]: value }));
  };

  const startEditReward = (reward) => {
    setEditingId(reward.reward_id);
    setRewardForm({
      name: reward.name || '',
      description: reward.description || '',
      points_cost: reward.points_cost ?? '',
      category: reward.category || '',
      emoji: reward.emoji || '🎁',
      image_url: reward.image_url || '',
      stock: reward.stock ?? '',
    });
  };

  const cancelRewardForm = () => {
    setEditingId(null);
    setRewardForm(EMPTY_REWARD_FORM);
    setRewardMsg('');
  };

  const handleSaveReward = async () => {
    if (!rewardForm.name || !rewardForm.points_cost) {
      setRewardMsg('Name and points cost are required');
      return;
    }
    setSavingReward(true);
    setRewardMsg('');
    const body = {
      name: rewardForm.name,
      description: rewardForm.description,
      points_cost: Number(rewardForm.points_cost),
      category: rewardForm.category,
      emoji: rewardForm.emoji,
      image_url: rewardForm.image_url,
      stock: Number(rewardForm.stock) || 0,
    };
    try {
      if (editingId) {
        await api.rewards.update(editingId, body);
        setRewardMsg('Reward updated');
      } else {
        await api.rewards.add(body);
        setRewardMsg('Reward added');
      }
      await loadRewards();
      cancelRewardForm();
    } catch (err) {
      setRewardMsg(`Error: ${err.message}`);
    } finally {
      setSavingReward(false);
    }
  };

  const handleDeleteReward = async (reward) => {
    if (!confirm(`Remove "${reward.name}" from the Rewards Store?`)) return;
    try {
      await api.rewards.remove(reward.reward_id);
      await loadRewards();
    } catch (err) {
      alert(err.message);
    }
  };

  const summary = useMemo(() => ({
    total:      pickups.length,
    pending:    pickups.filter(p => p.status === 'pending').length,
    confirmed:  pickups.filter(p => p.status === 'confirmed').length,
    in_transit: pickups.filter(p => p.status === 'in_transit').length,
    completed:  pickups.filter(p => p.status === 'completed').length,
  }), [pickups]);

  const handleNextStatus = async (pickup) => {
    const next = NEXT_STATUS[pickup.status];
    if (!next) return;
    setUpdating(pickup.request_id);
    try {
      const updated = await api.pickups.updateStatus(pickup.request_id, next);
      setPickups(prev => prev.map(p => p.request_id === pickup.request_id ? { ...p, ...updated } : p));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const orderedPickups = [...pickups].sort((a, b) => {
    const order = ['pending','confirmed','in_transit','completed','cancelled'];
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
              { value: summary.confirmed,  label: 'Confirmed' },
              { value: summary.in_transit, label: 'Picked Up' },
              { value: summary.completed,  label: 'Recycled' },
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
          <div className="section-title">Rewards Store Management</div>
        </div>

        <div className="card" style={{ marginBottom:16 }}>
          {(isAdmin || editingId) ? (
            <>
          <div style={{ fontWeight:600, marginBottom:12 }}>{editingId ? 'Edit Reward' : 'Add New Reward'}</div>

          {rewardMsg && (
            <div style={{ background: rewardMsg.startsWith('Reward') ? 'var(--green-glow)' : 'rgba(234,88,12,0.15)',
              border: `1px solid ${rewardMsg.startsWith('Reward') ? 'var(--green-primary)' : 'var(--badge-orange)'}`,
              borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 12,
              color: rewardMsg.startsWith('Reward') ? 'var(--green-bright)' : 'var(--badge-orange)', fontSize:13 }}>
              {rewardMsg}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" name="name" value={rewardForm.name} onChange={handleRewardFormChange} placeholder="Bamboo Water Bottle" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" name="category" value={rewardForm.category} onChange={handleRewardFormChange} placeholder="Lifestyle" />
            </div>
            <div className="form-group">
              <label className="form-label">Points Cost</label>
              <input className="form-input" type="number" name="points_cost" value={rewardForm.points_cost} onChange={handleRewardFormChange} placeholder="200" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock</label>
              <input className="form-input" type="number" name="stock" value={rewardForm.stock} onChange={handleRewardFormChange} placeholder="50" />
            </div>
            <div className="form-group">
              <label className="form-label">Emoji / Icon (optional)</label>
              <input className="form-input" name="emoji" value={rewardForm.emoji} onChange={handleRewardFormChange} placeholder="Leave blank to use image" />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL (optional)</label>
              <input className="form-input" name="image_url" value={rewardForm.image_url} onChange={handleRewardFormChange} placeholder="/rewards/my-item.jpg" />
            </div>
            <div className="form-group" style={{ gridColumn:'1 / -1' }}>
              <label className="form-label">Description</label>
              <input className="form-input" name="description" value={rewardForm.description} onChange={handleRewardFormChange} placeholder="Short description shown to users" />
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:14 }}>
            <button className="btn-submit" style={{ width:'auto', padding:'10px 20px' }} disabled={savingReward} onClick={handleSaveReward}>
              {savingReward ? 'Saving…' : editingId ? 'Save Changes' : 'Add Reward'}
            </button>
            {editingId && (
              <button className="action-btn" style={{ padding:'10px 20px' }} onClick={cancelRewardForm}>Cancel</button>
            )}
          </div>
            </>
          ) : (
            <div style={{ color:'var(--text-secondary)', fontSize:13 }}>
              Only admin staff can add new rewards. You can still edit existing items below.
            </div>
          )}
        </div>

        {rewardsLoading ? (
          <div className="card" style={{ textAlign:'center', color:'var(--text-secondary)', padding:24 }}>Loading rewards…</div>
        ) : rewardsError ? (
          <div className="card" style={{ textAlign:'center', color:'var(--badge-orange)', padding:24 }}>{rewardsError}</div>
        ) : rewards.length === 0 ? (
          <div className="card" style={{ textAlign:'center', color:'var(--text-secondary)', padding:24 }}>No rewards yet — add one above.</div>
        ) : (
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'var(--bg-panel)' }}>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}></th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Name</th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Category</th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Points</th>
                  <th style={{ textAlign:'left', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Stock</th>
                  <th style={{ textAlign:'right', padding:'12px 16px', fontSize:12, color:'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rewards.map(r => (
                  <tr key={r.reward_id} style={{ borderTop:'1px solid var(--border)' }}>
                    <td style={{ padding:'10px 16px' }}>
                      {(r.image_url && r.image_url !== 'null' && r.image_url.trim() !== '') || getFallbackImage(r.name)
                        ? <img src={(r.image_url && r.image_url !== 'null' && r.image_url.trim() !== '') ? r.image_url : getFallbackImage(r.name)} alt={r.name} style={{ width:36, height:36, borderRadius:6, objectFit:'cover' }} />
                        : <span style={{ fontSize:13, color:'var(--text-secondary)' }}>No image</span>}
                    </td>
                    <td style={{ padding:'10px 16px', fontSize:13 }}>{r.name}</td>
                    <td style={{ padding:'10px 16px', fontSize:13 }}>{r.category}</td>
                    <td style={{ padding:'10px 16px', fontSize:13 }}>{r.points_cost}</td>
                    <td style={{ padding:'10px 16px', fontSize:13 }}>{r.stock}</td>
                    <td style={{ padding:'10px 16px', textAlign:'right' }}>
                      <button className="action-btn" style={{ padding:'6px 12px', fontSize:12, marginRight:8 }} onClick={() => startEditReward(r)}>Edit</button>
                      {isAdmin && (
                        <button className="action-btn" style={{ padding:'6px 12px', fontSize:12, background:'var(--badge-orange)' }} onClick={() => handleDeleteReward(r)}>Delete</button>
                      )}
                    </td>
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
        ) : orderedPickups.map(pickup => {
          const deviceNames = (pickup.RequestDevices || []).map(d => d.DeviceCategory?.name).filter(Boolean);
          const categoryLabel = deviceNames.length ? deviceNames.join(', ') : 'E-waste pickup';
          const timeSlot = pickup.time_window_start && pickup.time_window_end
            ? `${String(pickup.time_window_start).slice(0,5)} - ${String(pickup.time_window_end).slice(0,5)}`
            : '';
          return (
          <div key={pickup.request_id} className="pickup-row" style={{ cursor:'default' }}>
            <div className={`pickup-icon ${pickup.status==='completed'?'green':pickup.status==='in_transit'?'orange':pickup.status==='confirmed'?'orange':'yellow'}`}>
              {pickup.status==='completed'?'OK':pickup.status==='in_transit'?'Transit':pickup.status==='confirmed'?'Set':'New'}
            </div>
            <div className="pickup-info" style={{ flex:1 }}>
              <div className="pickup-name">{pickup.User?.full_name || 'Unknown user'} · {categoryLabel}</div>
              <div className="pickup-meta">{Number(pickup.total_weight_kg) || 0} kg · {pickup.preferred_date || 'No date'}</div>
              <div className="pickup-meta" style={{ marginTop: 2 }}>{pickup.pickup_address}</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8, alignItems:'center' }}>
                <span className={STATUS_CLASS[pickup.status]||'badge'}>{STATUS_LABELS[pickup.status]}</span>
                <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{timeSlot || pickup.special_note || ''}</span>
              </div>
              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginTop:8, alignItems:'center' }}>
                {pickup.phone && (
                  <a href={`tel:${pickup.phone}`} style={{ fontSize:12, color:'var(--green-bright)', textDecoration:'none' }}>
                    {pickup.phone}
                  </a>
                )}
                {pickup.link && (
                  <a href={pickup.link} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:'var(--green-bright)', textDecoration:'none' }}>
                    View on map
                  </a>
                )}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
              {(isAdmin || pickup.status === 'pending') ? (
                <button className="action-btn"
                  style={{ padding:'10px 14px', fontSize:12, minWidth:120 }}
                  disabled={!NEXT_STATUS[pickup.status] || updating === pickup.request_id}
                  onClick={() => handleNextStatus(pickup)}>
                  {updating === pickup.request_id ? '…' : ACTION_LABEL[pickup.status]}
                </button>
              ) : (
                <span style={{ fontSize:11, color:'var(--text-secondary)' }}>Admin only</span>
              )}
              {pickup.status !== 'pending' && (
                <span style={{ fontSize:12, color:'var(--green-bright)' }}>
                  +{pickup.points_awarded || 0} pts awarded
                </span>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
