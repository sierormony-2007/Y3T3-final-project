import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

import LandingScreen  from './component/LandingScreen.jsx'
import Login          from './component/Login.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import TrackPickups   from './pages/TrackPickup.jsx'
import RewardsStore   from './pages/RewardsStore.jsx'
import MyImpact       from './pages/MyImpact.jsx'
import SchedulePickup from './pages/SchedulePickup.jsx'
import StaffDashboard from './pages/StaffDashboard.jsx'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/LandingScreen" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/LandingScreen" replace />} />
        <Route path="/LandingScreen" element={<LandingScreen />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/track"     element={<PrivateRoute><TrackPickups /></PrivateRoute>} />
        <Route path="/rewards"   element={<PrivateRoute><RewardsStore /></PrivateRoute>} />
        <Route path="/impact"    element={<PrivateRoute><MyImpact /></PrivateRoute>} />
        <Route path="/schedule"  element={<PrivateRoute><SchedulePickup /></PrivateRoute>} />
        <Route path="/staff"     element={<PrivateRoute><StaffDashboard /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
