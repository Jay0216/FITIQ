// src/redux/dailySessionsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { DailySessionRequest, DailySessionResponse } from "../API/dailySessionsAPI";
import { createDailySession, fetchSessionsByPlan, fetchTrainerMemberSessions } from "../API/dailySessionsAPI";

// Async thunk for creating a session
export const addDailySession = createAsyncThunk<
  DailySessionResponse,
  { token: string; session: DailySessionRequest },
  { rejectValue: string }
>(
  "dailySessions/addDailySession",
  async ({ token, session }, { rejectWithValue }) => {
    try {
      const res = await createDailySession(token, session);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchTrainerMemberSessionsThunk = createAsyncThunk<
  DailySessionResponse[],
  { token: string; memberId: string },
  { rejectValue: string }
>(
  "dailySessions/fetchTrainerMemberSessions",
  async ({ token, memberId }, { rejectWithValue }) => {
    try {
      return await fetchTrainerMemberSessions(token, memberId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchSessionsByPlanThunk = createAsyncThunk<
  DailySessionResponse[],
  { token: string; planId: string },
  { rejectValue: string }
>(
  "dailySessions/fetchSessionsByPlan",
  async ({ token, planId }, { rejectWithValue }) => {
    try {
      return await fetchSessionsByPlan(token, planId);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface DailySessionsState {
  sessions: DailySessionResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: DailySessionsState = {
  sessions: [],
  loading: false,
  error: null,
};

const dailySessionsSlice = createSlice({
  name: "dailySessions",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // CREATE SESSION
      .addCase(addDailySession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addDailySession.fulfilled,
        (state, action: PayloadAction<DailySessionResponse>) => {
          state.loading = false;
          state.sessions.push(action.payload);
        }
      )
      .addCase(addDailySession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add session";
      })

      // TRAINER FETCH MEMBER SESSIONS
      .addCase(fetchTrainerMemberSessionsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchTrainerMemberSessionsThunk.fulfilled,
        (state, action: PayloadAction<DailySessionResponse[]>) => {
          state.loading = false;
          state.sessions = action.payload;
        }
      )
      .addCase(fetchTrainerMemberSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch sessions";
      })

      // MEMBER FETCH SESSIONS BY PLAN
      .addCase(fetchSessionsByPlanThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchSessionsByPlanThunk.fulfilled,
        (state, action: PayloadAction<DailySessionResponse[]>) => {
          state.loading = false;
          state.sessions = action.payload;
        }
      )
      .addCase(fetchSessionsByPlanThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch sessions";
      });
  },
});

export const { clearError } = dailySessionsSlice.actions;
export default dailySessionsSlice.reducer;