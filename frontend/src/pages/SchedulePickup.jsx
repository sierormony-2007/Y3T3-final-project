import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';
import { DEVICE_CATEGORIES, TIME_SLOTS } from '../data/data.js';

const today = new Date().toISOString().split('T')[0];

export default function SchedulePickup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category: '', description: '', itemCount: 1,
    weight: '', date: '', timeSlot: '10:00 – 12:00',
    street: '', city: '', postal: '', notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const estimatedPts = form.weight && parseFloat(form.weight) >= 5
    ? Math.round(parseFloat(form.weight) * 40) : null;

  const validate = () => {
    const e = {};
    if (!form.category) e.category = 'Please select a device category.';
    if (!form.weight || isNaN(form.weight) || parseFloat(form.weight) <= 0)
      e.weight = 'Please enter a valid weight.';
    else if (parseFloat(form.weight) < 5)
      e.weight = 'Minimum weight is 5 kg for pickup.';
    if (!form.date)   e.date   = 'Please choose a pickup date.';
    if (!form.street) e.street = 'Please enter your street address.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await api.pickups.create({
        category:    form.category,
        description: form.description,
        itemCount:   form.itemCount,
        weight:      parseFloat(form.weight),
        date:        form.date,
        timeSlot:    form.timeSlot,
        street:      form.street,
        city:        form.city,
        postal:      form.postal,
        notes:       form.notes,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2500);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="app-shell">
        <Header />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Pickup Scheduled!</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Your {form.category} pickup is confirmed for {form.date}, {form.timeSlot}. Redirecting…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
          <div className="page-title" style={{ marginBottom: 0 }}>Schedule Pickup</div>
        </div>

        {apiError && (
          <div style={{ background: 'rgba(234,88,12,0.15)', border: '1px solid var(--badge-orange)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--badge-orange)', marginBottom: 16 }}>
            {apiError}
          </div>
        )}

        <div style={{ maxWidth: 640 }}>
          {/* Step 1 — Device */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>1 · Device Type</div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select device category</option>
                {DEVICE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.category}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-textarea" placeholder="e.g. Dell laptop, cracked screen…"
                value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Number of Items</label>
              <div className="item-counter">
                <button className="counter-btn" onClick={() => set('itemCount', Math.max(1, form.itemCount - 1))}>−</button>
                <div className="counter-value">{form.itemCount}</div>
                <button className="counter-btn" onClick={() => set('itemCount', form.itemCount + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* Step 2 — Weight */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>2 · Estimated Weight</div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Weight (kg) — minimum 5 kg required</label>
              <input className="form-input" type="number" placeholder="e.g. 6.5" min="5" step="0.1"
                value={form.weight} onChange={e => set('weight', e.target.value)} />
              {errors.weight && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.weight}</div>}
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
                ♻ Estimated eco points:{' '}
                <span style={{ color: 'var(--green-bright)', fontWeight: 600 }}>
                  {estimatedPts != null ? `${estimatedPts} pts` : '— pts'}
                </span>
                {' '}(40 pts/kg)
              </div>
            </div>
          </div>

          {/* Step 3 — Date & Time */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>3 · Pickup Date &amp; Time</div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" min={today} value={form.date}
                onChange={e => set('date', e.target.value)} style={{ maxWidth: 220 }} />
              {errors.date && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.date}</div>}
            </div>
            <label className="form-label">Preferred Time Slot</label>
            <div className="time-slots">
              {TIME_SLOTS.map(slot => (
                <div key={slot} className={`time-slot${form.timeSlot === slot ? ' selected' : ''}`}
                  onClick={() => set('timeSlot', slot)}>
                  {slot}
                </div>
              ))}
            </div>
          </div>

          {/* Step 4 — Address */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>4 · Pickup Address</div>
            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input className="form-input" type="text" placeholder="12 Green Ln"
                value={form.street} onChange={e => set('street', e.target.value)} />
              {errors.street && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.street}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" type="text" placeholder="Phnom Penh"
                  value={form.city} onChange={e => set('city', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input className="form-input" type="text" placeholder="12000"
                  value={form.postal} onChange={e => set('postal', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Special Instructions (optional)</label>
              <textarea className="form-textarea" placeholder="e.g. Ring bell twice, leave at gate…"
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting…' : 'Confirm Pickup Request'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
