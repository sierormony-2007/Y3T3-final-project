import { useState, useEffect } from 'react';
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
  return map[name] || '/rewards/rosca-water-bottle.jpg'; // Always return a default image if not matched
};

const ALL_CATS = 'All';

export default function RewardsStore() {
  const [rewards, setRewards]     = useState([]);
  const [user, setUser]           = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
  const [activeCat, setActiveCat] = useState(ALL_CATS);
  const [loading, setLoading]     = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  const [msg, setMsg]             = useState('');
  const [selectedReward, setSelectedReward] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const openRedeemModal = (item) => {
    setSelectedReward(item);
    setQuantity(1);
  };

  const handleOpenHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const data = await api.rewards.history();
      setHistory(data);
    } catch (err) {
      setMsg(`Error loading history: ${err.message}`);
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRedeemConfirm = async () => {
    if (!selectedReward) return;
    const item = selectedReward;
    if (item.stock < quantity || (user.points || 0) < (item.points_cost * quantity)) return;
    setRedeemingId(item.reward_id);
    try {
      const { remaining_points } = await api.rewards.redeem(item.reward_id, quantity);
      const updatedUser = { ...user, points: remaining_points, total_points: remaining_points };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      await loadRewards(); // refresh stock counts
      setMsg(`Redeemed ${quantity}x: ${item.name}`);
      setTimeout(() => setMsg(''), 3000);
      setSelectedReward(null);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
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
        <div style={{ background: msg.startsWith('Redeemed') ? 'var(--green-glow)' : 'rgba(234,88,12,0.15)',
            border: `1px solid ${msg.startsWith('Redeemed') ? 'var(--green-primary)' : 'var(--badge-orange)'}`,
            borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16,
            color: msg.startsWith('Redeemed') ? 'var(--green-bright)' : 'var(--badge-orange)' }}>
            {msg}
          </div>
        )}

        <div className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>Available Eco Points</div>
              <div style={{ fontSize:30, fontWeight:700, color:'var(--green-bright)' }}>
                {loading ? '...' : (user.points || 0).toLocaleString()}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
            <button className="btn-secondary" style={{ marginTop: 0, padding: '8px 16px' }} onClick={handleOpenHistory}>View History</button>
            <span className="badge badge-gold">{(user.points || 0) >= 2000 ? 'Platinum' : (user.points || 0) >= 1000 ? 'Gold' : 'Member'}</span>
          </div>
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
                    {(item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '') || getFallbackImage(item.name)
                      ? <img src={(item.image_url && item.image_url !== 'null' && item.image_url.trim() !== '') ? item.image_url : getFallbackImage(item.name)} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'var(--bg-panel)' }}>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No image</span>
                        </div>}
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
                        onClick={() => openRedeemModal(item)}
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

        {selectedReward && (
          <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 400, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <div className="page-title" style={{ fontSize: 20, marginBottom: 16 }}>Redeem {selectedReward.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Points per item: {selectedReward.points_cost}</div>
              
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max={Math.min(selectedReward.stock, Math.floor((user.points || 0) / selectedReward.points_cost))}
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Math.min(Math.min(selectedReward.stock, Math.floor((user.points || 0) / selectedReward.points_cost)), Number(e.target.value))))} 
                  className="form-input"
                />
              </div>
              
              <div style={{ fontSize: 14, marginTop: 16 }}>
                Total Points: <span style={{ color: 'var(--green-bright)', fontWeight: 'bold' }}>{selectedReward.points_cost * quantity}</span>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button className="btn-secondary" style={{ marginTop: 0 }} onClick={() => setSelectedReward(null)}>Cancel</button>
                <button className="btn-submit" style={{ marginTop: 0 }} onClick={handleRedeemConfirm} disabled={redeemingId !== null}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1000 }}>
            <div className="card" style={{ width: 600, maxHeight: '80vh', padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="page-title" style={{ fontSize: 20, marginBottom: 0 }}>Redemption History</div>
                <button className="back-btn" onClick={() => setShowHistory(false)}>×</button>
              </div>
              
              <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8 }}>
                {loadingHistory ? (
                  <div style={{ textAlign:'center', color:'var(--text-secondary)', padding:32 }}>Loading history...</div>
                ) : history.length === 0 ? (
                  <div style={{ textAlign:'center', color:'var(--text-secondary)', padding:32 }}>No redemptions yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {history.map(tx => (
                      <div key={tx.transaction_id} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: 14 }}>{tx.description}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{new Date(tx.created_at).toLocaleString()}</div>
                        </div>
                        <div style={{ color: 'var(--badge-orange)', fontWeight: 'bold' }}>{tx.points} pts</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
