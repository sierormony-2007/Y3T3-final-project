import { useState, useEffect } from 'react';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';

const ALL_CATS = 'All';

export default function RewardsStore() {
  const [rewards, setRewards]     = useState([]);
  const [user, setUser]           = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
  const [activeCat, setActiveCat] = useState(ALL_CATS);
  const [loading, setLoading]     = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [msg, setMsg]             = useState('');

  const loadRewards = () => api.rewards.list().then(setRewards);

  useEffect(() => {
    Promise.all([loadRewards(), api.auth.me()])
      .then(([, me]) => {
        setUser(me);
        localStorage.setItem('currentUser', JSON.stringify(me));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [ALL_CATS, ...new Set(rewards.map(r => r.category).filter(Boolean))];
  const visible = activeCat === ALL_CATS ? rewards : rewards.filter(r => r.category === activeCat);

  const handleRedeem = async (item) => {
    if (item.stock <= 0 || (user.points || 0) < item.points_cost) return;
    setRedeemingId(item.reward_id);
    try {
      const { remaining_points } = await api.rewards.redeem(item.reward_id);
      const updatedUser = { ...user, points: remaining_points, total_points: remaining_points };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      await loadRewards(); // refresh stock counts
      setMsg(`✅ Redeemed: ${item.name}!`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(`⚠️ ${err.message}`);
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setRedeemingId(null);
    }
  };

  return (
    <div className="app-shell">
      <Header user={user} />
      <div className="main-content">
        <div className="page-title">Rewards Store</div>

        {msg && (
          <div style={{ background: msg.startsWith('✅') ? 'var(--green-glow)' : 'rgba(234,88,12,0.15)',
            border: `1px solid ${msg.startsWith('✅') ? 'var(--green-primary)' : 'var(--badge-orange)'}`,
            borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16,
            color: msg.startsWith('✅') ? 'var(--green-bright)' : 'var(--badge-orange)' }}>
            {msg}
          </div>
        )}

        <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28 }}>♻️</span>
            <div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>Available Eco Points</div>
              <div style={{ fontSize:30, fontWeight:700, color:'var(--green-bright)' }}>
                {loading ? '…' : (user.points || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <span className="badge badge-gold">{(user.points || 0) >= 2000 ? 'Platinum' : (user.points || 0) >= 1000 ? 'Gold' : 'Member'}</span>
        </div>

        <div className="pill-group">
          {categories.map(cat => (
            <button key={cat} className={`pill${activeCat === cat ? ' active' : ''}`} onClick={() => setActiveCat(cat)}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', color:'var(--text-secondary)', padding:32 }}>Loading rewards…</div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign:'center', color:'var(--text-secondary)', padding:32 }}>No rewards in this category yet.</div>
        ) : (
          <div className="rewards-grid">
            {visible.map(item => {
              const outOfStock = item.stock <= 0;
              const canAfford  = (user.points || 0) >= item.points_cost;
              const isRedeeming = redeemingId === item.reward_id;
              return (
                <div className="reward-card" key={item.reward_id}>
                  <div className="reward-img">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : (item.emoji || '🎁')}
                  </div>
                  <div className="reward-body">
                    <div className="reward-cat">{item.category}</div>
                    <div className="reward-name">{item.name}</div>
                    <div className="reward-desc">{item.description}</div>
                    <div className="reward-desc" style={{ marginTop: 4 }}>{item.stock} left in stock</div>
                    <div className="reward-footer">
                      <div className="reward-pts">{item.points_cost} pts</div>
                      <button className="btn-redeem"
                        disabled={outOfStock || !canAfford || isRedeeming}
                        onClick={() => handleRedeem(item)}
                        style={(!canAfford || outOfStock) ? { background:'var(--badge-orange)' } : {}}>
                        {isRedeeming ? '…' : outOfStock ? 'Out of stock' : canAfford ? 'Redeem' : 'Not enough pts'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
