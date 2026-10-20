import React from 'react';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';

export default function DashboardLayout({ children, title }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <main className="page-body">{children}</main>
      </div>
    </div>
  );
}
