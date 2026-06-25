import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',      icon: ' ', path: '/dashboard' },
  { id: 'track',     label: 'Track Pickups',  icon: ' ', path: '/track'     },
  { id: 'rewards',   label: 'Rewards Store',  icon: ' ', path: '/rewards'   },
  { id: 'impact',    label: 'My Impact',      icon: ' ', path: '/impact'    },
  { id: 'schedule',  label: 'Schedule Pickup',icon: ' ', path: '/schedule'  },
];

export default function Header({ user }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activePage = NAV_ITEMS.find(n => pathname.startsWith(n.path))?.id ?? '';

  const currentUser = user || JSON.parse(localStorage.getItem('currentUser')) || { name: 'User', points: 0 };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">♻️</div>
        EcoRecycle
      </div>

      <div className="user-card">
        <div className="user-name">{currentUser.name}</div>
        <div className="user-pts"> {(currentUser.points || 0).toLocaleString()} pts</div>
      </div>

      {NAV_ITEMS.map(item => (
        <div key={item.id} className={`nav-item${activePage === item.id ? ' active' : ''}`}
          onClick={() => navigate(item.path)}>
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </div>
      ))}

      <div className="sidebar-bottom">
        <button className="btn-request" onClick={() => navigate('/schedule')}>
          + Request Pickup
        </button>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
