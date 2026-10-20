import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingCenter, Alert, SearchBar, Pagination, Modal, ConfirmModal,
         EmptyState, Avatar, FormField, FormRow, SectionHeader, Spinner } from '../../components/common';
import { adminAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';

const EMPTY_FORM = {
  fullName:'', email:'', password:'', phone:'',
  specialization:'', qualification:'', experienceYears:'',
  licenseNumber:'', department:'', consultationFee:'',
};

function validate(form, isEdit) {
  const e = {};
  if (!form.fullName)        e.fullName = 'Required';
  if (!form.email)           e.email    = 'Required';
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
  if (!isEdit && !form.password) e.password = 'Required';
  if (!isEdit && form.password && form.password.length < 6) e.password = 'Min 6 chars';
  if (!form.phone)           e.phone    = 'Required';
  if (!form.specialization)  e.specialization = 'Required';
  if (!form.qualification)   e.qualification  = 'Required';
  if (!form.licenseNumber)   e.licenseNumber  = 'Required';
  if (form.experienceYears === '' || form.experienceYears < 0) e.experienceYears = 'Required';
  return e;
}

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [modal, setModal]     = useState({ open:false, mode:'add', doctor:null });
  const [confirm, setConfirm] = useState({ open:false, id:null });
  const [form, setForm]       = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast]     = useState('');
  const { loading, error, execute, clearError } = useApi();
  const { query, setQuery, filtered } = useSearch(doctors, ['user.fullName','specialization','department','licenseNumber']);
  const { page, totalPages, pageItems, goTo, reset } = usePagination(filtered, 8);

  const loadDoctors = useCallback(() => {
    execute(adminAPI.getAllDoctors, (data) => setDoctors(data || []));
  }, [execute]);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  const openAdd  = () => { setForm(EMPTY_FORM); setFormErrors({}); setModal({ open:true, mode:'add',  doctor:null }); };
  const openEdit = (d) => {
    setForm({
      fullName: d.fullName, email: d.email, password:'', phone: d.phone,
      specialization: d.specialization, qualification: d.qualification,
      experienceYears: d.experienceYears, licenseNumber: d.licenseNumber,
      department: d.department||'', consultationFee: d.consultationFee||'',
    });
    setFormErrors({});
    setModal({ open:true, mode:'edit', doctor:d });
  };
  const closeModal = () => setModal(m => ({ ...m, open:false }));

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setFormErrors(er => ({ ...er, [field]:'' }));
  };

  const handleSave = async () => {
    const isEdit = modal.mode === 'edit';
    const e = validate(form, isEdit);
    if (Object.keys(e).length) { setFormErrors(e); return; }

    const payload = isEdit
      ? { fullName:form.fullName, phone:form.phone, specialization:form.specialization,
          qualification:form.qualification, experienceYears:Number(form.experienceYears),
          department:form.department, consultationFee:form.consultationFee }
      : { ...form, experienceYears:Number(form.experienceYears) };

    const apiCall = isEdit
      ? () => adminAPI.updateDoctor(modal.doctor.id, payload)
      : () => adminAPI.addDoctor(payload);

    await execute(apiCall, () => {
      loadDoctors();
      closeModal();
      showToast(isEdit ? 'Doctor updated!' : 'Doctor added!');
    });
  };

  const handleDelete = async () => {
    await execute(() => adminAPI.deleteDoctor(confirm.id), () => {
      loadDoctors();
      setConfirm({ open:false, id:null });
      showToast('Doctor removed.');
    });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  return (
    <DashboardLayout title="Doctor Management">
      {toast && (
        <div style={{ position:'fixed', top:20, right:24, background:'var(--primary)', color:'white',
          borderRadius:12, padding:'12px 20px', fontSize:13, fontWeight:600, zIndex:9999, boxShadow:'var(--shadow-lg)',
          animation:'slideUp .2s ease' }}>
          <i className="bi bi-check-circle me-2" /> {toast}
        </div>
      )}

      <SectionHeader
        title="Doctors"
        subtitle={`${doctors.length} registered`}
        action={<button className="btn btn-accent" onClick={openAdd}><i className="bi bi-plus-lg" /> Add Doctor</button>}
      />

      <Alert type="danger" message={error} onClose={clearError} />

      <div className="card animate-in-2">
        <div className="card-header">
          <SearchBar value={query} onChange={(v) => { setQuery(v); reset(); }} placeholder="Search doctors…" />
          <span style={{ fontSize:12, color:'var(--text-muted)' }}>{filtered.length} results</span>
        </div>
        {loading ? <LoadingCenter /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Specialization</th><th>Department</th><th>License</th><th>Exp.</th><th>Fee</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon="bi-person-badge" title="No doctors found" /></td></tr>
                ) : pageItems.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <Avatar name={d.fullName} size="sm" />
                        <div>
                          <div style={{ fontWeight:700, fontSize:13 }}>{d.fullName}</div>
                          <div style={{ fontSize:11, color:'var(--text-muted)' }}>{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{d.specialization}</td>
                    <td>{d.department || '—'}</td>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{d.licenseNumber}</td>
                    <td>{d.experienceYears}y</td>
                    <td>{d.consultationFee ? `₹${d.consultationFee}` : '—'}</td>
                    <td>
                      <span className={`badge ${d.available ? 'badge-success' : 'badge-danger'}`}>
                        {d.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button className="btn btn-outline btn-sm btn-icon" onClick={() => openEdit(d)} title="Edit">
                          <i className="bi bi-pencil" />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={() => setConfirm({ open:true, id:d.id })} title="Delete">
                          <i className="bi bi-trash" />
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
      <Modal open={modal.open} title={modal.mode==='add' ? 'Add New Doctor' : 'Edit Doctor'}
        onClose={closeModal} size="lg"
        footer={
          <>
            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
            <button className="btn btn-accent" onClick={handleSave} disabled={loading}>
              {loading ? <><Spinner small /> Saving…</> : <><i className="bi bi-check-lg" /> {modal.mode==='add'?'Add Doctor':'Save Changes'}</>}
            </button>
          </>
        }
      >
        <Alert type="danger" message={error} onClose={clearError} />
        <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
          <FormRow>
            <FormField label="Full Name" error={formErrors.fullName} required>
              <input className={`form-control ${formErrors.fullName?'is-invalid':''}`}
                value={form.fullName} onChange={set('fullName')} placeholder="Dr. John Smith" />
            </FormField>
            <FormField label="Email" error={formErrors.email} required>
              <input type="email" className={`form-control ${formErrors.email?'is-invalid':''}`}
                value={form.email} onChange={set('email')} placeholder="doctor@hospital.com"
                disabled={modal.mode==='edit'} />
            </FormField>
          </FormRow>
          {modal.mode==='add' && (
            <FormRow>
              <FormField label="Password" error={formErrors.password} required>
                <input type="password" className={`form-control ${formErrors.password?'is-invalid':''}`}
                  value={form.password} onChange={set('password')} placeholder="Min 6 characters" />
              </FormField>
              <FormField label="Phone" error={formErrors.phone} required>
                <input className={`form-control ${formErrors.phone?'is-invalid':''}`}
                  value={form.phone} onChange={set('phone')} placeholder="+91 9999999999" />
              </FormField>
            </FormRow>
          )}
          {modal.mode==='edit' && (
            <FormField label="Phone" error={formErrors.phone} required>
              <input className={`form-control ${formErrors.phone?'is-invalid':''}`}
                value={form.phone} onChange={set('phone')} />
            </FormField>
          )}
          <FormRow>
            <FormField label="Specialization" error={formErrors.specialization} required>
              <input className={`form-control ${formErrors.specialization?'is-invalid':''}`}
                value={form.specialization} onChange={set('specialization')} placeholder="Cardiology" />
            </FormField>
            <FormField label="Qualification" error={formErrors.qualification} required>
              <input className={`form-control ${formErrors.qualification?'is-invalid':''}`}
                value={form.qualification} onChange={set('qualification')} placeholder="MBBS, MD" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="License Number" error={formErrors.licenseNumber} required>
              <input className={`form-control ${formErrors.licenseNumber?'is-invalid':''}`}
                value={form.licenseNumber} onChange={set('licenseNumber')} placeholder="MCI-12345" />
            </FormField>
            <FormField label="Experience (Years)" error={formErrors.experienceYears} required>
              <input type="number" min="0" className={`form-control ${formErrors.experienceYears?'is-invalid':''}`}
                value={form.experienceYears} onChange={set('experienceYears')} placeholder="5" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Department">
              <input className="form-control" value={form.department} onChange={set('department')} placeholder="Cardiology Dept." />
            </FormField>
            <FormField label="Consultation Fee (₹)">
              <input className="form-control" value={form.consultationFee} onChange={set('consultationFee')} placeholder="500" />
            </FormField>
          </FormRow>
        </div>
      </Modal>

      <ConfirmModal
        open={confirm.open}
        title="Remove Doctor"
        message="Are you sure you want to deactivate this doctor? This action will mark them as unavailable."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open:false, id:null })}
        loading={loading}
        danger
      />
    </DashboardLayout>
  );
}
