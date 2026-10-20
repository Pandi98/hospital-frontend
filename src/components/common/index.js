import React from 'react';
import { getInitials } from '../../utils/helpers';

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ small }) {
  return <div className={`spinner ${small ? 'spinner-sm' : ''}`} />;
}

export function LoadingCenter({ text = 'Loading...' }) {
  return (
    <div className="loading-center">
      <Spinner />
      <span>{text}</span>
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────
export function Alert({ type = 'danger', message, onClose }) {
  if (!message) return null;
  const icons = { danger: 'bi-exclamation-circle', success: 'bi-check-circle',
                  info: 'bi-info-circle', warning: 'bi-exclamation-triangle' };
  return (
    <div className={`alert alert-${type}`}>
      <i className={`bi ${icons[type]}`} />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',opacity:.6,fontSize:16 }}>
          <i className="bi bi-x" />
        </button>
      )}
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────
export function Avatar({ name, size }) {
  return <div className={`avatar ${size ? `avatar-${size}` : ''}`}>{getInitials(name)}</div>;
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon = 'bi-inbox', title = 'No data found', description }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><i className={`bi ${icon}`} /></div>
      <h6>{title}</h6>
      {description && <p>{description}</p>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────
export function Pagination({ page, totalPages, onGoTo }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onGoTo(page - 1)} disabled={page === 1}>
        <i className="bi bi-chevron-left" />
      </button>
      {pages.map(p => (
        <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onGoTo(p)}>
          {p}
        </button>
      ))}
      <button className="page-btn" onClick={() => onGoTo(page + 1)} disabled={page === totalPages}>
        <i className="bi bi-chevron-right" />
      </button>
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-bar">
      <div className="input-group">
        <i className="bi bi-search input-icon" />
        <input
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────
export function Badge({ label, className }) {
  return <span className={`badge ${className}`}>{label}</span>;
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, title, onClose, children, footer, size }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal-box ${size === 'lg' ? 'modal-lg' : ''}`}>
        <div className="modal-header">
          <h5 className="modal-title">{title}</h5>
          {onClose && (
            <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ marginLeft: 'auto' }}>
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────
export function ConfirmModal({ open, title, message, onConfirm, onCancel, loading, danger }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}
      footer={
        <>
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={loading}>
            {loading ? <><Spinner small /> Deleting…</> : 'Confirm'}
          </button>
        </>
      }
    >
      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{message}</p>
    </Modal>
  );
}

// ── Stat Card ─────────────────────────────────────────────────
export function StatCard({ icon, iconClass, value, label, change, changeDir }) {
  return (
    <div className="stat-card animate-in">
      <div className={`stat-icon ${iconClass}`}><i className={`bi ${icon}`} /></div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && <div className={`stat-change ${changeDir}`}>{change}</div>}
      </div>
    </div>
  );
}

// ── Form Row (2-col grid) ─────────────────────────────────────
export function FormRow({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {children}
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────
export function FormField({ label, error, children, required }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}{required && ' *'}</label>
      {children}
      {error && <div className="invalid-feedback" style={{ display: 'block' }}>{error}</div>}
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="page-header animate-in">
      <div>
        <h4 className="page-title">{title}</h4>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
