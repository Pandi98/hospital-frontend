import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, LoadingCenter, Alert } from '../../components/common';
import { doctorAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, statusBadge } from '../../utils/helpers';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    try {
      const res = await doctorAPI.getMyAppointments();
      setAppointments(res.data?.data || []);
    } catch { setError('Failed to load dashboard'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const scheduled  = appointments.filter(a => a.status === 'SCHEDULED').length;
  const completed  = appointments.filter(a => a.status === 'COMPLETED').length;
  const inProgress = appointments.filter(a => a.status === 'IN_PROGRESS').length;

  const today = appointments.filter(a => {
    const d = new Date(a.appointmentDateTime);
    return d.toDateString() === new Date().toDateString();
  });

  const totalPatients =
  [...new Set(appointments.map(a => a.patientId))].length;

  return (
    <DashboardLayout title="Doctor Dashboard">
      {loading ? <LoadingCenter /> : (
        <>
          <Alert type="danger" message={error} onClose={() => setError('')} />

          {/* Welcome */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            borderRadius: 'var(--radius-lg)', padding: '24px 28px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            color: 'white', position: 'relative', overflow: 'hidden'
          }} className="animate-in">
            <div style={{ position:'absolute', right:-20, top:-20, width:140, height:140,
              background:'rgba(255,255,255,.05)', borderRadius:'50%' }} />
            <div style={{ position:'absolute', right:60, bottom:-40, width:100, height:100,
              background:'rgba(0,180,216,.15)', borderRadius:'50%' }} />
            <div style={{ position:'relative', zIndex:1 }}>
              <div style={{ fontSize:13, opacity:.7, marginBottom:4 }}>Welcome back,</div>
              <h3 style={{ fontSize:22, fontWeight:800, margin:0, color:'white' }}>Dr. {user?.fullName}</h3>
              <div style={{ fontSize:13, opacity:.6, marginTop:4 }}>Have a great day at work</div>
            </div>
            <div style={{ position:'relative', zIndex:1, textAlign:'right' }}>
              <div style={{ fontSize:32, fontWeight:800 }}>{today.length}</div>
              <div style={{ fontSize:12, opacity:.7 }}>Appointments Today</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid-stats">
            <StatCard icon="bi-people-fill"  iconClass="indigo" value={totalPatients} label="Total Patients"/>
            <StatCard icon="bi-calendar2-check-fill" iconClass="blue"   value={appointments.length} label="Total Appointments" />
            <StatCard icon="bi-clock-fill"           iconClass="amber"  value={scheduled}           label="Scheduled" />
            <StatCard icon="bi-activity"             iconClass="red"    value={inProgress}          label="In Progress" />
            <StatCard icon="bi-check-circle-fill"    iconClass="green"  value={completed}           label="Completed" />
          </div>

          {/* Today's appointments */}
          <div className="card animate-in-2">
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-calendar2-day" style={{ marginRight: 8 }} />
                Today's Schedule
              </h5>
              <span className="badge badge-info">{today.length}</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Patient</th><th>Time</th><th>Reason</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {today.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>
                        <i className="bi bi-sun" style={{ fontSize:28, display:'block', marginBottom:8 }} />
                        No appointments scheduled for today
                      </td>
                    </tr>
                  ) : today.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700, fontSize: 13 }}>{a.patientName}</td>
                      <td style={{ fontSize: 13 }}>{formatDateTime(a.appointmentDateTime)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 180,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {a.reason || '—'}
                      </td>
                      <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
