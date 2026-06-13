import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  fetchAnalytics,
  selectTransactions,
  selectAppointments,
  selectAnalyticsLoading,
  selectAnalyticsError,
} from '../redux/ownerAnalyticsSlice';
import type { AppDispatch } from '../redux/store';
import type { RootState } from '../redux/store';
import './OwnerAnalytics.css';
import { generateProPDFReport } from '../utils/reportgenerator';
import { getAllTrainers } from '../redux/trainerSlice';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TRAINER_TYPE_META: Record<string, { label: string; color: string }> = {
  muscle_gain:     { label: 'Muscle Gain',     color: '#f97316' },
  weight_loss:     { label: 'Weight Loss',     color: '#ef4444' },
  endurance:       { label: 'Endurance',       color: '#3b82f6' },
  flexibility:     { label: 'Flexibility',     color: '#8b5cf6' },
  rehabilitation:  { label: 'Rehabilitation',  color: '#22c55e' },
  nutrition:       { label: 'Nutrition',       color: '#10b981' },
  general_fitness: { label: 'General Fitness', color: '#06b6d4' },
};

function trainerTypeMeta(type: string) {
  return TRAINER_TYPE_META[type] ?? { label: type, color: '#8a8fa8' };
}

type AppointmentStatus = 'Completed' | 'Pending' | 'Cancelled' | 'No-Show';

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  Completed: '#22c55e',
  Pending:   '#f59e0b',
  Cancelled: '#ef4444',
  'No-Show': '#8b5cf6',
};

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function groupByMonth(txns: any[]) {
  const map: Record<string, { income: number; transactions: number }> = {};
  txns.forEach(t => {
    const d = new Date(t.transactionDate);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    if (!map[key]) map[key] = { income: 0, transactions: 0 };
    map[key].income += t.amount;
    map[key].transactions += 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, mon] = key.split('-');
      return {
        month: `${MONTH_NAMES[parseInt(mon)]} '${year.slice(2)}`,
        income: val.income,
        transactions: val.transactions,
      };
    });
}

function buildTrainerAppointmentData(appts: any[]) {
  const map: Record<string, {
    name: string;
    Completed: number; Pending: number; Cancelled: number; 'No-Show': number; total: number;
  }> = {};
  appts.forEach(a => {
    if (!map[a.trainerId]) {
      const parts = a.trainerName.split(' ');
      map[a.trainerId] = {
        name: `${parts[0]} ${parts[1]?.[0] ?? ''}.`,
        Completed: 0, Pending: 0, Cancelled: 0, 'No-Show': 0, total: 0,
      };
    }
    map[a.trainerId][a.status as AppointmentStatus] += 1;
    map[a.trainerId].total += 1;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

function downloadAsPNG(containerId: string, filename: string) {
  const svgEl = document.getElementById(containerId)?.querySelector('svg');
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true) as SVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const w = svgEl.clientWidth || 600;
  const h = svgEl.clientHeight || 300;
  clone.setAttribute('width', String(w));
  clone.setAttribute('height', String(h));
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    ctx.fillStyle = '#151724';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    });
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
}

function downloadAsSVG(containerId: string, filename: string) {
  const svgEl = document.getElementById(containerId)?.querySelector('svg');
  if (!svgEl) return;
  const clone = svgEl.cloneNode(true) as SVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const blob = new Blob([clone.outerHTML], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

async function downloadAsPDF(containerId: string, filename: string) {
  const element = document.getElementById(containerId);
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#151724" });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

const IncomeTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ad-tooltip">
      <p className="ad-tooltip-label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="ad-tooltip-row" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span>{p.name === 'Income' ? `Rs. ${p.value.toLocaleString()}` : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const ApptTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s: number, p: any) => s + (p.value || 0), 0);
  return (
    <div className="ad-tooltip">
      <p className="ad-tooltip-label">{label}</p>
      {payload.map((p: any) => p.value > 0 && (
        <p key={p.name} className="ad-tooltip-row" style={{ color: p.fill || p.color }}>
          <span>{p.name}</span><span>{p.value}</span>
        </p>
      ))}
      <div className="ad-tooltip-divider" />
      <p className="ad-tooltip-row ad-tooltip-total">
        <span>Total</span><span>{total}</span>
      </p>
    </div>
  );
};

interface ChartCardProps {
  id: string; title: string; subtitle: string;
  icon: string; accent: string; animDelay?: number;
  badge?: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({
  id, title, subtitle, icon, accent, animDelay = 0, badge, children
}) => {
  const [open, setOpen] = useState(false);
  const slug = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <div
      className="ad-card"
      style={{ '--card-accent': accent, animationDelay: `${animDelay}ms` } as React.CSSProperties}
    >
      <div className="ad-card-header">
        <div className="ad-card-title-group">
          <span className="ad-card-icon" style={{ background: `${accent}22`, color: accent }}>{icon}</span>
          <div>
            <div className="ad-card-title-row">
              <h3 className="ad-card-title">{title}</h3>
              {badge && (
                <span
                  className="ad-card-badge"
                  style={{ background: `${accent}18`, color: accent, borderColor: `${accent}35` }}
                >
                  {badge}
                </span>
              )}
            </div>
            <p className="ad-card-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="ad-dl-wrap">
          <button className="ad-dl-btn" onClick={() => setOpen(v => !v)}>↓ Export</button>
          {open && (
            <div className="ad-dl-menu">
              <button onClick={() => { setOpen(false); downloadAsPNG(id, `${slug}.png`); }}>🖼 PNG</button>
              <button onClick={() => { setOpen(false); downloadAsSVG(id, `${slug}.svg`); }}>📐 SVG</button>
            </div>
          )}
        </div>
      </div>
      <div id={id} className="ad-chart-area">{children}</div>
    </div>
  );
};

const RADIAN = Math.PI / 180;
const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.07) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text
      x={cx + r * Math.cos(-midAngle * RADIAN)}
      y={cy + r * Math.sin(-midAngle * RADIAN)}
      fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="ad-root">
    <div className="ad-skeleton ad-skeleton--header" />
    <div className="ad-kpis">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="ad-skeleton ad-skeleton--kpi" />
      ))}
    </div>
    <div className="ad-skeleton ad-skeleton--chart-wide" />
    <div className="ad-charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="ad-skeleton ad-skeleton--chart" />
      <div className="ad-skeleton ad-skeleton--chart" />
    </div>
  </div>
);

const OwnerAnalytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector(selectTransactions);
  const appointments = useSelector(selectAppointments);
  const loading      = useSelector(selectAnalyticsLoading);
  const error        = useSelector(selectAnalyticsError);
  const trainers     = useSelector((state: RootState) => state.trainer.trainers);

  // ✅ Date range filter state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  useEffect(() => {
    const token = localStorage.getItem('ownerToken');
    if (token) {
      dispatch(fetchAnalytics(token));
      dispatch(getAllTrainers(token));
    }
  }, [dispatch]);

  // ✅ Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    if (!dateFrom && !dateTo) return transactions;
    return transactions.filter(t => {
      const d = new Date(t.transactionDate);
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [transactions, dateFrom, dateTo]);

  // ✅ Filter appointments by date range
  const filteredAppointments = useMemo(() => {
    if (!dateFrom && !dateTo) return appointments;
    return appointments.filter(a => {
      const d = new Date(a.date); // adjust field name if needed
      if (dateFrom && d < new Date(dateFrom)) return false;
      if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [appointments, dateFrom, dateTo]);

  // ✅ All derived data now uses filtered versions
  const monthlyData     = useMemo(() => groupByMonth(filteredTransactions), [filteredTransactions]);
  const trainerApptData = useMemo(() => buildTrainerAppointmentData(filteredAppointments), [filteredAppointments]);

  const trainerTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    trainers.forEach(t => {
      counts[t.type] = (counts[t.type] ?? 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type:  trainerTypeMeta(type).label,
      count,
      color: trainerTypeMeta(type).color,
    }));
  }, [trainers]);

  const totalIncome    = useMemo(() => filteredTransactions.reduce((s, t) => s + t.amount, 0), [filteredTransactions]);
  const totalTxns      = filteredTransactions.length;
  const uniqueMembers  = useMemo(() => new Set(filteredTransactions.map(t => t.memberId)).size, [filteredTransactions]);
  const totalAppts     = filteredAppointments.length;
  const completedAppts = useMemo(() => filteredAppointments.filter(a => a.status === 'Completed').length, [filteredAppointments]);
  const completionRate = totalAppts > 0 ? Math.round((completedAppts / totalAppts) * 100) : 0;

  const lastTwo   = monthlyData.slice(-2);
  const momGrowth = lastTwo.length === 2 && lastTwo[0].income > 0
    ? (((lastTwo[1].income - lastTwo[0].income) / lastTwo[0].income) * 100).toFixed(1)
    : null;

  const dateRangeLabel = useMemo(() => {
    if (monthlyData.length === 0) return '—';
    const first = monthlyData[0].month;
    const last  = monthlyData[monthlyData.length - 1].month;
    return first === last ? first : `${first} – ${last}`;
  }, [monthlyData]);

  const handleExportPDF = () => {
    generateProPDFReport({
      totalIncome,
      totalTxns,
      totalAppts,
      completionRate,
      uniqueMembers,
      monthlyData
    });
  };

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="ad-root">
        <div className="ad-error-state">
          <span className="ad-error-icon">⚠️</span>
          <p className="ad-error-title">Failed to load analytics</p>
          <p className="ad-error-sub">{error}</p>
          <button
            className="ad-error-retry"
            onClick={() => {
              const token = localStorage.getItem('ownerToken');
              if (token) dispatch(fetchAnalytics(token));
            }}
          >
            ↺ Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-root">

      {/* ── Header with date range filter ── */}
      <div className="ad-header">
  {/* ── Left: title + date picker stacked ── */}
  <div className="ad-header-left">
    <div>
      <h2 className="ad-title">Analytics Overview</h2>
      <p className="ad-subtitle">FitIQ Platform · Payments & Trainer Appointments</p>
    </div>

    <div className="ad-date-range">
      <div className="ad-date-field">
        <label className="ad-date-label">From</label>
        <input
          type="date"
          className="ad-date-input"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
      </div>
      <span className="ad-date-sep">→</span>
      <div className="ad-date-field">
        <label className="ad-date-label">To</label>
        <input
          type="date"
          className="ad-date-input"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />
      </div>
      {(dateFrom || dateTo) && (
        <button
          className="ad-date-clear"
          onClick={() => { setDateFrom(''); setDateTo(''); }}
        >
          ✕ Clear
        </button>
      )}
    </div>
  </div>

  {/* ── Right: period badge + export ── */}
  <div className="ad-header-controls">
    <div className="ad-period-badge">{dateRangeLabel}</div>
    <button className="ad-dl-btn" onClick={handleExportPDF}>📄 Export Full Report</button>
  </div>
</div>

      {/* ── KPI Cards ── */}
      <div className="ad-kpis">
        <div className="ad-kpi" style={{ '--kpi-color': '#22c55e' } as React.CSSProperties}>
          <span className="ad-kpi-label">Total Income</span>
          <span className="ad-kpi-value">Rs. {totalIncome.toLocaleString()}</span>
          {momGrowth && (
            <span className={`ad-kpi-delta ${Number(momGrowth) >= 0 ? 'ad-kpi-delta--up' : 'ad-kpi-delta--down'}`}>
              {Number(momGrowth) >= 0 ? '↑' : '↓'} {Math.abs(Number(momGrowth))}% MoM
            </span>
          )}
        </div>
        <div className="ad-kpi" style={{ '--kpi-color': '#3b82f6' } as React.CSSProperties}>
          <span className="ad-kpi-label">Transactions</span>
          <span className="ad-kpi-value">{totalTxns}</span>
          <span className="ad-kpi-delta ad-kpi-delta--up">
            {dateFrom || dateTo ? 'Filtered range' : 'All time'}
          </span>
        </div>
        <div className="ad-kpi" style={{ '--kpi-color': '#f59e0b' } as React.CSSProperties}>
          <span className="ad-kpi-label">Appointments</span>
          <span className="ad-kpi-value">{totalAppts}</span>
          <span className="ad-kpi-delta ad-kpi-delta--up">{completionRate}% completion rate</span>
        </div>
        <div className="ad-kpi" style={{ '--kpi-color': '#8b5cf6' } as React.CSSProperties}>
          <span className="ad-kpi-label">Paying Members</span>
          <span className="ad-kpi-value">{uniqueMembers}</span>
          <span className="ad-kpi-delta ad-kpi-delta--up">Unique members</span>
        </div>
      </div>

      {filteredTransactions.length === 0 && filteredAppointments.length === 0 && (
        <div className="ad-empty-state">
          <span>📊</span>
          <p>
            {(dateFrom || dateTo)
              ? 'No data found for the selected date range. Try adjusting the filter.'
              : 'No data available yet. Transactions and appointments will appear here once recorded.'}
          </p>
        </div>
      )}

      {(filteredTransactions.length > 0 || filteredAppointments.length > 0) && (
        <div className="ad-charts-grid">

          <ChartCard
            id="chart-income"
            title="Monthly Income"
            subtitle="Revenue collected from member payments per month"
            icon="📈" accent="#6366f1" animDelay={0}
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTxn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#8a8fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fill: '#8a8fa8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8a8fa8', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={<IncomeTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px', color: '#8a8fa8' }} />
                <Area yAxisId="left"  type="monotone" dataKey="income"       name="Income"       stroke="#6366f1" strokeWidth={2.5} fill="url(#gIncome)" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
                <Area yAxisId="right" type="monotone" dataKey="transactions" name="Transactions" stroke="#f59e0b" strokeWidth={2}   fill="url(#gTxn)"    dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            id="chart-trainer-types"
            title="Trainer Specialties"
            subtitle="Breakdown of active trainers by their specialty type"
            icon="🥧" accent="#f97316" animDelay={120}
          >
            {trainerTypeData.length === 0 ? (
              <div className="ad-chart-empty">No trainer data yet</div>
            ) : (
              <div className="ad-pie-layout">
                <ResponsiveContainer width="55%" height={260}>
                  <PieChart>
                    <Pie
                      data={trainerTypeData}
                      dataKey="count" nameKey="type"
                      cx="50%" cy="50%"
                      innerRadius={58} outerRadius={100}
                      paddingAngle={3} labelLine={false} label={DonutLabel}
                    >
                      {trainerTypeData.map((d, i) => (
                        <Cell key={i} fill={d.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} trainers`, name]}
                      contentStyle={{ background: '#1e2130', border: '1px solid #2a2d3e', borderRadius: 8, color: '#f0f0f5', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ad-pie-legend">
                  {trainerTypeData.map((d, i) => (
                    <div key={i} className="ad-pie-legend-row">
                      <span className="ad-pie-dot" style={{ background: d.color }} />
                      <span className="ad-pie-leg-label">{d.type}</span>
                      <span className="ad-pie-leg-count">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ChartCard>

          <ChartCard
            id="chart-trainer-appts"
            title="Trainer Appointment Activity"
            subtitle="Completed, pending, cancelled & no-show sessions per trainer"
            icon="🏋️" accent="#22c55e" animDelay={240}
            badge={`${totalAppts} total`}
          >
            {trainerApptData.length === 0 ? (
              <div className="ad-chart-empty">No appointment data yet</div>
            ) : (
              <>
                <div className="ad-appt-strip">
                  {trainerApptData.map((t, i) => {
                    const rate = t.total > 0 ? Math.round((t.Completed / t.total) * 100) : 0;
                    return (
                      <div key={i} className="ad-appt-strip-item">
                        <span className="ad-appt-strip-name">{t.name}</span>
                        <div className="ad-appt-strip-bar-bg">
                          <div className="ad-appt-strip-bar-fill" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="ad-appt-strip-rate">{rate}%</span>
                      </div>
                    );
                  })}
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trainerApptData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#8a8fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8a8fa8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ApptTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px', color: '#8a8fa8' }} />
                    <Bar dataKey="Completed" name="Completed" stackId="a" fill={STATUS_COLORS.Completed}  radius={[0,0,0,0]} maxBarSize={52} />
                    <Bar dataKey="Pending"   name="Pending"   stackId="a" fill={STATUS_COLORS.Pending}    maxBarSize={52} />
                    <Bar dataKey="Cancelled" name="Cancelled" stackId="a" fill={STATUS_COLORS.Cancelled}  maxBarSize={52} />
                    <Bar dataKey="No-Show"   name="No-Show"   stackId="a" fill={STATUS_COLORS['No-Show']} radius={[5,5,0,0]} maxBarSize={52} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </ChartCard>

        </div>
      )}
    </div>
  );
};

export default OwnerAnalytics;