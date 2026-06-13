// dietLogAPI.ts

/* -------------------------
   REQUEST MODEL
--------------------------*/
export interface DietLogAIRequest {
  mealItems: string;
}

/* -------------------------
   RESPONSE MODEL
--------------------------*/
export interface DietLogAIResponse {
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

/* -------------------------
   ANALYZE MEAL (AI)
--------------------------*/
export async function analyzeMeal(
  data: DietLogAIRequest,
  token: string
): Promise<DietLogAIResponse> {

  const response = await fetch(
    "http://localhost:8080/api/member/diet-log/analyze-meal",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to analyze meal");
  }

  return response.json();
}

/* -------------------------
   REQUEST MODEL FOR SAVE
--------------------------*/
export interface DietLogSaveRequest {
  memberId: string;
  dietPlanId: string;
  mealName: string;
  mealItems: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  date: string; // e.g., "Thursday, Mar 19"
}

/* -------------------------
   RESPONSE MODEL FOR SAVE
--------------------------*/
export interface DietLogSaveResponse {
  id: string;
  memberId: string;
  dietPlanId: string;
  mealName: string;
  mealItems: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  date: string;
}

/* -------------------------
   SAVE DIET LOG
--------------------------*/
export async function saveDietLog(
  data: DietLogSaveRequest,
  token: string
): Promise<DietLogSaveResponse> {
  const response = await fetch(
    "http://localhost:8080/api/member/diet-log/save",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to save diet log");
  }

  return response.json();
}


/* -------------------------
   RESPONSE MODEL FOR FETCH
--------------------------*/
export interface DietLogFetchResponse {
  id: string;
  memberId: string;
  dietPlanId: string;
  mealName: string;
  mealItems: string[];
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
  date: string;
}

/* -------------------------
   FETCH DIET LOGS BY PLAN
--------------------------*/
export async function fetchDietLogsByPlan(
  dietPlanId: string,
  token: string
): Promise<DietLogFetchResponse[]> {
  const response = await fetch(
    `http://localhost:8080/api/member/diet-log/by-plan/${dietPlanId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch diet logs");
  }

  return response.json();
}