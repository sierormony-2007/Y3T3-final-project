import { useState, useEffect } from 'react';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';
import { ACHIEVEMENTS } from '../data/data.js';

function StatCard({ icon, value, label, sub, pct, goal }) {
  return (
    <div className="impact-card">
      <div className="impact-icon">{icon}</div>
      <div className="impact-value">{value}</div>
      <div className="impact-label">{label}</div>
      <div className="impact-sub">{sub}</div>
      <div className="progress-bar-wrap" style={{ marginTop:14 }}>
        <div className="progress-bar-fill" style={{ width:`${Math.min(pct, 100)}%` }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-secondary)', marginTop:6 }}>
        <span>0</span><span>Goal: {goal}</span>
      </div>
    </div>
  );
}

export default function MyImpact() {
  const [impact, setImpact] = useState(null);
  const [user, setUser]     = useState(JSON.parse(localStorage.getItem('currentUser')) || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.impact.mine(), api.auth.me()])
      .then(([imp, me]) => { setImpact(imp); setUser(me); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const points = user.points || 0;
  const totalWeight = Number(impact?.total_weight_kg) || 0;
  const totalCO2 = Number(impact?.co2_saved_kg) || 0;
  // Rough estimate: ~2 kWh of embodied energy recovered per kg of e-waste diverted
  const totalEnergy = Math.round(totalWeight * 2 * 10) / 10;
  const totalPickups = impact?.total_pickups || 0;

  const userAchievements = ACHIEVEMENTS.map(a => ({
    ...a,
    locked: a.name === 'Platinum' ? points < 2000
          : a.name === 'Gold Member' ? points < 1000
          : a.name === '50 kg Club' ? totalWeight < 50
          : false,
  }));

  return (
    <div className="app-shell">
      <Header user={user} />
      <div className="main-content">
        <div className="page-title">My Impact</div>

        {loading ? (
          <div style={{ textAlign:'center', color:'var(--text-secondary)', padding:32 }}>Loading impact data…</div>
        ) : (
          <>
            <div className="impact-grid">
              <StatCard icon="♻️" value={`${totalWeight} kg`} label="Total E-Waste Recycled"
                sub={`Across ${totalPickups} pickups`} pct={(totalWeight / 50) * 100} goal="50 kg" />
              <StatCard icon=" " value={`${totalCO2} kg`} label="CO₂ Emissions Saved"
                sub={`≈ ${Math.round(totalCO2 / 0.241)} km not driven`} pct={(totalCO2 / 140) * 100} goal="140 kg" />
              <StatCard icon=" " value={`${totalEnergy} kWh`} label="Energy Conserved"
                sub={`Powers a home for ~${Math.round(totalEnergy / 11)} days`} pct={(totalEnergy / 300) * 100} goal="300 kWh" />
              <StatCard icon=" " value={points.toLocaleString()} label="Eco Points Earned"
                sub={`${points >= 2000 ? 'Platinum Member' : points >= 1000 ? 'Gold Member' : 'Working toward Gold'}`}
                pct={(points / 2000) * 100} goal="2,000 pts" />
            </div>

            <div className="section-header"><div className="section-title">Recycling Summary</div></div>
            <div className="card" style={{ marginBottom:24, display:'flex', gap:32, flexWrap:'wrap' }}>
              <div>
                <div style={{ fontSize:22, fontWeight:700, color:'var(--green-bright)' }}>{impact?.total_devices || 0}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Devices recycled</div>
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:700, color:'var(--green-bright)' }}>{totalPickups}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Completed pickups</div>
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:700, color:'var(--green-bright)' }}>{Number(impact?.toxins_diverted_kg || 0).toFixed(2)} kg</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)' }}>Toxins diverted</div>
              </div>
            </div>

            <div className="section-header"><div className="section-title">Achievements</div></div>
            <div className="achievement-grid">
              {userAchievements.map(a => (
                <div className={`achievement-card${a.locked ? ' locked' : ''}`} key={a.name}>
                  <div className="achievement-icon">{a.icon}</div>
                  <div className="achievement-name">{a.name}</div>
                  <div className="achievement-sub">{a.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
