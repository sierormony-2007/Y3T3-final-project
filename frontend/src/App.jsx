import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

import Login          from './component/Login.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import TrackPickups   from './pages/TrackPickup.jsx'
import RewardsStore   from './pages/RewardsStore.jsx'
import MyImpact       from './pages/MyImpact.jsx'
import SchedulePickup from './pages/SchedulePickup.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/track"     element={<TrackPickups />} />
        <Route path="/rewards"   element={<RewardsStore />} />
        <Route path="/impact"    element={<MyImpact />} />
        <Route path="/schedule"  element={<SchedulePickup />} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
