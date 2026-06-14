import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',      icon: '⊞', path: '/dashboard' },
  { id: 'track',     label: 'Track Pickups',  icon: '🚛', path: '/track'     },
  { id: 'rewards',   label: 'Rewards Store',  icon: '🛍', path: '/rewards'   },
  { id: 'impact',    label: 'My Impact',      icon: '📈', path: '/impact'    },
  { id: 'schedule',  label: 'Schedule Pickup', icon: '🗓', path: '/schedule'  },
];

export default function Header({ user = { name: 'Alice Chen', pts: 1240 } }) {
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  const activePage = NAV_ITEMS.find(n => pathname.startsWith(n.path))?.id ?? '';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">♻️</div>
        EcoRecycle
      </div>

      {/* User card */}
      <div className="user-card">
        <div className="user-name">{user.name}</div>
        <div className="user-pts">♻ {user.pts.toLocaleString()} pts</div>
      </div>

      {/* Nav links */}
      {NAV_ITEMS.map(item => (
        <div
          key={item.id}
          className={`nav-item${activePage === item.id ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </div>
      ))}

      {/* Bottom actions */}
      <div className="sidebar-bottom">
        <button className="btn-request" onClick={() => navigate('/schedule')}>
          + Request Pickup
        </button>
        <button className="btn-logout" onClick={() => navigate('/login')}>
          ↩ Logout
        </button>
      </div>
    </aside>
  );
}
