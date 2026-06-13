// ─── Data Models ─────────────────────────────────────────────────────────

export interface PaymentTransaction {
  _id: string;
  memberId: string;
  subscriptionId: string;
  amount: number;
  transactionDate: string; // ISO date string
}

export type AppointmentStatus = 'Completed' | 'Pending' | 'Cancelled' | 'No-Show';

export interface Appointment {
  _id: string;
  trainerId: string;
  trainerName: string;
  memberId: string;
  date: string;
  timeSlot: string;
  venue: string;
  status: AppointmentStatus;
}

export interface TrainerTypeData {
  type: string;
  count: number;
  color: string;
}

// ─── API Responses ────────────────────────────────────────────────────────

export interface GetAllTransactionsResponse {
  transactions: PaymentTransaction[];
}

export interface GetAllAppointmentsResponse {
  appointments: Appointment[];
}

export interface OwnerAnalyticsData {
  transactions: PaymentTransaction[];
  appointments: Appointment[];
}

// ─── Base URL ─────────────────────────────────────────────────────────────

const PAYMENT_BASE_URL = "http://localhost:8080/api/payments";
const APPOINTMENT_BASE_URL = "http://localhost:8080/api/appointments";

// ─── Helper ───────────────────────────────────────────────────────────────

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ─── Fetch All Transactions (OWNER only) ──────────────────────────────────

export async function getAllTransactions(
  token: string
): Promise<PaymentTransaction[]> {
  const response = await fetch(`${PAYMENT_BASE_URL}/transactions/all`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch transactions");
  }

  const data: PaymentTransaction[] = await response.json();
  return data;
}

// ─── Fetch All Appointments (OWNER only) ─────────────────────────────────

export async function getAllAppointments(
  token: string
): Promise<Appointment[]> {
  const response = await fetch(`${APPOINTMENT_BASE_URL}/all`, {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch appointments");
  }

  const data: Appointment[] = await response.json();
  return data;
}

// ─── Fetch Both Together ──────────────────────────────────────────────────

export async function fetchOwnerAnalyticsData(
  token: string
): Promise<OwnerAnalyticsData> {
  const [transactions, appointments] = await Promise.all([
    getAllTransactions(token),
    getAllAppointments(token),
  ]);

  return { transactions, appointments };
}