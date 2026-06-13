import React, { useState, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './TrainerDietManagement.css';

import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveAssessmentsThunk } from '../redux/fitnessAssessmentSlice';
import type { RootState, AppDispatch } from '../redux/store';


import { createDietPlanThunk, fetchDietPlansThunk, setActiveDietPlanThunk } from '../redux/dietPlanSlice';
import type { DietPlanAIRequest, DietPlanAIResponse } from '../API/dietPlanAPI';

import { saveDietPlanThunk } from '../redux/dietPlanSlice';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FitnessAssessment {
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  injuries: string;
  notes: string;
}

interface Meal {
  id: string;
  mealName: string;       // e.g. "Breakfast", "Lunch", "Snack 1"
  time: string;           // e.g. "07:00"
  foods: string;          // e.g. "Oats 80g, banana, whey protein"
  calories: string;       // e.g. "480 kcal"
  protein: string;
  carbs: string;
  fats: string;
  notes: string;
}

interface DietDay {
  id: string;
  dayLabel: string;       // e.g. "Monday" or "Day 1"
  weekNumber: number;
  totalCalories: string;
  meals: Meal[];
}

interface DietPlan {
  id?: string;
  title: string;
  description: string;
  goal: string;           // e.g. "Muscle Gain", "Fat Loss"
  startDate: string;
  endDate: string;
  dailyCalorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
  dietDays: DietDay[];
}

interface Member {
  id: number;
  name: string;
  avatar: string;
  height: string;
  weight: string;
  age: string;
  goal: string;
  assessment?: FitnessAssessment;
  dietPlan?: DietPlan;
  fitnessAssessmentId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_NAMES = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner', 'Evening Snack'];
const DIET_GOALS = ['Muscle Gain', 'Fat Loss', 'Maintenance', 'Recomposition', 'General Fitness'];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: '#4ade80',
  Intermediate: '#facc15',
  Advanced: '#f87171',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Badge: React.FC<{ level?: string }> = ({ level }) => {
  if (!level) return <span className="td-badge td-badge-none">—</span>;
  return (
    <span className="td-badge" style={{ '--badge-color': LEVEL_COLORS[level] } as React.CSSProperties}>
      {level}
    </span>
  );
};

const Avatar: React.FC<{ initials: string; size?: number }> = ({ initials, size = 40 }) => (
  <div className="td-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
    {initials}
  </div>
);

const Portal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) =>
  ReactDOM.createPortal(
    <div className="td-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>,
    document.body
  );

// Macro ring display
const MacroBar: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="td-macro-bar">
    <div className="td-macro-dot" style={{ background: color }} />
    <div>
      <div className="td-macro-label">{label}</div>
      <div className="td-macro-val">{value || '—'}</div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

type View = 'roster' | 'profile';
type ModalMode = null | 'plan' | 'dayList' | 'dayEdit';

const TrainerDietManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { assessments, loading } = useSelector((state: RootState) => state.fitnessassessment);
  const { plans: dietPlans, loading: dietLoading, error: dietError } = useSelector((state: RootState) => state.dietplan);

  

  useEffect(() => {
    const token = localStorage.getItem('trainerToken');
    if (token) dispatch(fetchActiveAssessmentsThunk(token));
  }, [dispatch]);

  // ── State ────────────────────────────────────────────────────────────────
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<View>('roster');
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');
  const [filterGoal, setFilterGoal] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [profileTab, setProfileTab] = useState<'overview' | 'diet'>('overview');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingDay, setEditingDay] = useState<DietDay | null>(null);

  useEffect(() => {
  if (!activeMember?.fitnessAssessmentId) return;

  const token = localStorage.getItem("trainerToken");
  if (!token) return;

  dispatch(
    fetchDietPlansThunk({
      assessmentId: activeMember.fitnessAssessmentId,
      token: token,
    })
  );
}, [activeMember, dispatch]);

  // ── Plan form ────────────────────────────────────────────────────────────
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planGoal, setPlanGoal] = useState('General Fitness');
  const [planStart, setPlanStart] = useState('');
  const [planEnd, setPlanEnd] = useState('');
  const [planCalories, setPlanCalories] = useState('');
  const [planProtein, setPlanProtein] = useState('');
  const [planCarbs, setPlanCarbs] = useState('');
  const [planFats, setPlanFats] = useState('');

  // ── AI Generation ────────────────────────────────────────────────────────
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiGenerated, setAiGenerated] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const [savingPlan, setSavingPlan] = useState(false);
  const [saveError, setSaveError] = useState('');

  const generateAIDietPlan = async () => {
  if (!syncedActive) return;
  setAiGenerating(true);
  setAiError('');

  const token = localStorage.getItem('trainerToken') || '';
  const requestData: DietPlanAIRequest = {
    goal: syncedActive.goal,
    age: parseInt(syncedActive.age) || 25,
    weight: parseInt(syncedActive.weight) || 70,
    height: parseInt(syncedActive.height) || 170,
    activityLevel: syncedActive.assessment?.fitnessLevel || 'Moderate',
  };

  try {
    const response: DietPlanAIResponse = await dispatch(createDietPlanThunk({ data: requestData, token })).unwrap();

    // Set form fields
    setPlanTitle(response.title);
    setPlanDesc(response.description);
    setPlanGoal(response.goal);
    setPlanCalories(response.dailyCalorieTarget);
    setPlanProtein(response.proteinTarget);
    setPlanCarbs(response.carbTarget);
    setPlanFats(response.fatTarget);
    setAiGenerated(true);
  } catch (err: any) {
    setAiError(err || 'AI generation failed. You can fill manually.');
  } finally {
    setAiGenerating(false);
  }
};

  // ── Diet Day form ─────────────────────────────────────────────────────────
  const [ddLabel, setDdLabel] = useState('Monday');
  const [ddWeek, setDdWeek] = useState(1);
  const [ddTotalCal, setDdTotalCal] = useState('');
  const [ddMeals, setDdMeals] = useState<Meal[]>([
    { id: '1', mealName: 'Breakfast', time: '07:00', foods: '', calories: '', protein: '', carbs: '', fats: '', notes: '' },
  ]);

  // ── Map assessments → members ────────────────────────────────────────────
  useEffect(() => {
    if (!assessments || assessments.length === 0) return;
    const mapped: Member[] = assessments.map((a: any) => ({
      id: a.memberId,
      fitnessAssessmentId: a.id,
      name: a.assessmentName || 'Member',
      avatar: (a.assessmentName || 'M').split(' ').map((n: string) => n[0]).join('').toUpperCase(),
      height: a.height ? `${a.height} cm` : '-',
      weight: a.weight ? `${a.weight} kg` : '-',
      age: a.age ? `${a.age}` : '-',
      goal: a.fitnessGoal || 'General Fitness',
      assessment: {
        fitnessLevel: a.fitnessLevel || 'Beginner',
        injuries: a.limitations || '',
        notes: '',
      },
    }));
    setMembers(mapped);
  }, [assessments]);

  // ─── Derived ─────────────────────────────────────────────────────────────

  const allGoals = useMemo(() => ['All', ...Array.from(new Set(members.map(m => m.goal)))], [members]);

  const filtered = useMemo(() => members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchGoal = filterGoal === 'All' || m.goal === filterGoal;
    const matchLevel = filterLevel === 'All' || m.assessment?.fitnessLevel === filterLevel;
    return matchSearch && matchGoal && matchLevel;
  }), [members, search, filterGoal, filterLevel]);

  const syncedActive = activeMember ? members.find(m => m.id === activeMember.id) ?? null : null;

  // ─── Navigation ───────────────────────────────────────────────────────────

  const openProfile = (member: Member) => {
    setActiveMember(member);
    setProfileTab('overview');
    setView('profile');
  };

  const goBack = () => { setView('roster'); setActiveMember(null); };

  // ─── Modal openers ────────────────────────────────────────────────────────

  const openPlan = () => {
    const p = syncedActive?.dietPlan;
    setPlanTitle(p?.title ?? '');
    setPlanDesc(p?.description ?? '');
    setPlanGoal(p?.goal ?? syncedActive?.goal ?? 'General Fitness');
    setPlanStart(p?.startDate ?? '');
    setPlanEnd(p?.endDate ?? '');
    setPlanCalories(p?.dailyCalorieTarget ?? '');
    setPlanProtein(p?.proteinTarget ?? '');
    setPlanCarbs(p?.carbTarget ?? '');
    setPlanFats(p?.fatTarget ?? '');
    setAiGenerated(false);
    setAiError('');
    setModalMode('plan');
  };

  const openDayEdit = (day?: DietDay) => {
    if (day) {
      setEditingDay(day);
      setDdLabel(day.dayLabel);
      setDdWeek(day.weekNumber);
      setDdTotalCal(day.totalCalories);
      setDdMeals(day.meals.length > 0 ? day.meals : [{ id: Date.now().toString(), mealName: 'Breakfast', time: '07:00', foods: '', calories: '', protein: '', carbs: '', fats: '', notes: '' }]);
    } else {
      setEditingDay(null);
      setDdLabel('Monday');
      setDdWeek(1);
      setDdTotalCal('');
      setDdMeals([{ id: Date.now().toString(), mealName: 'Breakfast', time: '07:00', foods: '', calories: '', protein: '', carbs: '', fats: '', notes: '' }]);
    }
    setModalMode('dayEdit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingDay(null);
    setAiGenerating(false);
    setAiError('');
    setAiGenerated(false);
    if (abortRef.current) abortRef.current.abort();
  };

  // ─── Mutators ─────────────────────────────────────────────────────────────

  const updateMember = (updated: Member) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    setActiveMember(updated);
  };

function mapToFullDietPlan(
  plan: DietPlanAIResponse | DietPlan,
  existingDays: DietDay[] = [],
  startDate: string = '',
  endDate: string = ''
): DietPlan {
  return {
    id: (plan as DietPlan).id,               // keep existing id if any
    title: plan.title,
    description: plan.description,
    goal: plan.goal,
    dailyCalorieTarget: plan.dailyCalorieTarget,
    proteinTarget: plan.proteinTarget,
    carbTarget: plan.carbTarget,
    fatTarget: plan.fatTarget,
    startDate: (plan as DietPlan).startDate || startDate,
    endDate: (plan as DietPlan).endDate || endDate,
    dietDays: (plan as DietPlan).dietDays || existingDays,
  };
}

// ── SAVE DIET PLAN WITH BACKEND ──
const savePlan = async () => {
  if (!syncedActive) {
    setSaveError('No member selected.');
    window.alert('No member selected.');
    return;
  }

  if (!planTitle.trim() || !planStart || !planEnd) {
    setSaveError('Please fill in the plan title, start date, and end date.');
    window.alert('Please fill in the plan title, start date, and end date.');
    return;
  }

  setSaveError('');
  setSavingPlan(true);

  // Map AI or manual form into full DietPlan
  const dietPlan: DietPlan = mapToFullDietPlan(
    {
      title: planTitle.trim(),
      description: planDesc.trim(),
      goal: planGoal,
      dailyCalorieTarget: planCalories,
      proteinTarget: planProtein,
      carbTarget: planCarbs,
      fatTarget: planFats,
    },
    syncedActive.dietPlan?.dietDays,
    planStart,
    planEnd
  );

  try {
    const token = localStorage.getItem('trainerToken') || '';
    // Dispatch save thunk
    const savedPlan = await dispatch(
      saveDietPlanThunk({
        data: {
          ...dietPlan,
          memberId: String(syncedActive.id),
          fitnessAssessmentId: syncedActive.fitnessAssessmentId || '',
          startDate: planStart,
          endDate: planEnd,
        },
        token,
      })
    ).unwrap();

    // Update local member state with saved plan
    updateMember({ ...syncedActive, dietPlan });

    window.alert('Diet plan saved successfully!');

    // Close modal
    closeModal();
  } catch (err: any) {
    console.error(err);
    setSaveError(err?.message || 'Failed to save diet plan.');
    window.alert(err?.message || 'Failed to save diet plan.');
  } finally {
    setSavingPlan(false);
  }
};

useEffect(() => {
  if (!activeMember) return;
  if (!dietPlans || dietPlans.length === 0) return;

  const planFromStore = dietPlans[0];
  const fullPlan: DietPlan = mapToFullDietPlan(
    planFromStore as DietPlan,
    (planFromStore as DietPlan).dietDays ?? [],
    (planFromStore as DietPlan).startDate ?? '',
    (planFromStore as DietPlan).endDate ?? ''
  );

  // Only update if the plan is different
  if (JSON.stringify(activeMember.dietPlan) !== JSON.stringify(fullPlan)) {
    updateMember({
      ...activeMember,
      dietPlan: fullPlan,
    });
  }

}, [dietPlans, activeMember]);

  const saveDietDay = () => {
    if (!syncedActive?.dietPlan || !ddLabel) return;
    const day: DietDay = {
      id: editingDay?.id ?? Date.now().toString(),
      dayLabel: ddLabel, weekNumber: ddWeek,
      totalCalories: ddTotalCal,
      meals: ddMeals.filter(m => m.foods.trim() || m.mealName.trim()),
    };
    const list = syncedActive.dietPlan.dietDays ?? [];
    const updated = editingDay ? list.map(d => d.id === editingDay.id ? day : d) : [...list, day];
    updateMember({ ...syncedActive, dietPlan: { ...syncedActive.dietPlan, dietDays: updated } });
    setModalMode('dayList');
  };

  const deleteDay = (id: string) => {
    if (!syncedActive?.dietPlan) return;
    const updated = syncedActive.dietPlan.dietDays.filter(d => d.id !== id);
    updateMember({ ...syncedActive, dietPlan: { ...syncedActive.dietPlan, dietDays: updated } });
  };

  // ─── Meal helpers ─────────────────────────────────────────────────────────

  const addMeal = () => setDdMeals(prev => [...prev, { id: Date.now().toString(), mealName: '', time: '', foods: '', calories: '', protein: '', carbs: '', fats: '', notes: '' }]);
  const removeMeal = (id: string) => setDdMeals(prev => prev.filter(m => m.id !== id));
  const updateMeal = (id: string, field: keyof Meal, val: string) =>
    setDdMeals(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));

  // ─── Label style ──────────────────────────────────────────────────────────
  const lbl: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="trainer-diet">
        <div className="td-loading"><h3>Loading Member Profiles…</h3></div>
      </div>
    );
  }

  return (
    <div className="trainer-diet">

      {/* ── ROSTER VIEW ─────────────────────────────────────────────────── */}
      {view === 'roster' && (
        <>
          <div className="td-page-header">
            <div>
              <h2>Diet Plan Management</h2>
              <p className="td-subtitle">
                {members.length} members · {members.filter(m => m.dietPlan).length} active diet plans
              </p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="td-filters">
            <div className="td-search-wrap">
              <span className="td-search-icon">⌕</span>
              <input
                className="td-search"
                type="text"
                placeholder="Search member by name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="td-clear-btn" onClick={() => setSearch('')}>✕</button>}
            </div>
            <select className="td-select" value={filterGoal} onChange={e => setFilterGoal(e.target.value)}>
              {allGoals.map(g => <option key={g}>{g}</option>)}
            </select>
            <select className="td-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
              {['All', ...FITNESS_LEVELS].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          {/* Member Cards Grid */}
          {filtered.length === 0 ? (
            <div className="td-empty">No members match your search.</div>
          ) : (
            <div className="td-cards-grid">
              {filtered.map(member => (
                <div key={member.id} className="td-member-card" onClick={() => openProfile(member)}>
                  <div className="td-card-top">
                    <Avatar initials={member.avatar} size={46} />
                    <div className="td-card-identity">
                      <div className="td-card-name">{member.name}</div>
                      <div className="td-card-meta">{member.age} yrs · {member.height} · {member.weight}</div>
                    </div>
                    <Badge level={member.assessment?.fitnessLevel} />
                  </div>
                  <div className="td-card-divider" />
                  <div className="td-card-stats">
                    <div className="td-stat">
                      <span className="td-stat-label">Goal</span>
                      <span className="td-stat-val">{member.goal}</span>
                    </div>
                    <div className="td-stat">
                      <span className="td-stat-label">Diet Plan</span>
                      <span className="td-stat-val">{member.dietPlan ? member.dietPlan.title : '—'}</span>
                    </div>
                    <div className="td-stat">
                      <span className="td-stat-label">Calorie Target</span>
                      <span className="td-stat-val">{member.dietPlan?.dailyCalorieTarget || '—'}</span>
                    </div>
                    <div className="td-stat">
                      <span className="td-stat-label">Days Programmed</span>
                      <span className="td-stat-val">{member.dietPlan?.dietDays.length ?? 0}</span>
                    </div>
                  </div>
                  <div className="td-card-arrow">View Profile →</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── PROFILE VIEW ─────────────────────────────────────────────────── */}
      {view === 'profile' && syncedActive && (
        <>
          {/* Header */}
          <div className="td-profile-header">
            <button className="td-back-btn" onClick={goBack}>← Back</button>
            <div className="td-profile-identity">
              <Avatar initials={syncedActive.avatar} size={56} />
              <div>
                <h2 style={{ margin: 0 }}>{syncedActive.name}</h2>
                <p className="td-subtitle">
                  {syncedActive.age} yrs · {syncedActive.height} · {syncedActive.weight} · {syncedActive.goal}
                </p>
              </div>
              <Badge level={syncedActive.assessment?.fitnessLevel} />
            </div>
            {/* Quick actions */}
            <div className="td-profile-actions">
              <button className="assign-btn" onClick={openPlan}>
                {syncedActive.dietPlan ? 'Edit Diet Plan' : '+ Create Diet Plan'}
              </button>
              {syncedActive.dietPlan && (
                <button className="assign-btn" onClick={() => setModalMode('dayList')}>
                  Manage Diet Days
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="td-tabs">
            {(['overview', 'diet'] as const).map(tab => (
              <button
                key={tab}
                className={`td-tab ${profileTab === tab ? 'td-tab-active' : ''}`}
                onClick={() => setProfileTab(tab)}
              >
                {tab === 'diet' ? 'Diet Days' : 'Overview'}
              </button>
            ))}
          </div>

          {/* ── TAB: OVERVIEW ── */}
          {profileTab === 'overview' && (
            <div className="td-tab-content">
              <div className="td-overview-grid">

                {/* Assessment snapshot */}
                <div className="td-info-card">
                  <div className="td-info-card-title">Fitness Profile</div>
                  {syncedActive.assessment ? (
                    <div className="td-asm-grid">
                      <div className="td-asm-item">
                        <span className="td-asm-lbl">Fitness Level</span>
                        <span className="td-asm-val"><Badge level={syncedActive.assessment.fitnessLevel} /></span>
                      </div>
                      <div className="td-asm-item">
                        <span className="td-asm-lbl">Goal</span>
                        <span className="td-asm-val">{syncedActive.goal}</span>
                      </div>
                      <div className="td-asm-item td-asm-full">
                        <span className="td-asm-lbl">Limitations / Allergies</span>
                        <span className="td-asm-val">{syncedActive.assessment.injuries || 'None'}</span>
                      </div>
                      {syncedActive.assessment.notes && (
                        <div className="td-asm-item td-asm-full">
                          <span className="td-asm-lbl">Notes</span>
                          <span className="td-asm-val td-asm-note">{syncedActive.assessment.notes}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="td-empty-card">
                      <span>No assessment on file.</span>
                    </div>
                  )}
                </div>

                {/* Active Diet Plan Card */}
                <div className="td-info-card">
                  <div className="td-info-card-title">Active Diet Plan</div>
                  {syncedActive.dietPlan ? (
                    <>
                      <div className="td-plan-title">{syncedActive.dietPlan.title}</div>
                      {syncedActive.dietPlan.description && (
                        <div className="td-plan-desc">{syncedActive.dietPlan.description}</div>
                      )}
                      <div className="td-plan-dates">
                        📅 {syncedActive.dietPlan.startDate} → {syncedActive.dietPlan.endDate}
                      </div>
                      <div className="td-macros-row">
                        <MacroBar label="Calories" value={syncedActive.dietPlan.dailyCalorieTarget} color="#facc15" />
                        <MacroBar label="Protein" value={syncedActive.dietPlan.proteinTarget} color="#4ade80" />
                        <MacroBar label="Carbs" value={syncedActive.dietPlan.carbTarget} color="#60a5fa" />
                        <MacroBar label="Fats" value={syncedActive.dietPlan.fatTarget} color="#f87171" />
                      </div>
                      <div className="td-plan-stat">
                        {syncedActive.dietPlan.dietDays.length} day{syncedActive.dietPlan.dietDays.length !== 1 ? 's' : ''} programmed
                      </div>
                    </>
                  ) : (
                    <div className="td-empty-card">
                      <span>No diet plan created yet.</span>
                      <button className="assign-btn td-sm-btn" onClick={openPlan}>+ Create Diet Plan</button>
                    </div>
                  )}
                </div>

                {/* Meal Summary Card */}
                {syncedActive.dietPlan && syncedActive.dietPlan.dietDays.length > 0 && (
                  <div className="td-info-card">
                    <div className="td-info-card-title">Latest Day Summary</div>
                    {(() => {
                      const lastDay = syncedActive.dietPlan.dietDays[syncedActive.dietPlan.dietDays.length - 1];
                      return (
                        <>
                          <div className="td-plan-title" style={{ fontSize: '0.88rem' }}>
                            Week {lastDay.weekNumber} — {lastDay.dayLabel}
                          </div>
                          {lastDay.totalCalories && (
                            <div className="td-plan-dates">🔥 {lastDay.totalCalories} total</div>
                          )}
                          <div className="td-meal-summary-list">
                            {lastDay.meals.map(meal => (
                              <div key={meal.id} className="td-meal-summary-row">
                                <span className="td-meal-summary-name">{meal.mealName}</span>
                                <span className="td-meal-summary-cal">{meal.calories || '—'}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: DIET DAYS ── */}
          {profileTab === 'diet' && (
            <div className="td-tab-content">
              {!syncedActive.dietPlan ? (
                <div className="td-empty">
                  <p>No diet plan yet.</p>
                  <button className="assign-btn" onClick={openPlan}>+ Create Diet Plan</button>
                </div>
              ) : (
                <>
                  <div className="td-workouts-top">
                    <div className="td-plan-banner">
                      <span className="td-plan-banner-title">{syncedActive.dietPlan.title}</span>
                      <span className="td-plan-banner-dates">
                        {syncedActive.dietPlan.startDate} → {syncedActive.dietPlan.endDate}
                      </span>
                    </div>
                    <button className="assign-btn td-sm-btn" onClick={() => openDayEdit()}>+ Add Day</button>
                  </div>

                  {syncedActive.dietPlan.dietDays.length === 0 ? (
                    <div className="td-empty">No diet days yet. Add your first day above.</div>
                  ) : (
                    <div className="td-sessions-list">
                      {[...syncedActive.dietPlan.dietDays]
                        .sort((a, b) => a.weekNumber - b.weekNumber)
                        .map(day => (
                          <div key={day.id} className="td-session-card">
                            <div className="td-session-card-left">
                              <div className="td-session-day-badge">
                                <span className="td-sdb-week">Wk {day.weekNumber}</span>
                                <span className="td-sdb-day">{day.dayLabel.slice(0, 3)}</span>
                              </div>
                            </div>
                            <div className="td-session-card-body">
                              <div className="td-session-card-title">{day.dayLabel}</div>
                              <div className="td-session-card-meta">
                                {day.totalCalories && <span>🔥 {day.totalCalories}</span>}
                                <span>🍽 {day.meals.length} meal{day.meals.length !== 1 ? 's' : ''}</span>
                              </div>
                              {day.meals.length > 0 && (
                                <div className="td-meals-preview">
                                  {day.meals.map(meal => (
                                    <div key={meal.id} className="td-meal-row">
                                      <span className="td-meal-name">{meal.mealName}</span>
                                      {meal.time && <span className="td-meal-time">{meal.time}</span>}
                                      {meal.calories && <span className="td-meal-cal">{meal.calories}</span>}
                                      {meal.foods && (
                                        <span className="td-meal-foods">{meal.foods.length > 50 ? meal.foods.slice(0, 50) + '…' : meal.foods}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="td-session-card-actions">
                              <button className="assign-btn td-xs-btn" onClick={() => openDayEdit(day)}>Edit</button>
                              <button className="cancel-btn td-xs-btn" onClick={() => deleteDay(day.id)}>Delete</button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODALS
      ═════════════════════════════════════════════════════════════════════ */}

      {/* ── PLAN MODAL ── */}
      {modalMode === 'plan' && syncedActive && (
        <Portal onClose={closeModal}>
          <div className="modal-content td-modal-scroll td-modal-medium">
            <h3>{syncedActive.dietPlan ? 'Edit' : 'Create'} Diet Plan — {syncedActive.name}</h3>
            <p className="member-meta">{syncedActive.goal}{syncedActive.assessment ? ` · ${syncedActive.assessment.fitnessLevel}` : ''}</p>

            {/* Member context snapshot */}
            {syncedActive.assessment && (
              <div className="td-snapshot">
                {syncedActive.assessment.injuries && <span>⚠ {syncedActive.assessment.injuries}</span>}
                <span>🎯 {syncedActive.goal}</span>
                <span>📏 {syncedActive.height} · {syncedActive.weight}</span>
              </div>
            )}

            {/* ── AI Generate / Regenerate Box ── */}
<div className={`td-ai-banner${aiGenerated ? ' td-ai-banner--done' : ''}`}>
  <div className="td-ai-banner-left">
    <div className="td-ai-icon">{aiGenerating ? '⟳' : aiGenerated ? '✦' : '✦'}</div>
    <div>
      <div className="td-ai-banner-title">
        {aiGenerated ? 'AI Plan Generated' : 'Generate with AI'}
      </div>
      <div className="td-ai-banner-desc">
        {aiGenerated
          ? 'Fields pre-filled from member profile. You can regenerate or edit before saving.'
          : 'Auto-fill plan details based on this member\'s fitness profile and goal.'}
      </div>
    </div>
  </div>

  <button
    className={`td-ai-btn td-ai-btn--green${aiGenerating ? ' td-ai-btn--loading' : ''}`}
    onClick={generateAIDietPlan}
    disabled={aiGenerating}
  >
    {aiGenerating
      ? <><span className="td-spinner" />Generating…</>
      : aiGenerated
      ? 'Regenerate AI Plan'
      : 'Generate Plan'}
  </button>
</div>

            {/* AI error */}
            {aiError && (
              <div className="td-ai-error">{aiError}</div>
            )}

            <div className="modal-form">
              {/* Divider if AI was used */}
              {aiGenerated && (
                <div className="td-ai-divider">
                  <span>Review &amp; Edit AI Suggestion</span>
                </div>
              )}

              <div>
                <label style={lbl}>Plan Title</label>
                <input
                  type="text"
                  placeholder="e.g. 12-Week Lean Bulk"
                  value={planTitle}
                  onChange={e => setPlanTitle(e.target.value)}
                  className={aiGenerated && planTitle ? 'td-ai-filled' : ''}
                />
              </div>

              <div>
                <label style={lbl}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Plan overview / notes"
                  value={planDesc}
                  onChange={e => setPlanDesc(e.target.value)}
                  className={aiGenerated && planDesc ? 'td-ai-filled' : ''}
                />
              </div>

              <div>
                <label style={lbl}>Diet Goal</label>
                <div className="days-grid">
                  {DIET_GOALS.map(g => (
                    <button key={g} type="button" className={`day-btn${planGoal === g ? ' active-day' : ''}`} onClick={() => setPlanGoal(g)}>{g}</button>
                  ))}
                </div>
              </div>

              <div className="date-row">
                <div><label style={lbl}>Start Date</label><input type="date" value={planStart} onChange={e => setPlanStart(e.target.value)} /></div>
                <div><label style={lbl}>End Date</label><input type="date" value={planEnd} onChange={e => setPlanEnd(e.target.value)} /></div>
              </div>

              <div>
                <label style={lbl}>
                  Daily Macro Targets
                  {aiGenerated && <span className="td-ai-tag">✦ AI suggested</span>}
                </label>
                <div className="td-macro-inputs">
                  <div>
                    <label style={lbl}>Calories</label>
                    <input type="text" placeholder="e.g. 2500 kcal" value={planCalories} onChange={e => setPlanCalories(e.target.value)} className={aiGenerated && planCalories ? 'td-ai-filled' : ''} />
                  </div>
                  <div>
                    <label style={lbl}>Protein</label>
                    <input type="text" placeholder="e.g. 180g" value={planProtein} onChange={e => setPlanProtein(e.target.value)} className={aiGenerated && planProtein ? 'td-ai-filled' : ''} />
                  </div>
                  <div>
                    <label style={lbl}>Carbs</label>
                    <input type="text" placeholder="e.g. 280g" value={planCarbs} onChange={e => setPlanCarbs(e.target.value)} className={aiGenerated && planCarbs ? 'td-ai-filled' : ''} />
                  </div>
                  <div>
                    <label style={lbl}>Fats</label>
                    <input type="text" placeholder="e.g. 70g" value={planFats} onChange={e => setPlanFats(e.target.value)} className={aiGenerated && planFats ? 'td-ai-filled' : ''} />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="confirm-btn" onClick={savePlan} disabled={!planTitle || !planStart || !planEnd}>
                  {aiGenerated ? '✓ Save AI Plan' : 'Save Plan'}
                </button>
                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── DAY LIST MODAL ── */}
      {modalMode === 'dayList' && syncedActive?.dietPlan && (
        <Portal onClose={closeModal}>
          <div className="modal-content td-modal-scroll td-modal-medium">
            <h3>Diet Days — {syncedActive.name}</h3>
            <p className="member-meta">{syncedActive.dietPlan.title} · {syncedActive.dietPlan.dailyCalorieTarget || 'No calorie target'}</p>

            {syncedActive.dietPlan.dietDays.length === 0
              ? <div className="td-empty-card" style={{ padding: '1.5rem 0' }}><span>No days yet.</span></div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[...syncedActive.dietPlan.dietDays]
                    .sort((a, b) => a.weekNumber - b.weekNumber)
                    .map(day => (
                      <div key={day.id} className="td-session-item">
                        <div className="td-session-day-badge" style={{ minWidth: 52 }}>
                          <span className="td-sdb-week">Wk {day.weekNumber}</span>
                          <span className="td-sdb-day">{day.dayLabel.slice(0, 3)}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{day.dayLabel}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                            {day.meals.length} meal{day.meals.length !== 1 ? 's' : ''}{day.totalCalories ? ` · ${day.totalCalories}` : ''}
                          </div>
                        </div>
                        <div className="td-action-row">
                          <button className="assign-btn td-xs-btn" onClick={() => openDayEdit(day)}>Edit</button>
                          <button className="cancel-btn td-xs-btn" onClick={() => deleteDay(day.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button className="confirm-btn" onClick={() => openDayEdit()}>+ Add Day</button>
              <button className="cancel-btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </Portal>
      )}

      {/* ── DAY EDIT MODAL ── */}
      {modalMode === 'dayEdit' && syncedActive?.dietPlan && (
        <Portal onClose={() => setModalMode('dayList')}>
          <div className="modal-content td-modal-scroll td-modal-wide">
            <h3>{editingDay ? 'Edit' : 'Add'} Diet Day — {syncedActive.name}</h3>
            <p className="member-meta">{syncedActive.dietPlan.title}</p>
            <div className="modal-form">

              <div className="date-row">
                <div>
                  <label style={lbl}>Day</label>
                  <div className="days-grid" style={{ marginTop: '0.3rem' }}>
                    {WEEKDAYS.map(day => (
                      <button key={day} type="button"
                        className={`day-btn td-xs-btn${ddLabel === day ? ' active-day' : ''}`}
                        onClick={() => setDdLabel(day)}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Week #</label>
                  <input type="number" min={1} value={ddWeek} onChange={e => setDdWeek(parseInt(e.target.value) || 1)} />
                </div>
              </div>

              <div>
                <label style={lbl}>Total Calories (optional)</label>
                <input type="text" placeholder="e.g. 2480 kcal" value={ddTotalCal} onChange={e => setDdTotalCal(e.target.value)} />
              </div>

              {/* Meals */}
              <div>
                <div className="td-meals-header">
                  <label style={{ fontFamily: "'Syne', sans-serif" }}>Meals</label>
                  <button type="button" className="assign-btn td-xs-btn" onClick={addMeal}>+ Add Meal</button>
                </div>

                {ddMeals.map((meal, idx) => (
                  <div key={meal.id} className="td-meal-card">
                    <div className="td-meal-card-header">
                      <span className="td-meal-num">Meal #{idx + 1}</span>
                      {ddMeals.length > 1 && (
                        <button type="button" className="td-remove-btn" onClick={() => removeMeal(meal.id)}>✕</button>
                      )}
                    </div>
                    <div className="date-row">
                      <div>
                        <label style={lbl}>Meal Name</label>
                        <select
                          value={meal.mealName}
                          onChange={e => updateMeal(meal.id, 'mealName', e.target.value)}
                          style={{ padding: '0.75rem', background: 'var(--dark-700)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: "'Space Mono', monospace", fontSize: '0.85rem', width: '100%' }}
                        >
                          {MEAL_NAMES.map(n => <option key={n}>{n}</option>)}
                          <option value={meal.mealName}>{meal.mealName}</option>
                        </select>
                      </div>
                      <div>
                        <label style={lbl}>Time</label>
                        <input type="time" value={meal.time} onChange={e => updateMeal(meal.id, 'time', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={lbl}>Foods / Ingredients</label>
                      <textarea rows={2} placeholder="e.g. Oats 80g, banana 1 medium, whey protein 30g" value={meal.foods} onChange={e => updateMeal(meal.id, 'foods', e.target.value)} className="td-full-input" />
                    </div>
                    <div className="td-macro-inputs">
                      <div><label style={lbl}>Calories</label><input type="text" placeholder="kcal" value={meal.calories} onChange={e => updateMeal(meal.id, 'calories', e.target.value)} /></div>
                      <div><label style={lbl}>Protein</label><input type="text" placeholder="g" value={meal.protein} onChange={e => updateMeal(meal.id, 'protein', e.target.value)} /></div>
                      <div><label style={lbl}>Carbs</label><input type="text" placeholder="g" value={meal.carbs} onChange={e => updateMeal(meal.id, 'carbs', e.target.value)} /></div>
                      <div><label style={lbl}>Fats</label><input type="text" placeholder="g" value={meal.fats} onChange={e => updateMeal(meal.id, 'fats', e.target.value)} /></div>
                    </div>
                    <div>
                      <label style={lbl}>Notes</label>
                      <input type="text" placeholder="e.g. Pre-workout, avoid if lactose intolerant" value={meal.notes} onChange={e => updateMeal(meal.id, 'notes', e.target.value)} className="td-full-input" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button className="confirm-btn" onClick={saveDietDay} disabled={!ddLabel}>
                  {editingDay ? 'Update Day' : 'Save Day'}
                </button>
                <button className="cancel-btn" onClick={() => setModalMode('dayList')}>Back</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
};

export default TrainerDietManagement;