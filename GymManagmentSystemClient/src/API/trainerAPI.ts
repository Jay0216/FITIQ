// ----------------------
// Data Models / Types
// ----------------------

export interface TrainerLoginRequest {
  email: string;
  password: string;
}

export interface TrainerResponse {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  type: string; // weight_loss, muscle_gain, endurance, general_fitness
  availableForAppointments: boolean;
}

export interface TrainerLoginResponse {
  message: string;
  token: string;
  trainer: TrainerResponse;
}

export interface TrainerRegisterRequest {
  fullname: string;
  phonenumber: string;
  email: string;
  password: string;
  type: string;
  availableForAppointments: boolean;
}

export interface TrainerRegisterResponse {
  message: string;
  trainer: TrainerResponse;
}

// ----------------------
// API Functions (fetch)
// ----------------------

const BASE_URL = "http://localhost:8080/api/trainers";

// Trainer login
export const loginTrainer = async (
  data: TrainerLoginRequest
): Promise<TrainerLoginResponse> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};

export interface GetAllTrainersResponse {
  message: string;
  trainers: TrainerResponse[];
}


// Get all trainers (Member protected)
export const fetchAllTrainers = async (token: string) => {
  const response = await fetch(`${BASE_URL}/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};


export const registerTrainer = async (
  data: TrainerRegisterRequest
): Promise<TrainerRegisterResponse> => {
  const response = await fetch(`${BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // OPTIONAL: if owner auth needed later
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};

export interface TrainerCountResponse {
  totalTrainers: number;
}

// Get total trainers count (Owner only)
export const fetchTrainerCount = async (token: string): Promise<TrainerCountResponse> => {
  const response = await fetch(`${BASE_URL}/count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};