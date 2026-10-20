import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { Alert, Spinner } from '../../components/common';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setLoading(true);
    setApiError('');
    try {
      const res = await authAPI.login(form);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      const dest = { ADMIN:'/admin', RECEPTIONIST:'/receptionist', DOCTOR:'/doctor' }[userData.role] || '/';
      navigate(dest);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  return (
    <div className="login-page">
      {/* Left hero */}
      <div className="login-left">
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <div style={{ width:46, height:46, background:'var(--accent)', borderRadius:14, display:'grid',
              placeItems:'center', fontSize:22, color:'white', boxShadow:'0 4px 16px rgba(0,180,216,.4)' }}>
              <i className="bi bi-heart-pulse-fill" />
            </div>
            <div style={{ color:'white', fontWeight:800, fontSize:20 }}>Dr SCYNDHU</div>
          </div>

          <h1 className="login-hero-title">
            Healthcare<br />
            <em style={{ fontStyle:'italic', color:'var(--accent)' }}>Management</em><br />
            Simplified
          </h1>
          <p className="login-hero-subtitle">
            A unified platform for administrators, receptionists, and doctors to manage
            patients, appointments, and prescriptions seamlessly.
          </p>

          <div style={{ display:'flex', gap:24, marginTop:40 }}>
            {[
              { icon:'bi-people-fill',  label:'Patient Care' },
              { icon:'bi-calendar2-check-fill', label:'Scheduling' },
              { icon:'bi-file-earmark-medical-fill', label:'Prescriptions' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:8, color:'rgba(255,255,255,.7)', fontSize:13 }}>
                <i className={`bi ${icon}`} style={{ color:'var(--accent)' }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:26, fontWeight:800, marginBottom:6 }}>Welcome back</h2>
            <p style={{ color:'var(--text-muted)', fontSize:14 }}>Sign in to your account to continue</p>
          </div>

          <Alert type="danger" message={apiError} onClose={() => setApiError('')} />

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <div className="input-group">
                <i className="bi bi-envelope input-icon" />
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="doctor@hospital.com"
                  value={form.email}
                  onChange={set('email')}
                  autoFocus
                />
              </div>
              {errors.email && <div className="invalid-feedback" style={{ display:'block' }}>{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <i className="bi bi-lock input-icon" />
                <input
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                />
              </div>
              {errors.password && <div className="invalid-feedback" style={{ display:'block' }}>{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading} style={{ marginTop:8 }}>
              {loading ? <><Spinner small /> Signing in…</> : <><i className="bi bi-arrow-right-circle" /> Sign In</>}
            </button>
          </form>

          <hr className="divider" />
          <p style={{ textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--accent)', fontWeight:700, textDecoration:'none' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
