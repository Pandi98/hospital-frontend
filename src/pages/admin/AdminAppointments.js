import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingCenter, Alert, SearchBar, Pagination, EmptyState,
         SectionHeader } from '../../components/common';
import { adminAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';
import { formatDateTime, statusBadge } from '../../utils/helpers';

const STATUS_COLORS = { SCHEDULED:'badge-info', IN_PROGRESS:'badge-warning', COMPLETED:'badge-success', CANCELLED:'badge-danger' };

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { loading, error, execute, clearError } = useApi();

  const byStatus = filterStatus === 'ALL'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  const { query, setQuery, filtered } = useSearch(byStatus, ['patientName','doctorName','doctorSpecialization']);
  const { page, totalPages, pageItems, goTo, reset } = usePagination(filtered, 10);

  const load = useCallback(() => {
    execute(adminAPI.getAllAppointments, (data) => setAppointments(data || []));
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    ALL: appointments.length,
    SCHEDULED:   appointments.filter(a=>a.status==='SCHEDULED').length,
    IN_PROGRESS: appointments.filter(a=>a.status==='IN_PROGRESS').length,
    COMPLETED:   appointments.filter(a=>a.status==='COMPLETED').length,
    CANCELLED:   appointments.filter(a=>a.status==='CANCELLED').length,
  };

  return (
    <DashboardLayout title="Appointments">
      <SectionHeader title="All Appointments" subtitle={`${appointments.length} total`} />
      <Alert type="danger" message={error} onClose={clearError} />

      {/* Status filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {['ALL','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); reset(); }}
            className={`btn btn-sm ${filterStatus===s ? 'btn-primary' : 'btn-outline'}`}>
            {s.replace('_',' ')} <span style={{ opacity:.7 }}>({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className="card animate-in">
        <div className="card-header">
          <SearchBar value={query} onChange={(v) => { setQuery(v); reset(); }} placeholder="Search appointments…" />
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{filtered.length} results</span>
        </div>

        {loading ? <LoadingCenter /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Patient</th><th>Doctor</th><th>Specialization</th><th>Date & Time</th><th>Reason</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState icon="bi-calendar2-x" title="No appointments found" /></td></tr>
                ) : pageItems.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12 }}>#{a.id}</td>
                    <td style={{ fontWeight:600, fontSize:13 }}>{a.patientName}</td>
                    <td style={{ fontWeight:600, fontSize:13 }}>{a.doctorName}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{a.doctorSpecialization}</td>
                    <td style={{ fontSize:12 }}>{formatDateTime(a.appointmentDateTime)}</td>
                    <td style={{ fontSize:12, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.reason || '—'}
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding:'0 16px 16px' }}>
          <Pagination page={page} totalPages={totalPages} onGoTo={goTo} />
        </div>
      </div>
    </DashboardLayout>
  );
}
