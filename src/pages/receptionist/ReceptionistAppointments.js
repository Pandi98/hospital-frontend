import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingCenter, Alert, SearchBar, Pagination, Modal, EmptyState,
         FormField, FormRow, SectionHeader, Spinner, ConfirmModal } from '../../components/common';
import { receptionistAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';
import { formatDateTime, statusBadge, nowDateTimeLocal } from '../../utils/helpers';

const EMPTY_BOOK = { patientId:'', doctorId:'', appointmentDateTime:'', reason:'', notes:'' };

export default function ReceptionistAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients]         = useState([]);
  const [doctors,  setDoctors]          = useState([]);
  const [modal, setModal]   = useState({ open:false });
  const [assignModal, setAssignModal] = useState({ open:false, appointment:null, doctorId:'' });
  const [cancelConfirm, setCancelConfirm] = useState({ open:false, id:null });
  const [form, setForm]     = useState(EMPTY_BOOK);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast]   = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const { loading, error, execute, clearError } = useApi();

  const byStatus = filterStatus === 'ALL' ? appointments : appointments.filter(a => a.status === filterStatus);
  const { query, setQuery, filtered } = useSearch(byStatus, ['patientName','doctorName','status']);
  const { page, totalPages, pageItems, goTo, reset } = usePagination(filtered, 8);

  const loadAll = useCallback(async () => {
    await Promise.all([
      execute(receptionistAPI.getAllAppointments, (d) => setAppointments(d||[])),
      execute(receptionistAPI.getAllPatients,     (d) => setPatients(d||[])),
      execute(receptionistAPI.getAvailableDoctors,(d) => setDoctors(d||[])),
    ]);
  }, [execute]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const validate = () => {
    const e = {};
    if (!form.patientId)         e.patientId = 'Select a patient';
    if (!form.doctorId)          e.doctorId  = 'Select a doctor';
    if (!form.appointmentDateTime) e.appointmentDateTime = 'Select date & time';
    return e;
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFormErrors(er => ({ ...er, [field]:'' }));
  };

  const handleBook = async () => {
    const e = validate();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    await execute(
      () => receptionistAPI.bookAppointment({ ...form, patientId:Number(form.patientId), doctorId:Number(form.doctorId) }),
      () => { loadAll(); setModal({ open:false }); setForm(EMPTY_BOOK); showToast('Appointment booked!'); }
    );
  };

  const handleAssign = async () => {
    if (!assignModal.doctorId) return;
    await execute(
      () => receptionistAPI.assignDoctor(assignModal.appointment.id, Number(assignModal.doctorId)),
      () => { loadAll(); setAssignModal({ open:false, appointment:null, doctorId:'' }); showToast('Doctor assigned!'); }
    );
  };

  const handleCancel = async () => {
    await execute(
      () => receptionistAPI.cancelAppointment(cancelConfirm.id),
      () => { loadAll(); setCancelConfirm({ open:false, id:null }); showToast('Appointment cancelled.'); }
    );
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <DashboardLayout title="Appointments">
      {toast && (
        <div style={{ position:'fixed', top:20, right:24, background:'var(--primary)', color:'white',
          borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600, zIndex:9999, boxShadow:'var(--shadow-lg)' }}>
          <i className="bi bi-check-circle" style={{ marginRight:8 }} />{toast}
        </div>
      )}

      <SectionHeader
        title="Appointments"
        subtitle={`${appointments.length} total`}
        action={<button className="btn btn-accent" onClick={() => { setForm(EMPTY_BOOK); setFormErrors({}); setModal({ open:true }); }}>
          <i className="bi bi-plus-lg" /> Book Appointment
        </button>}
      />
      <Alert type="danger" message={error} onClose={clearError} />

      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
        {['ALL','SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED'].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); reset(); }}
            className={`btn btn-sm ${filterStatus===s?'btn-primary':'btn-outline'}`}>
            {s.replace('_',' ')}
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
                <tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="bi-calendar2-x" title="No appointments" /></td></tr>
                ) : pageItems.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight:700, fontSize:13 }}>{a.patientName}</td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:13 }}>{a.doctorName}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{a.doctorSpecialization}</div>
                    </td>
                    <td style={{ fontSize:12 }}>{formatDateTime(a.appointmentDateTime)}</td>
                    <td style={{ fontSize:12, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {a.reason || '—'}
                    </td>
                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {a.status === 'SCHEDULED' && (
                          <>
                            <button className="btn btn-outline btn-sm" title="Reassign doctor"
                              onClick={() => setAssignModal({ open:true, appointment:a, doctorId:'' })}>
                              <i className="bi bi-person-check" />
                            </button>
                            <button className="btn btn-danger btn-sm"
                              onClick={() => setCancelConfirm({ open:true, id:a.id })}>
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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

      {/* Book Modal */}
      <Modal open={modal.open} title="Book Appointment" onClose={() => setModal({ open:false })} size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal({ open:false })}>Cancel</button>
            <button className="btn btn-accent" onClick={handleBook} disabled={loading}>
              {loading ? <><Spinner small /> Booking…</> : 'Book Appointment'}
            </button>
          </>
        }
      >
        <Alert type="danger" message={error} onClose={clearError} />
        <FormRow>
          <FormField label="Patient" error={formErrors.patientId} required>
            <select className={`form-select ${formErrors.patientId?'is-invalid':''}`}
              value={form.patientId} onChange={set('patientId')}>
              <option value="">Select Patient…</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </FormField>
          <FormField label="Doctor" error={formErrors.doctorId} required>
            <select className={`form-select ${formErrors.doctorId?'is-invalid':''}`}
              value={form.doctorId} onChange={set('doctorId')}>
              <option value="">Select Doctor…</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialization}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormField label="Appointment Date & Time" error={formErrors.appointmentDateTime} required>
          <input type="datetime-local" className={`form-control ${formErrors.appointmentDateTime?'is-invalid':''}`}
            value={form.appointmentDateTime} onChange={set('appointmentDateTime')}
            min={nowDateTimeLocal()} />
        </FormField>
        <FormField label="Reason for Visit">
          <textarea className="form-control" rows={2} value={form.reason} onChange={set('reason')}
            placeholder="Brief description of symptoms…" />
        </FormField>
        <FormField label="Additional Notes">
          <textarea className="form-control" rows={2} value={form.notes} onChange={set('notes')} />
        </FormField>
      </Modal>

      {/* Assign Doctor Modal */}
      <Modal open={assignModal.open} title="Reassign Doctor"
        onClose={() => setAssignModal({ open:false, appointment:null, doctorId:'' })}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setAssignModal({ open:false, appointment:null, doctorId:'' })}>Cancel</button>
            <button className="btn btn-accent" onClick={handleAssign} disabled={loading || !assignModal.doctorId}>
              {loading ? <Spinner small /> : 'Assign Doctor'}
            </button>
          </>
        }
      >
        <Alert type="danger" message={error} onClose={clearError} />
        <FormField label="Select New Doctor" required>
          <select className="form-select"
            value={assignModal.doctorId}
            onChange={e => setAssignModal(m => ({ ...m, doctorId: e.target.value }))}>
            <option value="">Choose a doctor…</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName} — {d.specialization}</option>)}
          </select>
        </FormField>
      </Modal>

      <ConfirmModal
        open={cancelConfirm.open}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This cannot be undone."
        onConfirm={handleCancel}
        onCancel={() => setCancelConfirm({ open:false, id:null })}
        loading={loading}
        danger
      />
    </DashboardLayout>
  );
}
