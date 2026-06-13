import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TrainerWorkoutManagement.css';

import { useDispatch, useSelector } from "react-redux";
import { fetchActiveAssessmentsThunk } from "../redux/fitnessAssessmentSlice";
import type { RootState, AppDispatch } from "../redux/store";

import { createWorkoutPlanThunk, fetchWorkoutPlansThunk } from "../redux/workoutPlanSlice";
import { addDailySession } from '../redux/dailySessionsSlice';
import type { DailySessionRequest } from '../API/dailySessionsAPI';

import { fetchTrainerMemberSessionsThunk } from "../redux/dailySessionsSlice";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FitnessAssessment {
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  bodyFat: string;
  muscleMass: string;
  restingHeartRate: string;
  vo2Max: string;
  injuries: string;
  availableEquipment: string[];
  notes: string;
}

interface ProgressEntry {
  date: string;
  weight: string;
  bodyFat: string;
  note: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

interface DailyWorkout {
  id: string;
  day: string;
  weekNumber: number;
  sessionTitle: string;
  focusArea: string;
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
  duration: string;
}

interface WorkoutPlan {
  id?: string; 
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
  dailyWorkouts: DailyWorkout[];
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
  workoutPlan?: WorkoutPlan;
  progress: ProgressEntry[];
  fitnessAssessmentId?: string;
  workoutDays?: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbells', 'Resistance Bands', 'Kettlebell', 'Pull-up Bar', 'Cable Machine', 'Bench', 'Treadmill', 'No Equipment'];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: '#4ade80',
  Intermediate: '#facc15',
  Advanced: '#f87171',
};

const SEED_MEMBERS: Member[] = [
  {
    id: 1, name: 'John Carter', avatar: 'JC',
    height: '175 cm', weight: '78 kg', age: '28', goal: 'Muscle Gain',
    assessment: {
      fitnessLevel: 'Intermediate', bodyFat: '18%', muscleMass: '42 kg',
      restingHeartRate: '68 bpm', vo2Max: '44 ml/kg/min',
      injuries: 'Mild lower back tension', availableEquipment: ['Barbell', 'Dumbbells', 'Bench', 'Cable Machine'],
      notes: 'Responds well to high-volume training. Prefers morning sessions.',
    },
    workoutPlan: {
      title: '12-Week Hypertrophy', description: 'Progressive overload focus',
      startDate: '2025-03-01', endDate: '2025-05-24',
      trainingDays: ['Mon', 'Tue', 'Thu', 'Fri'],
      dailyWorkouts: [
        {
          id: 'dw1', day: 'Mon', weekNumber: 1, sessionTitle: 'Upper Body Push',
          focusArea: 'Chest & Triceps', warmup: '10 min treadmill + arm circles',
          cooldown: '5 min static stretch', duration: '50 min',
          exercises: [
            { id: 'e1', name: 'Bench Press', sets: '4', reps: '8–10', rest: '90s', notes: 'Focus on chest squeeze' },
            { id: 'e2', name: 'Incline Dumbbell Press', sets: '3', reps: '10–12', rest: '75s', notes: '' },
            { id: 'e3', name: 'Tricep Pushdown', sets: '3', reps: '12–15', rest: '60s', notes: '' },
          ],
        },
        {
          id: 'dw2', day: 'Tue', weekNumber: 1, sessionTitle: 'Lower Body',
          focusArea: 'Quads & Glutes', warmup: '5 min bike + leg swings',
          cooldown: '10 min foam roll', duration: '55 min',
          exercises: [
            { id: 'e4', name: 'Barbell Squat', sets: '4', reps: '6–8', rest: '2 min', notes: 'ATG depth' },
            { id: 'e5', name: 'Romanian Deadlift', sets: '3', reps: '10', rest: '90s', notes: '' },
          ],
        },
      ],
    },
    progress: [
      { date: '2025-03-01', weight: '78 kg', bodyFat: '18%', note: 'Program start' },
      { date: '2025-03-15', weight: '78.5 kg', bodyFat: '17.5%', note: 'Slight lean gain' },
      { date: '2025-04-01', weight: '79.2 kg', bodyFat: '17%', note: 'Good progression' },
    ],
  },
  {
    id: 2, name: 'Alex Morgan', avatar: 'AM',
    height: '168 cm', weight: '65 kg', age: '24', goal: 'Fat Loss',
    assessment: {
      fitnessLevel: 'Beginner', bodyFat: '26%', muscleMass: '36 kg',
      restingHeartRate: '72 bpm', vo2Max: '38 ml/kg/min',
      injuries: 'None', availableEquipment: ['Dumbbells', 'Resistance Bands', 'Treadmill'],
      notes: 'New to structured training. Build habit consistency first.',
    },
    progress: [
      { date: '2025-02-15', weight: '65 kg', bodyFat: '26%', note: 'Baseline' },
    ],
  },
  {
    id: 3, name: 'Sam Rivera', avatar: 'SR',
    height: '180 cm', weight: '85 kg', age: '32', goal: 'Strength',
    progress: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Badge: React.FC<{ level?: string }> = ({ level }) => {
  if (!level) return <span className="tw-badge tw-badge-none">—</span>;
  return (
    <span className="tw-badge" style={{ '--badge-color': LEVEL_COLORS[level] } as React.CSSProperties}>
      {level}
    </span>
  );
};

const Avatar: React.FC<{ initials: string; size?: number }> = ({ initials, size = 40 }) => (
  <div className="tw-avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
    {initials}
  </div>
);

// Portal wrapper
const Portal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) =>
  ReactDOM.createPortal(
    <div className="tw-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>,
    document.body
  );

// Progress mini-chart (SVG sparkline)
const Sparkline: React.FC<{ entries: ProgressEntry[] }> = ({ entries }) => {
  if (entries.length < 2) return <span className="tw-no-data">Not enough data</span>;
  const weights = entries.map(e => parseFloat(e.weight));
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const W = 160, H = 48;
  const pts = weights.map((w, i) => {
    const x = (i / (weights.length - 1)) * W;
    const y = H - ((w - min) / (max - min)) * H;
    return `${x},${y}`;
  }).join(' ');
  const trend = weights[weights.length - 1] - weights[0];
  const trendColor = trend > 0 ? '#4ade80' : trend < 0 ? '#f87171' : '#facc15';
  return (
    <div className="tw-sparkline-wrap">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <polyline points={pts} fill="none" stroke={trendColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {weights.map((w, i) => {
          const x = (i / (weights.length - 1)) * W;
          const y = H - ((w - min) / (max - min)) * H;
          return <circle key={i} cx={x} cy={y} r="3.5" fill={trendColor} />;
        })}
      </svg>
      <span className="tw-trend" style={{ color: trendColor }}>
        {trend > 0 ? '▲' : trend < 0 ? '▼' : '●'} {Math.abs(trend).toFixed(1)} kg
      </span>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type View = 'roster' | 'profile';
type ModalMode = null | 'assessment' | 'plan' | 'dailyList' | 'dailyEdit' | 'progress';

const TrainerWorkoutManagement: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>();

  const { assessments, loading } = useSelector(
   (state: RootState) => state.fitnessassessment
  );

useEffect(() => {
  const token = localStorage.getItem("trainerToken");

  if (token) {
    dispatch(fetchActiveAssessmentsThunk(token));
  }
}, [dispatch]);

useEffect(() => {
  if (!assessments || assessments.length === 0) return;

  const mappedMembers: Member[] = assessments.map((a: any, index: number) => ({
    id: a.memberId,
    fitnessAssessmentId: a.id,
    name: a.assessmentName || "Member",
    avatar: (a.assessmentName || "M")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase(),
    height: a.height ? `${a.height} cm` : "-",
    weight: a.weight ? `${a.weight} kg` : "-",
    age: a.age ? `${a.age}` : "-",
    goal: a.fitnessGoal || "General Fitness",

    assessment: {
      fitnessLevel: a.fitnessLevel || "Beginner",
      bodyFat: "",
      muscleMass: "",
      restingHeartRate: "",
      vo2Max: "",
      injuries: a.limitations || "",
      availableEquipment: [],
      notes: "",
    },

    progress: [],
  }));

  setMembers(mappedMembers);
}, [assessments]);

const { sessions } = useSelector((state: RootState) => state.dailysessions);



  //const [members, setMembers] = useState<Member[]>(SEED_MEMBERS);

  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<View>('roster');
  const [activeMember, setActiveMember] = useState<Member | null>(null);
  const [search, setSearch] = useState('');
  const [filterGoal, setFilterGoal] = useState('All');
  const [filterLevel, setFilterLevel] = useState('All');
  const [profileTab, setProfileTab] = useState<'overview' | 'workouts' | 'progress'>('overview');

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingWorkout, setEditingWorkout] = useState<DailyWorkout | null>(null);

  // ── Assessment form ──────────────────────────────────────────────────────
  const [asmLevel, setAsmLevel] = useState<FitnessAssessment['fitnessLevel']>('Beginner');
  const [asmBodyFat, setAsmBodyFat] = useState('');
  const [asmMuscleMass, setAsmMuscleMass] = useState('');
  const [asmRHR, setAsmRHR] = useState('');
  const [asmVO2, setAsmVO2] = useState('');
  const [asmInjuries, setAsmInjuries] = useState('');
  const [asmEquipment, setAsmEquipment] = useState<string[]>([]);
  const [asmNotes, setAsmNotes] = useState('');

  // ── Plan form ────────────────────────────────────────────────────────────
  const [planTitle, setPlanTitle] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planStart, setPlanStart] = useState('');
  const [planEnd, setPlanEnd] = useState('');
  const [planDays, setPlanDays] = useState<string[]>([]);

  // ── Daily workout form ───────────────────────────────────────────────────
  const [dwDay, setDwDay] = useState('Mon');
  const [dwWeek, setDwWeek] = useState(1);
  const [dwTitle, setDwTitle] = useState('');
  const [dwFocus, setDwFocus] = useState('');
  const [dwWarmup, setDwWarmup] = useState('');
  const [dwCooldown, setDwCooldown] = useState('');
  const [dwDuration, setDwDuration] = useState('');
  const [dwExercises, setDwExercises] = useState<Exercise[]>([
    { id: '1', name: '', sets: '', reps: '', rest: '', notes: '' },
  ]);

  // ── Progress form ────────────────────────────────────────────────────────
  const [pgDate, setPgDate] = useState('');
  const [pgWeight, setPgWeight] = useState('');
  const [pgBodyFat, setPgBodyFat] = useState('');
  const [pgNote, setPgNote] = useState('');

  // ─── Derived ─────────────────────────────────────────────────────────────

  const allGoals = useMemo(() => ['All', ...Array.from(new Set(members.map(m => m.goal)))], [members]);

  const filtered = useMemo(() => members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchGoal = filterGoal === 'All' || m.goal === filterGoal;
    const matchLevel = filterLevel === 'All' || m.assessment?.fitnessLevel === filterLevel;
    return matchSearch && matchGoal && matchLevel;
  }), [members, search, filterGoal, filterLevel]);

  // Keep activeMember in sync after mutations
  const syncedActive = activeMember ? members.find(m => m.id === activeMember.id) ?? null : null;

  // ─── Navigation ───────────────────────────────────────────────────────────

  //const openProfile = (member: Member) => {
    //setActiveMember(member);
    //setProfileTab('overview');
    //setView('profile');
  //};

  const openProfile = (member: Member) => {

  const token = localStorage.getItem("trainerToken");

  if (token) {
    dispatch(
      fetchTrainerMemberSessionsThunk({
        token,
        memberId: member.id.toString(),
      })
    );
  }

  setActiveMember(member);
  setProfileTab("overview");
  setView("profile");
};

useEffect(() => {

  if (!sessions || sessions.length === 0 || !syncedActive?.workoutPlan) return;

  const mappedSessions: DailyWorkout[] = sessions.map((s) => ({
    id: s.id,
    day: "Mon", // backend currently not returning day
    weekNumber: s.weekNumber,
    sessionTitle: s.sessionTitle,
    focusArea: s.focusArea,
    warmup: s.warmup,
    cooldown: s.cooldown,
    duration: s.duration,
    exercises: s.exercises.map((e, index) => ({
      id: index.toString(),
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      rest: e.rest,
      notes: e.notes,
    })),
  }));

  updateMember({
    ...syncedActive,
    workoutPlan: {
      ...syncedActive.workoutPlan,
      dailyWorkouts: mappedSessions,
    },
  });

}, [sessions]);

  const goBack = () => {
    setView('roster');
    setActiveMember(null);
  };

  // ─── Modal openers ────────────────────────────────────────────────────────

  const openAssessment = () => {
    const a = syncedActive?.assessment;
    setAsmLevel(a?.fitnessLevel ?? 'Beginner');
    setAsmBodyFat(a?.bodyFat ?? '');
    setAsmMuscleMass(a?.muscleMass ?? '');
    setAsmRHR(a?.restingHeartRate ?? '');
    setAsmVO2(a?.vo2Max ?? '');
    setAsmInjuries(a?.injuries ?? '');
    setAsmEquipment(a?.availableEquipment ?? []);
    setAsmNotes(a?.notes ?? '');
    setModalMode('assessment');
  };

  const openPlan = () => {
  const p = syncedActive?.workoutPlan;
  setPlanTitle(p?.title ?? '');
  setPlanDesc(p?.description ?? '');
  setPlanStart(p?.startDate ?? '');
  setPlanEnd(p?.endDate ?? '');
  // ✅ use existing plan days, fall back to assessment's workoutDays, then empty
  setPlanDays(p?.trainingDays ?? syncedActive?.workoutDays ?? []);
  setModalMode('plan');
};

  const openDailyEdit = (w?: DailyWorkout) => {
    const trainingDays = syncedActive?.workoutPlan?.trainingDays ?? [];
    if (w) {
      setEditingWorkout(w);
      setDwDay(w.day); setDwWeek(w.weekNumber); setDwTitle(w.sessionTitle);
      setDwFocus(w.focusArea); setDwWarmup(w.warmup); setDwCooldown(w.cooldown);
      setDwDuration(w.duration);
      setDwExercises(w.exercises.length > 0 ? w.exercises : [{ id: Date.now().toString(), name: '', sets: '', reps: '', rest: '', notes: '' }]);
    } else {
      setEditingWorkout(null);
      setDwDay(trainingDays[0] ?? 'Mon'); setDwWeek(1); setDwTitle('');
      setDwFocus(''); setDwWarmup(''); setDwCooldown(''); setDwDuration('');
      setDwExercises([{ id: Date.now().toString(), name: '', sets: '', reps: '', rest: '', notes: '' }]);
    }
    setModalMode('dailyEdit');
  };

  const openProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    setPgDate(today); setPgWeight(''); setPgBodyFat(''); setPgNote('');
    setModalMode('progress');
  };

  const closeModal = () => { setModalMode(null); setEditingWorkout(null); };

  // ─── Mutators ─────────────────────────────────────────────────────────────

  const updateMember = (updated: Member) => {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m));
    setActiveMember(updated);
  };

  const saveAssessment = () => {
    if (!syncedActive) return;
    updateMember({ ...syncedActive, assessment: { fitnessLevel: asmLevel, bodyFat: asmBodyFat, muscleMass: asmMuscleMass, restingHeartRate: asmRHR, vo2Max: asmVO2, injuries: asmInjuries, availableEquipment: asmEquipment, notes: asmNotes } });
    closeModal();
  };

  //const savePlan = () => {
    //if (!syncedActive || !planTitle || !planStart || !planEnd) return;
    //const existing = syncedActive.workoutPlan?.dailyWorkouts ?? [];
    //updateMember({ ...syncedActive, workoutPlan: { title: planTitle, description: planDesc, startDate: planStart, endDate: planEnd, trainingDays: planDays, dailyWorkouts: existing } });
    //closeModal();
  //};

const savePlan = async () => {

  // Basic validation
  if (!syncedActive) {
    alert("Please select a member first.");
    return;
  }

  if (!planTitle.trim()) {
    alert("Plan title is required.");
    return;
  }

  if (!planStart || !planEnd) {
    alert("Please select start and end dates.");
    return;
  }

  if (planDays.length === 0) {
    alert("Please select at least one training day.");
    return;
  }

  if (new Date(planEnd) < new Date(planStart)) {
    alert("End date cannot be earlier than start date.");
    return;
  }

  const token = localStorage.getItem("trainerToken");

  if (!token) {
    alert("Trainer not authenticated.");
    return;
  }

  try {

    await dispatch(
      createWorkoutPlanThunk({
        token: token,
        data: {
          memberId: syncedActive.id.toString(),
          fitnessAssessmentId: syncedActive.fitnessAssessmentId!,
          planTitle: planTitle,
          description: planDesc,
          startDate: planStart,
          endDate: planEnd,
          trainingDays: planDays,
        }
      })
    ).unwrap();

    // SUCCESS MESSAGE
    alert("✅ Workout plan created successfully!");

    // Reset form
    setPlanTitle("");
    setPlanDesc("");
    setPlanStart("");
    setPlanEnd("");
    setPlanDays([]);

    closeModal();

  } catch (error: any) {

    console.error(error);

    // FAILURE MESSAGE
    alert("❌ Failed to create workout plan. Please try again.");

  }
};

useEffect(() => {
  const token = localStorage.getItem("trainerToken");
  if (!token) return;

  // fetch assessments
  dispatch(fetchActiveAssessmentsThunk(token));

  // fetch workout plans
  dispatch(fetchWorkoutPlansThunk(token));
}, [dispatch]);

const { plans } = useSelector((state: RootState) => state.workoutplan);

useEffect(() => {
  if (!assessments || assessments.length === 0) return;

  const mappedMembers: Member[] = assessments.map((a: any) => {
    const plan = plans.find(p => p.memberId === a.memberId);

    return {
      id: a.memberId,
      fitnessAssessmentId: a.id,
      name: a.assessmentName || "Member",
      avatar: (a.assessmentName || "M")
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),
      height: a.height ? `${a.height} cm` : "-",
      weight: a.weight ? `${a.weight} kg` : "-",
      age: a.age ? `${a.age}` : "-",
      goal: a.fitnessGoal || "General Fitness",
      assessment: {
        fitnessLevel: a.fitnessLevel || "Beginner",
        bodyFat: "",
        muscleMass: "",
        restingHeartRate: "",
        vo2Max: "",
        injuries: a.limitations || "",
        availableEquipment: [],
        notes: "",
      },
      progress: [],
      workoutPlan: plan
        ? {
            id: plan.id,
            title: plan.planTitle,
            description: plan.description,
            startDate: plan.startDate.split("T")[0],
            endDate: plan.endDate.split("T")[0],
            trainingDays: plan.trainingDays,
            dailyWorkouts: [],
          }
        : undefined,
      workoutDays: a.workoutDays ?? [], // ✅ carry over from assessment
    };
  });

  setMembers(mappedMembers);
}, [assessments, plans]);

  //const saveDailyWorkout = () => {
    //if (!syncedActive?.workoutPlan || !dwTitle) return;
    //const session: DailyWorkout = { id: editingWorkout?.id ?? Date.now().toString(), day: dwDay, weekNumber: dwWeek, sessionTitle: dwTitle, focusArea: dwFocus, warmup: dwWarmup, cooldown: dwCooldown, duration: dwDuration, exercises: dwExercises.filter(e => e.name.trim()) };
    //const list = syncedActive.workoutPlan.dailyWorkouts ?? [];
    //const updated = editingWorkout ? list.map(w => w.id === editingWorkout.id ? session : w) : [...list, session];
    //updateMember({ ...syncedActive, workoutPlan: { ...syncedActive.workoutPlan, dailyWorkouts: updated } });
    //setModalMode('dailyList');
  //};

const saveDailyWorkout = async () => {
  if (!syncedActive?.workoutPlan) {
    alert("Select a member with a workout plan first.");
    return;
  }

  if (!dwTitle.trim()) {
    alert("Session title is required.");
    return;
  }

  if (dwExercises.length === 0 || dwExercises.every(e => !e.name.trim())) {
    alert("Add at least one exercise with a name.");
    return;
  }

  const token = localStorage.getItem("trainerToken");
  if (!token) {
    alert("Trainer not authenticated.");
    return;
  }

  const sessionPayload: DailySessionRequest = {
    memberId: syncedActive.id.toString(),
    planId: syncedActive.workoutPlan.id || "", // Or actual planId from backend
    sessionTitle: dwTitle,
    focusArea: dwFocus,
    weekNumber: dwWeek,
    day: dwDay,
    warmup: dwWarmup,
    cooldown: dwCooldown,
    duration: dwDuration,
    exercises: dwExercises
      .filter(e => e.name.trim())
      .map(e => ({
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        rest: e.rest,
        notes: e.notes,
      })),
  };

  try {
    const newSession = await dispatch(
      addDailySession({ token, session: sessionPayload })
    ).unwrap();

    // Map exercises to include id
    const exercisesWithId: Exercise[] = newSession.exercises.map(e => ({
      id: Date.now().toString() + Math.random(), // generate unique id
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      rest: e.rest,
      notes: e.notes,
    }));

    // Update local state
    const updatedPlan: WorkoutPlan = {
      ...syncedActive.workoutPlan,
      dailyWorkouts: [
        ...(syncedActive.workoutPlan.dailyWorkouts ?? []),
        {
          id: newSession.id,
          day: dwDay,
          weekNumber: dwWeek,
          sessionTitle: newSession.sessionTitle,
          focusArea: newSession.focusArea,
          warmup: newSession.warmup,
          cooldown: newSession.cooldown,
          duration: newSession.duration,
          exercises: exercisesWithId,
        },
      ],
    };

    updateMember({ ...syncedActive, workoutPlan: updatedPlan });

    alert("✅ Daily session created successfully!");
    closeModal();
  } catch (err: any) {
    console.error(err);
    alert("❌ Failed to create daily session: " + err.message);
  }
};

  const deleteSession = (id: string) => {
    if (!syncedActive?.workoutPlan) return;
    const updated = syncedActive.workoutPlan.dailyWorkouts.filter(w => w.id !== id);
    updateMember({ ...syncedActive, workoutPlan: { ...syncedActive.workoutPlan, dailyWorkouts: updated } });
  };

  const saveProgress = () => {
    if (!syncedActive || !pgDate || !pgWeight) return;
    const entry: ProgressEntry = { date: pgDate, weight: pgWeight, bodyFat: pgBodyFat, note: pgNote };
    updateMember({ ...syncedActive, progress: [...syncedActive.progress, entry] });
    closeModal();
  };

  // ─── Exercise helpers ─────────────────────────────────────────────────────

  const addExercise = () => setDwExercises(prev => [...prev, { id: Date.now().toString(), name: '', sets: '', reps: '', rest: '', notes: '' }]);
  const removeExercise = (id: string) => setDwExercises(prev => prev.filter(e => e.id !== id));
  const updateExercise = (id: string, field: keyof Exercise, val: string) =>
    setDwExercises(prev => prev.map(e => e.id === id ? { ...e, [field]: val } : e));

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);

  // ─── Label style ──────────────────────────────────────────────────────────
  const lbl: React.CSSProperties = { fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' };

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (loading) {
  return (
    <div className="trainer-workout">
      <div className="tw-loading">
        <h3>Loading Active Member Profiles...</h3>
      </div>
    </div>
  );
}

  return (
    <div className="trainer-workout">

      {/* ── ROSTER VIEW ─────────────────────────────────────────────────── */}
      {view === 'roster' && (
        <>
          <div className="tw-page-header">
            <div>
              <h2>Structured Workout Programs</h2>
              <p className="tw-subtitle">{members.length} members · {members.filter(m => m.workoutPlan).length} active plans</p>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="tw-filters">
            <div className="tw-search-wrap">
              <span className="tw-search-icon">⌕</span>
              <input
                className="tw-search"
                type="text"
                placeholder="Search member by name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button className="tw-clear-btn" onClick={() => setSearch('')}>✕</button>}
            </div>
            <select className="tw-select" value={filterGoal} onChange={e => setFilterGoal(e.target.value)}>
              {allGoals.map(g => <option key={g}>{g}</option>)}
            </select>
            <select className="tw-select" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
              {['All', ...FITNESS_LEVELS].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          {/* Member Cards Grid */}
          {filtered.length === 0 ? (
            <div className="tw-empty">No members match your search.</div>
          ) : (
            <div className="tw-cards-grid">
              {filtered.map(member => (
                <div key={member.id} className="tw-member-card" onClick={() => openProfile(member)}>
                  <div className="tw-card-top">
                    <Avatar initials={member.avatar} size={46} />
                    <div className="tw-card-identity">
                      <div className="tw-card-name">{member.name}</div>
                      <div className="tw-card-meta">{member.age} yrs · {member.height} · {member.weight}</div>
                    </div>
                    <Badge level={member.assessment?.fitnessLevel} />
                  </div>
                  <div className="tw-card-divider" />
                  <div className="tw-card-stats">
                    <div className="tw-stat">
                      <span className="tw-stat-label">Goal</span>
                      <span className="tw-stat-val">{member.goal}</span>
                    </div>
                    <div className="tw-stat">
                      <span className="tw-stat-label">Plan</span>
                      <span className="tw-stat-val">{member.workoutPlan ? member.workoutPlan.title : '—'}</span>
                    </div>
                    <div className="tw-stat">
                      <span className="tw-stat-label">Sessions</span>
                      <span className="tw-stat-val">{member.workoutPlan?.dailyWorkouts.length ?? 0}</span>
                    </div>
                    <div className="tw-stat">
                      <span className="tw-stat-label">Progress</span>
                      <span className="tw-stat-val">{member.progress.length} entries</span>
                    </div>
                  </div>
                  <div className="tw-card-arrow">View Profile →</div>
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
          <div className="tw-profile-header">
            <button className="tw-back-btn" onClick={goBack}>← Back</button>
            <div className="tw-profile-identity">
              <Avatar initials={syncedActive.avatar} size={56} />
              <div>
                <h2 style={{ margin: 0 }}>{syncedActive.name}</h2>
                <p className="tw-subtitle">{syncedActive.age} yrs · {syncedActive.height} · {syncedActive.weight} · {syncedActive.goal}</p>
              </div>
              <Badge level={syncedActive.assessment?.fitnessLevel} />
            </div>
            {/* Quick actions */}
            <div className="tw-profile-actions">
              <button className="assign-btn" onClick={openAssessment}>
                {syncedActive.assessment ? 'Edit Assessment' : '+ Assessment'}
              </button>
              <button className="assign-btn" onClick={openPlan}>
                {syncedActive.workoutPlan ? 'Edit Plan' : '+ Create Plan'}
              </button>
              {syncedActive.workoutPlan && (
                <button className="assign-btn" onClick={() => setModalMode('dailyList')}>
                  Manage Sessions
                </button>
              )}
              <button className="assign-btn" onClick={openProgress}>Log Progress</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tw-tabs">
            {(['overview', 'workouts', 'progress'] as const).map(tab => (
              <button
                key={tab}
                className={`tw-tab ${profileTab === tab ? 'tw-tab-active' : ''}`}
                onClick={() => setProfileTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* ── TAB: OVERVIEW ── */}
          {profileTab === 'overview' && (
            <div className="tw-tab-content">
              <div className="tw-overview-grid">

                {/* Assessment Card */}
                <div className="tw-info-card">
                  <div className="tw-info-card-title">Fitness Assessment</div>
                  {syncedActive.assessment ? (
                    <div className="tw-asm-grid">
                      <div className="tw-asm-item"><span className="tw-asm-lbl">Level</span><span className="tw-asm-val"><Badge level={syncedActive.assessment.fitnessLevel} /></span></div>
                      <div className="tw-asm-item"><span className="tw-asm-lbl">Body Fat</span><span className="tw-asm-val">{syncedActive.assessment.bodyFat || '—'}</span></div>
                      <div className="tw-asm-item"><span className="tw-asm-lbl">Muscle Mass</span><span className="tw-asm-val">{syncedActive.assessment.muscleMass || '—'}</span></div>
                      <div className="tw-asm-item"><span className="tw-asm-lbl">RHR</span><span className="tw-asm-val">{syncedActive.assessment.restingHeartRate || '—'}</span></div>
                      <div className="tw-asm-item"><span className="tw-asm-lbl">VO2 Max</span><span className="tw-asm-val">{syncedActive.assessment.vo2Max || '—'}</span></div>
                      <div className="tw-asm-item tw-asm-full"><span className="tw-asm-lbl">Injuries</span><span className="tw-asm-val">{syncedActive.assessment.injuries || 'None'}</span></div>
                      <div className="tw-asm-item tw-asm-full"><span className="tw-asm-lbl">Equipment</span><span className="tw-asm-val">{syncedActive.assessment.availableEquipment.join(', ') || '—'}</span></div>
                      {syncedActive.assessment.notes && (
                        <div className="tw-asm-item tw-asm-full"><span className="tw-asm-lbl">Notes</span><span className="tw-asm-val tw-asm-note">{syncedActive.assessment.notes}</span></div>
                      )}
                    </div>
                  ) : (
                    <div className="tw-empty-card">
                      <span>No assessment yet.</span>
                      <button className="assign-btn tw-sm-btn" onClick={openAssessment}>+ Add Assessment</button>
                    </div>
                  )}
                </div>

                {/* Plan Card */}
                <div className="tw-info-card">
                  <div className="tw-info-card-title">Active Workout Plan</div>
                  {syncedActive.workoutPlan ? (
                    <>
                      <div className="tw-plan-title">{syncedActive.workoutPlan.title}</div>
                      {syncedActive.workoutPlan.description && (
                        <div className="tw-plan-desc">{syncedActive.workoutPlan.description}</div>
                      )}
                      <div className="tw-plan-dates">
                        📅 {syncedActive.workoutPlan.startDate} → {syncedActive.workoutPlan.endDate}
                      </div>
                      <div className="tw-plan-days">
                        {syncedActive.workoutPlan.trainingDays.map(d => (
                          <span key={d} className="tw-day-chip">{d}</span>
                        ))}
                      </div>
                      <div className="tw-plan-stat">
                        {syncedActive.workoutPlan.dailyWorkouts.length} session{syncedActive.workoutPlan.dailyWorkouts.length !== 1 ? 's' : ''} programmed
                      </div>
                    </>
                  ) : (
                    <div className="tw-empty-card">
                      <span>No plan created yet.</span>
                      <button className="assign-btn tw-sm-btn" onClick={openPlan}>+ Create Plan</button>
                    </div>
                  )}
                </div>

                {/* Latest Progress Card */}
                <div className="tw-info-card">
                  <div className="tw-info-card-title">Progress Snapshot</div>
                  {syncedActive.progress.length > 0 ? (
                    <>
                      <Sparkline entries={syncedActive.progress} />
                      <div className="tw-progress-latest">
                        {syncedActive.progress.slice(-1).map(p => (
                          <div key={p.date} className="tw-asm-grid" style={{ marginTop: '1rem' }}>
                            <div className="tw-asm-item"><span className="tw-asm-lbl">Date</span><span className="tw-asm-val">{p.date}</span></div>
                            <div className="tw-asm-item"><span className="tw-asm-lbl">Weight</span><span className="tw-asm-val">{p.weight}</span></div>
                            {p.bodyFat && <div className="tw-asm-item"><span className="tw-asm-lbl">Body Fat</span><span className="tw-asm-val">{p.bodyFat}</span></div>}
                            {p.note && <div className="tw-asm-item tw-asm-full"><span className="tw-asm-lbl">Note</span><span className="tw-asm-val">{p.note}</span></div>}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="tw-empty-card">
                      <span>No progress logged yet.</span>
                      <button className="assign-btn tw-sm-btn" onClick={openProgress}>Log Progress</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: WORKOUTS ── */}
          {profileTab === 'workouts' && (
            <div className="tw-tab-content">
              {!syncedActive.workoutPlan ? (
                <div className="tw-empty">
                  <p>No workout plan yet.</p>
                  <button className="assign-btn" onClick={openPlan}>+ Create Plan</button>
                </div>
              ) : (
                <>
                  <div className="tw-workouts-top">
                    <div className="tw-plan-banner">
                      <span className="tw-plan-banner-title">{syncedActive.workoutPlan.title}</span>
                      <span className="tw-plan-banner-dates">{syncedActive.workoutPlan.startDate} → {syncedActive.workoutPlan.endDate}</span>
                    </div>
                    <button className="assign-btn tw-sm-btn" onClick={() => openDailyEdit()}>+ Add Session</button>
                  </div>

                  {syncedActive.workoutPlan.dailyWorkouts.length === 0 ? (
                    <div className="tw-empty">No sessions yet. Add your first session above.</div>
                  ) : (
                    <div className="tw-sessions-list">
                      {[...syncedActive.workoutPlan.dailyWorkouts]
                        .sort((a, b) => a.weekNumber - b.weekNumber || DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
                        .map(w => (
                          <div key={w.id} className="tw-session-card">
                            <div className="tw-session-card-left">
                              <div className="tw-session-day-badge">
                                <span className="tw-sdb-week">Wk {w.weekNumber}</span>
                                <span className="tw-sdb-day">{w.day}</span>
                              </div>
                            </div>
                            <div className="tw-session-card-body">
                              <div className="tw-session-card-title">{w.sessionTitle}</div>
                              <div className="tw-session-card-meta">
                                {w.focusArea && <span>{w.focusArea}</span>}
                                {w.duration && <span>⏱ {w.duration}</span>}
                                <span>💪 {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}</span>
                              </div>
                              {/* Exercises preview */}
                              {w.exercises.length > 0 && (
                                <div className="tw-exercises-preview">
                                  {w.exercises.map(ex => (
                                    <div key={ex.id} className="tw-ex-row">
                                      <span className="tw-ex-name">{ex.name}</span>
                                      <span className="tw-ex-detail">{ex.sets} × {ex.reps}</span>
                                      {ex.rest && <span className="tw-ex-rest">Rest: {ex.rest}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="tw-session-card-actions">
                              <button className="assign-btn tw-xs-btn" onClick={() => openDailyEdit(w)}>Edit</button>
                              <button className="cancel-btn tw-xs-btn" onClick={() => deleteSession(w.id)}>Delete</button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TAB: PROGRESS ── */}
          {profileTab === 'progress' && (
            <div className="tw-tab-content">
              <div className="tw-progress-top">
                <h3 style={{ margin: 0, fontFamily: "'Syne', sans-serif" }}>Progress History</h3>
                <button className="assign-btn tw-sm-btn" onClick={openProgress}>+ Log Entry</button>
              </div>

              {syncedActive.progress.length === 0 ? (
                <div className="tw-empty">No progress entries yet.</div>
              ) : (
                <>
                  {/* Weight sparkline */}
                  <div className="tw-info-card" style={{ marginBottom: '1.5rem' }}>
                    <div className="tw-info-card-title">Weight Trend</div>
                    <Sparkline entries={syncedActive.progress} />
                  </div>

                  {/* Full table */}
                  <div className="member-table-wrapper">
                    <table className="member-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Weight</th>
                          <th>Body Fat</th>
                          <th>Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...syncedActive.progress].reverse().map((p, i) => (
                          <tr key={i}>
                            <td style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.85rem' }}>{p.date}</td>
                            <td style={{ fontWeight: 700 }}>{p.weight}</td>
                            <td>{p.bodyFat || '—'}</td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.note || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODALS
      ═════════════════════════════════════════════════════════════════════ */}

      {/* ── ASSESSMENT MODAL ── */}
      {modalMode === 'assessment' && syncedActive && (
        <Portal onClose={closeModal}>
          <div className="modal-content tw-modal-scroll">
            <h3>Fitness Assessment — {syncedActive.name}</h3>
            <p className="member-meta">{syncedActive.height} · {syncedActive.weight} · {syncedActive.goal}</p>
            <div className="modal-form">
              <div>
                <label style={lbl}>Fitness Level</label>
                <div className="days-grid">
                  {FITNESS_LEVELS.map(lvl => (
                    <button key={lvl} type="button" className={`day-btn${asmLevel === lvl ? ' active-day' : ''}`} style={{ flex: 1 }} onClick={() => setAsmLevel(lvl)}>{lvl}</button>
                  ))}
                </div>
              </div>
              <div className="date-row">
                <div><label style={lbl}>Body Fat %</label><input type="text" placeholder="e.g. 18%" value={asmBodyFat} onChange={e => setAsmBodyFat(e.target.value)} /></div>
                <div><label style={lbl}>Muscle Mass</label><input type="text" placeholder="e.g. 42 kg" value={asmMuscleMass} onChange={e => setAsmMuscleMass(e.target.value)} /></div>
              </div>
              <div className="date-row">
                <div><label style={lbl}>Resting Heart Rate</label><input type="text" placeholder="e.g. 68 bpm" value={asmRHR} onChange={e => setAsmRHR(e.target.value)} /></div>
                <div><label style={lbl}>VO2 Max</label><input type="text" placeholder="e.g. 44 ml/kg/min" value={asmVO2} onChange={e => setAsmVO2(e.target.value)} /></div>
              </div>
              <div><label style={lbl}>Injuries / Limitations</label><input type="text" placeholder="e.g. Lower back" value={asmInjuries} onChange={e => setAsmInjuries(e.target.value)} /></div>
              <div className="training-days">
                <label>Available Equipment</label>
                <div className="days-grid">
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <button key={eq} type="button" className={`day-btn${asmEquipment.includes(eq) ? ' active-day' : ''}`} onClick={() => toggleArr(asmEquipment, eq, setAsmEquipment)}>{eq}</button>
                  ))}
                </div>
              </div>
              <div><label style={lbl}>Trainer Notes</label><textarea rows={3} placeholder="Notes…" value={asmNotes} onChange={e => setAsmNotes(e.target.value)} /></div>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={saveAssessment}>Save Assessment</button>
                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── PLAN MODAL ── */}
      {modalMode === 'plan' && syncedActive && (
        <Portal onClose={closeModal}>
          <div className="modal-content tw-modal-scroll">
            <h3>{syncedActive.workoutPlan ? 'Edit' : 'Create'} Plan — {syncedActive.name}</h3>
            <p className="member-meta">{syncedActive.goal}{syncedActive.assessment ? ` · ${syncedActive.assessment.fitnessLevel}` : ''}</p>
            {syncedActive.assessment && (
              <div className="tw-snapshot">
                {syncedActive.assessment.bodyFat && <span>🔬 <strong>{syncedActive.assessment.bodyFat}</strong> body fat</span>}
                {syncedActive.assessment.injuries && <span>⚠ {syncedActive.assessment.injuries}</span>}
                {syncedActive.assessment.availableEquipment.length > 0 && <span>🏋️ {syncedActive.assessment.availableEquipment.slice(0, 3).join(', ')}{syncedActive.assessment.availableEquipment.length > 3 ? '…' : ''}</span>}
              </div>
            )}
            <div className="modal-form">
              <input type="text" placeholder="Plan Title" value={planTitle} onChange={e => setPlanTitle(e.target.value)} />
              <textarea rows={3} placeholder="Description / Goals" value={planDesc} onChange={e => setPlanDesc(e.target.value)} />
              <div className="date-row">
                <div><label>Start Date</label><input type="date" value={planStart} onChange={e => setPlanStart(e.target.value)} /></div>
                <div><label>End Date</label><input type="date" value={planEnd} onChange={e => setPlanEnd(e.target.value)} /></div>
              </div>
              <div className="training-days">
                <label>Training Days</label>
                <div className="days-grid">
                  {DAYS.map(day => (
                    <button key={day} type="button" className={`day-btn${planDays.includes(day) ? ' active-day' : ''}`} onClick={() => toggleArr(planDays, day, setPlanDays)}>{day}</button>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={savePlan} disabled={!planTitle || !planStart || !planEnd}>Save Plan</button>
                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── DAILY LIST MODAL ── */}
      {modalMode === 'dailyList' && syncedActive?.workoutPlan && (
        <Portal onClose={closeModal}>
          <div className="modal-content tw-modal-scroll tw-modal-medium">
            <h3>Sessions — {syncedActive.name}</h3>
            <p className="member-meta">{syncedActive.workoutPlan.title} · {syncedActive.workoutPlan.trainingDays.join(', ')}</p>
            {syncedActive.workoutPlan.dailyWorkouts.length === 0
              ? <div className="tw-empty-card" style={{ padding: '1.5rem 0' }}><span>No sessions yet.</span></div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {[...syncedActive.workoutPlan.dailyWorkouts]
                    .sort((a, b) => a.weekNumber - b.weekNumber || DAYS.indexOf(a.day) - DAYS.indexOf(b.day))
                    .map(w => (
                      <div key={w.id} className="tw-session-item">
                        <div className="tw-session-day-badge" style={{ minWidth: 52 }}>
                          <span className="tw-sdb-week">Wk {w.weekNumber}</span>
                          <span className="tw-sdb-day">{w.day}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{w.sessionTitle}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                            {w.focusArea && `${w.focusArea} · `}{w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}{w.duration && ` · ${w.duration}`}
                          </div>
                        </div>
                        <div className="tw-action-row">
                          <button className="assign-btn tw-xs-btn" onClick={() => openDailyEdit(w)}>Edit</button>
                          <button className="cancel-btn tw-xs-btn" onClick={() => deleteSession(w.id)}>✕</button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button className="confirm-btn" onClick={() => openDailyEdit()}>+ Add Session</button>
              <button className="cancel-btn" onClick={closeModal}>Close</button>
            </div>
          </div>
        </Portal>
      )}

      {/* ── DAILY EDIT MODAL ── */}
      {modalMode === 'dailyEdit' && syncedActive?.workoutPlan && (
        <Portal onClose={() => setModalMode('dailyList')}>
          <div className="modal-content tw-modal-scroll tw-modal-wide">
            <h3>{editingWorkout ? 'Edit' : 'Add'} Session — {syncedActive.name}</h3>
            <p className="member-meta">{syncedActive.workoutPlan.title}</p>
            <div className="modal-form">
              <input type="text" placeholder="Session Title (e.g. Upper Body Push)" value={dwTitle} onChange={e => setDwTitle(e.target.value)} />
              <div className="date-row">
                <div><label style={lbl}>Focus Area</label><input type="text" placeholder="e.g. Chest & Triceps" value={dwFocus} onChange={e => setDwFocus(e.target.value)} /></div>
                <div><label style={lbl}>Duration</label><input type="text" placeholder="e.g. 45 min" value={dwDuration} onChange={e => setDwDuration(e.target.value)} /></div>
              </div>
              <div className="date-row">
                <div><label style={lbl}>Week #</label><input type="number" min={1} value={dwWeek} onChange={e => setDwWeek(parseInt(e.target.value) || 1)} /></div>
                <div>
                  <label style={lbl}>Day</label>
                  <div className="days-grid" style={{ marginTop: '0.3rem' }}>
                    {(syncedActive.workoutPlan.trainingDays.length > 0 ? syncedActive.workoutPlan.trainingDays : DAYS).map(day => (
                      <button key={day} type="button" className={`day-btn tw-xs-btn${dwDay === day ? ' active-day' : ''}`} onClick={() => setDwDay(day)}>{day}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div><label style={lbl}>Warm-Up</label><input type="text" placeholder="e.g. 10 min light cardio" value={dwWarmup} onChange={e => setDwWarmup(e.target.value)} /></div>

              {/* Exercises */}
              <div>
                <div className="tw-exercises-header">
                  <label style={{ fontFamily: "'Syne', sans-serif" }}>Exercises</label>
                  <button type="button" className="assign-btn tw-xs-btn" onClick={addExercise}>+ Add</button>
                </div>
                {dwExercises.map((ex, idx) => (
                  <div key={ex.id} className="tw-exercise-card">
                    <div className="tw-exercise-card-header">
                      <span className="tw-exercise-num">#{idx + 1}</span>
                      {dwExercises.length > 1 && <button type="button" className="tw-remove-btn" onClick={() => removeExercise(ex.id)}>✕</button>}
                    </div>
                    <input type="text" placeholder="Exercise name" value={ex.name} onChange={e => updateExercise(ex.id, 'name', e.target.value)} className="tw-full-input" />
                    <div className="tw-exercise-grid">
                      <input type="text" placeholder="Sets" value={ex.sets} onChange={e => updateExercise(ex.id, 'sets', e.target.value)} />
                      <input type="text" placeholder="Reps" value={ex.reps} onChange={e => updateExercise(ex.id, 'reps', e.target.value)} />
                      <input type="text" placeholder="Rest" value={ex.rest} onChange={e => updateExercise(ex.id, 'rest', e.target.value)} />
                    </div>
                    <input type="text" placeholder="Notes (e.g. RPE 8, tempo 3-1-1)" value={ex.notes} onChange={e => updateExercise(ex.id, 'notes', e.target.value)} className="tw-full-input" />
                  </div>
                ))}
              </div>

              <div><label style={lbl}>Cool-Down</label><input type="text" placeholder="e.g. 5 min static stretch" value={dwCooldown} onChange={e => setDwCooldown(e.target.value)} /></div>
              
              <div className="modal-actions">
                <button className="confirm-btn" onClick={saveDailyWorkout} disabled={!dwTitle}>{editingWorkout ? 'Update Session' : 'Save Session'}</button>
                <button className="cancel-btn" onClick={() => setModalMode('dailyList')}>Back</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── PROGRESS MODAL ── */}
      {modalMode === 'progress' && syncedActive && (
        <Portal onClose={closeModal}>
          <div className="modal-content tw-modal-scroll">
            <h3>Log Progress — {syncedActive.name}</h3>
            <p className="member-meta">Current: {syncedActive.weight} · {syncedActive.goal}</p>
            <div className="modal-form">
              <div><label style={lbl}>Date</label><input type="date" value={pgDate} onChange={e => setPgDate(e.target.value)} /></div>
              <div className="date-row">
                <div><label style={lbl}>Weight</label><input type="text" placeholder="e.g. 79 kg" value={pgWeight} onChange={e => setPgWeight(e.target.value)} /></div>
                <div><label style={lbl}>Body Fat %</label><input type="text" placeholder="e.g. 17%" value={pgBodyFat} onChange={e => setPgBodyFat(e.target.value)} /></div>
              </div>
              <div><label style={lbl}>Note</label><input type="text" placeholder="e.g. Feeling stronger" value={pgNote} onChange={e => setPgNote(e.target.value)} /></div>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={saveProgress} disabled={!pgDate || !pgWeight}>Save Entry</button>
                <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
};

export default TrainerWorkoutManagement;