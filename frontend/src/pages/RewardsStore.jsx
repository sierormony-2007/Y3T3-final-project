import { useState } from 'react';
import Header from '../component/Header.jsx'
import { REWARD_CATEGORIES as CATEGORIES, REWARD_ITEMS as ITEMS } from '../data/data.js';

export default function RewardsStore() {
  const [activeCat, setActiveCat] = useState('All');
  const [points, setPoints]       = useState(1240);
  const [redeemed, setRedeemed]   = useState(new Set());

  const visible = activeCat === 'All' ? ITEMS : ITEMS.filter(i => i.cat === activeCat);

  const handleRedeem = (item) => {
    if (redeemed.has(item.id) || points < item.pts) return;
    setPoints(prev => prev - item.pts);
    setRedeemed(prev => new Set([...prev, item.id]));
  };

  return (
    <div className="app-shell">
      <Header user={{ name: 'Alice Chen', pts: points }} />

      <div className="main-content">
        <div className="page-title">Rewards Store</div>

        {/* Points banner */}
        <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <span style={{ fontSize:28 }}>♻️</span>
            <div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>Available Eco Points</div>
              <div style={{ fontSize:30, fontWeight:700, color:'var(--green-bright)' }}>
                {points.toLocaleString()}
              </div>
            </div>
          </div>
          <span className="badge badge-gold">⭐ Gold Member</span>
        </div>

        {/* Category pills */}
        <div className="pill-group">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`pill${activeCat === cat ? ' active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="rewards-grid">
          {visible.map(item => {
            const isRedeemed = redeemed.has(item.id);
            const canAfford  = points >= item.pts;
            return (
              <div className="reward-card" key={item.id}>
                <div className="reward-img">{item.emoji}</div>
                <div className="reward-body">
                  <div className="reward-cat">{item.cat}</div>
                  <div className="reward-name">{item.name}</div>
                  <div className="reward-desc">{item.desc}</div>
                  <div className="reward-footer">
                    <div className="reward-pts">♻ {item.pts} pts</div>
                    <button
                      className="btn-redeem"
                      disabled={isRedeemed || !canAfford}
                      onClick={() => handleRedeem(item)}
                      style={!canAfford && !isRedeemed ? { background:'var(--badge-orange)' } : {}}
                    >
                      {isRedeemed ? 'Redeemed ✓' : canAfford ? 'Redeem' : 'Not enough pts'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
