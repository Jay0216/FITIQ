import React, { useState, useEffect, useMemo, useRef } from 'react';
import './Appointments.css';
import {
  Calendar, Clock, User, Video, MapPin,
  ChevronLeft, ChevronRight, Dumbbell, X, CheckCircle, Loader,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { fetchMemberWorkoutPlansThunk } from '../redux/workoutPlanSlice';
import { getAllTrainers } from '../redux/trainerSlice';
import { bookAppointmentThunk, fetchAppointmentsThunk } from '../redux/appointmentSlice';
import type { AppointmentRequest, AppointmentResponse } from '../API/appointmentAPI';
import type { WorkoutPlanResponse } from '../API/workoutPlanAPI';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAME_TO_INDEX: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
  sun: 0,    mon: 1,    tue: 2,     wed: 3,        thu: 4,      fri: 5,    sat: 6,
};

const TRAINER_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  weight_loss:     { label: 'Weight Loss',     icon: '🔥' },
  muscle_gain:     { label: 'Muscle Gain',     icon: '💪' },
  endurance:       { label: 'Endurance',       icon: '🏃' },
  flexibility:     { label: 'Flexibility',     icon: '🧘' },
  general_fitness: { label: 'General Fitness', icon: '⚡' },
};

// ─── Status helpers ───────────────────────────────────────────────────────────
// Backend sends "In-person", "Virtual", "Completed", "Cancelled" etc.
// Normalise to lowercase for consistent comparison.

function normaliseStatus(raw: string): 'upcoming' | 'completed' | 'cancelled' | 'unknown' {
  const s = raw?.trim().toLowerCase();
  if (s === 'completed')                         return 'completed';
  if (s === 'cancelled' || s === 'canceled')     return 'cancelled';
  // "in-person", "virtual", "scheduled", "confirmed" → all mean upcoming
  return 'upcoming';
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseDateLocal(dateStr: string): Date {
  const datePart = dateStr.split('T')[0].trim();
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * The API stores appointment dates as human-readable strings like
 * "Tuesday, March 24, 2026". We need to convert that back to "YYYY-MM-DD"
 * for calendar comparison. Falls back gracefully if it's already YYYY-MM-DD.
 */
function normaliseDateToKey(dateStr: string): string {
  if (!dateStr) return '';
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.split('T')[0];
  // Human readable — parse via Date constructor (safe for full strings like "Tuesday, March 24, 2026")
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return formatLocal(parsed);
  return dateStr; // fallback
}

// ─── Plan date builders ───────────────────────────────────────────────────────

function buildAllowedDatesForPlan(plan: WorkoutPlanResponse): Set<string> {
  const allowed = new Set<string>();
  if (!plan.startDate || !plan.endDate || !plan.trainingDays?.length) return allowed;

  const indices = plan.trainingDays
    .map((d) => DAY_NAME_TO_INDEX[d.trim().toLowerCase()])
    .filter((n): n is number => n !== undefined);

  if (indices.length === 0) return allowed;

  const start  = parseDateLocal(plan.startDate);
  const end    = parseDateLocal(plan.endDate);
  const cursor = new Date(start);
  while (cursor <= end) {
    if (indices.includes(cursor.getDay())) allowed.add(formatLocal(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return allowed;
}

function buildAllowedDatesForPlans(plans: WorkoutPlanResponse[]): Set<string> {
  const merged = new Set<string>();
  plans.forEach((p) => buildAllowedDatesForPlan(p).forEach((d) => merged.add(d)));
  return merged;
}

function buildInRangeDates(plans: WorkoutPlanResponse[]): Set<string> {
  const inRange = new Set<string>();
  for (const plan of plans) {
    if (!plan.startDate || !plan.endDate) continue;
    const start  = parseDateLocal(plan.startDate);
    const end    = parseDateLocal(plan.endDate);
    const cursor = new Date(start);
    while (cursor <= end) {
      inRange.add(formatLocal(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return inRange;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Appointments: React.FC = () => {
  const dispatch   = useDispatch<AppDispatch>();
  const bookingRef = useRef<HTMLDivElement>(null);

  const memberPlans      = useSelector((state: RootState) => state.workoutplan.plans);
  const { trainers }     = useSelector((state: RootState) => state.trainer);
  const rawAppointments  = useSelector((state: RootState) => state.appointments.appointments) as AppointmentResponse[];
  const bookingLoading   = useSelector((state: RootState) => state.appointments.loading);

  useEffect(() => {
    const token = localStorage.getItem('memberToken');
    if (token) {
      dispatch(fetchMemberWorkoutPlansThunk(token));
      dispatch(getAllTrainers(token));
      dispatch(fetchAppointmentsThunk(token));
    }
  }, [dispatch]);

  // ── Normalise appointments from API ───────────────────────────────────────
  // Convert date to YYYY-MM-DD key and status to our internal values
  const appointments = useMemo(() =>
    rawAppointments.map((apt) => ({
      ...apt,
      dateKey:         normaliseDateToKey(apt.date),     // "YYYY-MM-DD" for comparison
      normalisedStatus: normaliseStatus(apt.status),     // 'upcoming' | 'completed' | 'cancelled'
    })),
    [rawAppointments]
  );

  // Set of YYYY-MM-DD dates that already have an appointment (any status)
  const bookedDateKeys = useMemo(
    () => new Set(appointments.map((a) => a.dateKey)),
    [appointments]
  );

  // ── Plan filter ────────────────────────────────────────────────────────────
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const activePlans: WorkoutPlanResponse[]  = memberPlans ?? [];

  const relevantPlans = useMemo(
    () => selectedPlanId ? activePlans.filter((p) => p.id === selectedPlanId) : activePlans,
    [activePlans, selectedPlanId]
  );

  const allowedDates     = useMemo(() => buildAllowedDatesForPlans(relevantPlans), [relevantPlans]);
  const inRangeDates     = useMemo(() => buildInRangeDates(relevantPlans),         [relevantPlans]);
  const trainingDayNames = useMemo(() => {
    const s = new Set<string>();
    relevantPlans.forEach((p) => p.trainingDays?.forEach((d) => s.add(d)));
    return Array.from(s);
  }, [relevantPlans]);

  const plansLoaded = activePlans.length > 0 && allowedDates.size > 0;

  // ── Booking state ──────────────────────────────────────────────────────────
  const [showBooking, setShowBooking]         = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedDate, setSelectedDate]       = useState('');   // always YYYY-MM-DD
  const [selectedTime, setSelectedTime]       = useState('');
  const [bookingError, setBookingError]       = useState('');

  // ── Calendar state ─────────────────────────────────────────────────────────
  const today    = new Date();
  const todayKey = formatLocal(today);

  const [calendarDate, setCalendarDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  useEffect(() => { setSelectedDate(''); closeBooking(); }, [selectedPlanId]);

  // ── Trainers ───────────────────────────────────────────────────────────────
  const mappedTrainers = useMemo(
    () => trainers.map((t) => ({
      id: t.id, name: t.fullname, typeKey: t.type, available: t.availableForAppointments,
    })),
    [trainers]
  );

  const availableSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const closeBooking = () => {
    setShowBooking(false);
    setSelectedTrainer('');
    setSelectedTime('');
    setBookingError('');
    // Keep selectedDate so the calendar highlight + appointment list filter stays
  };

  const handleDayClick = (dateKey: string, state: 'training' | 'rest' | 'out-of-range') => {
    if (state !== 'training') return;

    // Always update the selected date for filtering the appointments list
    setSelectedDate(dateKey);

    // If this date already has an appointment — just show the appointments list, don't open booking
    if (bookedDateKeys.has(dateKey)) {
      setShowBooking(false);
      return;
    }

    // Otherwise open the booking form
    setSelectedTrainer('');
    setSelectedTime('');
    setBookingError('');
    setShowBooking(true);
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const handleBooking = async () => {
    if (!selectedTrainer || !selectedDate || !selectedTime) return;

    const token = localStorage.getItem('memberToken');
    if (!token) { setBookingError('You must be logged in to book.'); return; }

    const trainer = mappedTrainers.find((t) => t.name === selectedTrainer);
    if (!trainer) return;

    // Format date as human-readable for the API (matches AppointmentRequest.date type)
    const humanDate = parseDateLocal(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    const appointmentData: AppointmentRequest = {
      trainerId:   trainer.id,
      trainerName: trainer.name,
      date:        humanDate,   // "Tuesday, March 24, 2026"
      timeSlot:    selectedTime,
      status:      'In-person',
    };

    setBookingError('');
    try {
      await dispatch(bookAppointmentThunk({ token, data: appointmentData })).unwrap();
      dispatch(fetchAppointmentsThunk(token)); // refresh list
      closeBooking();
    } catch (err: any) {
      setBookingError(err?.message ?? String(err) ?? 'Failed to book. Please try again.');
    }
  };

  // ── Calendar helpers ───────────────────────────────────────────────────────
  const getDaysInMonth     = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
  const formatDateKey      = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const prevMonth = () =>
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  const year        = calendarDate.getFullYear();
  const month       = calendarDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);
  const monthName   = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayState = (dateKey: string): 'training' | 'rest' | 'out-of-range' => {
    if (!plansLoaded)              return 'out-of-range';
    if (allowedDates.has(dateKey)) return 'training';
    if (inRangeDates.has(dateKey)) return 'rest';
    return 'out-of-range';
  };

  // ── Filtered appointments list ─────────────────────────────────────────────
  const filteredAppointments = selectedDate
    ? appointments.filter((a) => a.dateKey === selectedDate)
    : appointments;

  const upcomingAppointments = filteredAppointments.filter((a) => a.normalisedStatus === 'upcoming');
  const pastAppointments     = filteredAppointments.filter((a) => a.normalisedStatus === 'completed');

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="appointments">

      {/* Header */}
      <div className="appointments-header">
        <div className="appointments-header-content">
          <h1>Appointments</h1>
          <p>
            {plansLoaded
              ? 'Click a green training day to book · Yellow dot = appointment booked'
              : 'Manage your training sessions with coaches'}
          </p>
        </div>
      </div>

      {/* Plan Filter Pills */}
      {activePlans.length > 0 && (
        <div className="plan-filter-bar">
          <button
            className={`plan-pill ${selectedPlanId === null ? 'active' : ''}`}
            onClick={() => setSelectedPlanId(null)}
          >
            <Dumbbell size={13} />All Plans
          </button>
          {activePlans.map((plan) => (
            <button
              key={plan.id}
              className={`plan-pill ${selectedPlanId === plan.id ? 'active' : ''}`}
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <Calendar size={13} />
              {plan.planTitle}
              {plan.active && <span className="plan-pill-active-dot" />}
            </button>
          ))}
        </div>
      )}

      {/* Selected plan info bar */}
      {selectedPlanId && (() => {
        const plan = activePlans.find((p) => p.id === selectedPlanId);
        if (!plan) return null;
        return (
          <div className="plan-date-range-bar">
            <span className="plan-date-range-label">
              <Calendar size={13} />
              {parseDateLocal(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' — '}
              {parseDateLocal(plan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="plan-date-range-days">
              Training on: {plan.trainingDays.join(', ')}
            </span>
          </div>
        );
      })()}

      {/* ── Calendar ──────────────────────────────────────────────────────── */}
      <div className="calendar-filter">
        <div className="calendar-filter-header">
          <div className="calendar-filter-title">
            <Calendar size={18} />
            <span>{plansLoaded ? 'Select a training day' : 'Calendar'}</span>
          </div>
          {selectedDate && (
            <button className="clear-filter-btn" onClick={() => { setSelectedDate(''); closeBooking(); }}>
              Clear selection
            </button>
          )}
        </div>

        {plansLoaded && (
          <div className="cal-legend">
            <span className="cal-legend-dot training" />
            <span className="cal-legend-text">
              Training day {trainingDayNames.length > 0 && `(${trainingDayNames.join(', ')})`}
            </span>
            <span className="cal-legend-dot rest" />
            <span className="cal-legend-text">Rest day</span>
            <span className="cal-legend-dot appointment" />
            <span className="cal-legend-text">Booked</span>
          </div>
        )}

        {!plansLoaded && activePlans.length === 0 && (
          <p className="cal-loading-hint">Loading your training schedule...</p>
        )}
        {activePlans.length > 0 && allowedDates.size === 0 && (
          <p className="cal-loading-hint" style={{ color: 'var(--danger)' }}>
            ⚠ No training dates found — check your plan configuration.
          </p>
        )}

        <div className="mini-calendar">
          <div className="calendar-nav">
            <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <span className="cal-month-label">{monthName}</span>
            <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>

          <div className="calendar-grid">
            {weekDays.map((d) => (
              <div key={d} className="cal-weekday">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} className="cal-empty" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day        = i + 1;
              const dateKey    = formatDateKey(year, month, day);
              const state      = getDayState(dateKey);
              const hasApt     = bookedDateKeys.has(dateKey);   // ← uses normalised keys
              const isSelected = selectedDate === dateKey;
              const isToday    = dateKey === todayKey;
              const isTraining = state === 'training';

              return (
                <button
                  key={day}
                  title={
                    isTraining
                      ? (hasApt ? 'Appointment booked — click to view' : 'Click to book this training day')
                      : state === 'rest' ? 'Rest day' : 'Outside plan range'
                  }
                  className={[
                    'cal-day',
                    `cal-day--${state}`,
                    hasApt     ? 'has-appointment' : '',
                    isSelected ? 'selected'        : '',
                    isToday    ? 'today'           : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleDayClick(dateKey, state)}
                >
                  {day}
                  {hasApt && isTraining && <span className="apt-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="filter-active-label">
            {bookedDateKeys.has(selectedDate) ? '📋 Showing appointment for ' : 'Selected: '}
            <strong>
              {parseDateLocal(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </strong>
          </div>
        )}
      </div>

      {/* ── Booking Panel ─────────────────────────────────────────────────── */}
      {showBooking && selectedDate && !bookedDateKeys.has(selectedDate) && (
        <div className="booking-panel" ref={bookingRef}>
          <div className="booking-header">
            <div>
              <h2>Book a Training Session</h2>
              <p className="booking-date-context">
                <Calendar size={13} />
                {parseDateLocal(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                })}
              </p>
              {selectedPlanId && (() => {
                const plan = activePlans.find((p) => p.id === selectedPlanId);
                return plan ? <p className="booking-plan-context">Plan: <strong>{plan.planTitle}</strong></p> : null;
              })()}
            </div>
            <button className="booking-close-btn" onClick={closeBooking}><X size={18} /></button>
          </div>

          <div className="booking-form">
            {/* Trainer selection */}
            <div className="trainers-selection">
              <h3>Select Trainer</h3>
              {mappedTrainers.length === 0 ? (
                <p className="trainers-empty">No trainers available at the moment.</p>
              ) : (
                <div className="trainers-grid">
                  {mappedTrainers.map((trainer) => {
                    const typeInfo    = TRAINER_TYPE_LABELS[trainer.typeKey] ?? { label: trainer.typeKey.replace(/_/g, ' '), icon: '🏋️' };
                    const isSelected  = selectedTrainer === trainer.name;
                    const unavailable = !trainer.available;
                    return (
                      <div
                        key={trainer.id}
                        className={`trainer-card ${isSelected ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`}
                        onClick={() => !unavailable && setSelectedTrainer(trainer.name)}
                      >
                        <div className="trainer-avatar"><User size={24} /></div>
                        <div className="trainer-info">
                          <h4>{trainer.name}</h4>
                          <span className="trainer-type-badge">{typeInfo.icon} {typeInfo.label}</span>
                          {unavailable && <span className="unavailable-badge">Not Available</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time slot */}
            <div className="form-group">
              <label>Select Time Slot</label>
              <div className="time-slots">
                {availableSlots.map((slot, i) => (
                  <button
                    key={i}
                    className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {bookingError && (
              <p className="date-error-hint">{bookingError}</p>
            )}

            <button
              className="confirm-booking-btn"
              onClick={handleBooking}
              disabled={!selectedTrainer || !selectedTime || bookingLoading}
            >
              {bookingLoading
                ? <><Loader size={16} className="spin-icon" /> Booking...</>
                : <><CheckCircle size={16} /> Confirm Booking</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Appointments Grid ──────────────────────────────────────────────── */}
      <div className="appointments-grid">

        <div className="appointments-section">
          <h2>
            Upcoming Sessions
            {selectedDate && (
              <span className="section-date-badge">
                {parseDateLocal(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </h2>
          <div className="appointments-list">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card upcoming">
                  <div className="appointment-header">
                    <div className="appointment-trainer">
                      <div className="trainer-avatar-small"><User size={20} /></div>
                      <span>{apt.trainerName}</span>
                    </div>
                    {/* Show In-Person / Virtual badge from raw status */}
                    <div className={`appointment-type ${apt.status?.toLowerCase().includes('virtual') ? 'virtual' : 'in-person'}`}>
                      {apt.status?.toLowerCase().includes('virtual')
                        ? <><Video size={16} /> Virtual</>
                        : <><MapPin size={16} /> In-Person</>
                      }
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div className="detail-item">
                      <Calendar size={18} />
                      {/* Show the human-readable date from API, or parse dateKey */}
                      <span>
                        {apt.date.includes(',')
                          ? apt.date   // already "Tuesday, March 24, 2026"
                          : parseDateLocal(apt.dateKey).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                        }
                      </span>
                    </div>
                    <div className="detail-item"><Clock size={18} /><span>{apt.timeSlot}</span></div>
                    {apt.venue && <div className="detail-item"><MapPin size={18} /><span>{apt.venue}</span></div>}
                  </div>
                  <div className="appointment-actions">
                    <button className="action-btn reschedule">Reschedule</button>
                    <button className="action-btn cancel">Cancel</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <p>
                  {selectedDate
                    ? bookedDateKeys.has(selectedDate)
                      ? 'No upcoming session — appointment may be completed or cancelled'
                      : 'No appointment booked for this date yet'
                    : 'No upcoming appointments'}
                </p>
                {!selectedDate && plansLoaded && (
                  <p className="empty-state-hint">Click a green training day above to book</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="appointments-section">
          <h2>Past Sessions</h2>
          <div className="appointments-list">
            {pastAppointments.length > 0 ? (
              pastAppointments.map((apt) => (
                <div key={apt.id} className="appointment-card past">
                  <div className="appointment-header">
                    <div className="appointment-trainer">
                      <div className="trainer-avatar-small"><User size={20} /></div>
                      <span>{apt.trainerName}</span>
                    </div>
                    <div className="completed-badge">
                      <CheckCircle size={13} />
                      Completed
                    </div>
                  </div>
                  <div className="appointment-details">
                    <div className="detail-item">
                      <Calendar size={18} />
                      <span>
                        {apt.date.includes(',')
                          ? apt.date
                          : parseDateLocal(apt.dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }
                      </span>
                    </div>
                    <div className="detail-item"><Clock size={18} /><span>{apt.timeSlot}</span></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <p>{selectedDate ? 'No past sessions on this date' : 'No past appointments'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;