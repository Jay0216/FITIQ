// src/redux/appointmentsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { bookAppointment, getAppointments, getTrainerAppointments, updateAppointmentStatus, type AppointmentRequest, type AppointmentResponse } from "../API/appointmentAPI";

interface AppointmentsState {
  appointments: AppointmentResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  loading: false,
  error: null,
};

// 🔹 Async Thunk: Book Appointment
export const bookAppointmentThunk = createAsyncThunk<
  AppointmentResponse,
  { token: string; data: AppointmentRequest },
  { rejectValue: string }
>("appointments/book", async ({ token, data }, { rejectWithValue }) => {
  try {
    return await bookAppointment(token, data);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// 🔹 Async Thunk: Fetch All Appointments
export const fetchAppointmentsThunk = createAsyncThunk<
  AppointmentResponse[],
  string,
  { rejectValue: string }
>("appointments/fetchAll", async (token, { rejectWithValue }) => {
  try {
    return await getAppointments(token);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// 🔹 Async Thunk: Fetch Trainer Appointments (JWT only)
export const fetchTrainerAppointmentsThunk = createAsyncThunk<
  AppointmentResponse[],
  string,
  { rejectValue: string }
>("appointments/fetchTrainer", async (token, { rejectWithValue }) => {
  try {
    return await getTrainerAppointments(token);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// 🔹 Async Thunk: Update appointment status (Trainer only)
export const updateAppointmentStatusThunk = createAsyncThunk<
  AppointmentResponse,
  { token: string; appointmentId: string; status: string },
  { rejectValue: string }
>(
  "appointments/updateStatus",
  async ({ token, appointmentId, status }, { rejectWithValue }) => {
    try {
      return await updateAppointmentStatus(token, appointmentId, status);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearAppointmentsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Book Appointment
      .addCase(bookAppointmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointmentThunk.fulfilled, (state, action: PayloadAction<AppointmentResponse>) => {
        state.loading = false;
        state.appointments.push(action.payload);
      })
      .addCase(bookAppointmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to book appointment";
      })

      // Fetch Appointments
      .addCase(fetchAppointmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsThunk.fulfilled, (state, action: PayloadAction<AppointmentResponse[]>) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch appointments";
      })

      // Fetch Trainer Appointments
      .addCase(fetchTrainerAppointmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainerAppointmentsThunk.fulfilled, (state, action: PayloadAction<AppointmentResponse[]>) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchTrainerAppointmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch trainer appointments";
      })

      // Update Appointment Status
      // Update Appointment Status
  .addCase(updateAppointmentStatusThunk.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  .addCase(updateAppointmentStatusThunk.fulfilled, (state, action: PayloadAction<AppointmentResponse>) => {
    state.loading = false;
    // Update appointment in-place
    const index = state.appointments.findIndex(a => a.id === action.payload.id);
    if (index !== -1) state.appointments[index] = action.payload;
  })
  .addCase(updateAppointmentStatusThunk.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload || "Failed to update appointment status";
  });
  },
});

export const { clearAppointmentsError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;