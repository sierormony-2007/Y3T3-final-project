import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',      icon: ' ', path: '/dashboard' },
  { id: 'track',     label: 'Track Pickups',  icon: ' ', path: '/track'     },
  { id: 'rewards',   label: 'Rewards Store',  icon: ' ', path: '/rewards'   },
  { id: 'impact',    label: 'My Impact',      icon: ' ', path: '/impact'    },
  { id: 'schedule',  label: 'Schedule Pickup',icon: ' ', path: '/schedule'  },
];

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Header({ user }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activePage = NAV_ITEMS.find(n => pathname.startsWith(n.path))?.id ?? '';

  const currentUser = user || JSON.parse(localStorage.getItem('currentUser')) || { name: 'User', points: 0 };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const panelRef = useRef(null);

  const loadNotifications = () => {
    api.notifications.list().then(setNotifications).catch(() => {});
    api.notifications.unreadCount().then(r => setUnreadCount(r.unread_count || 0)).catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 20000); // poll every 20s
    return () => clearInterval(interval);
  }, []);

  // Close the dropdown when clicking outside it
  useEffect(() => {
    const onClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleBellClick = () => setOpen(o => !o);

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      try {
        await api.notifications.markRead(notif.notification_id);
        setNotifications(prev => prev.map(n => n.notification_id === notif.notification_id ? { ...n, is_read: true } : n));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch { /* ignore */ }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon">♻️</div>
          EcoRecycle
        </div>

        <div className="notif-wrap" ref={panelRef}>
          <button className="notif-bell" onClick={handleBellClick} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="notif-dot">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {open && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={handleMarkAllRead}>Mark all read</button>
                )}
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.notification_id}
                      className={`notif-item${n.is_read ? '' : ' unread'}`}
                      onClick={() => handleNotifClick(n)}>
                      <div className="notif-title">{n.title}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-time">{timeAgo(n.sent_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
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
