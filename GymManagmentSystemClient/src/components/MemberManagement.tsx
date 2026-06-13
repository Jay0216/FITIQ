import React, { useState, useMemo, useRef } from 'react';
import './MemberManagement.css';

// ── Types ──────────────────────────────────────────────────────────────────
type MemberType =
  | 'muscle_gain'
  | 'weight_loss'
  | 'endurance'
  | 'flexibility'
  | 'rehabilitation'
  | 'nutrition';

interface Fingerprint {
  id: string;
  slot: number;
  enrolledAt: string;
}

interface Member {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  type: MemberType;
  role: 'MEMBER';
  fingerprints: Fingerprint[];
}

// ── Config ─────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<MemberType, { label: string; icon: string; color: string }> = {
  muscle_gain:    { label: 'Muscle Gain',    icon: '💪', color: '#f97316' },
  weight_loss:    { label: 'Weight Loss',    icon: '🔥', color: '#ef4444' },
  endurance:      { label: 'Endurance',      icon: '⚡', color: '#3b82f6' },
  flexibility:    { label: 'Flexibility',    icon: '🧘', color: '#8b5cf6' },
  rehabilitation: { label: 'Rehabilitation', icon: '🩺', color: '#22c55e' },
  nutrition:      { label: 'Nutrition',      icon: '🥗', color: '#10b981' },
};

const MEMBER_TYPES = Object.keys(TYPE_CONFIG) as MemberType[];

const EMPTY_FORM = {
  fullname: '',
  phonenumber: '',
  email: '',
  type: 'muscle_gain' as MemberType,
};

// ── Mock Data ──────────────────────────────────────────────────────────────
let fpCounter = 8;

const MOCK_MEMBERS: Member[] = [
  {
    id: 'm001', fullname: 'Aisha Perera',     phonenumber: '0771234567',
    email: 'aisha@fitiq.com',    type: 'muscle_gain',    role: 'MEMBER',
    fingerprints: [
      { id: 'FP-001', slot: 1, enrolledAt: '2025-04-10' },
      { id: 'FP-002', slot: 2, enrolledAt: '2025-04-10' },
    ],
  },
  {
    id: 'm002', fullname: 'Kasun Silva',       phonenumber: '0769876543',
    email: 'kasun@fitiq.com',    type: 'weight_loss',    role: 'MEMBER',
    fingerprints: [{ id: 'FP-003', slot: 1, enrolledAt: '2025-05-02' }],
  },
  {
    id: 'm003', fullname: 'Nimal Fernando',    phonenumber: '0712345678',
    email: 'nimal@fitiq.com',    type: 'endurance',      role: 'MEMBER',
    fingerprints: [],
  },
  {
    id: 'm004', fullname: 'Priya Jayawardena', phonenumber: '0778901234',
    email: 'priya@fitiq.com',    type: 'flexibility',    role: 'MEMBER',
    fingerprints: [
      { id: 'FP-004', slot: 1, enrolledAt: '2025-03-15' },
      { id: 'FP-005', slot: 2, enrolledAt: '2025-03-15' },
      { id: 'FP-006', slot: 3, enrolledAt: '2025-06-01' },
    ],
  },
  {
    id: 'm005', fullname: 'Lahiru Bandara',    phonenumber: '0703456789',
    email: 'lahiru@fitiq.com',   type: 'rehabilitation', role: 'MEMBER',
    fingerprints: [],
  },
  {
    id: 'm006', fullname: 'Sachini Madushani', phonenumber: '0754567890',
    email: 'sachini@fitiq.com',  type: 'nutrition',      role: 'MEMBER',
    fingerprints: [{ id: 'FP-007', slot: 1, enrolledAt: '2025-05-20' }],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Toast ──────────────────────────────────────────────────────────────────
const Toast: React.FC<{ message: string }> = ({ message }) => (
  <div className="mm-toast">{message}</div>
);

// ── Fingerprint Scanner Modal ──────────────────────────────────────────────
type ScanState = 'idle' | 'scanning' | 'done';

interface FingerprintModalProps {
  member: Member;
  onEnrol: (memberId: string) => void;
  onRemoveFp: (memberId: string, fpId: string) => void;
  onClose: () => void;
}

const FingerprintModal: React.FC<FingerprintModalProps> = ({
  member, onEnrol, onRemoveFp, onClose,
}) => {
  const [scanState, setScanState] = useState<ScanState>('idle');

  const handleScan = () => {
    if (scanState === 'scanning') return;
    setScanState('scanning');
    setTimeout(() => {
      onEnrol(member.id);
      setScanState('done');
      setTimeout(() => setScanState('idle'), 1500);
    }, 1800);
  };

  const hintMap: Record<ScanState, React.ReactNode> = {
    idle:     <><strong>Tap</strong> the sensor to enrol a new fingerprint</>,
    scanning: <>Scanning… <strong>hold still</strong></>,
    done:     <strong className="mm-hint--success">Fingerprint enrolled!</strong>,
  };

  return (
    <div className="mm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mm-modal">
        <div className="mm-modal-header">
          <span className="mm-modal-icon">🔏</span>
          <h3>{member.fullname} – Fingerprints</h3>
          <button className="mm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="mm-modal-body">
          <div className="mm-scan-area">
            <button
              className={`mm-scanner mm-scanner--${scanState}`}
              onClick={handleScan}
              disabled={scanState === 'scanning'}
              aria-label="Scan fingerprint"
            >
              <span className="mm-scanner-icon">
                {scanState === 'done' ? '✅' : '👆'}
              </span>
              {scanState === 'scanning' && <span className="mm-scanner-ring" />}
            </button>
            <p className="mm-hint">{hintMap[scanState]}</p>
          </div>

          <div>
            <label className="mm-label">
              Enrolled fingerprints ({member.fingerprints.length})
            </label>

            {member.fingerprints.length === 0 ? (
              <p className="mm-fp-empty">No fingerprints enrolled yet</p>
            ) : (
              <div className="mm-fp-list">
                {member.fingerprints.map((fp, i) => (
                  <div key={fp.id} className="mm-fp-item">
                    <div className="mm-fp-item-left">
                      <span className="mm-fp-dot" />
                      <span className="mm-fp-id">{fp.id}</span>
                      <span className="mm-fp-slot">Slot {i + 1}</span>
                      <span className="mm-fp-date">{fp.enrolledAt}</span>
                    </div>
                    <button
                      className="mm-fp-del"
                      onClick={() => onRemoveFp(member.id, fp.id)}
                      title="Remove fingerprint"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mm-modal-footer">
          <button className="mm-btn mm-btn--ghost" onClick={onClose}>Close</button>
          <button className="mm-btn mm-btn--primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ── Add Member Modal ───────────────────────────────────────────────────────
interface AddModalProps {
  form: typeof EMPTY_FORM;
  errors: Partial<Record<keyof typeof EMPTY_FORM, string>>;
  onChange: (f: typeof EMPTY_FORM) => void;
  onSave: () => void;
  onClose: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ form, errors, onChange, onSave, onClose }) => {
  const set = (key: keyof typeof EMPTY_FORM, val: string) =>
    onChange({ ...form, [key]: val });

  return (
    <div className="mm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mm-modal">
        <div className="mm-modal-header">
          <span className="mm-modal-icon">＋</span>
          <h3>Add New Member</h3>
          <button className="mm-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="mm-modal-body">
          <div className="mm-field-group">
            <label className="mm-label">Full Name</label>
            <input
              className={`mm-input ${errors.fullname ? 'mm-input--err' : ''}`}
              placeholder="e.g. John Carter"
              value={form.fullname}
              onChange={e => set('fullname', e.target.value)}
            />
            {errors.fullname && <span className="mm-err">{errors.fullname}</span>}
          </div>

          <div className="mm-field-row">
            <div className="mm-field-group">
              <label className="mm-label">Phone Number</label>
              <input
                className={`mm-input ${errors.phonenumber ? 'mm-input--err' : ''}`}
                placeholder="07XXXXXXXX"
                value={form.phonenumber}
                onChange={e => set('phonenumber', e.target.value)}
              />
              {errors.phonenumber && <span className="mm-err">{errors.phonenumber}</span>}
            </div>

            <div className="mm-field-group">
              <label className="mm-label">Member Type</label>
              <select
                className="mm-select"
                value={form.type}
                onChange={e => set('type', e.target.value)}
              >
                {MEMBER_TYPES.map(t => (
                  <option key={t} value={t}>
                    {TYPE_CONFIG[t].icon} {TYPE_CONFIG[t].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mm-field-group">
            <label className="mm-label">Email Address</label>
            <input
              className={`mm-input ${errors.email ? 'mm-input--err' : ''}`}
              type="email"
              placeholder="member@fitiq.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
            />
            {errors.email && <span className="mm-err">{errors.email}</span>}
          </div>

          <div className="mm-role-chip">
            <span className="mm-role-dot" /> MEMBER
          </div>
        </div>

        <div className="mm-modal-footer">
          <button className="mm-btn mm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="mm-btn mm-btn--primary" onClick={onSave}>
            Create Member
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm ─────────────────────────────────────────────────────────
interface DeleteConfirmProps {
  member: Member;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteConfirm: React.FC<DeleteConfirmProps> = ({ member, onConfirm, onClose }) => (
  <div className="mm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="mm-modal mm-modal--sm">
      <div className="mm-modal-header">
        <span className="mm-modal-icon mm-modal-icon--danger">🗑</span>
        <h3>Remove Member?</h3>
        <button className="mm-modal-close" onClick={onClose}>✕</button>
      </div>
      <div className="mm-delete-body">
        <p className="mm-delete-sub">
          You are about to permanently remove{' '}
          <strong>{member.fullname}</strong> and all their enrolled fingerprints
          from the system.
        </p>
      </div>
      <div className="mm-modal-footer">
        <button className="mm-btn mm-btn--ghost" onClick={onClose}>Cancel</button>
        <button className="mm-btn mm-btn--danger" onClick={onConfirm}>
          Yes, Remove
        </button>
      </div>
    </div>
  </div>
);

// ── Validate ───────────────────────────────────────────────────────────────
function validate(f: typeof EMPTY_FORM) {
  const e: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
  if (!f.fullname.trim()) e.fullname = 'Name is required';
  if (!f.phonenumber.match(/^0\d{9}$/)) e.phonenumber = 'Must be 10 digits starting with 0';
  if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Invalid email address';
  return e;
}

// ── Main Component ─────────────────────────────────────────────────────────
const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [search, setSearch] = useState('');

  const [showAdd, setShowAdd]           = useState(false);
  const [fpTarget, setFpTarget]         = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);

  const [formData, setFormData]     = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  const filtered = useMemo(() =>
    members.filter(m =>
      m.fullname.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phonenumber.includes(search)
    ),
    [members, search]
  );

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setShowAdd(true);
  };

  const handleSaveAdd = () => {
    const errs = validate(formData);
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    const newMember: Member = {
      id: 'm' + String(members.length + 1).padStart(3, '0'),
      fullname: formData.fullname,
      phonenumber: formData.phonenumber,
      email: formData.email,
      type: formData.type,
      role: 'MEMBER',
      fingerprints: [],
    };
    setMembers(prev => [newMember, ...prev]);
    setShowAdd(false);
    showToast(`✅ ${formData.fullname} added successfully`);
  };

  const handleEnrol = (memberId: string) => {
    const fp: Fingerprint = {
      id: `FP-${String(fpCounter).padStart(3, '0')}`,
      slot: 0,
      enrolledAt: today(),
    };
    fpCounter++;
    setMembers(prev =>
      prev.map(m => {
        if (m.id !== memberId) return m;
        const updated = { ...m, fingerprints: [...m.fingerprints, { ...fp, slot: m.fingerprints.length + 1 }] };
        setFpTarget(updated);
        return updated;
      })
    );
    showToast(`🔏 Fingerprint enrolled`);
  };

  const handleRemoveFp = (memberId: string, fpId: string) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id !== memberId) return m;
        const updated = { ...m, fingerprints: m.fingerprints.filter(f => f.id !== fpId) };
        setFpTarget(updated);
        return updated;
      })
    );
    showToast(`🗑 Fingerprint ${fpId} removed`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
    showToast(`🗑 ${deleteTarget.fullname} removed`);
    setDeleteTarget(null);
  };

  return (
    <div className="mm-root">
      {toast && <Toast message={toast} />}

      {/* Header */}
      <div className="mm-header">
        <div>
          <h2 className="mm-title">Member Management</h2>
          <p className="mm-subtitle">
            {members.length} member{members.length !== 1 ? 's' : ''} · FitIQ Platform
          </p>
        </div>
        <button className="mm-add-btn" onClick={openAdd}>
          <span className="mm-add-plus">＋</span> Add Member
        </button>
      </div>

      {/* Search */}
      <div className="mm-controls">
        <div className="mm-search-wrap">
          <span className="mm-search-icon">⌕</span>
          <input
            className="mm-search"
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="mm-search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>
        <span className="mm-result-count">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="mm-table-wrap">
        <table className="mm-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Contact</th>
              <th>Type</th>
              <th className="mm-th-center">Fingerprints</th>
              <th className="mm-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="mm-empty">
                  <span>🔍</span>
                  <p>{members.length === 0 ? 'No members found' : 'No members match your search'}</p>
                </td>
              </tr>
            ) : (
              filtered.map((m, i) => {
                const cfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.muscle_gain;
                return (
                  <tr
                    key={m.id}
                    className="mm-row"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {/* Member */}
                    <td>
                      <div className="mm-member-cell">
                        <div
                          className="mm-avatar"
                          style={{
                            background: `${cfg.color}22`,
                            border: `1.5px solid ${cfg.color}`,
                            color: cfg.color,
                          }}
                        >
                          {initials(m.fullname)}
                        </div>
                        <div>
                          <div className="mm-member-name">{m.fullname}</div>
                          <div className="mm-member-id">#{m.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact — phone + email stacked */}
                    <td>
                      <div className="mm-contact-cell">
                        <span className="mm-contact-phone">{m.phonenumber}</span>
                        <span className="mm-contact-email">{m.email}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td>
                      <span
                        className="mm-type-badge"
                        style={{
                          background: `${cfg.color}22`,
                          color: cfg.color,
                          border: `1px solid ${cfg.color}44`,
                        }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>

                    {/* Fingerprints — compact count badge */}
                    <td className="mm-fp-col">
                      {m.fingerprints.length === 0 ? (
                        <button
                          className="mm-fp-enrol-chip"
                          onClick={() => setFpTarget(m)}
                        >
                          🔏 Enrol
                        </button>
                      ) : (
                        <button
                          className="mm-fp-count-badge"
                          onClick={() => setFpTarget(m)}
                          title="Manage fingerprints"
                        >
                          👆 {m.fingerprints.length}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="mm-actions-cell">
                      <button
                        className="mm-action-btn mm-action-btn--fp"
                        onClick={() => setFpTarget(m)}
                        title="Manage Fingerprints"
                      >
                        🔏
                      </button>
                      <button
                        className="mm-action-btn mm-action-btn--delete"
                        onClick={() => setDeleteTarget(m)}
                        title="Remove Member"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddModal
          form={formData}
          errors={formErrors}
          onChange={setFormData}
          onSave={handleSaveAdd}
          onClose={() => setShowAdd(false)}
        />
      )}

      {fpTarget && (
        <FingerprintModal
          member={fpTarget}
          onEnrol={handleEnrol}
          onRemoveFp={handleRemoveFp}
          onClose={() => setFpTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          member={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default MemberManagement;