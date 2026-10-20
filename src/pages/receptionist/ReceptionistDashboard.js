import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, LoadingCenter, Alert } from '../../components/common';
import { receptionistAPI } from '../../api';
import { formatDateTime, statusBadge } from '../../utils/helpers';

export default function ReceptionistDashboard() {
  const [data, setData] = useState({ patients:[], appointments:[], doctors:[] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(async () => {
    try {
      const [pRes, aRes, dRes] = await Promise.all([
        receptionistAPI.getAllPatients(),
        receptionistAPI.getAllAppointments(),
        receptionistAPI.getAllDoctors(),
      ]);
      setData({
        patients:     pRes.data?.data || [],
        appointments: aRes.data?.data || [],
        doctors:      dRes.data?.data || [],
      });
    } catch { setError('Failed to load dashboard'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = data.appointments.filter(a => {
    const d = new Date(a.appointmentDateTime);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  });

  const scheduled = data.appointments.filter(a => a.status === 'SCHEDULED').length;
  const available  = data.doctors.filter(d => d.available).length;

  return (
    <DashboardLayout title="Receptionist Dashboard">
      {loading ? <LoadingCenter /> : (
        <>
          <Alert type="danger" message={error} onClose={() => setError('')} />

          <div className="grid-stats">
            <StatCard icon="bi-people-fill"          iconClass="blue"   value={data.patients.length}     label="Total Patients" />
            <StatCard icon="bi-calendar2-check-fill" iconClass="green"  value={scheduled}                label="Scheduled Today" />
            <StatCard icon="bi-person-badge-fill"    iconClass="amber"  value={available}                label="Available Doctors" />
            <StatCard icon="bi-calendar2-day-fill"   iconClass="indigo" value={today.length}             label="Today's Appointments" />
          </div>

          {/* Today's appointments */}
          <div className="card animate-in-2">
            <div className="card-header">
              <h5 className="card-title"><i className="bi bi-calendar2-day" style={{ marginRight:8 }} />Today's Appointments</h5>
              <span className="badge badge-info">{today.length}</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {today.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No appointments today</td></tr>
                  ) : today.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight:600 }}>{a.patientName}</td>
                      <td>
                        <div style={{ fontWeight:600, fontSize:13 }}>{a.doctorName}</div>
                        <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.doctorSpecialization}</div>
                      </td>
                      <td style={{ fontSize:13 }}>{formatDateTime(a.appointmentDateTime)}</td>
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
