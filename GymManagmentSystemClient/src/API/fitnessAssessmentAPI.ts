const BASE_URL = "http://localhost:8080/api/fitness-assessments";

/* -------------------------
   Request Data Model
--------------------------*/
export interface FitnessAssessmentRequest {
  assessmentName: string;
  age: number;
  height: number;
  weight: number;
  fitnessGoal: string;
  fitnessLevel: string;
  limitations: string;
  workoutDays: string[];
}

/* -------------------------
   Response Data Model
--------------------------*/
export interface FitnessAssessmentResponse {
  id: string;
  memberId: string;
  assessmentName: string;
  age: number;
  height: number;
  weight: number;
  fitnessGoal: string;
  fitnessLevel: string;
  limitations: string;
  active: boolean;
  workoutDays: string[];
  createdAt: string;
}

/* -------------------------
   CREATE Fitness Assessment
--------------------------*/
export const createFitnessAssessment = async (
  data: FitnessAssessmentRequest,
  token: string
): Promise<FitnessAssessmentResponse> => {

  const response = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Failed to create fitness assessment");
  }

  const result: FitnessAssessmentResponse = await response.json();
  return result;
};

/* -------------------------
   GET Member Assessments
--------------------------*/
export const getMemberAssessments = async (
  token: string
): Promise<FitnessAssessmentResponse[]> => {

  const response = await fetch(`${BASE_URL}/member`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch assessments");
  }

  const result: FitnessAssessmentResponse[] = await response.json();
  return result;
};


/* -------------------------
   ACTIVATE FITNESS ASSESSMENT
--------------------------*/
export const activateFitnessAssessment = async (
  assessmentId: string,
  token: string
): Promise<string> => {

  const response = await fetch(`${BASE_URL}/activate/${assessmentId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to activate assessment");
  }

  return await response.text();
};


export const getAllActiveAssessments = async (
  token: string
): Promise<FitnessAssessmentResponse[]> => {

  const response = await fetch(`${BASE_URL}/active`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch active assessments");
  }

  return await response.json();
};