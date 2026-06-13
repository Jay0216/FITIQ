const BASE_URL = "http://localhost:8080/api/workout-plans";

/* =========================
   REQUEST MODEL
========================= */

export interface WorkoutPlanRequest {
  memberId: string;
  fitnessAssessmentId: string;
  planTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
}

/* =========================
   RESPONSE MODEL
========================= */

export interface WorkoutPlanResponse {
  id: string;
  memberId: string;
  fitnessAssessmentId: string;
  trainerId: string;
  planTitle: string;
  description: string;
  startDate: string;
  endDate: string;
  trainingDays: string[];
  active: boolean;
  createdAt: string;
}

/* =========================
   CREATE WORKOUT PLAN
========================= */

export async function createWorkoutPlan(
  data: WorkoutPlanRequest,
  token: string
): Promise<WorkoutPlanResponse> {
  const response = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to create workout plan");
  }

  return await response.json();
}


/* =========================
   FETCH TRAINER WORKOUT PLANS
========================= */
export async function fetchTrainerWorkoutPlans(
  token: string
): Promise<WorkoutPlanResponse[]> {
  const response = await fetch(`${BASE_URL}/trainer`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch workout plans");
  }

  return await response.json();
}


// =========================
// FETCH MEMBER WORKOUT PLANS
// =========================
export async function fetchMemberWorkoutPlans(token: string): Promise<WorkoutPlanResponse[]> {
  const response = await fetch(`${BASE_URL}/member/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch member workout plans");
  }

  return await response.json();
}