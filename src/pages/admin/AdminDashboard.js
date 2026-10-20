import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, LoadingCenter, Alert } from '../../components/common';
import { adminAPI } from '../../api';
import { formatDateTime, statusBadge } from '../../utils/helpers';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ doctors:0, receptionists:0 ,patients:0, appointments:0, completed:0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [docRes,recRes, patRes, apptRes] = await Promise.all([
          adminAPI.getAllDoctors(),
          adminAPI.getAllReceptionists(),
          adminAPI.getAllPatients(),
          adminAPI.getAllAppointments(),
        ]);
        const appts = apptRes.data?.data || [];

        setStats({
          doctors:        (docRes.data?.data || []).length,
          receptionists:  (recRes.data?.data || []).length,
          patients:       (patRes.data?.data || []).length,
          appointments:   appts.length,
          completed:      appts.filter(a => a.status === 'COMPLETED').length,
          });


        
        setRecentAppointments(appts.slice(0, 8));
      } catch { setError('Failed to load dashboard data'); }
      finally  { setLoading(false); }
    };
    load();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      {loading ? <LoadingCenter /> : (
        <>
          <Alert type="danger" message={error} onClose={() => setError('')} />

          {/* Stats */}
          <div className="grid-stats">
            <StatCard icon="bi-person-badge-fill" iconClass="blue"  value={stats.doctors}      label="Total Doctors"       />
            <StatCard icon="bi-person-workspace"  iconClass="purple"  value={stats.receptionists}  label="Total Receptionists"/>
            <StatCard icon="bi-people-fill"        iconClass="green" value={stats.patients}     label="Total Patients"      />
            <StatCard icon="bi-calendar2-check-fill" iconClass="amber" value={stats.appointments} label="Total Appointments" />
            <StatCard icon="bi-check-circle-fill"  iconClass="indigo" value={stats.completed}   label="Completed"          />
          </div>

          {/* Recent Appointments */}
          <div className="card animate-in-2">
            <div className="card-header">
              <h5 className="card-title"><i className="bi bi-calendar2-check ms-2" style={{ marginRight:8 }} />Recent Appointments</h5>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No appointments found</td></tr>
                  ) : recentAppointments.map((a, i) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12 }}>#{a.id}</td>
                      <td>
                        <div style={{ fontWeight:600, fontSize:13 }}>{a.patientName}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight:600, fontSize:13 }}>{a.doctorName}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.doctorSpecialization}</div>
                      </td>
                      <td style={{ fontSize:12 }}>{formatDateTime(a.appointmentDateTime)}</td>
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
