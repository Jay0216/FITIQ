// src/api/dailySessionsAPI.ts

export interface ExerciseRequest {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes: string;
}

export interface DailySessionRequest {
  memberId: string;
  planId: string;
  sessionTitle: string;
  focusArea: string;
  weekNumber: number;
  day: string;
  warmup: string;
  cooldown: string;
  duration: string;
  exercises: ExerciseRequest[];
}

// Response from backend
export interface ExerciseResponse extends ExerciseRequest {}

export interface DailySessionResponse {
  id: string;
  memberId: string;
  planId: string;
  sessionTitle: string;
  focusArea: string;
  weekNumber: number;
  day: string;
  warmup: string;
  cooldown: string;
  duration: string;
  exercises: ExerciseResponse[];
}

// Create session API call
export const createDailySession = async (
  token: string,
  session: DailySessionRequest
): Promise<DailySessionResponse> => {
  const response = await fetch("http://localhost:8080/api/daily-sessions/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(session),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to create session");
  }

  const data: DailySessionResponse = await response.json();
  return data;
};


// Get sessions for specific member (Trainer)
export const fetchTrainerMemberSessions = async (
  token: string,
  memberId: string
): Promise<DailySessionResponse[]> => {

  const response = await fetch(
    `http://localhost:8080/api/daily-sessions/trainer/member/${memberId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to fetch sessions");
  }

  return await response.json();
};


// Get daily sessions by workout plan (Member App)
export const fetchSessionsByPlan = async (
  token: string,
  planId: string
): Promise<DailySessionResponse[]> => {

  const response = await fetch(
    `http://localhost:8080/api/daily-sessions/plan/${planId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to fetch sessions");
  }

  return await response.json();
};