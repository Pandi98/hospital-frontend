import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';
import { formatDate } from '../../utils/helpers';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const roleBg = { ADMIN: '#0a2540', RECEPTIONIST: '#06d6a0', DOCTOR: '#00b4d8' };

  return (
    <header className="topbar">
      {/* Left: page title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(new Date())}</div>
      </div>

      {/* Right: user dropdown */}
      <div style={{ position: 'relative' }} ref={ref}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'1.5px solid var(--border)',
            borderRadius:99, padding:'5px 14px 5px 5px', cursor:'pointer', transition:'all .2s' }}
        >
          <Avatar name={user?.fullName} size="sm" />
          <div style={{ textAlign:'left' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-primary)', lineHeight:1.2 }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>
              {user?.role}
            </div>
          </div>
          <i className="bi bi-chevron-down" style={{ fontSize:11, color:'var(--text-muted)', marginLeft:4 }} />
        </button>

        {open && (
          <div className="dropdown-menu-custom">
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:700 }}>{user?.fullName}</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>{user?.email}</div>
              <span style={{
                display:'inline-block', marginTop:6, fontSize:10, fontWeight:700,
                letterSpacing:.5, textTransform:'uppercase', padding:'2px 8px',
                borderRadius:99, background: roleBg[user?.role] || '#eee', color:'white'
              }}>{user?.role}</span>
            </div>
            <div className="dropdown-item-custom danger" onClick={() => { logout(); navigate('/login'); }}>
              <i className="bi bi-box-arrow-right" /> Logout
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
