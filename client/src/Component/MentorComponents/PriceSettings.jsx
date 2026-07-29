import React, { useState, useEffect } from 'react';
import { getMyMentorProfile, updateMentorProfile } from '../../service/mentorservice';
import { showSuccess, showError } from '../../utils/toast';

export default function PriceSettings() {
  const [loading, setLoading] = useState(false);
  const [rate, setRate] = useState('');
  const [discount, setDiscount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyMentorProfile();
      const m = res.data || {};
      setRate(m.ratePerSession ?? '');
      setDiscount(m.discountPercent ?? 0);
    } catch (err) {
      console.error('Failed to load mentor profile for price settings', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const r = parseFloat(rate);
    const d = parseFloat(discount);
    if (isNaN(r) || r <= 0) {
      showError('Rate must be a number greater than 0');
      return false;
    }
    if (isNaN(d) || d < 0 || d > 100) {
      showError('Discount must be between 0 and 100');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await updateMentorProfile({ ratePerSession: parseFloat(rate), discountPercent: parseFloat(discount) });
      showSuccess('Pricing updated');
    } catch (err) {
      console.error('Failed to update pricing', err);
      showError(err?.message || 'Failed to save pricing');
    } finally {
      setSaving(false);
    }
  };

  const finalPrice = () => {
    const r = parseFloat(rate) || 0;
    const d = parseFloat(discount) || 0;
    return Math.round(r - (r * d) / 100);
  };

  return (
    <div className="section-card">
      <h5 className="section-title">Pricing</h5>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="form-grid">
          <div className="form-group">
            <label>Session Price (₹)</label>
            <input type="number" min="1" step="1" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Discount (%)</label>
            <input type="number" min="0" max="100" step="1" value={discount} onChange={(e) => setDiscount(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Final Price</label>
            <div style={{ fontWeight: 700 }}>₹{finalPrice()}</div>
          </div>

          <div className="form-group full-width">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
