import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Clock, ChevronRight, Calendar,
  ChevronLeft, ChevronRight as NextIcon,
  X, Sparkles, Bot, Zap
} from 'lucide-react';
import { fetchMyDietPlansThunk } from '../redux/dietPlanSlice';
import { analyzeMealThunk, clearAnalysis, fetchDietLogsByPlanThunk } from '../redux/dietLogSlice';
import type { AppDispatch, RootState } from '../redux/store';
import './DietPlan.css';
import { saveDietLogThunk } from '../redux/dietLogSlice';

interface Meal {
  time: string;
  name: string;
  items: string[];
  calories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  consumedCalories?: number;
  consumedItems?: string[];
  tip?: string;
}

interface AIAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  feedback: string;
  tips: string[];
  rating: 'excellent' | 'good' | 'fair' | 'poor';
}

// Parses "700 kcal" → 700, "60g" → 60
const parseNumeric = (value: string | undefined): number => {
  if (!value) return 0;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

const DietPlan: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const token = localStorage.getItem('memberToken') ?? '';

  // ── Redux: diet plans ────────────────────────────────────────
  const { memberPlans, loading, error } = useSelector((state: RootState) => state.dietplan);

  // ── Redux: AI meal analysis ──────────────────────────────────
  const {
    analysis: rawAnalysis,   // DietLogAIResponse | null  (strings like "700 kcal")
    loading: aiLoading,
    error: aiError,
    logs: dietLogs,
  } = useSelector((state: RootState) => state.dietlog);



  // ── Local UI state ───────────────────────────────────────────
  const [currentDate, setCurrentDate]         = useState(new Date());
  const [showLogPopup, setShowLogPopup]       = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState<number | null>(null);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [aiStage, setAiStage]                 = useState<'idle' | 'filled' | 'analyzed'>('idle');
  const [aiAnalysis, setAiAnalysis]           = useState<AIAnalysis | null>(null);
  const [analyzeError, setAnalyzeError]       = useState<string | null>(null);

  // Add this effect after the currentPlan derived variable
useEffect(() => {
  if (currentPlan?.startDate) {
    setCurrentDate(new Date(currentPlan.startDate));
  }
}, [currentPlanIndex]);

  const [logForm, setLogForm] = useState({
    name: '', items: '', calories: '', protein: '', carbs: '', fats: '',
  });

  // ── When rawAnalysis arrives from Redux → populate form fields ──
  useEffect(() => {
    if (!rawAnalysis) return;

    // Parse the string values ("700 kcal" → "700", "60g" → "60")
    setLogForm((prev) => ({
      ...prev,
      calories: String(parseNumeric(rawAnalysis.calories)),
      protein:  String(parseNumeric(rawAnalysis.protein)),
      carbs:    String(parseNumeric(rawAnalysis.carbs)),
      fats:     String(parseNumeric(rawAnalysis.fats)),
    }));
    setAiStage('filled');
  }, [rawAnalysis]);

  // ── Fetch plans on mount ─────────────────────────────────────
  useEffect(() => {
    if (token) dispatch(fetchMyDietPlansThunk(token));
  }, [dispatch, token]);

  useEffect(() => {
    setCurrentPlanIndex(0);
  }, [memberPlans.length]);

  // ── Derived plan data ────────────────────────────────────────
  const currentPlan   = memberPlans[currentPlanIndex] ?? null;

  const planTargets = currentPlan
    ? {
        calories: parseNumeric(currentPlan.dailyCalorieTarget),
        protein:  parseNumeric(currentPlan.proteinTarget),
        carbs:    parseNumeric(currentPlan.carbTarget),
        fats:     parseNumeric(currentPlan.fatTarget),
      }
    : { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const currentDateStr = currentDate.toLocaleDateString('en-US', {
   weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
  });

  const todaysLogs = dietLogs.filter((log) => log.date === currentDateStr);

  // ── Static meals ─────────────────────────────────────────────
  const meals: Meal[] = [
    {
      time: '7:00 AM', name: 'Breakfast',
      items: ['4 Scrambled Eggs', 'Whole Wheat Toast (2 slices)', 'Avocado (1/2)', 'Orange Juice'],
      calories: 520, protein: 25, carbs: 40, fats: 25,
      tip: 'Start your day with protein-rich foods. Eggs or Greek yogurt help build muscles.',
    },
    {
      time: '1:00 PM', name: 'Lunch',
      items: ['Grilled Chicken Breast (200g)', 'Brown Rice (1 cup)', 'Mixed Vegetables', 'Olive Oil Dressing'],
      calories: 680, protein: 40, carbs: 50, fats: 20,
      tip: 'Include lean protein and complex carbs. Keep lunch balanced but not too heavy.',
    },
    {
      time: '7:00 PM', name: 'Dinner',
      items: ['Salmon (200g)', 'Sweet Potato (1 large)', 'Broccoli', 'Quinoa (1/2 cup)'],
      calories: 730, protein: 50, carbs: 60, fats: 30,
      tip: 'Have a lighter meal in the evening. Focus on protein and vegetables, avoid heavy carbs.',
    },
  ];

  const [mealLogs, setMealLogs] = useState<Meal[]>(
    meals.map((meal) => ({ ...meal, consumedCalories: 0, consumedItems: [] }))
  );

  useEffect(() => {
  if (currentPlan?.id && token) {
    dispatch(fetchDietLogsByPlanThunk({ dietPlanId: currentPlan.id, token }));
  }
}, [currentPlan?.id, dispatch, token]);

  // ── Macro helpers ─────────────────────────────────────────────
  type MacroKey = 'calories' | 'protein' | 'carbs' | 'fats';
  const macroKeys: MacroKey[] = ['calories', 'protein', 'carbs', 'fats'];

  //const getMacroProgress = (macro: MacroKey): number => {
    //const target = planTargets[macro];
   // if (!target) return 0;
    //const consumed = mealLogs.reduce((sum, meal) => {
     // if (macro === 'calories') return sum + (meal.consumedCalories || 0);
     // return sum + (meal[macro] || 0);
    //}, 0);
    //return Math.min((consumed / target) * 100, 100);
 // };

 const getMacroProgress = (macro: MacroKey): number => {
  const target = planTargets[macro];
  if (!target) return 0;

  const consumed = todaysLogs.reduce((sum, log) => {
    if (macro === 'calories') return sum + Number(log.calories);
    if (macro === 'protein')  return sum + Number(log.protein);
    if (macro === 'carbs')    return sum + Number(log.carbs);
    if (macro === 'fats')     return sum + Number(log.fats);
    return sum;
  }, 0);

  return Math.min((consumed / target) * 100, 100);
};

  const macroMeta: Record<MacroKey, { icon: string; unit: string }> = {
    calories: { icon: '🔥', unit: 'kcal' },
    protein:  { icon: '💪', unit: 'g' },
    carbs:    { icon: '🍞', unit: 'g' },
    fats:     { icon: '🥑', unit: 'g' },
  };

  // ── Navigation ───────────────────────────────────────────────
  //const prevDay  = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)));
  //const nextDay  = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)));
  //const prevPlan = () => setCurrentPlanIndex((p) => Math.max(0, p - 1));
  //const nextPlan = () => setCurrentPlanIndex((p) => Math.min(memberPlans.length - 1, p + 1));

  // Replace prevDay and nextDay
const planStart = currentPlan?.startDate ? new Date(currentPlan.startDate) : null;
const planEnd   = currentPlan?.endDate   ? new Date(currentPlan.endDate)   : null;

const prevDay = () => {
  const prev = new Date(currentDate);
  prev.setDate(prev.getDate() - 1);
  if (!planStart || prev >= planStart) setCurrentDate(prev);
};

const nextDay = () => {
  const next = new Date(currentDate);
  next.setDate(next.getDate() + 1);
  if (!planEnd || next <= planEnd) setCurrentDate(next);
};

  const handleUpdatePlan = () => {
    if (window.confirm('This will remove your current diet plan. Continue?')) {
      setMealLogs(meals.map((meal) => ({ ...meal, consumedCalories: 0, consumedItems: [] })));
    }
  };

  // ── Log popup ────────────────────────────────────────────────
  const openLogPopup = (index: number) => {
    setCurrentLogIndex(index);
    setLogForm({ name: meals[index].name, items: '', calories: '', protein: '', carbs: '', fats: '' });
    setAiStage('idle');
    setAiAnalysis(null);
    setAnalyzeError(null);
    dispatch(clearAnalysis());
    setShowLogPopup(true);
  };

  const closeLogPopup = () => {
    setShowLogPopup(false);
    setAiStage('idle');
    setAiAnalysis(null);
    setAnalyzeError(null);
    dispatch(clearAnalysis());
  };

  //const handleLogSubmit = () => {
    //if (currentLogIndex === null) return;
    //const updated = [...mealLogs];
    //updated[currentLogIndex].name             = logForm.name || meals[currentLogIndex].name;
    //updated[currentLogIndex].items            = logForm.items.split(',').map((i) => i.trim());
    //updated[currentLogIndex].consumedItems    = [...updated[currentLogIndex].items];
    //updated[currentLogIndex].consumedCalories = Number(logForm.calories) || 0;
    //updated[currentLogIndex].protein          = Number(logForm.protein)  || 0;
    //updated[currentLogIndex].carbs            = Number(logForm.carbs)    || 0;
    //updated[currentLogIndex].fats             = Number(logForm.fats)     || 0;
    //setMealLogs(updated);
    //closeLogPopup();
  //};

  const handleLogSubmit = async () => {
  if (currentLogIndex === null) return;

  // 🔹 Validation
  if (!logForm.name.trim()) {
    alert('Please enter a meal name.');
    return;
  }
  if (!logForm.items.trim()) {
    alert('Please enter the meal items.');
    return;
  }
  if (!logForm.calories || !logForm.protein || !logForm.carbs || !logForm.fats) {
    alert('Please ensure all macro values are filled.');
    return;
  }

  // 🔹 Update local meal logs first
  const updated = [...mealLogs];
  updated[currentLogIndex].name             = logForm.name || meals[currentLogIndex].name;
  updated[currentLogIndex].items            = logForm.items.split(',').map((i) => i.trim());
  updated[currentLogIndex].consumedItems    = [...updated[currentLogIndex].items];
  updated[currentLogIndex].consumedCalories = Number(logForm.calories);
  updated[currentLogIndex].protein          = Number(logForm.protein);
  updated[currentLogIndex].carbs            = Number(logForm.carbs);
  updated[currentLogIndex].fats             = Number(logForm.fats);
  setMealLogs(updated);

  // 🔹 Prepare payload for API
  const payload = {
    memberId: currentPlan?.memberId || '',
    dietPlanId: currentPlan?.id || '',
    mealName: logForm.name,
    mealItems: logForm.items,
    calories: logForm.calories,
    protein: logForm.protein,
    carbs: logForm.carbs,
    fats: logForm.fats,
    date: currentDate.toLocaleDateString('en-US', {
     weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
    }),
  };

  if (!token) {
    alert('Member token not found. Please login again.');
    return;
  }

  try {
    // 🔹 Dispatch save thunk
    await dispatch(saveDietLogThunk({ data: payload, token })).unwrap();

    // 🔹 Success alert
    alert('✅ Meal log saved successfully!');
    closeLogPopup();
  } catch (err: any) {
    // 🔹 Error alert
    alert(`⚠️ Failed to save meal log: ${err.message || err}`);
  }
};

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ── AI: Auto-fill via backend thunk ──────────────────────────
  const handleAIFill = () => {
    if (!logForm.items.trim()) return;

    // Reset any previous fill/analysis
    setAiStage('idle');
    setAiAnalysis(null);
    setAnalyzeError(null);
    dispatch(clearAnalysis());

    dispatch(analyzeMealThunk({
      data:  { mealItems: logForm.items },
      token,
    }));
    // Form fields are populated by the useEffect watching rawAnalysis
  };

  // ── AI: Analyze meal against plan (Anthropic API direct) ──────
  const handleAIAnalyze = async () => {
    if (!logForm.calories) {
      setAnalyzeError('Please fill in the meal details (or use Auto-fill) before analyzing.');
      return;
    }
    setAnalyzeError(null);

    try {
      const mealName  = logForm.name  || 'this meal';
      const mealItems = logForm.items || 'unspecified items';

      const planContext = currentPlan
        ? `Daily targets: ${planTargets.calories} kcal, ${planTargets.protein}g protein, ${planTargets.carbs}g carbs, ${planTargets.fats}g fats. Goal: ${currentPlan.goal}.`
        : 'No specific diet plan assigned.';

      //const alreadyConsumed = {
        //calories: mealLogs.reduce((s, m) => s + (m.consumedCalories || 0), 0),
        //protein:  mealLogs.reduce((s, m) => s + (m.protein  || 0), 0),
        //carbs:    mealLogs.reduce((s, m) => s + (m.carbs    || 0), 0),
        //fats:     mealLogs.reduce((s, m) => s + (m.fats     || 0), 0),
      //};
      const alreadyConsumed = {
       calories: todaysLogs.reduce((s, log) => s + Number(log.calories), 0),
       protein:  todaysLogs.reduce((s, log) => s + Number(log.protein),  0),
       carbs:    todaysLogs.reduce((s, log) => s + Number(log.carbs),    0),
       fats:     todaysLogs.reduce((s, log) => s + Number(log.fats),     0),
      };

      const prompt = `You are a nutrition coach. Analyze this meal:

Meal: ${mealName}
Items: ${mealItems}
Calories: ${logForm.calories} kcal | Protein: ${logForm.protein}g | Carbs: ${logForm.carbs}g | Fats: ${logForm.fats}g

${planContext}
Already consumed today: ${alreadyConsumed.calories} kcal, ${alreadyConsumed.protein}g protein, ${alreadyConsumed.carbs}g carbs, ${alreadyConsumed.fats}g fats.

Return ONLY valid JSON, no markdown:
{
  "calories": <same as input, number>,
  "protein": <same as input, number>,
  "carbs": <same as input, number>,
  "fats": <same as input, number>,
  "rating": <"excellent"|"good"|"fair"|"poor">,
  "feedback": "<1-2 sentence summary>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data  = await response.json();
      const text  = data.content?.find((b: any) => b.type === 'text')?.text ?? '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed: AIAnalysis = JSON.parse(clean);

      setAiAnalysis(parsed);
      setAiStage('analyzed');
    } catch {
      setAnalyzeError('AI analysis failed. Please try again.');
    }
  };

  const ratingConfig = {
    excellent: { color: '#2dd881', label: 'Excellent',  emoji: '🌟' },
    good:      { color: '#7b2ff7', label: 'Good',       emoji: '✅' },
    fair:      { color: '#f7c548', label: 'Fair',       emoji: '⚡' },
    poor:      { color: '#f10f6b', label: 'Needs Work', emoji: '⚠️' },
  };

  // combined error to show in UI
  const displayError = aiError || analyzeError;

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="diet-plan">

      <div className="diet-header">
        <div className="diet-header-content">
          <h1>Diet Plan & Schedule</h1>
          <p>AI-powered personalized nutrition planning</p>
        </div>
      </div>

      <div className="diet-grid">

        {/* ── Left: Plan Overview ── */}
        <div className="plan-overview">
          {loading && (
            <div className="plan-loading">
              <div className="plan-loading-spinner" />
              <p>Loading your diet plans…</p>
            </div>
          )}

          {!loading && error && (
            <div className="plan-error">
              <p>⚠️ {error}</p>
              <button className="update-plan-btn" onClick={() => token && dispatch(fetchMyDietPlansThunk(token))}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && memberPlans.length === 0 && (
            <div className="no-plan">
              <span style={{ fontSize: '3rem' }}>🥗</span>
              <h3>No Diet Plans Yet</h3>
              <p>Your trainer hasn't assigned a plan yet.</p>
            </div>
          )}

          {!loading && !error && currentPlan && (
            <>
              <div className="plan-header">
                <div className="plan-title">
                  <div className="plan-title-nav">
                    <h2>{currentPlan.title}</h2>
                    {memberPlans.length > 1 && (
                      <div className="plan-nav-controls">
                        <button onClick={prevDay} disabled={!!planStart && currentDate <= planStart}>
                           <ChevronLeft size={16} />
                        </button>
                        <span className="plan-nav-counter">{currentPlanIndex + 1} / {memberPlans.length}</span>
                        <button onClick={nextDay} disabled={!!planEnd && currentDate >= planEnd}>
                          <NextIcon size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="plan-status approved">🎯 {currentPlan.goal}</span>
                </div>
                {currentPlan.description && <p className="plan-description">{currentPlan.description}</p>}
                {currentPlan.startDate && currentPlan.endDate && (
                  <p className="plan-date-range">📅 {formatDate(currentPlan.startDate)} — {formatDate(currentPlan.endDate)}</p>
                )}
              </div>

              <div className="macros-grid">
                {macroKeys.map((macro) => (
                  <div className="macro-card" key={macro}>
  <div className="macro-icon">{macroMeta[macro].icon}</div>
  <div className="macro-content">
    <span className="macro-value">
      {(() => {
        const consumed = todaysLogs.reduce((sum, log) => sum + Number(log[macro]), 0);
        return consumed > 0
          ? <>{consumed}<span className="macro-unit"> / {planTargets[macro]} {macroMeta[macro].unit}</span></>
          : <>{planTargets[macro]}<span className="macro-unit"> {macroMeta[macro].unit}</span></>;
      })()}
    </span>
    <span className="macro-label">{macro.charAt(0).toUpperCase() + macro.slice(1)}</span>
    <div className="bar-bg">
      <div className="bar-fill" style={{ width: `${getMacroProgress(macro)}%` }} />
    </div>
  </div>
</div>
                ))}
              </div>

              <button className="update-plan-btn" onClick={handleUpdatePlan}>Update Plan</button>

              <div className="meal-tips">
                <h3>General Meal Guidance</h3>
                {meals.map((meal, idx) => (
                  <div key={idx} className="meal-tip-card">
                    <strong>{meal.name}:</strong> {meal.tip}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Right: Meal Logs ── */}
        <div className="meal-schedule">
          <div className="schedule-header">
            <h2>Meal Log</h2>
            <div className="schedule-date">
              <button onClick={prevDay}><ChevronLeft size={16} /></button>
              <Calendar size={18} />
              <span>
                  {currentDate.toLocaleDateString('en-US', {
                      weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
                  })}
              </span>
              <button onClick={nextDay}><NextIcon size={16} /></button>
            </div>
          </div>

          <div className="meals-list">
  {mealLogs.map((meal, index) => {
    const logged = todaysLogs.find(
      (log) => log.mealName.toLowerCase() === meal.name.toLowerCase()
    );

    return (
      <div className="meal-card" key={index}>
        <div className="meal-header">
          <div className="meal-time"><Clock size={18} /> {meal.time}</div>
          <div className="meal-calories">
            {logged ? Number(logged.calories) : (meal.consumedCalories || 0)} / {meal.calories} cal
          </div>
        </div>
        <h3>{meal.name}</h3>

        {logged && (
          <div className="meal-logged-summary">
            <span className="logged-badge">✅ Logged</span>
            <p className="logged-items">{
              Array.isArray(logged.mealItems)
                ? logged.mealItems.join(', ')
                : logged.mealItems
            }</p>
            <div className="logged-macros">
              <span>💪 {logged.protein}g</span>
              <span>🍞 {logged.carbs}g</span>
              <span>🥑 {logged.fats}g</span>
            </div>
          </div>
        )}

        <button className="log-meal-btn" onClick={() => openLogPopup(index)}>
          {logged ? 'Update Meal' : 'Log Your Meal'}
        </button>
      </div>
    );
  })}
</div>
        </div>
      </div>

      {/* ── Meal Log Popup with AI Tracker ── */}
      {showLogPopup && (
        <div className="popup-overlay">
          <div className="popup-form popup-form--wide">
            <button className="close-btn" onClick={closeLogPopup}><X size={16} /></button>
            <h3>Log Your Meal</h3>

            <div className="form-group">
              <label>Meal Name</label>
              <input
                type="text"
                value={logForm.name}
                onChange={(e) => setLogForm({ ...logForm, name: e.target.value })}
                placeholder="e.g. Breakfast"
              />
            </div>

            {/* Items + Auto-fill */}
            <div className="form-group">
              <label>Meal Items</label>
              <div className="items-row">
                <input
                  type="text"
                  value={logForm.items}
                  onChange={(e) => {
                    setLogForm({ ...logForm, items: e.target.value });
                    // If items change after a fill, reset to idle
                    if (aiStage !== 'idle') {
                      setAiStage('idle');
                      setAiAnalysis(null);
                      dispatch(clearAnalysis());
                    }
                  }}
                  placeholder="e.g. grilled chicken, brown rice, broccoli"
                />
                <button
                  className="ai-autofill-btn"
                  onClick={handleAIFill}
                  disabled={aiLoading || !logForm.items.trim()}
                  title="Auto-fill macros with AI"
                >
                  {aiLoading && aiStage === 'idle' ? (
                    <span className="ai-btn-spinner" />
                  ) : (
                    <><Zap size={14} /> Auto-fill</>
                  )}
                </button>
              </div>
              <span className="field-hint">Comma-separated. AI will estimate macros from these items.</span>
            </div>

            {/* Macro inputs */}
            <div className="form-row macros-row">
              {(['calories', 'protein', 'carbs', 'fats'] as const).map((field) => (
                <div className="form-group" key={field}>
                  <label>
                    {macroMeta[field as MacroKey].icon} {field.charAt(0).toUpperCase() + field.slice(1)}
                    {field === 'calories' ? ' (kcal)' : ' (g)'}
                  </label>
                  <input
                    type="number"
                    value={logForm[field]}
                    onChange={(e) => setLogForm({ ...logForm, [field]: e.target.value })}
                    placeholder="0"
                    className={aiStage === 'filled' || aiStage === 'analyzed' ? 'ai-filled' : ''}
                  />
                </div>
              ))}
            </div>

            {/* AI-filled confirmation badge */}
            {aiStage === 'filled' && (
              <div className="ai-filled-badge">
                <Sparkles size={13} /> Macros estimated by AI — review & adjust if needed
              </div>
            )}

            {/* Error display */}
            {displayError && <div className="ai-error-msg">⚠️ {displayError}</div>}

            {/* Analyze button */}
            <button
              className="ai-analyze-btn"
              onClick={handleAIAnalyze}
              disabled={aiLoading || !logForm.calories}
            >
              {aiLoading && aiStage !== 'idle' ? (
                <><span className="ai-btn-spinner" /> Analyzing…</>
              ) : (
                <><Bot size={16} /> Analyze with AI</>
              )}
            </button>

            {/* AI Analysis Result */}
            {aiAnalysis && aiStage === 'analyzed' && (
              <div className="ai-analysis-card">
                <div className="ai-analysis-header">
                  <span
                    className="ai-rating-badge"
                    style={{
                      background:   `${ratingConfig[aiAnalysis.rating].color}22`,
                      color:        ratingConfig[aiAnalysis.rating].color,
                      borderColor:  `${ratingConfig[aiAnalysis.rating].color}44`,
                    }}
                  >
                    {ratingConfig[aiAnalysis.rating].emoji} {ratingConfig[aiAnalysis.rating].label}
                  </span>
                  <span className="ai-analysis-title">AI Nutrition Analysis</span>
                </div>

                <div className="ai-macro-summary">
                  {macroKeys.map((macro) => {
                    const val    = aiAnalysis[macro as keyof AIAnalysis] as number;
                    const target = planTargets[macro];
                    const pct    = target ? Math.min((val / target) * 100, 100) : 0;
                    return (
                      <div key={macro} className="ai-macro-row">
                        <span className="ai-macro-label">{macroMeta[macro].icon} {macro}</span>
                        <div className="ai-macro-bar-bg">
                          <div className="ai-macro-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="ai-macro-nums">
                          {val}<span className="ai-macro-unit">/{target}{macroMeta[macro].unit}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="ai-feedback">{aiAnalysis.feedback}</p>

                {aiAnalysis.tips?.length > 0 && (
                  <ul className="ai-tips-list">
                    {aiAnalysis.tips.map((tip, i) => (
                      <li key={i}><span className="ai-tip-arrow">→</span> {tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button className="submit-btn" onClick={handleLogSubmit}>
              Save Meal Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlan;