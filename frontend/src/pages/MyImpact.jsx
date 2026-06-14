import Header from '../component/Header.jsx'
import { DEVICES, MONTHLY, ACHIEVEMENTS } from '../data/data.js';

function StatCard({ icon, value, label, sub, pct, goal }) {
  return (
    <div className="impact-card">
      <div className="impact-icon">{icon}</div>
      <div className="impact-value">{value}</div>
      <div className="impact-label">{label}</div>
      <div className="impact-sub">{sub}</div>
      <div className="progress-bar-wrap" style={{ marginTop:14 }}>
        <div className="progress-bar-fill" style={{ width:`${pct}%` }} />
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-secondary)', marginTop:6 }}>
        <span>0</span><span>Goal: {goal}</span>
      </div>
    </div>
  );
}

export default function MyImpact() {
  return (
    <div className="app-shell">
      <Header />

      <div className="main-content">
        <div className="page-title">My Impact</div>

        {/* Key stats */}
        <div className="impact-grid">
          <StatCard icon="♻️" value="26.9 kg" label="Total E-Waste Recycled"   sub="Across 3 pickups this year"        pct={54}  goal="50 kg"    />
          <StatCard icon="🌿" value="75.3 kg" label="CO₂ Emissions Saved"      sub="Equivalent to 312 km not driven"   pct={75}  goal="100 kg"  />
          <StatCard icon="⚡" value="142 kWh" label="Energy Conserved"          sub="Powers a home for ~13 days"        pct={47}  goal="300 kWh" />
          <StatCard icon="🏆" value="1,240"   label="Eco Points Earned"         sub="Gold Member · Next: Platinum at 2,000 pts" pct={62} goal="2,000 pts" />
        </div>

        {/* Device breakdown */}
        <div className="section-header">
          <div className="section-title">Breakdown by Device Type</div>
        </div>

        <div className="card" style={{ marginBottom:24 }}>
          {DEVICES.map(d => (
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
          <div style={{ paddingTop:10, borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', fontSize:13 }}>
            <span style={{ color:'var(--text-secondary)' }}>Other / Mixed</span>
            <span style={{ color:'var(--text-secondary)' }}>8.4 kg</span>
          </div>
        </div>

        {/* Monthly chart */}
        <div className="section-header">
          <div className="section-title">Monthly Activity</div>
        </div>

        <div className="card" style={{ marginBottom:24 }}>
          <div className="bar-chart">
            {MONTHLY.map(m => (
              <div className="bar-col" key={m.month}>
                <div className={`bar-fill${m.highlight ? ' highlight' : ''}`} style={{ height:`${m.pct}%` }} />
                <div className={`bar-label${m.highlight ? ' highlight' : ''}`}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="section-header">
          <div className="section-title">Achievements</div>
        </div>

        <div className="achievement-grid">
          {ACHIEVEMENTS.map(a => (
            <div className={`achievement-card${a.locked ? ' locked' : ''}`} key={a.name}>
              <div className="achievement-icon">{a.icon}</div>
              <div className="achievement-name">{a.name}</div>
              <div className="achievement-sub">{a.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
