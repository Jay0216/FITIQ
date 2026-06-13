import React, { useState, useMemo } from 'react';
import './OwnerPayments.css';

type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded';

interface Payment {
  id: string;
  date: string;
  description: string;
  method: string;
  amount: number;
  status: PaymentStatus;
}

const payments: Payment[] = [
  { id: 'TXN-0041', date: '2025-03-01', description: 'Monthly Subscription', method: 'Visa •••• 4242', amount: 100, status: 'Pending' },
  { id: 'TXN-0040', date: '2025-02-01', description: 'Monthly Subscription', method: 'Visa •••• 4242', amount: 100, status: 'Paid' },
  { id: 'TXN-0039', date: '2025-01-15', description: 'Late Fee', method: 'Bank Transfer', amount: 25, status: 'Paid' },
  { id: 'TXN-0038', date: '2025-01-01', description: 'Monthly Subscription', method: 'Visa •••• 4242', amount: 100, status: 'Paid' },
  { id: 'TXN-0037', date: '2024-12-01', description: 'Monthly Subscription', method: 'Mastercard •••• 8811', amount: 100, status: 'Paid' },
  { id: 'TXN-0036', date: '2024-11-10', description: 'Damage Deposit', method: 'Bank Transfer', amount: 500, status: 'Refunded' },
  { id: 'TXN-0035', date: '2024-11-01', description: 'Monthly Subscription', method: 'Mastercard •••• 8811', amount: 100, status: 'Failed' },
];

const STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: string; cls: string }> = {
  Paid:     { label: 'Paid',     icon: '✓', cls: 'status-paid' },
  Pending:  { label: 'Pending',  icon: '◷', cls: 'status-pending' },
  Failed:   { label: 'Failed',   icon: '✕', cls: 'status-failed' },
  Refunded: { label: 'Refunded', icon: '↩', cls: 'status-refunded' },
};

const METHOD_ICONS: Record<string, string> = {
  Visa: '💳',
  Mastercard: '💳',
  Bank: '🏦',
};

function getMethodIcon(method: string): string {
  const key = Object.keys(METHOD_ICONS).find(k => method.startsWith(k));
  return key ? METHOD_ICONS[key] : '💳';
}

const ALL_STATUSES: PaymentStatus[] = ['Paid', 'Pending', 'Failed', 'Refunded'];

const OwnerPayments: React.FC = () => {
  const [filter, setFilter] = useState<PaymentStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalFailed = payments.filter(p => p.status === 'Failed').reduce((s, p) => s + p.amount, 0);

  const filtered = useMemo(() => {
    return payments
      .filter(p => filter === 'All' || p.status === filter)
      .filter(p =>
        p.id.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.method.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDir === 'desc' ? -diff : diff;
      });
  }, [filter, search, sortDir]);

  return (
    <div className="op-root">
      {/* Header */}
      <div className="op-header">
        <div>
          <h2 className="op-title">Payment History</h2>
          <p className="op-subtitle">{payments.length} transactions · All time</p>
        </div>
        <button className="op-export-btn">
          <span>↓</span> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="op-stats">
        <div className="op-stat op-stat--paid">
          <span className="op-stat-label">Total Paid</span>
          <span className="op-stat-value">${totalPaid.toLocaleString()}</span>
          <span className="op-stat-tag">✓ Cleared</span>
        </div>
        <div className="op-stat op-stat--pending">
          <span className="op-stat-label">Pending</span>
          <span className="op-stat-value">${totalPending.toLocaleString()}</span>
          <span className="op-stat-tag">◷ Awaiting</span>
        </div>
        <div className="op-stat op-stat--failed">
          <span className="op-stat-label">Failed</span>
          <span className="op-stat-value">${totalFailed.toLocaleString()}</span>
          <span className="op-stat-tag">✕ Action needed</span>
        </div>
      </div>

      {/* Controls */}
      <div className="op-controls">
        <div className="op-search-wrap">
          <span className="op-search-icon">⌕</span>
          <input
            className="op-search"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="op-filters">
          {(['All', ...ALL_STATUSES] as const).map(s => (
            <button
              key={s}
              className={`op-filter-btn ${filter === s ? 'op-filter-btn--active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="op-table-wrap">
        <table className="op-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th
                className="op-sortable"
                onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
              >
                Date <span className="op-sort-icon">{sortDir === 'desc' ? '↓' : '↑'}</span>
              </th>
              <th>Description</th>
              <th>Payment Method</th>
              <th className="op-th-right">Amount</th>
              <th className="op-th-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="op-empty">No transactions found</td>
              </tr>
            )}
            {filtered.map((p, i) => {
              const cfg = STATUS_CONFIG[p.status];
              return (
                <tr key={p.id} className="op-row" style={{ animationDelay: `${i * 40}ms` }}>
                  <td>
                    <span className="op-txn-id">{p.id}</span>
                  </td>
                  <td className="op-date">
                    {new Date(p.date).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                  <td className="op-desc">{p.description}</td>
                  <td>
                    <span className="op-method">
                      {getMethodIcon(p.method)} {p.method}
                    </span>
                  </td>
                  <td className="op-amount">${p.amount.toLocaleString()}</td>
                  <td className="op-td-center">
                    <span className={`op-badge ${cfg.cls}`}>
                      <span className="op-badge-icon">{cfg.icon}</span>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="op-footer">
        Showing {filtered.length} of {payments.length} transactions
      </div>
    </div>
  );
};

export default OwnerPayments;