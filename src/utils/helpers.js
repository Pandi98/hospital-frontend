// ── Date formatting ────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Initials avatar ────────────────────────────────────────────
export function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

// ── Status badge helper ────────────────────────────────────────
export function statusBadge(status) {
  const map = {
    SCHEDULED:   'badge-info',
    IN_PROGRESS: 'badge-warning',
    COMPLETED:   'badge-success',
    CANCELLED:   'badge-danger',
    ACTIVE:      'badge-success',
    INACTIVE:    'badge-neutral',
  };
  return map[status] ?? 'badge-neutral';
}

// ── Role badge ─────────────────────────────────────────────────
export function roleBadge(role) {
  const map = {
    ADMIN:        'badge-primary',
    DOCTOR:       'badge-info',
    RECEPTIONIST: 'badge-success',
  };
  return map[role] ?? 'badge-neutral';
}

// ── Error message extractor ────────────────────────────────────
export function extractError(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.errors)  return Object.values(err.response.data.errors).join(', ');
  return err?.message || 'Something went wrong';
}

// ── Min date for datetime-local input ─────────────────────────
export function nowDateTimeLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
