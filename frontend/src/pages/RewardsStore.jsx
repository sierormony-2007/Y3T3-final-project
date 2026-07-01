import { useState, useEffect } from 'react';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';

const ALL_CATS = 'All';

export default function RewardsStore() {
  const [rewards, setRewards]     = useState([]);
  const [user, setUser]           = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
  const [activeCat, setActiveCat] = useState(ALL_CATS);
  const [redeemed, setRedeemed]   = useState(new Set());
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState('');

  useEffect(() => {
    Promise.all([api.rewards.list(), api.auth.me(), api.rewards.history()])
      .then(([r, me, history]) => {
        setRewards(r);
        setUser(me);
        localStorage.setItem('currentUser', JSON.stringify(me));
        setRedeemed(new Set((Array.isArray(history) ? history : []).map(h => h.rewardId)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [ALL_CATS, ...new Set(rewards.map(r => r.cat))];
  const visible = activeCat === ALL_CATS ? rewards : rewards.filter(r => r.cat === activeCat);

  const handleRedeem = async (item) => {
    if (redeemed.has(item.id) || user.points < item.pts) return;
    try {
      const { user: updatedUser } = await api.rewards.redeem(item.id);
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setRedeemed(prev => new Set([...prev, item.id]));
      setMsg(` Redeemed: ${item.name}!`);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(` ${err.message}`);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="app-shell">
      <Header user={user} />
      <div className="main-content">
        <div className="page-title">Rewards Store</div>

        {msg && (
          <div style={{ background: msg.startsWith('') ? 'var(--green-glow)' : 'rgba(234,88,12,0.15)',
            border: `1px solid ${msg.startsWith('') ? 'var(--green-primary)' : 'var(--badge-orange)'}`,
            borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16,
            color: msg.startsWith('') ? 'var(--green-bright)' : 'var(--badge-orange)' }}>
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
          <span className="badge badge-gold"> {(user.points || 0) >= 2000 ? 'Platinum' : (user.points || 0) >= 1000 ? 'Gold' : 'Member'}</span>
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
        ) : (
          <div className="rewards-grid">
            {visible.map(item => {
              const isRedeemed = redeemed.has(item.id);
              const canAfford  = (user.points || 0) >= item.pts;
              return (
                <div className="reward-card" key={item.id}>
                  <div className="reward-img">{item.emoji}</div>
                  <div className="reward-body">
                    <div className="reward-cat">{item.cat}</div>
                    <div className="reward-name">{item.name}</div>
                    <div className="reward-desc">{item.desc}</div>
                    <div className="reward-footer">
                      <div className="reward-pts"> {item.pts} pts</div>
                      <button className="btn-redeem"
                        disabled={isRedeemed || !canAfford}
                        onClick={() => handleRedeem(item)}
                        style={!canAfford && !isRedeemed ? { background:'var(--badge-orange)' } : {}}>
                        {isRedeemed ? 'Redeemed ✓' : canAfford ? 'Redeem' : 'Not enough pts'}
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
