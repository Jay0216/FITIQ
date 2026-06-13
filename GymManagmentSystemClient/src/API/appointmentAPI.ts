// src/api/appointmentsApi.ts

export interface AppointmentRequest {
  trainerId: string;
  trainerName: string;
  date: string;      // "Tuesday, March 24, 2026"
  timeSlot: string;  // "9:00 AM"
  status: string;    // "In-person" | "Completed"
  // memberId is set on backend from JWT
}

export interface AppointmentResponse {
  id: string;
  trainerId: string;
  trainerName: string;
  memberId: string;  // returned from backend
  date: string;
  timeSlot: string;
  venue: string;     // "FITIQ"
  status: string;
}

const BASE_URL = `http://localhost:8080/api/appointments`;

// 🔹 Book Appointment (JWT required)
export const bookAppointment = async (
  token: string,
  data: AppointmentRequest
): Promise<AppointmentResponse> => {
  const response = await fetch(`${BASE_URL}/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to book appointment");
  }

  return response.json();
};

// 🔹 Fetch all appointments for the logged-in user
export const getAppointments = async (token: string): Promise<AppointmentResponse[]> => {
  const response = await fetch(`${BASE_URL}/member`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch appointments");
  }

  return response.json();
};

// 🔹 Fetch appointments for the logged-in trainer (JWT only)
export const getTrainerAppointments = async (token: string): Promise<AppointmentResponse[]> => {
  const response = await fetch(`${BASE_URL}/trainer`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch trainer appointments");
  }

  return response.json();
};

// 🔹 Update appointment status (JWT required, PUT)
export const updateAppointmentStatus = async (
  token: string,
  appointmentId: string,
  status: string  // "In-person" | "Completed" | "Cancelled", etc.
): Promise<AppointmentResponse> => {
  const response = await fetch(`${BASE_URL}/update-status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ id: appointmentId, status }), // send 'id' to match backend
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update appointment status");
  }

  return response.json();
};