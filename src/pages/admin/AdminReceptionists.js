import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  LoadingCenter,
  Alert,
  SearchBar,
  Pagination,
  Modal,
  ConfirmModal,
  EmptyState,
  Avatar,
  FormField,
  FormRow,
  SectionHeader,
  Spinner
} from '../../components/common';

import { adminAPI } from '../../api';
import { useSearch, usePagination, useApi } from '../../hooks/useApi';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  phone: ''
};

function validate(form, isEdit) {
  const e = {};

  if (!form.fullName) e.fullName = 'Required';

  if (!form.email) e.email = 'Required';
  else if (!/\S+@\S+\.\S+/.test(form.email))
    e.email = 'Invalid email';

  if (!isEdit && !form.password)
    e.password = 'Required';

  if (!isEdit && form.password.length < 6)
    e.password = 'Min 6 chars';

  if (!form.phone)
    e.phone = 'Required';

  return e;
}

export default function AdminReceptionists() {

  const [receptionists, setReceptionists] = useState([]);
  const [modal, setModal] = useState({ open: false, mode: 'add', receptionist: null  });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState('');
  const { loading, error, execute, clearError } = useApi();

  const {
    query,
    setQuery,
    filtered
  } = useSearch(
    receptionists,
    ['fullName', 'email', 'phone']
  );

  const {
    page,
    totalPages,
    pageItems,
    goTo,
    reset
  } = usePagination(filtered, 8);

  const loadReceptionists = useCallback(() => {
    execute(
      adminAPI.getAllReceptionists,
      (data) => setReceptionists(data || [])
    );
  }, [execute]);

  useEffect(() => {
    loadReceptionists();
  }, [loadReceptionists]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setModal({
      open: true,
      mode: 'add',
      receptionist: null
    });
  };

  const openEdit = (r) => {
    setForm({
      fullName: r.fullName,
      email: r.email,
      password: '',
      phone: r.phone
    });

    setFormErrors({});

    setModal({
      open: true,
      mode: 'edit',
      receptionist: r
    });
  };

  const closeModal = () =>
    setModal(m => ({ ...m, open: false }));

  const set = (field) => (e) => {
    setForm(f => ({
      ...f,
      [field]: e.target.value
    }));

    setFormErrors(er => ({
      ...er,
      [field]: ''
    }));
  };

  const handleSave = async () => {

    const isEdit = modal.mode === 'edit';

    const e = validate(form, isEdit);

    if (Object.keys(e).length) {
      setFormErrors(e);
      return;
    }

    const payload = isEdit
      ? {
          fullName: form.fullName,
          phone: form.phone
        }
      : form;

    const apiCall = isEdit
      ? () =>
          adminAPI.updateReceptionist(
            modal.receptionist.id,
            payload
          )
      : () =>
          adminAPI.addReceptionist(payload);

    await execute(apiCall, () => {

      loadReceptionists();

      closeModal();

      showToast(
        isEdit
          ? 'Receptionist updated!'
          : 'Receptionist added!'
      );
    });
  };

const handleDelete = async () => {

  console.log("Deleting receptionist ID:", confirm.id);

  try {

    const response =
      await adminAPI.deleteReceptionist(confirm.id);

    console.log("DELETE RESPONSE:", response);

    loadReceptionists();

    setConfirm({
      open: false,
      id: null
    });

    showToast('Receptionist removed.');

  } catch (err) {

    console.error("DELETE ERROR:", err);

  }
};

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  return (
    <DashboardLayout title="Receptionist Management">

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 24,
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 12,
            padding: '12px 20px',
            zIndex: 9999
          }}
        >
          {toast}
        </div>
      )}

      <SectionHeader
        title="Receptionists"
        subtitle={`${receptionists.length} registered`}
        action={
          <button
            className="btn btn-accent"
            onClick={openAdd}
          >
            <i className="bi bi-plus-lg" />
            Add Receptionist
          </button>
        }
      />

      <Alert
        type="danger"
        message={error}
        onClose={clearError}
      />

      <div className="card">

        <div className="card-header">

          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              reset();
            }}
            placeholder="Search receptionists..."
          />

          <span>
            {filtered.length} results
          </span>

        </div>

        {loading ? (
          <LoadingCenter />
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Receptionist</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        icon="bi-people"
                        title="No receptionists found"
                      />
                    </td>
                  </tr>
                ) : (
                  pageItems.map(r => (
                    <tr key={r.id}>

                      <td>
                        <div
                          style={{
                            display: 'flex',
                            gap: 10,
                            alignItems: 'center'
                          }}
                        >
                          <Avatar
                            name={r.fullName}
                            size="sm"
                          />

                          <div>
                            <div>
                              {r.fullName}
                            </div>

                            <div
                              style={{
                                fontSize: 12
                              }}
                            >
                              {r.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>{r.phone}</td>

                      <td>
                        <span
                          className={`badge ${
                            r.active
                              ? 'badge-success'
                              : 'badge-danger'
                          }`}
                        >
                          {r.active
                            ? 'ACTIVE'
                            : 'INACTIVE'}
                        </span>
                      </td>

                      <td>

                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            setConfirm({
                              open: true,
                              id: r.id
                            })
                          }
                        >
                          Delete
                        </button>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onGoTo={goTo}
        />

      </div>

      <Modal
        open={modal.open}
        title={
          modal.mode === 'add'
            ? 'Add Receptionist'
            : 'Edit Receptionist'
        }
        onClose={closeModal}
      >

        <FormRow>
          <FormField
            label="Full Name"
            error={formErrors.fullName}
          >
            <input
              className="form-control"
              value={form.fullName}
              onChange={set('fullName')}
            />
          </FormField>

          <FormField
            label="Email"
            error={formErrors.email}
          >
            <input
              className="form-control"
              value={form.email}
              onChange={set('email')}
              disabled={modal.mode === 'edit'}
            />
          </FormField>
        </FormRow>

        {modal.mode === 'add' && (
          <FormRow>

            <FormField
              label="Password"
              error={formErrors.password}
            >
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={set('password')}
              />
            </FormField>

            <FormField
              label="Phone"
              error={formErrors.phone}
            >
              <input
                className="form-control"
                value={form.phone}
                onChange={set('phone')}
              />
            </FormField>

          </FormRow>
        )}

        {modal.mode === 'edit' && (
          <FormField
            label="Phone"
            error={formErrors.phone}
          >
            <input
              className="form-control"
              value={form.phone}
              onChange={set('phone')}
            />
          </FormField>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            marginTop: 20
          }}
        >
          <button
            className="btn btn-outline"
            onClick={closeModal}
          >
            Cancel
          </button>

          <button
            className="btn btn-accent"
            onClick={handleSave}
          >
            {loading
              ? <Spinner small />
              : modal.mode === 'add'
              ? 'Add Receptionist'
              : 'Save Changes'}
          </button>
        </div>

      </Modal>

      <ConfirmModal
        open={confirm.open}
        title="Remove Receptionist"
        message="Are you sure you want to deactivate this receptionist?"
        onConfirm={handleDelete}
        onCancel={() =>
          setConfirm({
            open: false,
            id: null
          })
        }
        loading={loading}
        danger
      />

    </DashboardLayout>
  );
}