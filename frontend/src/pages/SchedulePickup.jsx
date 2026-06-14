import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header.jsx'
import {
  DEVICE_CATEGORIES,
  TIME_SLOTS
} from "../data/data";

const today = new Date().toISOString().split('T')[0];

export default function SchedulePickup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category:    '',
    description: '',
    itemCount:   1,
    weight:      '',
    date:        '',
    timeSlot:    '10:00 – 12:00',
    street:      '12 Green Ln',
    city:        'Eco City',
    postal:      '10001',
    notes:       '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]       = useState({});

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const savePickup = () => {
    if (!currentUser?.id) return;

    const pickups = JSON.parse(localStorage.getItem('pickups')) || [];

    pickups.push({
      id: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      category: form.category,
      description: form.description,
      itemCount: form.itemCount,
      weight: form.weight,
      date: form.date,
      timeSlot: form.timeSlot,
      street: form.street,
      city: form.city,
      postal: form.postal,
      notes: form.notes,
      status: 'pending',
    });

    localStorage.setItem('pickups', JSON.stringify(pickups));
  };

  const estimatedPts = form.weight ? Math.round(parseFloat(form.weight) * 40) : null;

  const validate = () => {
    const e = {};
    if (!form.category) e.category = 'Please select a device category.';
    if (!form.weight || isNaN(form.weight) || parseFloat(form.weight) <= 0)
      e.weight = 'Please enter a valid weight.';
    if (!form.date)   e.date   = 'Please choose a pickup date.';
    if (!form.street) e.street = 'Please enter your street address.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    savePickup();
    setSubmitted(true);
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  if (submitted) {
    return (
      <div className="app-shell">
        <Header />
        <div className="main-content" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ textAlign:'center', maxWidth:360 }}>
            <div style={{ fontSize:64, marginBottom:20 }}>✅</div>
            <div style={{ fontSize:22, fontWeight:700, marginBottom:8 }}>Pickup Scheduled!</div>
            <div style={{ fontSize:14, color:'var(--text-secondary)' }}>
              Your {form.category} pickup is confirmed for {form.date}, {form.timeSlot}.
              Redirecting to dashboard…
            </div>

            <button onClick={submitPickup}>
              Request Pickup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />

      <div className="main-content">
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
          <div className="page-title" style={{ marginBottom:0 }}>Schedule Pickup</div>
        </div>

        <div style={{ maxWidth:640 }}>

          {/* Step 1 — Device */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>1 · Device Type</div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => set('category', e.target.value)}
              >
                <option value="">Select device category</option>
                {DEVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <div style={{ color:'var(--badge-orange)', fontSize:11, marginTop:4 }}>{errors.category}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Dell laptop, cracked screen, no charger…"
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Number of Items</label>
              <div className="item-counter">
                <button className="counter-btn" onClick={() => set('itemCount', Math.max(1, form.itemCount - 1))}>−</button>
                <div className="counter-value">{form.itemCount}</div>
                <button className="counter-btn" onClick={() => set('itemCount', form.itemCount + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* Step 2 — Weight */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>2 · Estimated Weight</div>
            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Weight (kg) — approximate is fine</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 3.5"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={e => set('weight', e.target.value)}
              />
              {errors.weight && <div style={{ color:'var(--badge-orange)', fontSize:11, marginTop:4 }}>{errors.weight}</div>}
              <div style={{ marginTop:8, fontSize:11, color:'var(--text-secondary)' }}>
                ♻ Estimated eco points:{' '}
                <span style={{ color:'var(--green-bright)', fontWeight:600 }}>
                  {estimatedPts != null ? `${estimatedPts} pts` : '— pts'}
                </span>
                {' '}(40 pts/kg)
              </div>
            </div>
          </div>

          {/* Step 3 — Date & Time */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>3 · Pickup Date &amp; Time</div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                min={today}
                value={form.date}
                onChange={e => set('date', e.target.value)}
                style={{ maxWidth:220 }}
              />
              {errors.date && <div style={{ color:'var(--badge-orange)', fontSize:11, marginTop:4 }}>{errors.date}</div>}
            </div>

            <label className="form-label">Preferred Time Slot</label>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <div
                  key={slot}
                  className={`time-slot${form.timeSlot === slot ? ' selected' : ''}`}
                  onClick={() => set('timeSlot', slot)}
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>

          {/* Step 4 — Address */}
          <div className="card" style={{ marginBottom:24 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:16 }}>4 · Pickup Address</div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                className="form-input"
                type="text"
                placeholder="12 Green Ln"
                value={form.street}
                onChange={e => set('street', e.target.value)}
              />
              {errors.street && <div style={{ color:'var(--badge-orange)', fontSize:11, marginTop:4 }}>{errors.street}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" type="text" placeholder="Eco City"
                  value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input className="form-input" type="text" placeholder="10001"
                  value={form.postal} onChange={e => set('postal', e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom:0 }}>
              <label className="form-label">Special Instructions (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Ring bell twice, leave at gate…"
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </div>
          </div>

          <button className="btn-submit" onClick={handleSubmit}>
            Confirm Pickup Request
          </button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
