import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const goHome = () => {
    const dest = { ADMIN:'/admin', RECEPTIONIST:'/receptionist', DOCTOR:'/doctor' }[user?.role] || '/login';
    navigate(dest);
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', flexDirection:'column', gap:16, textAlign:'center', padding:24
    }}>
      <div style={{
        width:80, height:80, borderRadius:24, background:'rgba(239,71,111,.1)',
        display:'grid', placeItems:'center', fontSize:36, marginBottom:8
      }}>
        🚫
      </div>
      <h2 style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)' }}>Access Denied</h2>
      <p style={{ color:'var(--text-muted)', maxWidth:340, fontSize:14 }}>
        You don't have permission to view this page. Please contact your administrator.
      </p>
      <button className="btn btn-primary btn-lg" onClick={goHome}>
        <i className="bi bi-arrow-left" /> Go to Dashboard
      </button>
    </div>
  );
}
