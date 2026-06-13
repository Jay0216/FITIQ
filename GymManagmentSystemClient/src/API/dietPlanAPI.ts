// dietApi.ts
export interface DietPlanAIRequest {
  goal: string;           // e.g., "Muscle Gain"
  age: number;
  weight: number;
  height: number;
  activityLevel: string;  // e.g., "Moderate"
}

export interface DietPlanAIResponse {
  title: string;
  description: string;
  goal: string;
  dailyCalorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
}

// Save diet plan request (frontend)
export interface SaveDietPlanRequest extends DietPlanAIResponse {
  memberId: string;
  fitnessAssessmentId: string;
  startDate: string;
  endDate: string;
}

// Function to call backend API
export async function generateDietPlan(
  requestData: DietPlanAIRequest,
  token: string
): Promise<DietPlanAIResponse> {
  const response = await fetch("http://localhost:8080/api/trainer/diet-ai/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to generate diet plan");
  }

  return response.json();
}


export async function saveDietPlan(
  planData: SaveDietPlanRequest,
  token: string
): Promise<DietPlanAIResponse> {
  const response = await fetch("http://localhost:8080/api/trainer/diet-ai/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(planData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to save diet plan");
  }

  return response.json();
}


/* -------------------------
   FETCH DIET PLANS BY ASSESSMENT
--------------------------*/
export async function getDietPlansByAssessment(
  assessmentId: string,
  token: string
): Promise<SaveDietPlanRequest[]> {

  const response = await fetch(
    `http://localhost:8080/api/trainer/diet-ai/trainer-diet-plans/${assessmentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch diet plans");
  }

  return response.json();
}


/* -------------------------
   FETCH MY DIET PLANS (MEMBER DASHBOARD)
--------------------------*/
export interface DietPlan {
  id: string;
  memberId: string;
  fitnessAssessmentId: string;
  trainerId: string;
  title: string;
  description: string;
  goal: string;
  startDate: string;
  endDate: string;
  dailyCalorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
}

export async function getMyDietPlans(
  token: string
): Promise<DietPlan[]> {

  const response = await fetch(
    `http://localhost:8080/api/trainer/diet-ai/my-diet-plans`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch diet plans");
  }

  return response.json();
}