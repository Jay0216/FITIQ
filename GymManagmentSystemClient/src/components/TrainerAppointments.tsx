import React, { useState, useEffect, useMemo } from 'react';
import './TrainerAppointments.css';
import {
  Search, Calendar, Clock, User, MapPin, CheckCircle,
  XCircle, Filter, ChevronDown, Loader, RefreshCw, Inbox,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import {
  fetchTrainerAppointmentsThunk,
  updateAppointmentStatusThunk,
} from '../redux/appointmentSlice';
import type { AppointmentResponse } from '../API/appointmentAPI';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normaliseDateToKey(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.split('T')[0];
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return dateStr;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—';
  if (dateStr.includes(',')) return dateStr;
  const key = normaliseDateToKey(dateStr);
  if (!key) return dateStr;
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

type NormStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

function normaliseStatus(raw: string): NormStatus {
  const s = raw?.trim().toLowerCase() ?? '';
  if (s === 'completed')                     return 'completed';
  if (s === 'cancelled' || s === 'canceled') return 'cancelled';
  if (s === 'confirmed' || s === 'approved') return 'confirmed';
  return 'pending';
}

// Maps our internal action → the status string your API expects
const ACTION_TO_API_STATUS: Record<'approve' | 'complete' | 'cancel', string> = {
  approve:  'Confirmed',
  complete: 'Completed',
  cancel:   'Cancelled',
};

const STATUS_META: Record<NormStatus, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'status--pending'   },
  confirmed: { label: 'Confirmed', className: 'status--confirmed' },
  completed: { label: 'Completed', className: 'status--completed' },
  cancelled: { label: 'Cancelled', className: 'status--cancelled' },
};

const FILTER_TABS: { key: 'all' | NormStatus; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'pending',   label: 'Pending'   },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const TrainerAppointments: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const rawAppointments = useSelector(
    (state: RootState) => state.appointments.appointments
  ) as AppointmentResponse[];
  const loading = useSelector((state: RootState) => state.appointments.loading);
  const error   = useSelector((state: RootState) => state.appointments.error);

  // Track which card is currently being updated to show a spinner on that button only
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('trainerToken');
    if (token) dispatch(fetchTrainerAppointmentsThunk(token));
  }, [dispatch]);

  // ── Enriched appointments ──────────────────────────────────────────────────
  const appointments = useMemo(
    () => rawAppointments.map((a) => ({
      ...a,
      dateKey:     normaliseDateToKey(a.date),
      normStatus:  normaliseStatus(a.status),
    })),
    [rawAppointments]
  );

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch]         = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusTab, setStatusTab]   = useState<'all' | NormStatus>('all');
  const [sortDesc, setSortDesc]     = useState(true);

  const filtered = useMemo(() => {
    let list = [...appointments];
    if (statusTab !== 'all') list = list.filter((a) => a.normStatus === statusTab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.memberId?.toLowerCase().includes(q) ||
          a.trainerName?.toLowerCase().includes(q) ||
          a.timeSlot?.toLowerCase().includes(q)
      );
    }
    if (dateFilter) list = list.filter((a) => a.dateKey === dateFilter);
    list.sort((a, b) => {
      const da = new Date(a.dateKey || a.date).getTime();
      const db = new Date(b.dateKey || b.date).getTime();
      return sortDesc ? db - da : da - db;
    });
    return list;
  }, [appointments, statusTab, search, dateFilter, sortDesc]);

  const counts = useMemo(() => ({
    all:       appointments.length,
    pending:   appointments.filter((a) => a.normStatus === 'pending').length,
    confirmed: appointments.filter((a) => a.normStatus === 'confirmed').length,
    completed: appointments.filter((a) => a.normStatus === 'completed').length,
    cancelled: appointments.filter((a) => a.normStatus === 'cancelled').length,
  }), [appointments]);

  // ── Action handler ─────────────────────────────────────────────────────────
const handleAction = async (
  appointmentId: string,
  action: 'approve' | 'complete' | 'cancel'
) => {
  const token = localStorage.getItem('trainerToken');
  if (!token) return;

  const apiStatus = ACTION_TO_API_STATUS[action];
  setUpdatingId(appointmentId);
  setActionError(null);

  try {
    await dispatch(
      updateAppointmentStatusThunk({ token, appointmentId, status: apiStatus })
    ).unwrap();

    // ✅ SUCCESS ALERT HERE
    if (action === 'approve') {
      alert('Appointment approved successfully!');
    } else if (action === 'complete') {
      alert('Appointment marked as completed!');
    } else if (action === 'cancel') {
      alert('Appointment cancelled successfully!');
    }

    dispatch(fetchTrainerAppointmentsThunk(token));
  } catch (err: any) {
    setActionError(err?.message ?? 'Failed to update. Please try again.');
  } finally {
    setUpdatingId(null);
  }
};

  const refresh = () => {
    const token = localStorage.getItem('trainerToken');
    if (token) dispatch(fetchTrainerAppointmentsThunk(token));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="ta-root">

      {/* Header */}
      <div className="ta-header">
        <div className="ta-header-left">
          <h1 className="ta-title">Appointment Requests</h1>
          <p className="ta-subtitle">Review and manage member bookings</p>
        </div>
        <button className="ta-refresh-btn" onClick={refresh} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin-icon' : ''} />
          Refresh
        </button>
      </div>

      {/* Global action error */}
      {actionError && (
        <div className="ta-action-error">
          ⚠ {actionError}
          <button onClick={() => setActionError(null)}>×</button>
        </div>
      )}

      {/* Stats row */}
      <div className="ta-stats-row">
        {[
          { label: 'Total',     value: counts.all,       cls: '' },
          { label: 'Pending',   value: counts.pending,   cls: 'pending' },
          { label: 'Confirmed', value: counts.confirmed, cls: 'confirmed' },
          { label: 'Completed', value: counts.completed, cls: 'completed' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`ta-stat-card ${cls}`}>
            <span className="ta-stat-value">{value}</span>
            <span className="ta-stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="ta-toolbar">
        <div className="ta-search-wrap">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by member or time…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ta-date-wrap">
          <Calendar size={15} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button className="ta-clear-date" onClick={() => setDateFilter('')}>×</button>
          )}
        </div>
        <button
          className="ta-sort-btn"
          onClick={() => setSortDesc((v) => !v)}
        >
          <Filter size={14} />
          {sortDesc ? 'Newest first' : 'Oldest first'}
          <ChevronDown
            size={13}
            style={{ transform: sortDesc ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
          />
        </button>
      </div>

      {/* Status tabs */}
      <div className="ta-tabs">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`ta-tab ${statusTab === key ? 'active' : ''}`}
            onClick={() => setStatusTab(key)}
          >
            {label}
            <span className="ta-tab-count">{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading && appointments.length === 0 ? (
        <div className="ta-loading">
          <Loader size={28} className="spin-icon" />
          <p>Loading appointments…</p>
        </div>
      ) : error ? (
        <div className="ta-error">
          <p>⚠ {error}</p>
          <button onClick={refresh}>Try again</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ta-empty">
          <Inbox size={44} />
          <p>No appointments found</p>
          {(search || dateFilter || statusTab !== 'all') && (
            <button
              className="ta-clear-filters"
              onClick={() => { setSearch(''); setDateFilter(''); setStatusTab('all'); }}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="ta-list">
          {filtered.map((apt) => {
            const meta       = STATUS_META[apt.normStatus];
            const isUpdating = updatingId === apt.id;

            return (
              <div key={apt.id} className={`ta-card ta-card--${apt.normStatus}`}>

                {/* Top row */}
                <div className="ta-card-top">
                  <div className="ta-member-info">
                    <div className="ta-avatar"><User size={18} /></div>
                    <div>
                      <p className="ta-member-id">Member #{apt.memberId?.slice(-6) ?? '—'}</p>
                      <p className="ta-booked-label">Booked session</p>
                    </div>
                  </div>
                  <span className={`ta-status-badge ${meta.className}`}>
                    {isUpdating
                      ? <><Loader size={11} className="spin-icon" /> Updating…</>
                      : meta.label
                    }
                  </span>
                </div>

                {/* Details */}
                <div className="ta-card-details">
                  <div className="ta-detail-item">
                    <Calendar size={14} />
                    <span>{formatDisplayDate(apt.date)}</span>
                  </div>
                  <div className="ta-detail-item">
                    <Clock size={14} />
                    <span>{apt.timeSlot}</span>
                  </div>
                  {apt.venue && (
                    <div className="ta-detail-item">
                      <MapPin size={14} />
                      <span>{apt.venue}</span>
                    </div>
                  )}
                  <div className="ta-detail-item">
                    <span className="ta-raw-status-badge">{apt.status}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="ta-card-actions">
                  {apt.normStatus === 'pending' && (
                    <>
<button
  className="ta-btn ta-btn--approve"
  disabled={isUpdating}
  onClick={() => {
    const confirmApprove = window.confirm(
      'Are you sure you want to approve this appointment?'
    );
    if (confirmApprove) {
      handleAction(apt.id, 'approve');
    }
  }}
>
  {isUpdating
    ? <Loader size={13} className="spin-icon" />
    : <CheckCircle size={13} />
  }
  Approve
</button>
                      <button
                        className="ta-btn ta-btn--cancel"
                        disabled={isUpdating}
                        onClick={() => handleAction(apt.id, 'cancel')}
                      >
                        {isUpdating
                          ? <Loader size={13} className="spin-icon" />
                          : <XCircle size={13} />
                        }
                        Decline
                      </button>
                    </>
                  )}

                  {apt.normStatus === 'confirmed' && (
                    <>
                      <button
                        className="ta-btn ta-btn--done"
                        disabled={isUpdating}
                        onClick={() => handleAction(apt.id, 'complete')}
                      >
                        {isUpdating
                          ? <Loader size={13} className="spin-icon" />
                          : <CheckCircle size={13} />
                        }
                        Mark as Done
                      </button>
                      <button
                        className="ta-btn ta-btn--cancel"
                        disabled={isUpdating}
                        onClick={() => handleAction(apt.id, 'cancel')}
                      >
                        {isUpdating
                          ? <Loader size={13} className="spin-icon" />
                          : <XCircle size={13} />
                        }
                        Cancel
                      </button>
                    </>
                  )}

                  {apt.normStatus === 'completed' && (
                    <span className="ta-closed-label ta-closed-label--done">✓ Session completed</span>
                  )}
                  {apt.normStatus === 'cancelled' && (
                    <span className="ta-closed-label ta-closed-label--cancelled">✕ Declined</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainerAppointments;