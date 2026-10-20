import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { LoadingCenter, Alert, SearchBar, Pagination, EmptyState,
         Avatar, Modal, SectionHeader } from '../../components/common';
import { adminAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/helpers';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [viewModal, setViewModal] = useState({ open:false, patient:null });
  const { loading, error, execute, clearError } = useApi();
  const { query, setQuery, filtered } = useSearch(patients, ['fullName','email','phone','bloodGroup']);
  const { page, totalPages, pageItems, goTo, reset } = usePagination(filtered, 10);

  const load = useCallback(() => {
    execute(adminAPI.getAllPatients, (data) => setPatients(data || []));
  }, [execute]);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout title="Patient Records">
      <SectionHeader title="All Patients" subtitle={`${patients.length} registered patients`} />
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
                <tr><th>Patient</th><th>Phone</th><th>DOB</th><th>Gender</th><th>Blood Group</th><th>Registered</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pageItems.length === 0 ? (
                  <tr><td colSpan={7}><EmptyState icon="bi-people" title="No patients found" /></td></tr>
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
                    <td><span style={{ textTransform:'capitalize', fontSize:13 }}>{p.gender}</span></td>
                    <td>
                      {p.bloodGroup
                        ? <span className="badge badge-danger">{p.bloodGroup}</span>
                        : <span style={{ color:'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-muted)' }}>{formatDate(p.createdAt)}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => setViewModal({ open:true, patient:p })}>
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

      {/* View Patient Modal */}
      <Modal open={viewModal.open} title="Patient Details" onClose={() => setViewModal({ open:false, patient:null })}>
        {viewModal.patient && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, paddingBottom:16, borderBottom:'1px solid var(--border)' }}>
              <Avatar name={viewModal.patient.fullName} />
              <div>
                <div style={{ fontWeight:800, fontSize:17 }}>{viewModal.patient.fullName}</div>
                <div style={{ color:'var(--text-muted)', fontSize:13 }}>{viewModal.patient.email}</div>
              </div>
            </div>
            {[
              ['Phone', viewModal.patient.phone],
              ['Date of Birth', formatDate(viewModal.patient.dateOfBirth)],
              ['Gender', viewModal.patient.gender],
              ['Blood Group', viewModal.patient.bloodGroup || '—'],
              ['Address', viewModal.patient.address || '—'],
              ['Allergies', viewModal.patient.allergies || '—'],
              ['Medical History', viewModal.patient.medicalHistory || '—'],
              ['Emergency Contact', viewModal.patient.emergencyContactName || '—'],
              ['Emergency Phone', viewModal.patient.emergencyContactPhone || '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ display:'flex', gap:8 }}>
                <div style={{ width:130, fontSize:12, color:'var(--text-muted)', fontWeight:600, flexShrink:0 }}>{label}</div>
                <div style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>{val}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
