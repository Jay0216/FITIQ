import React, { useState, useMemo, useEffect } from 'react';
import './TrainerManagement.css';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { register, getAllTrainers } from '../redux/trainerSlice';

type TrainerType =
  | 'muscle_gain'
  | 'weight_loss'
  | 'endurance'
  | 'flexibility'
  | 'rehabilitation'
  | 'nutrition';

interface Trainer {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  password: string;
  type: TrainerType;
  role: 'TRAINER';
}

const TYPE_CONFIG: Record<TrainerType, { label: string; icon: string; color: string }> = {
  muscle_gain:    { label: 'Muscle Gain',    icon: '💪', color: '#f97316' },
  weight_loss:    { label: 'Weight Loss',    icon: '🔥', color: '#ef4444' },
  endurance:      { label: 'Endurance',      icon: '⚡', color: '#3b82f6' },
  flexibility:    { label: 'Flexibility',    icon: '🧘', color: '#8b5cf6' },
  rehabilitation: { label: 'Rehabilitation', icon: '🩺', color: '#22c55e' },
  nutrition:      { label: 'Nutrition',      icon: '🥗', color: '#10b981' },
};

const TRAINER_TYPES = Object.keys(TYPE_CONFIG) as TrainerType[];

const EMPTY_FORM: Omit<Trainer, 'id' | 'role'> = {
  fullname: '', phonenumber: '', email: '', password: '', type: 'muscle_gain',
};

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

// ── Modal ──────────────────────────────────────────────────────────────────
interface ModalProps {
  mode: 'add' | 'edit';
  trainer: Omit<Trainer, 'id' | 'role'>;
  onChange: (f: Omit<Trainer, 'id' | 'role'>) => void;
  onSave: () => void;
  onClose: () => void;
  errors: Partial<Record<keyof Omit<Trainer, 'id' | 'role'>, string>>;
}

const TrainerModal: React.FC<ModalProps> = ({ mode, trainer, onChange, onSave, onClose, errors }) => {
  const [showPw, setShowPw] = useState(false);
  const { loading } = useSelector((state: RootState) => state.trainer);

  const set = (key: keyof typeof trainer, val: string) =>
    onChange({ ...trainer, [key]: val });

  return (
    <div className="tm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tm-modal">
        <div className="tm-modal-header">
          <span className="tm-modal-icon">{mode === 'add' ? '＋' : '✎'}</span>
          <h3>{mode === 'add' ? 'Add New Trainer' : 'Edit Trainer'}</h3>
          <button className="tm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="tm-modal-body">
          <div className="tm-field-group">
            <label className="tm-label">Full Name</label>
            <input
              className={`tm-input ${errors.fullname ? 'tm-input--err' : ''}`}
              placeholder="e.g. John Carter"
              value={trainer.fullname}
              onChange={e => set('fullname', e.target.value)}
            />
            {errors.fullname && <span className="tm-err">{errors.fullname}</span>}
          </div>

          <div className="tm-field-row">
            <div className="tm-field-group">
              <label className="tm-label">Phone Number</label>
              <input
                className={`tm-input ${errors.phonenumber ? 'tm-input--err' : ''}`}
                placeholder="07XXXXXXXX"
                value={trainer.phonenumber}
                onChange={e => set('phonenumber', e.target.value)}
              />
              {errors.phonenumber && <span className="tm-err">{errors.phonenumber}</span>}
            </div>

            <div className="tm-field-group">
              <label className="tm-label">Trainer Type</label>
              <select
                className="tm-select"
                value={trainer.type}
                onChange={e => set('type', e.target.value)}
              >
                {TRAINER_TYPES.map(t => (
                  <option key={t} value={t}>{TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="tm-field-group">
            <label className="tm-label">Email Address</label>
            <input
              className={`tm-input ${errors.email ? 'tm-input--err' : ''}`}
              type="email"
              placeholder="trainer@fitiq.com"
              value={trainer.email}
              onChange={e => set('email', e.target.value)}
            />
            {errors.email && <span className="tm-err">{errors.email}</span>}
          </div>

          <div className="tm-field-group">
            <label className="tm-label">
              Password {mode === 'edit' && <span className="tm-label-hint">(leave blank to keep current)</span>}
            </label>
            <div className="tm-pw-wrap">
              <input
                className={`tm-input tm-input--pw ${errors.password ? 'tm-input--err' : ''}`}
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'edit' ? '••••••••' : 'Min. 6 characters'}
                value={trainer.password}
                onChange={e => set('password', e.target.value)}
              />
              <button className="tm-pw-toggle" type="button" onClick={() => setShowPw(v => !v)}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="tm-err">{errors.password}</span>}
          </div>

          <div className="tm-role-chip">
            <span className="tm-role-dot" /> TRAINER
          </div>
        </div>

        <div className="tm-modal-footer">
          <button className="tm-btn tm-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className="tm-btn tm-btn--primary"
            onClick={onSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : (mode === 'add' ? 'Create Trainer' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm ────────────────────────────────────────────────────────
interface DeleteConfirmProps {
  trainer: Trainer;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ trainer, onConfirm, onClose }) => (
  <div className="tm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="tm-modal tm-modal--sm">
      <div className="tm-delete-icon">🗑</div>
      <h3 className="tm-delete-title">Remove Trainer?</h3>
      <p className="tm-delete-sub">
        <strong>{trainer.fullname}</strong> will be permanently removed from the system.
      </p>
      <div className="tm-modal-footer">
        <button className="tm-btn tm-btn--ghost" onClick={onClose}>Cancel</button>
        <button className="tm-btn tm-btn--danger" onClick={onConfirm}>Yes, Remove</button>
      </div>
    </div>
  </div>
);

// ── Validate ──────────────────────────────────────────────────────────────
function validate(f: Omit<Trainer, 'id' | 'role'>, mode: 'add' | 'edit') {
  const e: Partial<Record<keyof typeof f, string>> = {};
  if (!f.fullname.trim()) e.fullname = 'Name is required';
  if (!f.phonenumber.match(/^0\d{9}$/)) e.phonenumber = 'Invalid phone number';
  if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email address';
  // On edit, password is optional — only validate if filled in
  if (mode === 'add' && f.password.length < 6) e.password = 'Min. 6 characters';
  if (mode === 'edit' && f.password.length > 0 && f.password.length < 6) e.password = 'Min. 6 characters';
  return e;
}

// ── Loading Skeleton ──────────────────────────────────────────────────────
const TableSkeleton: React.FC = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="tm-row tm-row--skeleton">
        <td>
          <div className="tm-trainer-cell">
            <div className="tm-avatar tm-skeleton-block" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div>
              <div className="tm-skeleton-block" style={{ width: 120, height: 14, marginBottom: 6 }} />
              <div className="tm-skeleton-block" style={{ width: 70, height: 11 }} />
            </div>
          </div>
        </td>
        <td><div className="tm-skeleton-block" style={{ width: 100, height: 14 }} /></td>
        <td><div className="tm-skeleton-block" style={{ width: 160, height: 14 }} /></td>
        <td><div className="tm-skeleton-block" style={{ width: 90, height: 24, borderRadius: 12 }} /></td>
        <td><div className="tm-skeleton-block" style={{ width: 60, height: 22, borderRadius: 10 }} /></td>
        <td className="tm-actions-cell">
          <div className="tm-skeleton-block" style={{ width: 64, height: 30, borderRadius: 6 }} />
        </td>
      </tr>
    ))}
  </>
);

// ── Main Component ────────────────────────────────────────────────────────
const TrainerManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Pull everything from Redux
  const { trainers: reduxTrainers, loading, error } = useSelector(
    (state: RootState) => state.trainer
  );

  // Optimistic local state — tracks newly added trainers and deleted IDs
  const [localTrainers, setLocalTrainers] = useState<Trainer[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TrainerType | 'All'>('All');

  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Trainer | null>(null);
  const [formData, setFormData] = useState<Omit<Trainer, 'id' | 'role'>>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  const [deleteTarget, setDeleteTarget] = useState<Trainer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const token = localStorage.getItem("memberToken")


  // Fetch trainers on mount / when token changes
  useEffect(() => {
    if (token) {
      dispatch(getAllTrainers(token));
    }
  }, [dispatch, token]);

  // Merge Redux trainers with optimistic local state
  const trainers: Trainer[] = useMemo(() => {
    // Map API trainers to the local Trainer shape
    const fromRedux: Trainer[] = reduxTrainers
      .filter(t => !deletedIds.has(t.id))
      .map(t => ({
        id: t.id,
        fullname: t.fullname,
        phonenumber: t.phonenumber,
        email: t.email,
        password: '',                   // API never returns passwords
        type: t.type as TrainerType,
        role: 'TRAINER',
      }));

    // Apply any local edits on top of Redux data
    const editedMap = new Map(localTrainers.map(t => [t.id, t]));
    const merged = fromRedux.map(t => editedMap.get(t.id) ?? t);

    // Prepend any locally added trainers not yet in Redux
    const reduxIds = new Set(fromRedux.map(t => t.id));
    const onlyLocal = localTrainers.filter(
      t => !reduxIds.has(t.id) && !deletedIds.has(t.id)
    );

    return [...onlyLocal, ...merged];
  }, [reduxTrainers, localTrainers, deletedIds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setEditTarget(null);
    setModalMode('add');
  };

  const openEdit = (t: Trainer) => {
    setFormData({
      fullname: t.fullname,
      phonenumber: t.phonenumber,
      email: t.email,
      password: '',             // Don't pre-fill password for security
      type: t.type,
    });
    setFormErrors({});
    setEditTarget(t);
    setModalMode('edit');
  };

  const handleSave = async () => {
    const errs = validate(formData, modalMode!);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    try {
      if (modalMode === 'add') {
        const result = await dispatch(register({
          fullname: formData.fullname,
          phonenumber: formData.phonenumber,
          email: formData.email,
          password: formData.password,
          type: formData.type,
          availableForAppointments: true,
        })).unwrap();

        // Optimistically add to UI
        const newTrainer: Trainer = {
          id: result.trainer.id,
          role: 'TRAINER',
          ...formData,
        };
        setLocalTrainers(prev => [newTrainer, ...prev]);
        showToast(`✅ ${formData.fullname} Account created successfully`);

      } else if (editTarget) {
        // Optimistic edit — update local record
        setLocalTrainers(prev => {
          const exists = prev.find(t => t.id === editTarget.id);
          if (exists) {
            return prev.map(t => t.id === editTarget.id ? { ...t, ...formData } : t);
          }
          // If trainer came from Redux, add an edited copy to localTrainers
          return [...prev, { ...editTarget, ...formData }];
        });
        showToast(`✏️ ${formData.fullname} updated`);
      }

      setModalMode(null);

    } catch (err: any) {
      showToast(`❌ ${err?.message || 'Failed to save trainer'}`);
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setDeletedIds(prev => new Set([...prev, deleteTarget.id]));
    setLocalTrainers(prev => prev.filter(t => t.id !== deleteTarget.id));
    showToast(`🗑 ${deleteTarget.fullname} removed`);
    setDeleteTarget(null);
  };

  const filtered = useMemo(() =>
    trainers
      .filter(t => typeFilter === 'All' || t.type === typeFilter)
      .filter(t =>
        t.fullname.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        t.phonenumber.includes(search)
      ),
    [trainers, search, typeFilter]
  );

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    trainers.forEach(t => { c[t.type] = (c[t.type] || 0) + 1; });
    return c;
  }, [trainers]);

  return (
    <div className="tm-root">
      {/* Toast */}
      {toast && <div className="tm-toast">{toast}</div>}

      {/* Header */}
      <div className="tm-header">
        <div>
          <h2 className="tm-title">Member Management</h2>
          <p className="tm-subtitle">
            {loading && trainers.length === 0
              ? 'Loading trainers…'
              : `${trainers.length} trainer${trainers.length !== 1 ? 's' : ''} · FitIQ Platform`}
          </p>
        </div>
        <button className="tm-add-btn" onClick={openAdd} disabled={loading && trainers.length === 0}>
          <span className="tm-add-plus">＋</span> Add Trainer
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="tm-error-banner">
          ⚠️ {error}
          {token && (
            <button className="tm-retry-btn" onClick={() => dispatch(getAllTrainers(token))}>
              Retry
            </button>
          )}
        </div>
      )}

      {/* Type Summary Strip */}
      <div className="tm-type-strip">
        {TRAINER_TYPES.map(type => {
          const cfg = TYPE_CONFIG[type];
          return (
            <button
              key={type}
              className={`tm-type-card ${typeFilter === type ? 'tm-type-card--active' : ''}`}
              style={{ '--type-color': cfg.color } as React.CSSProperties}
              onClick={() => setTypeFilter(prev => prev === type ? 'All' : type)}
            >
              <span className="tm-type-icon">{cfg.icon}</span>
              <span className="tm-type-label">{cfg.label}</span>
              <span className="tm-type-count">{typeCounts[type] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Search + Filter Row */}
      <div className="tm-controls">
        <div className="tm-search-wrap">
          <span className="tm-search-icon">⌕</span>
          <input
            className="tm-search"
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="tm-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <span className="tm-result-count">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="tm-table-wrap">
        <table className="tm-table">
          <thead>
            <tr>
              <th>Trainer</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Type</th>
              <th>Role</th>
              <th className="tm-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading skeleton — only on initial load when list is empty */}
            {loading && trainers.length === 0 && <TableSkeleton />}

            {/* Empty state — only when not loading */}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="tm-empty">
                  <span>🔍</span>
                  <p>{trainers.length === 0 ? 'No trainers found on server' : 'No trainers match your search'}</p>
                </td>
              </tr>
            )}

            {filtered.map((t, i) => {
              const cfg = TYPE_CONFIG[t.type] ?? TYPE_CONFIG['muscle_gain'];
              return (
                <tr key={t.id} className="tm-row" style={{ animationDelay: `${i * 45}ms` }}>
                  <td>
                    <div className="tm-trainer-cell">
                      <div
                        className="tm-avatar"
                        style={{ '--av-color': cfg.color } as React.CSSProperties}
                      >
                        {initials(t.fullname)}
                      </div>
                      <div>
                        <div className="tm-trainer-name">{t.fullname}</div>
                        <div className="tm-trainer-id">#{t.id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="tm-phone">{t.phonenumber}</td>
                  <td className="tm-email">{t.email}</td>
                  <td>
                    <span
                      className="tm-type-badge"
                      style={{ '--type-color': cfg.color } as React.CSSProperties}
                    >
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                  <td>
                    <span className="tm-role-badge">TRAINER</span>
                  </td>
                  <td className="tm-actions-cell">
                    <button
                      className="tm-action-btn tm-action-btn--edit"
                      onClick={() => openEdit(t)}
                      title="Edit"
                    >✎</button>
                    <button
                      className="tm-action-btn tm-action-btn--delete"
                      onClick={() => setDeleteTarget(t)}
                      title="Delete"
                    >🗑</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modalMode && (
        <TrainerModal
          mode={modalMode}
          trainer={formData}
          onChange={setFormData}
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          errors={formErrors}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          trainer={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default TrainerManagement;