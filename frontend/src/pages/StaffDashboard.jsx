import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from '../component/Header.jsx';
import { PICKUPS } from '../data/data.js';

const STATUS_LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  processing: "Processing",
  recycled: "Recycled ✓",
};

const STATUS_CLASS = {
  pending: "badge badge-pending",
  accepted: "badge badge-processing",
  processing: "badge badge-processing",
  recycled: "badge badge-recycled",
};

const NEXT_STATUS = {
  pending: "accepted",
  accepted: "processing",
  processing: "recycled",
};

const ACTION_LABEL = {
  pending: "Accept",
  accepted: "Process",
  processing: "Complete",
  recycled: "Completed",
};

export default function StaffDashboard() {
  const navigate = useNavigate();
  const storedPickups = JSON.parse(localStorage.getItem("pickups"));
  const [pickups, setPickups] = useState(
    storedPickups?.length ? storedPickups : PICKUPS
  );

  const summary = useMemo(
    () => ({
      total: pickups.length,
      pending: pickups.filter((p) => p.status === "pending").length,
      accepted: pickups.filter((p) => p.status === "accepted").length,
      processing: pickups.filter((p) => p.status === "processing").length,
      recycled: pickups.filter((p) => p.status === "recycled").length,
    }),
    [pickups]
  );

  const savePickups = (updated) => {
    setPickups(updated);
    localStorage.setItem("pickups", JSON.stringify(updated));
  };

  const handleNextStatus = (id) => {
    const pickup = pickups.find((p) => p.id === id);
    if (!pickup) return;

    const next = NEXT_STATUS[pickup.status];
    if (!next) return;

    const updatedPickups = pickups.map((p) =>
      p.id === id ? { ...p, status: next } : p
    );

    if (next === "recycled") {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const updatedUsers = users.map((user) =>
        user.id === pickup.userId
          ? {
              ...user,
              points: (user.points || 0) + Math.round((pickup.weight || 0) * 40),
            }
          : user
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }

    savePickups(updatedPickups);
  };

  const orderedPickups = [...pickups].sort((a, b) => {
    const order = ["pending", "accepted", "processing", "recycled"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  return (
    <div className="app-shell">
      <Header />

      <div className="main-content">
        <div className="page-title">Staff Dashboard</div>

        <div className="card-lg">
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>Operations center</div>
              <div style={{ color: "var(--text-secondary)", marginTop: 6 }}>
                Manage pickup requests, update statuses, and confirm completed recycling jobs.
              </div>
            </div>
            <button className="btn-request" onClick={() => navigate('/dashboard')}>
              View user dashboard
            </button>
          </div>

          <div className="stat-grid" style={{ marginTop: 24 }}>
            {[
              { value: summary.total, label: 'Total jobs' },
              { value: summary.pending, label: 'Pending' },
              { value: summary.accepted, label: 'Accepted' },
              { value: summary.processing, label: 'Processing' },
              { value: summary.recycled, label: 'Recycled' },
            ].map((stat) => (
              <div className="stat-cell" key={stat.label}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-header" style={{ marginTop: 24 }}>
          <div className="section-title">Pickup queue</div>
          <span className="view-all" onClick={() => navigate('/track')}>View tracking page</span>
        </div>

        {orderedPickups.length === 0 ? (
          <div className="card">No pickup requests are available.</div>
        ) : (
          orderedPickups.map((pickup) => (
            <div key={pickup.id} className="pickup-row" style={{ cursor: 'default' }}>
              <div className={`pickup-icon ${pickup.status === 'recycled' ? 'green' : pickup.status === 'processing' ? 'yellow' : 'orange'}`}>
                {pickup.status === 'recycled' ? '✅' : pickup.status === 'processing' ? '🛠' : '🚚'}
              </div>

              <div className="pickup-info" style={{ flex: 1 }}>
                <div className="pickup-name">{pickup.userName} · {pickup.category}</div>
                <div className="pickup-meta">{pickup.weight} kg · {pickup.date || 'No date selected'}</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8, alignItems:'center' }}>
                  <span className={STATUS_CLASS[pickup.status] ?? 'badge'}>{STATUS_LABELS[pickup.status]}</span>
                  <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{pickup.timeSlot || pickup.notes || 'No extra notes'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                <button
                  className="action-btn"
                  style={{ padding: '10px 14px', fontSize: 12, minWidth: 120 }}
                  disabled={!NEXT_STATUS[pickup.status]}
                  onClick={() => handleNextStatus(pickup.id)}
                >
                  {ACTION_LABEL[pickup.status]}
                </button>
                {pickup.status === 'recycled' && (
                  <span style={{ fontSize: 12, color: 'var(--green-bright)' }}>
                    +{Math.round((pickup.weight || 0) * 40)} pts
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
