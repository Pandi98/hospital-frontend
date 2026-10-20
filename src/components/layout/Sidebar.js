import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common';

const navConfig = {
  ADMIN: [

    
  { section: 'Overview', items: [
    { to: '/admin', icon: 'bi-grid-1x2', label: 'Dashboard' },
  ]},
  { section: 'Management', items: [
    { to: '/admin/doctors', icon: 'bi-person-badge', label: 'Doctors' },

    { to: '/admin/receptionists', icon: 'bi-person-workspace', label: 'Receptionists' },

    { to: '/admin/patients', icon: 'bi-people', label: 'Patients' },

    { to: '/admin/appointments', icon: 'bi-calendar2-check', label: 'Appointments' },
  ]},
],

RECEPTIONIST: [
  {
    section: 'Overview',
    items: [
      {
        to: '/receptionist',
        icon: 'bi-grid-1x2',
        label: 'Dashboard'
      },
    ]
  },
  {
    section: 'Operations',
    items: [
      {
        to: '/receptionist/patients',
        icon: 'bi-people',
        label: 'Patients'
      },
      {
        to: '/receptionist/appointments',
        icon: 'bi-calendar2-check',
        label: 'Appointments'
      },
    ]
  },
],
    

  DOCTOR: [
    { section: 'Overview', items: [
      { to: '/doctor',                  icon: 'bi-grid-1x2',     label: 'Dashboard' },
    ]},
    { section: 'My Work', items: [
      { to: '/doctor/appointments',     icon: 'bi-calendar2-check', label: 'Appointments' },
      { to: '/doctor/prescriptions',    icon: 'bi-file-earmark-medical', label: 'Prescriptions' },
      { to: '/doctor/profile', icon: 'bi-person-circle', label: 'My Profile'},
    ]},
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = navConfig[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon"><i className="bi bi-heart-pulse-fill" /></div>
        <div>
          <div className="sidebar-brand-text">MediCore</div>
          <div className="sidebar-brand-sub">HMS</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {items.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to.split('/').length <= 2}
                className={({ isActive }) => `nav-link-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-link-icon"><i className={`bi ${icon}`} /></span>
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <Avatar name={user?.fullName} size="sm" />
          <div>
            <div style={{ color:'white', fontSize:12, fontWeight:700, lineHeight:1.2 }}>{user?.fullName}</div>
            <div style={{ color:'rgba(255,255,255,.45)', fontSize:10, textTransform:'uppercase', letterSpacing:'.5px' }}>{user?.role}</div>
          </div>
        </div>
        <button className="nav-link-item" onClick={handleLogout} style={{ borderRadius:8, width:'100%' }}>
          <span className="nav-link-icon"><i className="bi bi-box-arrow-right" /></span>
          Logout
        </button>
      </div>
    </aside>
  );
}
