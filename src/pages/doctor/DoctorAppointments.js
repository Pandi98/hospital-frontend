import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingCenter, Alert, SearchBar, Pagination, EmptyState,
         SectionHeader, ConfirmModal } from '../../components/common';
import { doctorAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';
import { formatDateTime, statusBadge } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function DoctorAppointments() {

  
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [completeConfirm, setCompleteConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState('');
  const { loading, error, execute, clearError } = useApi();
  const navigate=useNavigate();

  const byStatus = filterStatus === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  const { query, setQuery, filtered } = useSearch(byStatus, ['patientName', 'status', 'reason']);
  const { page, totalPages, pageItems, goTo, reset } = usePagination(filtered, 8);

  // 
  const load = useCallback(async () => {
  try {
    const response = await doctorAPI.getMyAppointments();
   // console.log("Doctor Appointments Response:", response);
    console.log("FULL RESPONSE:", response.data);
    console.log("APPOINTMENTS:", response.data.data);

    setAppointments(response.data.data || []);
  } catch (err) {
    console.log("Doctor Appointments Error:", err);
  }
}, []);

  useEffect(() => { load(); }, [load]);

  const handleComplete = async () => {
    await execute(
      () => doctorAPI.completeAppointment(completeConfirm.id),
      () => {
        load();
        setCompleteConfirm({ open: false, id: null });
        showToast('Appointment marked as completed!');
      }
    );
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const counts = {
    ALL:         appointments.length,
    SCHEDULED:   appointments.filter(a => a.status === 'SCHEDULED').length,
    IN_PROGRESS: appointments.filter(a => a.status === 'IN_PROGRESS').length,
    COMPLETED:   appointments.filter(a => a.status === 'COMPLETED').length,
    CANCELLED:   appointments.filter(a => a.status === 'CANCELLED').length,
  };

  return (
    <DashboardLayout title="My Appointments">
      {toast && (
        <div style={{
          position:'fixed', top:20, right:24, background:'var(--success)', color:'white',
          borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600,
          zIndex:9999, boxShadow:'var(--shadow-lg)', animation:'slideUp .2s ease'
        }}>
          <i className="bi bi-check-circle" style={{ marginRight:8 }} />{toast}
        </div>
      )}

      <SectionHeader
        title="My Appointments"
        subtitle={`${appointments.length} total assigned`}
      />
      <Alert type="danger" message={error} onClose={clearError} />

      {/* Status filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {['ALL','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => (
          <button key={s}
            onClick={() => { setFilterStatus(s); reset(); }}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-outline'}`}>
            {s.replace('_',' ')}
            <span style={{ opacity:.7, marginLeft:4 }}>({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className="card animate-in">
        <div className="card-header">
          <SearchBar
            value={query}
            onChange={(v) => { setQuery(v); reset(); }}
            placeholder="Search by patient, reason…"
          />
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{filtered.length} results</span>
        </div>

        {loading ? <LoadingCenter /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient ID</th>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr>

                      


                    <td colSpan={7}>
                      <EmptyState
                        icon="bi-calendar2-x"
                        title="No appointments found"
                        description="Your appointments will appear here once scheduled"
                      />
                    </td>
                  </tr>
                  
                ) : pageItems.map(a => {
                  console.log("Appointment Row:", a);

  return (
                  <tr key={a.id}>
                    <td style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12 }}>#{a.id}</td>
                    <td>{a.patientId}</td>
                    <td>
                      <div style={{ fontWeight:700, fontSize:13 }}>{a.patientName}</div>
                    </td>
                    <td style={{ fontSize:12 }}>{formatDateTime(a.appointmentDateTime)}</td>
                    <td style={{
                      fontSize:12, color:'var(--text-muted)',
                      maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                    }}>
                      {a.reason || '—'}
                    </td>
                    <td style={{
                      fontSize:12, color:'var(--text-muted)',
                      maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'
                    }}>
                      {a.notes || '—'}
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                    </td>

  <td>
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

    <button
      className="btn btn-info btn-sm"
      onClick={() => {
        console.log("Patient ID:", a.patientId);
        navigate(`/doctor/history/${a.patientId}`);
      }}
      
    >
      <i className="bi bi-clock-history"></i> History
    </button>

    {(a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS') && (
      <button
        className="btn btn-success btn-sm"
        onClick={() =>
          setCompleteConfirm({
            open: true,
            id: a.id
          })
        }
      >
        <i className="bi bi-check2-circle"></i> Complete
      </button>
    )}

  </div>
  
</td>                </tr>
  );
})}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:'0 16px 16px' }}>
          <Pagination page={page} totalPages={totalPages} onGoTo={goTo} />
        </div>
      </div>

      <ConfirmModal
        open={completeConfirm.open}
        title="Complete Appointment"
        message="Mark this appointment as completed? Make sure you have added the prescription before completing."
        onConfirm={handleComplete}
        onCancel={() => setCompleteConfirm({ open:false, id:null })}
        loading={loading}
      />
    </DashboardLayout>
  );
}
