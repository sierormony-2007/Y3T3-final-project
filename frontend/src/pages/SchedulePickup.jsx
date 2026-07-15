import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../component/Header.jsx';
import { api } from '../services/api.js';
import { TIME_SLOTS } from '../data/data.js';

const today = new Date().toISOString().split('T')[0];

export default function SchedulePickup() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  useEffect(() => {
  const loadCategories = async () => {
    try {
      const data = await api.categories.list();
      console.log('Categories:', data);
      setCategories(data);
    }catch (err) {
      console.error(err);
    }
  };
  loadCategories();
}, []);
  const [form, setForm] = useState({
    category: null, description: '', itemCount: 1,
    weight: '', date: '', timeSlot: '10:00 – 12:00',
    district: '', city: '', postal: '', notes: '',
    phone: '', mapLink: '',
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
    if (!form.date)     e.date     = 'Please choose a pickup date.';
    if (!form.district) e.district = 'Please enter your district.';
    if (!form.city)     e.city     = 'Please enter your city.';
    if (!form.postal)   e.postal   = 'Please enter your postal code.';
    if (!form.phone)    e.phone    = 'Please enter a contact phone number.';
    else if (!/^[0-9+\-\s]{8,}$/.test(form.phone)) e.phone = 'Please enter a valid phone number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
    const [start, end] = form.timeSlot.split(/\s+[–-]\s+/);
      await api.pickups.create({
        pickup_address: `${form.district}, ${form.city}, ${form.postal}`,
        preferred_date: form.date,
        time_window_start: `${start}:00`,
        time_window_end: `${end}:00`,
        special_note: form.notes,
        phone: form.phone,
        link: form.mapLink || undefined,

        devices: [
          {
            category_id: Number(form.category),
            quantity: form.itemCount,
            weight_kg: parseFloat(form.weight),
            notes: form.description,
          }
        ]
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
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Recycle Request Submitted!</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Your {form.category} recycle request is confirmed for {form.date}, {form.timeSlot}. Redirecting...
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
          <div className="page-title" style={{ marginBottom: 0 }}>Request Recycle</div>
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
              <select
                className = "form-select"
                value={form.category}
                onChange={e => set('category', e.target.value)}
                >
                <option value="">Select a category</option>
                {categories.map(c =>
                  <option key={c.category_id} value={c.category_id}>
                    {c.name}
                  </option>
                )}
              </select>
              {errors.category && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.category}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea className="form-textarea" placeholder="e.g. Dell laptop, cracked screen..."
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
                Estimated eco points:{' '}
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
              <label className="form-label">District</label>
              <input className="form-input" type="text" placeholder="e.g. Daun Penh"
                value={form.district} onChange={e => set('district', e.target.value)} />
              {errors.district && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.district}</div>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" type="text" placeholder="Phnom Penh"
                  value={form.city} onChange={e => set('city', e.target.value)} />
                {errors.city && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.city}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input className="form-input" type="text" placeholder="12000"
                  value={form.postal} onChange={e => set('postal', e.target.value)} />
                {errors.postal && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.postal}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input className="form-input" type="tel" placeholder="012 345 678"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
              {errors.phone && <div style={{ color: 'var(--badge-orange)', fontSize: 11, marginTop: 4 }}>{errors.phone}</div>}
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                Our staff will call this number to confirm the pickup.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Google Maps Link (optional)</label>
              <input className="form-input" type="url" placeholder="https://maps.google.com/?q=..."
                value={form.mapLink} onChange={e => set('mapLink', e.target.value)} />
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                Paste a Google Maps link to your location so staff can find it easily.
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Special Instructions (optional)</label>
              <textarea className="form-textarea" placeholder="e.g. Ring bell twice, leave at gate..."
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Confirm Recycle Request'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
