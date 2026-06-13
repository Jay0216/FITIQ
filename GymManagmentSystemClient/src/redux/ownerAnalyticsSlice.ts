import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchOwnerAnalyticsData,
} from "../API/ownerAnalyticsAPI";
import type { Appointment, OwnerAnalyticsData, PaymentTransaction } from "../API/ownerAnalyticsAPI";
import type { RootState } from "./store";

// ─── State Shape ──────────────────────────────────────────────────────────

interface OwnerAnalyticsState {
  transactions: PaymentTransaction[];
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: OwnerAnalyticsState = {
  transactions: [],
  appointments: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// ─── Async Thunk ──────────────────────────────────────────────────────────

export const fetchAnalytics = createAsyncThunk<
  OwnerAnalyticsData,
  string,
  { rejectValue: string }
>(
  "ownerAnalytics/fetchAll",
  async (token: string, { rejectWithValue }) => {
    try {
      const data = await fetchOwnerAnalyticsData(token);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to load analytics data");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────

const ownerAnalyticsSlice = createSlice({
  name: "ownerAnalytics",
  initialState,
  reducers: {
    clearAnalytics(state) {
      state.transactions = [];
      state.appointments = [];
      state.error = null;
      state.lastFetched = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAnalytics.fulfilled,
        (state, action: PayloadAction<OwnerAnalyticsData>) => {
          state.loading = false;
          state.transactions = action.payload.transactions;
          state.appointments = action.payload.appointments;
          state.lastFetched = new Date().toISOString();
        }
      )
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────

export const { clearAnalytics, clearError } = ownerAnalyticsSlice.actions;

// ─── Selectors — key matches store: owneranalytics ───────────────────────

export const selectTransactions     = (state: RootState) => state.owneranalytics.transactions;
export const selectAppointments     = (state: RootState) => state.owneranalytics.appointments;
export const selectAnalyticsLoading = (state: RootState) => state.owneranalytics.loading;
export const selectAnalyticsError   = (state: RootState) => state.owneranalytics.error;
export const selectLastFetched      = (state: RootState) => state.owneranalytics.lastFetched;

// ─── Reducer ──────────────────────────────────────────────────────────────

export default ownerAnalyticsSlice.reducer;