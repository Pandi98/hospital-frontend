import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingCenter, Alert, SearchBar, Pagination, Modal, EmptyState,
         Avatar, FormField, FormRow, SectionHeader, Spinner } from '../../components/common';
import { receptionistAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/helpers';

const EMPTY = {
  fullName:'', email:'', phone:'', dateOfBirth:'', gender:'Male',
  address:'', bloodGroup:'', allergies:'', medicalHistory:'',
  emergencyContactName:'', emergencyContactPhone:'',
};

function validate(f) {
  const e = {};
  if (!f.fullName)    e.fullName    = 'Required';
  if (!f.email)       e.email       = 'Required';
  else if (!/\S+@\S+\.\S+/.test(f.email)) e.email = 'Invalid email';
  if (!f.phone)       e.phone       = 'Required';
  if (!f.dateOfBirth) e.dateOfBirth = 'Required';
  if (!f.gender)      e.gender      = 'Required';
  return e;
}

export default function ReceptionistPatients() {
  const [patients, setPatients] = useState([]);
  const [modal, setModal]       = useState({ open:false, mode:'add', patient:null });
  const [viewModal, setViewModal] = useState({ open:false, patient:null });
  const [form, setForm]         = useState(EMPTY);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast]       = useState('');
  const { loading, error, execute, clearError } = useApi();
  const { query, setQuery, filtered } = useSearch(patients, ['fullName','email','phone','bloodGroup','gender']);
  const { page, totalPages, pageItems, goTo, reset } = usePagination(filtered, 8);

  const load = useCallback(() => {
    execute(receptionistAPI.getAllPatients, (data) => setPatients(data || []));
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(EMPTY); setFormErrors({}); setModal({ open:true, mode:'add', patient:null }); };
  const openEdit = (p) => {
    setForm({
      fullName: p.fullName, email: p.email, phone: p.phone,
      dateOfBirth: p.dateOfBirth, gender: p.gender,
      address: p.address||'', bloodGroup: p.bloodGroup||'',
      allergies: p.allergies||'', medicalHistory: p.medicalHistory||'',
      emergencyContactName: p.emergencyContactName||'',
      emergencyContactPhone: p.emergencyContactPhone||'',
    });
    setFormErrors({});
    setModal({ open:true, mode:'edit', patient:p });
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFormErrors(er => ({ ...er, [field]:'' }));
  };

  const handleSave = async () => {
    const e = validate(form);
    if (Object.keys(e).length) { setFormErrors(e); return; }
    const apiCall = modal.mode === 'add'
      ? () => receptionistAPI.registerPatient(form)
      : () => receptionistAPI.updatePatient(modal.patient.id, form);
    await execute(apiCall, () => {
      load(); setModal(m => ({ ...m, open:false }));
      showToast(modal.mode==='add' ? 'Patient registered!' : 'Patient updated!');
    });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <DashboardLayout title="Patient Management">
      {toast && (
        <div style={{ position:'fixed', top:20, right:24, background:'var(--primary)', color:'white',
          borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600, zIndex:9999, boxShadow:'var(--shadow-lg)' }}>
          <i className="bi bi-check-circle" style={{ marginRight:8 }} />{toast}
        </div>
      )}

      <SectionHeader
        title="Patients"
        subtitle={`${patients.length} registered`}
        action={<button className="btn btn-accent" onClick={openAdd}><i className="bi bi-plus-lg" /> Register Patient</button>}
      />
      <Alert type="danger" message={error} onClose={clearError} />

      <div className="card animate-in">
        <div className="card-header">
          <SearchBar value={query} onChange={(v) => { setQuery(v); reset(); }} placeholder="Search patients…" />
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{filtered.length} results</span>
        </div>

        {loading ? <LoadingCenter /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Patient</th><th>Phone</th><th>DOB</th><th>Gender</th><th>Blood</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={6}><EmptyState icon="bi-people" title="No patients yet" description="Register your first patient" /></td></tr>
                ) : pageItems.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={p.fullName} size="sm" />
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{p.fullName}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{p.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize:13 }}>{p.phone}</td>
                    <td style={{ fontSize:13 }}>{formatDate(p.dateOfBirth)}</td>
                    <td style={{ fontSize:13, textTransform:'capitalize' }}>{p.gender}</td>
                    <td>{p.bloodGroup ? <span className="badge badge-danger">{p.bloodGroup}</span> : '—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => setViewModal({ open:true, patient:p })}>
                          <i className="bi bi-eye" />
                        </button>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(p)}>
                          <i className="bi bi-pencil" />
                        </button>
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

      {/* Add/Edit Modal */}
      <Modal open={modal.open} title={modal.mode==='add'?'Register Patient':'Edit Patient'}
        onClose={() => setModal(m => ({ ...m, open:false }))} size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(m => ({ ...m, open:false }))}>Cancel</button>
            <button className="btn btn-accent" onClick={handleSave} disabled={loading}>
              {loading ? <><Spinner small /> Saving…</> : modal.mode==='add' ? 'Register Patient' : 'Save Changes'}
            </button>
          </>
        }
      >
        <Alert type="danger" message={error} onClose={clearError} />
        <FormRow>
          <FormField label="Full Name" error={formErrors.fullName} required>
            <input className={`form-control ${formErrors.fullName?'is-invalid':''}`}
              value={form.fullName} onChange={set('fullName')} placeholder="Jane Doe" />
          </FormField>
          <FormField label="Email" error={formErrors.email} required>
            <input type="email" className={`form-control ${formErrors.email?'is-invalid':''}`}
              value={form.email} onChange={set('email')} disabled={modal.mode==='edit'} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Phone" error={formErrors.phone} required>
            <input className={`form-control ${formErrors.phone?'is-invalid':''}`}
              value={form.phone} onChange={set('phone')} />
          </FormField>
          <FormField label="Date of Birth" error={formErrors.dateOfBirth} required>
            <input type="date" className={`form-control ${formErrors.dateOfBirth?'is-invalid':''}`}
              value={form.dateOfBirth} onChange={set('dateOfBirth')} max={new Date().toISOString().split('T')[0]} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Gender" error={formErrors.gender} required>
            <select className="form-select" value={form.gender} onChange={set('gender')}>
              {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
            </select>
          </FormField>
          <FormField label="Blood Group">
            <select className="form-select" value={form.bloodGroup} onChange={set('bloodGroup')}>
              <option value="">Select…</option>
              {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b}>{b}</option>)}
            </select>
          </FormField>
        </FormRow>
        <FormField label="Address">
          <textarea className="form-control" rows={2} value={form.address} onChange={set('address')} />
        </FormField>
        <FormRow>
          <FormField label="Allergies">
            <input className="form-control" value={form.allergies} onChange={set('allergies')} placeholder="Penicillin, Pollen…" />
          </FormField>
          <FormField label="Emergency Contact Name">
            <input className="form-control" value={form.emergencyContactName} onChange={set('emergencyContactName')} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField label="Emergency Contact Phone">
            <input className="form-control" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} />
          </FormField>
          <FormField label="Medical History">
            <input className="form-control" value={form.medicalHistory} onChange={set('medicalHistory')} placeholder="Diabetes, Hypertension…" />
          </FormField>
        </FormRow>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal.open} title="Patient Details" onClose={() => setViewModal({ open:false, patient:null })}>
        {viewModal.patient && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              ['Name',      viewModal.patient.fullName],
              ['Email',     viewModal.patient.email],
              ['Phone',     viewModal.patient.phone],
              ['DOB',       formatDate(viewModal.patient.dateOfBirth)],
              ['Gender',    viewModal.patient.gender],
              ['Blood',     viewModal.patient.bloodGroup||'—'],
              ['Allergies', viewModal.patient.allergies||'—'],
              ['Medical History', viewModal.patient.medicalHistory||'—'],
              ['Emergency', viewModal.patient.emergencyContactName ? `${viewModal.patient.emergencyContactName} (${viewModal.patient.emergencyContactPhone})` : '—'],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', gap:12, borderBottom:'1px solid var(--border)', paddingBottom:10 }}>
                <div style={{ width:130, fontSize:12, fontWeight:700, color:'var(--text-muted)', flexShrink:0 }}>{l}</div>
                <div style={{ fontSize:13 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
