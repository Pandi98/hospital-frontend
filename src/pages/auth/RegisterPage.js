import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api';
import { Alert, Spinner } from '../../components/common';

const ROLES = ['ADMIN', 'RECEPTIONIST', 'DOCTOR'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName:'', email:'', password:'', phone:'', role:'DOCTOR' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.email)           e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password)        e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (!form.phone)           e.phone    = 'Phone is required';
    if (!form.role)            e.role     = 'Role is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true); setApiError('');
    try {
      await authAPI.register(form);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <div style={{ width:46, height:46, background:'var(--accent)', borderRadius:14, display:'grid',
              placeItems:'center', fontSize:22, color:'white' }}>
              <i className="bi bi-heart-pulse-fill" />
            </div>
            <div style={{ color:'white', fontWeight:800, fontSize:20 }}>MediCore HMS</div>
          </div>
          <h1 className="login-hero-title">Join Our<br /><em style={{ color:'var(--accent)', fontStyle:'italic' }}>Healthcare</em><br />Network</h1>
          <p className="login-hero-subtitle">Create your account to access the Hospital Management System tailored for your role.</p>
        </div>
      </div>

      <div className="login-right" style={{ padding:'40px 48px' }}>
        <div className="login-form-wrap" style={{ maxWidth:380 }}>
          <div style={{ marginBottom:28 }}>
            <h2 style={{ fontSize:24, fontWeight:800, marginBottom:4 }}>Create Account</h2>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>Fill in your details to register</p>
          </div>

          <Alert type="danger"  message={apiError} onClose={() => setApiError('')} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Full Name *</label>
              <div className="input-group">
                <i className="bi bi-person input-icon" />
                <input className={`form-control ${errors.fullName?'is-invalid':''}`}
                  placeholder="Dr. John Smith" value={form.fullName} onChange={set('fullName')} />
              </div>
              {errors.fullName && <div className="invalid-feedback" style={{display:'block'}}>{errors.fullName}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Email *</label>
              <div className="input-group">
                <i className="bi bi-envelope input-icon" />
                <input type="email" className={`form-control ${errors.email?'is-invalid':''}`}
                  placeholder="you@hospital.com" value={form.email} onChange={set('email')} />
              </div>
              {errors.email && <div className="invalid-feedback" style={{display:'block'}}>{errors.email}</div>}
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div className="mb-3">
                <label className="form-label">Password *</label>
                <input type="password" className={`form-control ${errors.password?'is-invalid':''}`}
                  placeholder="••••••••" value={form.password} onChange={set('password')} />
                {errors.password && <div className="invalid-feedback" style={{display:'block'}}>{errors.password}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label">Phone *</label>
                <input className={`form-control ${errors.phone?'is-invalid':''}`}
                  placeholder="+91 9999999999" value={form.phone} onChange={set('phone')} />
                {errors.phone && <div className="invalid-feedback" style={{display:'block'}}>{errors.phone}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Role *</label>
              <select className={`form-select ${errors.role?'is-invalid':''}`}
                value={form.role} onChange={set('role')}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.role && <div className="invalid-feedback" style={{display:'block'}}>{errors.role}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading} style={{ marginTop:4 }}>
              {loading ? <><Spinner small /> Creating…</> : <><i className="bi bi-person-plus" /> Create Account</>}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent)', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
