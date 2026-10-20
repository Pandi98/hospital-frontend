import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingCenter, Alert, SearchBar, Pagination, EmptyState, Modal,
         FormField, FormRow, SectionHeader, Spinner } from '../../components/common';
import { doctorAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/helpers';

const EMPTY_MED   = { medicineName:'', dosage:'', frequency:'', duration:'', instructions:'' };
const EMPTY_FORM  = { appointmentId:'', diagnosis:'', instructions:'', followUpDate:'', medicines:[{ ...EMPTY_MED }] };

function validatePrescription(form) {
  const e = {};
  if (!form.appointmentId) e.appointmentId = 'Select an appointment';
  if (!form.diagnosis)     e.diagnosis     = 'Diagnosis is required';
  form.medicines.forEach((m, i) => {
    if (!m.medicineName) e[`med_name_${i}`]  = 'Medicine name required';
    if (!m.dosage)       e[`med_dose_${i}`]  = 'Dosage required';
    if (!m.frequency)    e[`med_freq_${i}`]  = 'Frequency required';
    if (!m.duration)     e[`med_dur_${i}`]   = 'Duration required';
  });
  return e;
}

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments,  setAppointments]  = useState([]);
  const [modal, setModal]   = useState({ open:false });
  const [viewModal, setViewModal] = useState({ open:false, prescription:null });
  const [form, setForm]     = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast]   = useState('');
  const { loading, error, execute, clearError } = useApi();
  const { query, setQuery, filtered } = useSearch(prescriptions, ['patientName','doctorName','diagnosis']);
  const { page, totalPages, pageItems, goTo, reset } = usePagination(filtered, 8);

  const load = useCallback(async () => {
    await Promise.all([
      execute(doctorAPI.getMyPrescriptions,  (d) => setPrescriptions(d || [])),
      execute(doctorAPI.getMyAppointments,   (d) => {
        // Only show scheduled/in-progress appointments for new prescriptions
        setAppointments((d || []).filter(a => a.status === 'SCHEDULED' || a.status === 'IN_PROGRESS'));
      }),
    ]);
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  // ── Medicine helpers ───────────────────────────────────────────
  const addMedicine    = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...EMPTY_MED }] }));
  const removeMedicine = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }));
  const setMed = (i, field) => (e) => {
    setForm(f => {
      const meds = [...f.medicines];
      meds[i] = { ...meds[i], [field]: e.target.value };
      return { ...f, medicines: meds };
    });
    setFormErrors(er => ({ ...er, [`med_${field.substring(0,4)}_${i}`]:'' }));
  };
  const setField = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFormErrors(er => ({ ...er, [field]:'' }));
  };

  const handleSubmit = async () => {
    const e = validatePrescription(form);
    if (Object.keys(e).length) { setFormErrors(e); return; }
    await execute(
      () => doctorAPI.addPrescription({ ...form, appointmentId: Number(form.appointmentId) }),
      () => {
        load();
        setModal({ open:false });
        setForm(EMPTY_FORM);
        showToast('Prescription added successfully!');
      }
    );
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <DashboardLayout title="Prescriptions">
      {toast && (
        <div style={{
          position:'fixed', top:20, right:24, background:'var(--success)', color:'white',
          borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600,
          zIndex:9999, boxShadow:'var(--shadow-lg)'
        }}>
          <i className="bi bi-check-circle" style={{ marginRight:8 }} />{toast}
        </div>
      )}

      <SectionHeader
        title="Prescriptions"
        subtitle={`${prescriptions.length} written`}
        action={
          <button className="btn btn-accent" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setModal({ open:true }); }}>
            <i className="bi bi-plus-lg" /> New Prescription
          </button>
        }
      />
      <Alert type="danger" message={error} onClose={clearError} />

      <div className="card animate-in">
        <div className="card-header">
          <SearchBar value={query} onChange={(v) => { setQuery(v); reset(); }} placeholder="Search prescriptions…" />
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{filtered.length} results</span>
        </div>

        {loading ? <LoadingCenter /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Patient</th><th>Diagnosis</th><th>Medicines</th><th>Follow-Up</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState icon="bi-file-earmark-medical" title="No prescriptions yet" description="Add your first prescription" /></td></tr>
                ) : pageItems.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12 }}>#{p.id}</td>
                    <td style={{ fontWeight:700, fontSize:13 }}>{p.patientName}</td>
                    <td style={{ fontSize:13, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.diagnosis || '—'}
                    </td>
                    <td>
                      <span className="badge badge-info">{p.medicines?.length || 0} medicine(s)</span>
                    </td>
                    <td style={{ fontSize:12 }}>{p.followUpDate || '—'}</td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{formatDate(p.createdAt)}</td>
                    <td>
                      <button className="btn btn-outline btn-sm"
                        onClick={() => setViewModal({ open:true, prescription:p })}>
                        <i className="bi bi-eye" /> View
                      </button>
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

      {/* Add Prescription Modal */}
      <Modal open={modal.open} title="New Prescription" onClose={() => setModal({ open:false })} size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal({ open:false })}>Cancel</button>
            <button className="btn btn-accent" onClick={handleSubmit} disabled={loading}>
              {loading ? <><Spinner small /> Saving…</> : <><i className="bi bi-file-earmark-plus" /> Save Prescription</>}
            </button>
          </>
        }
      >
        <Alert type="danger" message={error} onClose={clearError} />

        <FormField label="Appointment" error={formErrors.appointmentId} required>
          <select className={`form-select ${formErrors.appointmentId?'is-invalid':''}`}
            value={form.appointmentId} onChange={setField('appointmentId')}>
            <option value="">Select appointment…</option>
            {appointments.map(a => (
              <option key={a.id} value={a.id}>
                #{a.id} — {a.patientName} ({new Date(a.appointmentDateTime).toLocaleDateString()})
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Diagnosis" error={formErrors.diagnosis} required>
          <textarea className={`form-control ${formErrors.diagnosis?'is-invalid':''}`}
            rows={2} value={form.diagnosis} onChange={setField('diagnosis')}
            placeholder="Patient diagnosis…" />
        </FormField>

        <FormRow>
          <FormField label="Instructions">
            <textarea className="form-control" rows={2} value={form.instructions}
              onChange={setField('instructions')} placeholder="Special instructions…" />
          </FormField>
          <FormField label="Follow-Up Date">
            <input type="date" className="form-control" value={form.followUpDate}
              onChange={setField('followUpDate')} min={new Date().toISOString().split('T')[0]} />
          </FormField>
        </FormRow>

        {/* Medicines */}
        <div style={{ marginTop:8 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <label className="form-label" style={{ margin:0, fontSize:13, fontWeight:700 }}>
              Medicines *
            </label>
            <button type="button" className="btn btn-outline btn-sm" onClick={addMedicine}>
              <i className="bi bi-plus" /> Add Medicine
            </button>
          </div>

          {form.medicines.map((med, i) => (
            <div key={i} style={{
              background:'var(--surface-2)', borderRadius:10, padding:16, marginBottom:12,
              border:'1px solid var(--border)', position:'relative'
            }}>
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12
              }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)' }}>
                  Medicine #{i + 1}
                </span>
                {form.medicines.length > 1 && (
                  <button type="button" className="btn btn-danger btn-sm btn-icon"
                    onClick={() => removeMedicine(i)}>
                    <i className="bi bi-trash" />
                  </button>
                )}
              </div>

              <FormRow>
                <FormField label="Medicine Name" error={formErrors[`med_name_${i}`]} required>
                  <input className={`form-control ${formErrors[`med_name_${i}`]?'is-invalid':''}`}
                    value={med.medicineName} onChange={setMed(i,'medicineName')}
                    placeholder="Paracetamol 500mg" />
                </FormField>
                <FormField label="Dosage" error={formErrors[`med_dose_${i}`]} required>
                  <input className={`form-control ${formErrors[`med_dose_${i}`]?'is-invalid':''}`}
                    value={med.dosage} onChange={setMed(i,'dosage')}
                    placeholder="1 tablet" />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField label="Frequency" error={formErrors[`med_freq_${i}`]} required>
                  <select className={`form-select ${formErrors[`med_freq_${i}`]?'is-invalid':''}`}
                    value={med.frequency} onChange={setMed(i,'frequency')}>
                    <option value="">Select…</option>
                    {['Once daily','Twice daily','Three times daily','Four times daily',
                      'Every 4 hours','Every 6 hours','Every 8 hours','As needed'].map(f =>
                      <option key={f} value={f}>{f}</option>
                    )}
                  </select>
                </FormField>
                <FormField label="Duration" error={formErrors[`med_dur_${i}`]} required>
                  <input className={`form-control ${formErrors[`med_dur_${i}`]?'is-invalid':''}`}
                    value={med.duration} onChange={setMed(i,'duration')}
                    placeholder="5 days" />
                </FormField>
              </FormRow>
              <FormField label="Instructions (optional)">
                <input className="form-control" value={med.instructions}
                  onChange={setMed(i,'instructions')} placeholder="After meals, with water…" />
              </FormField>
            </div>
          ))}
        </div>
      </Modal>

      {/* View Prescription Modal */}
      <Modal open={viewModal.open} title="Prescription Details" size="lg"
        onClose={() => setViewModal({ open:false, prescription:null })}>
        {viewModal.prescription && (
          <div>
            <div style={{
              display:'grid', gridTemplateColumns:'1fr 1fr', gap:16,
              background:'var(--surface-2)', borderRadius:10, padding:16, marginBottom:20,
              border:'1px solid var(--border)'
            }}>
              {[
                ['Patient',   viewModal.prescription.patientName],
                ['Doctor',    viewModal.prescription.doctorName],
                ['Diagnosis', viewModal.prescription.diagnosis || '—'],
                ['Follow-Up', viewModal.prescription.followUpDate || '—'],
                ['Instructions', viewModal.prescription.instructions || '—'],
                ['Date', formatDate(viewModal.prescription.createdAt)],
              ].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>{l}</div>
                  <div style={{ fontSize:13, fontWeight:600, marginTop:3 }}>{v}</div>
                </div>
              ))}
            </div>

            <h6 style={{ fontWeight:700, marginBottom:12, fontSize:13 }}>
              <i className="bi bi-capsule" style={{ marginRight:6 }} />
              Medicines ({viewModal.prescription.medicines?.length || 0})
            </h6>
            {(viewModal.prescription.medicines || []).map((m, i) => (
              <div key={i} style={{
                border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:10,
                background:'white'
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{
                    background:'var(--accent)', color:'white', borderRadius:6,
                    padding:'2px 8px', fontSize:11, fontWeight:700
                  }}>#{i+1}</span>
                  <span style={{ fontWeight:700, fontSize:14 }}>{m.medicineName}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                  {[['Dosage',m.dosage],['Frequency',m.frequency],['Duration',m.duration]].map(([l,v]) => (
                    <div key={l}>
                      <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase' }}>{l}</div>
                      <div style={{ fontSize:12, fontWeight:600, marginTop:2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                {m.instructions && (
                  <div style={{ marginTop:8, fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>
                    Note: {m.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
