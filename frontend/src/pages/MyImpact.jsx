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
  const totalWeight = impact?.totalWeight || 0;
  const totalCO2 = impact?.totalCO2Saved || 0;
  const totalEnergy = impact?.totalEnergySaved || 0;

  const byCategory = impact?.byCategory || {};
  const deviceList = Object.entries(byCategory).map(([name, kg]) => ({
    name, kg: Math.round(kg * 10) / 10,
    pct: totalWeight > 0 ? Math.round((kg / totalWeight) * 100) : 0,
    icon: name.includes('Laptop') ? '💻' : name.includes('Phone') || name.includes('Smart') ? '📱' : name.includes('Print') ? '🖨' : name.includes('TV') ? '📺' : '🔌',
  }));

  const monthlyData = impact?.monthlyActivity || {};
  const monthlyEntries = Object.entries(monthlyData).sort();
  const maxMonthly = Math.max(...Object.values(monthlyData), 1);

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
                sub={`Across ${impact?.totalPickups || 0} pickups`} pct={(totalWeight / 50) * 100} goal="50 kg" />
              <StatCard icon="🌿" value={`${totalCO2} kg`} label="CO₂ Emissions Saved"
                sub={`≈ ${Math.round(totalCO2 / 0.241)} km not driven`} pct={(totalCO2 / 140) * 100} goal="140 kg" />
              <StatCard icon="⚡" value={`${totalEnergy} kWh`} label="Energy Conserved"
                sub={`Powers a home for ~${Math.round(totalEnergy / 11)} days`} pct={(totalEnergy / 300) * 100} goal="300 kWh" />
              <StatCard icon="🏆" value={points.toLocaleString()} label="Eco Points Earned"
                sub={`${points >= 2000 ? 'Platinum Member' : points >= 1000 ? 'Gold Member' : 'Working toward Gold'}`}
                pct={(points / 2000) * 100} goal="2,000 pts" />
            </div>

            {deviceList.length > 0 && (
              <>
                <div className="section-header"><div className="section-title">Breakdown by Device Type</div></div>
                <div className="card" style={{ marginBottom:24 }}>
                  {deviceList.map(d => (
                    <div key={d.name} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                        <span>{d.icon} {d.name}</span>
                        <span style={{ color:'var(--green-bright)', fontWeight:600 }}>{d.kg} kg</span>
                      </div>
                      <div className="progress-bar-wrap">
                        <div className="progress-bar-fill" style={{ width:`${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {monthlyEntries.length > 0 && (
              <>
                <div className="section-header"><div className="section-title">Monthly Activity</div></div>
                <div className="card" style={{ marginBottom:24 }}>
                  <div className="bar-chart">
                    {monthlyEntries.map(([month, kg]) => (
                      <div className="bar-col" key={month}>
                        <div className="bar-fill highlight" style={{ height:`${(kg / maxMonthly) * 100}%` }} />
                        <div className="bar-label">{month.slice(5)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

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
