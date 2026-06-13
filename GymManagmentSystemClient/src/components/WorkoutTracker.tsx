import React, { useState } from 'react';
import './WorkoutTracker.css';
import { Dumbbell, CheckCircle, Clock, MessageSquare, Plus, X, User, Target, Ruler, Scale, ChevronRight, Zap, ArrowLeft, Flame, Trash2, Loader, Calendar, Edit3 } from 'lucide-react';

import { useDispatch } from "react-redux";
import type { AppDispatch } from "../redux/store";
import { activateAssessmentThunk, createFitnessAssessmentThunk } from "../redux/fitnessAssessmentSlice";

import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { fetchFitnessAssessments } from "../redux/fitnessAssessmentSlice";
import { useEffect } from "react";
import type { WorkoutPlanResponse } from '../API/workoutPlanAPI';
import { fetchMemberWorkoutPlansThunk } from '../redux/workoutPlanSlice';

import { fetchSessionsByPlanThunk } from "../redux/dailySessionsSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
  assignedBy: string;
  date: string;
  completed: boolean;
  day?: string;
  planId?: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
}

interface FitnessProfile {
  id: string;
  name: string;
  age: string;
  height: string;
  weight: string;
  goal: string;
  level: string;
  daysPerWeek: string;
  limitations: string;
  active?: boolean;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_OPTIONS = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '🔥' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
  { value: 'endurance', label: 'Endurance', icon: '🏃' },
  { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { value: 'general', label: 'General Fitness', icon: '⚡' },
];

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

// ─── Hardcoded exercises used as placeholder per workout day ──────────────────

const HARDCODED_EXERCISES: Exercise[] = [
  { name: 'Bench Press', sets: 4, reps: '8-10', completed: false },
  { name: 'Pull-ups', sets: 3, reps: '10-12', completed: false },
  { name: 'Shoulder Press', sets: 3, reps: '10', completed: false },
  { name: 'Bicep Curls', sets: 3, reps: '12-15', completed: false },
];

const mapApiToWorkout = (apiPlan: WorkoutPlanResponse): Workout[] => {
  return apiPlan.trainingDays.map((day, idx) => ({
    id: Date.now() + idx,
    name: apiPlan.planTitle,
    day: day,
    assignedBy: apiPlan.trainerId,
    date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
    completed: false,
    planId: apiPlan.id,
    exercises: HARDCODED_EXERCISES.map((ex) => ({ ...ex })),
  }));
};

const mapSessionToWorkout = (session: any): Workout => {
  return {
    id: session.id, // quick unique id
    name: session.sessionTitle,
    day: session.day?.trim(),
    assignedBy: "Trainer",
    date: new Date().toISOString().split("T")[0],
    completed: false,
    planId: session.planId,
    exercises: session.exercises.map((ex: any) => ({
      name: ex.name,
      sets: Number(ex.sets),
      reps: ex.reps,
      completed: false,
    })),
  };
};

// ─── Profile Creation Modal ───────────────────────────────────────────────────

interface ProfileModalProps {
  onClose: () => void;
  onSave: (profile: Omit<FitnessProfile, 'id' | 'createdAt'> & { workoutDays: string[] }) => Promise<void>;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: '', age: '', height: '', weight: '',
    goal: 'general', level: 'beginner', daysPerWeek: '3', limitations: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.height || !form.weight) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        workoutDays: selectedDays
      });   
      onClose();
    } catch {
      setError('Failed to save assessment. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="profile-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="profile-modal">
        <div className="profile-modal-header">
          <div>
            <h2>Create Fitness Assessment</h2>
            <p>We'll generate a personalized workout plan for you</p>
          </div>
          <button className="profile-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="profile-form-grid">
          <div className="profile-form-field full-width">
            <label><User size={12} /> Assessment Name *</label>
            <input placeholder="e.g. John's Plan" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div className="profile-form-field">
            <label>Age *</label>
            <input type="number" placeholder="25" value={form.age} onChange={(e) => set('age', e.target.value)} />
          </div>

          <div className="profile-form-field">
            <label><Ruler size={12} /> Height (cm) *</label>
            <input type="number" placeholder="175" value={form.height} onChange={(e) => set('height', e.target.value)} />
          </div>

          <div className="profile-form-field">
            <label><Scale size={12} /> Weight (kg) *</label>
            <input type="number" placeholder="70" value={form.weight} onChange={(e) => set('weight', e.target.value)} />
          </div>

<div className="profile-form-field">
  <label><Calendar size={12} /> Select Days</label>
  <div className="profile-btn-group">
    {DAYS.map((day) => (
      <button
        key={day}
        className={`profile-chip ${selectedDays.includes(day) ? 'active' : ''}`}
        onClick={() => {
          setSelectedDays((prev) =>
            prev.includes(day)
              ? prev.filter((d) => d !== day)
              : [...prev, day]
          );
        }}
      >
        {day}
      </button>
    ))}
  </div>
</div>

          <div className="profile-form-field full-width">
            <label><Target size={12} /> Fitness Goal</label>
            <div className="profile-btn-group">
              {GOAL_OPTIONS.map((g) => (
                <button key={g.value} className={`profile-chip ${form.goal === g.value ? 'active' : ''}`}
                  onClick={() => set('goal', g.value)}>{g.icon} {g.label}</button>
              ))}
            </div>
          </div>

          <div className="profile-form-field full-width">
            <label><Zap size={12} /> Fitness Level</label>
            <div className="profile-btn-group">
              {LEVEL_OPTIONS.map((l) => (
                <button key={l.value} className={`profile-chip level-chip ${form.level === l.value ? 'active' : ''}`}
                  onClick={() => set('level', l.value)}>{l.label}</button>
              ))}
            </div>
          </div>

          <div className="profile-form-field full-width">
            <label>Limitations / Notes</label>
            <textarea placeholder="Any injuries, medical conditions, or preferences..."
              value={form.limitations} onChange={(e) => set('limitations', e.target.value)} />
          </div>
        </div>

        {error && <p className="profile-form-error">{error}</p>}

        <button className={`profile-generate-btn ${saving ? 'loading' : ''}`} onClick={handleSubmit} disabled={saving}>
          {saving
            ? <><Loader size={18} className="spin-icon" /> Saving Assessment...</>
            : <><Zap size={18} /> Save Assessment</>}
        </button>
      </div>
    </div>
  );
};

// ─── Profiles List View ───────────────────────────────────────────────────────

interface ProfilesViewProps {
  profiles: FitnessProfile[];
  activeProfileId: string | null;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onNew: () => void;
}

const ProfilesView: React.FC<ProfilesViewProps> = ({ profiles, activeProfileId, onActivate, onDelete, onBack, onNew }) => (
  <div>
    <div className="profiles-view-header">
      <div className="profiles-view-title">
        <h1>Fitness Assesments</h1>
        <p>Manage your personalized workout profiles + goals.</p>
      </div>
      <button className="profile-new-btn" onClick={onBack}>
        <ArrowLeft size={16} /> Back
      </button>
    </div>

    {profiles.length === 0 ? (
      <div className="profiles-empty">
        <User size={40} />
        <p>No profiles yet. Create your first fitness profile!</p>
      </div>
    ) : (
      <div className="profiles-grid">
        {profiles.map((p) => {
          const goalInfo = GOAL_OPTIONS.find((g) => g.value === p.goal);
          return (
            <div key={p.id} className={`profile-card ${activeProfileId === p.id ? 'active' : ''}`}>
              <div className="profile-card-top">
                <div className="profile-card-icon"><User size={20} /></div>
                <div className="profile-card-badges">
                  {activeProfileId === p.id && <span className="profile-active-badge">Active</span>}
                  <button className="profile-delete-btn" onClick={() => onDelete(p.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="profile-card-name">{p.name}</h3>
              <div className="profile-card-tags">
                <span className="profile-goal-tag">{goalInfo?.icon} {goalInfo?.label}</span>
                <span className="profile-level-tag">{p.level} · {p.daysPerWeek}d/wk</span>
              </div>
              <div className="profile-card-stats">
                {[{ label: 'Age', value: `${p.age} yrs` }, { label: 'Height', value: `${p.height} cm` },
                  { label: 'Weight', value: `${p.weight} kg` }, { label: 'Days/Wk', value: p.daysPerWeek }]
                  .map((s) => (
                    <div key={s.label} className="profile-stat">
                      <span className="profile-stat-label">{s.label}</span>
                      <span className="profile-stat-value">{s.value}</span>
                    </div>
                  ))}
              </div>
              <button
                className={`profile-activate-btn ${activeProfileId === p.id ? 'is-active' : ''}`}
                onClick={() => onActivate(p.id)}
              >
                {activeProfileId === p.id
                  ? <><CheckCircle size={14} /> Currently Active</>
                  : <><ChevronRight size={14} /> Set as Active</>}
              </button>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ─── Main WorkoutTracker ──────────────────────────────────────────────────────

const WorkoutTracker: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  const assessments = useSelector(
    (state: RootState) => state.fitnessassessment.assessments
  );

  const sessions = useSelector(
   (state: RootState) => state.dailysessions.sessions
  );

  useEffect(() => {
    const token = localStorage.getItem("memberToken");
    if (token) {
      dispatch(fetchFitnessAssessments(token));
    }
  }, [dispatch]);

  useEffect(() => {
    const active = assessments.find((a: any) => a.active);
    if (active) {
      setActiveProfileId(active.id);
      setActiveFilter(active.id);
    }
  }, [assessments]);

  // ── Fetch workout plans from API ───────────────────────────────────────────
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("memberToken");
    if (token) {
      dispatch(fetchMemberWorkoutPlansThunk(token));
    }
  }, [dispatch]);

  const memberPlans = useSelector((state: RootState) => state.workoutplan.plans);

  //useEffect(() => {
    //if (memberPlans && memberPlans.length > 0) {
      //const mappedWorkouts = memberPlans.flatMap(mapApiToWorkout);
      //setWorkouts(mappedWorkouts);
    //}
 // }, [memberPlans]);

 useEffect(() => {
  if (sessions && sessions.length > 0) {
    const mapped = sessions.map(mapSessionToWorkout);
    console.log("Mapped workouts (day):", mapped.map(w => ({ id: w.id, day: w.day })));
    setWorkouts(mapped);
  }
}, [sessions]);

  

  const [selectedWorkout, setSelectedWorkout] = useState(0);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [view, setView] = useState<'tracker' | 'profiles'>('tracker');
  const [showModal, setShowModal] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');
  const [dayFilter, setDayFilter] = useState<string>('');

  useEffect(() => {
  const token = localStorage.getItem("memberToken");

  const selectedPlan = memberPlans[selectedPlanIndex];

  if (token && selectedPlan) {
    dispatch(
      fetchSessionsByPlanThunk({
        token,
        planId: selectedPlan.id,
      })
    );
  }
}, [dispatch, selectedPlanIndex, memberPlans]);

  const profiles: FitnessProfile[] = assessments.map((a: any) => ({
    id: a.id,
    name: a.assessmentName,
    age: String(a.age),
    height: String(a.height),
    weight: String(a.weight),
    goal: a.fitnessGoal?.toLowerCase().replace(" ", "_"),
    level: a.fitnessLevel?.toLowerCase(),
    daysPerWeek: String(a.workoutDays?.length || 0),
    limitations: a.limitations,
    active: a.active,
    createdAt: a.createdAt,
  }));

   useEffect(() => {
  if (workouts.length > 0) {
    const firstDay = workouts.find((w) => w.day)?.day;
    if (firstDay) {
      setDayFilter(firstDay);
      setSelectedWorkout(0);
    }
  }
}, [workouts]);

const workoutDays = Array.from(
  new Set(
    workouts
      .map((w) => w.day)
      .filter((d): d is string => !!d) // keep only defined strings
  )
);

  //const filteredWorkouts = activeFilter === 'all'
    //? workouts
    //: workouts.filter((w) => w.planId === activeFilter);

  const filteredWorkouts = React.useMemo(() => {
  if (!workouts || workouts.length === 0) return [];
  return workouts.filter((w) => {
    // Remove the planId/activeFilter check since sessions belong to plans, not assessments
    const workoutDay = w.day?.trim().toLowerCase();
    const filterDay = dayFilter?.trim().toLowerCase();
    const matchesDay = !filterDay || workoutDay === filterDay;
    return matchesDay;
  });
}, [workouts, dayFilter]);

console.log(`Filtered workouts for day: "${dayFilter}"`, filteredWorkouts);

//console.log(`Filtered workouts for day: ${dayFilter}`, filteredWorkouts);

  

  const safeIndex = Math.min(selectedWorkout, Math.max(0, filteredWorkouts.length - 1));
  const currentWorkout = filteredWorkouts[safeIndex] ?? workouts[0];

  const toggleExercise = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts];
    const realIndex = newWorkouts.findIndex((w) => w.id === filteredWorkouts[workoutIndex]?.id);
    if (realIndex === -1) return;
    newWorkouts[realIndex].exercises[exerciseIndex].completed =
      !newWorkouts[realIndex].exercises[exerciseIndex].completed;
    const allCompleted = newWorkouts[realIndex].exercises.every((ex) => ex.completed);
    newWorkouts[realIndex].completed = allCompleted;
    setWorkouts(newWorkouts);
  };

const handleSaveProfile = async (
  formData: Omit<FitnessProfile, "id" | "createdAt"> & { workoutDays: string[] }
) => {
  const token = localStorage.getItem("memberToken");

  if (!token) {
    alert("User not authenticated");
    return;
  }

  try {
    // 🔹 Step 1: Create Assessment
    const assessmentData = {
      assessmentName: formData.name,
      age: Number(formData.age),
      height: Number(formData.height),
      weight: Number(formData.weight),
      fitnessGoal: formData.goal,
      fitnessLevel: formData.level,
      limitations: formData.limitations,
      workoutDays: formData.workoutDays,
    };

    const result = await dispatch(
      createFitnessAssessmentThunk({
        data: assessmentData,
        token,
      })
    ).unwrap();

    // 🔹 Step 2: Activate it in DB (REAL ACTIVE)
    await dispatch(
      activateAssessmentThunk({
        assessmentId: result.id,
        token,
      })
    ).unwrap();

    // 🔹 Step 3: Refresh data
    await dispatch(fetchFitnessAssessments(token));

    // 🔹 Step 4: Update UI state
    setActiveProfileId(result.id);
    setActiveFilter(result.id);
    setSelectedWorkout(0);
    setView("tracker");

    // 🔥 Step 5: SUCCESS ALERT
    alert("✅ Fitness Assessment Created & Activated Successfully!");

  } catch (error) {
    console.error("Assessment creation failed", error);

    alert("❌ Failed to create assessment. Please try again.");
  }
};

  const handleDeleteProfile = (id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.planId !== id));
    if (activeProfileId === id) setActiveProfileId(null);
    if (activeFilter === id) setActiveFilter('all');
  };

  const completedExercises = currentWorkout?.exercises.filter((ex) => ex.completed).length ?? 0;
  const progressPercentage = currentWorkout
    ? (completedExercises / currentWorkout.exercises.length) * 100 : 0;

  const planFilters = profiles.filter((p) => workouts.some((w) => w.planId === p.id));

  

 

  // ── Profiles View ──────────────────────────────────────────────────────────
  if (view === 'profiles') {
    return (
      <div className="workout-tracker">
        <ProfilesView
          profiles={profiles}
          activeProfileId={activeProfileId}
          onActivate={async (id) => {
            const token = localStorage.getItem("memberToken");
            if (!token) return;
            try {
              await dispatch(
                activateAssessmentThunk({
                  assessmentId: id,
                  token
                })
              ).unwrap();
              setActiveProfileId(id);
              setActiveFilter(id);
              setView("tracker");
            } catch (error) {
              console.error("Activation failed", error);
            }
          }}
          onDelete={handleDeleteProfile}
          onBack={() => setView('tracker')}
          onNew={() => { setView('tracker'); setShowModal(true); }}
        />
        {showModal && (
          <ProfileModal onClose={() => setShowModal(false)} onSave={handleSaveProfile} />
        )}
      </div>
    );
  }

 

  // ── Tracker View ───────────────────────────────────────────────────────────
  return (
    <div className="workout-tracker">

      <div className="workout-header">
        <div className="workout-header-top">
          <div className="workout-header-content">
            <h1>Workout Plans</h1>
            <p>Track your assigned workouts and progress</p>
          </div>
          <div className="workout-header-actions">
            <button className="btn-profiles" onClick={() => setView('profiles')}>
              <User size={15} /> Profiles
              {profiles.length > 0 && <span className="profiles-count">{profiles.length}</span>}
            </button>
            <button className="btn-create-profile" onClick={() => setShowModal(true)}>
              <Plus size={15} /> Create Fitness Assessment
            </button>
          </div>
        </div>
      </div>

      {planFilters.length > 0 && (
        <div className="plan-filter-row">
          <button
            className={`plan-filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setActiveFilter('all'); setSelectedWorkout(0); }}
          >🏋️ All Workouts</button>
          {planFilters.map((p) => {
            const icon = GOAL_OPTIONS.find((g) => g.value === p.goal)?.icon ?? '⚡';
            return (
              <button
                key={p.id}
                className={`plan-filter-chip ${activeFilter === p.id ? 'active' : ''}`}
                onClick={() => { setActiveFilter(p.id); setSelectedWorkout(0); }}
              >{icon} {p.name}</button>
            );
          })}
        </div>
      )}

      <div className="workout-grid">
        <div className="workout-list">
          <h2>Your Workouts</h2>
          <div className="workout-items">
            {(!memberPlans || memberPlans.length === 0) ? (
              <div className="workout-list-empty">
                <Dumbbell size={28} />
                <p>No workout plans assigned yet.</p>
              </div>
            ) : (
              memberPlans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`workout-plan-card ${selectedPlanIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedPlanIndex(index)}
                >
                  <div className="workout-plan-card-top">
                    <div className="workout-plan-card-icon">
                      <Dumbbell size={18} />
                    </div>
                    {plan.active && (
                      <span className="workout-plan-active-pill">Active</span>
                    )}
                  </div>
                  <h3 className="workout-plan-card-title">{plan.planTitle}</h3>
                  <p className="workout-plan-card-desc">{plan.description}</p>
                  <div className="workout-plan-card-days">
                    {plan.trainingDays.map((day) => (
                      <span key={day} className="workout-plan-day-chip">{day}</span>
                    ))}
                  </div>
                  <div className="workout-plan-card-footer">
                    <Calendar size={11} />
                    <span>
                      {new Date(plan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' — '}
                      {new Date(plan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="workout-details">
          {currentWorkout ? (
            <>
              {/* ── Date Navigator ── */}
              {(() => {
                //const allDates = filteredWorkouts.map((w) => w.date).sort();
                const allDates = filteredWorkouts.map((w) => w.day || "");
                const currentDate = filteredWorkouts[safeIndex]?.date ?? '';
                const currentIdx = allDates.indexOf(currentDate);
                const canPrev = currentIdx > 0;
                const canNext = currentIdx < allDates.length - 1;
                const goTo = (date: string) => {
                  const idx = filteredWorkouts.findIndex((w) => w.date === date);
                  if (idx !== -1) { setSelectedWorkout(idx); setSelectedDate(date); setShowCalendar(false); }
                };
                return (
                  <div className="workout-date-navigator">
                    <button
                      className="date-nav-btn"
                      disabled={!canPrev}
                      onClick={() => goTo(allDates[currentIdx - 1])}
                    >&#8592;</button>

<div className="date-nav-center" onClick={() => setShowCalendar((v) => !v)}>
  <Calendar size={14} />
  <span>
    {dayFilter || "Select Day"}
  </span>
  <span className="date-nav-caret">{showCalendar ? '▴' : '▾'}</span>
</div>

                    <button
                      className="date-nav-btn"
                      disabled={!canNext}
                      onClick={() => goTo(allDates[currentIdx + 1])}
                    >&#8594;</button>

{showCalendar && workoutDays.length > 0 && (
  <div className="date-nav-dropdown">
    {workoutDays.map((day) => {
      const firstIndex = workouts.findIndex((w) => w.day === day);
      const completed = workouts.find((w) => w.day === day)?.completed;
      return (
        <button
         key={day}
         className={`date-nav-option ${dayFilter === day ? 'active' : ''}`}
         onClick={() => {
           setDayFilter(day.trim()); // trim just in case
  const firstIndex = workouts.findIndex(
    (w) => w.day?.trim().toLowerCase() === day.trim().toLowerCase() &&
           (activeFilter === 'all' || w.planId === activeFilter)
  );
  setSelectedWorkout(firstIndex !== -1 ? firstIndex : 0);
  setShowCalendar(false);
        }}
>
  <span className="date-nav-option-day">{day}</span>
</button>
      );
    })}
  </div>
)}
                  </div>
                );
              })()}

              <div className="workout-details-header">
                <div className="workout-title-section">
                  <div className="workout-title-row">
                    <h2>{currentWorkout.day ?? currentWorkout.name}</h2>
                  </div>
                  {currentWorkout.day && (
                    <p className="workout-plan-subtitle">{currentWorkout.name}</p>
                  )}
                  <div className="workout-meta">
                    <span className="workout-coach">
                      <MessageSquare size={16} />
                      {currentWorkout.assignedBy}
                    </span>
                    <span className="workout-date-badge">
                      <Clock size={16} />
                      {new Date(currentWorkout.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                {currentWorkout.completed && (
                  <div className="workout-completed-badge">
                    <CheckCircle size={20} />
                    <span>Completed</span>
                  </div>
                )}
              </div>

              <div className="workout-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }} />
                </div>
                <div className="progress-info">
                  {completedExercises} of {currentWorkout.exercises.length} exercises completed
                </div>
              </div>

              <div className="exercises-list">
                <h3>Exercises</h3>
                {currentWorkout.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className={`exercise-item ${exercise.completed ? 'completed' : ''}`}
                    onClick={() => toggleExercise(safeIndex, index)}
                  >
                    <div className="exercise-checkbox">
                      {exercise.completed && <CheckCircle size={20} />}
                    </div>
                    <div className="exercise-content">
                      <h4>{exercise.name}</h4>
                      <p>{exercise.sets} sets × {exercise.reps} reps</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="trainer-feedback">
                <h3>{currentWorkout.planId ? 'Plan Info' : 'Trainer Feedback'}</h3>
                <div className="feedback-box">
                  {currentWorkout.planId ? (
                    <>
                      <p>Complete all exercises and track your progress to hit your goals!</p>
                      <span className="feedback-author">— Your Trainer</span>
                    </>
                  ) : (
                    <>
                      <p>Great progress on your upper body strength! Focus on maintaining proper form during bench press. Consider increasing weight by 5lbs next week.</p>
                      <span className="feedback-author">- Coach Mike</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="workout-list-empty">
              <Dumbbell size={28} />
              <p>Select a workout to view details.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProfileModal onClose={() => setShowModal(false)} onSave={handleSaveProfile} />
      )}
    </div>
  );
};

export default WorkoutTracker;