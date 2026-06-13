import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createWorkoutPlan,
  fetchMemberWorkoutPlans,
  fetchTrainerWorkoutPlans,
} from "../API/workoutPlanAPI";
import type { WorkoutPlanRequest, WorkoutPlanResponse } from "../API/workoutPlanAPI";

interface WorkoutPlanState {
  plans: WorkoutPlanResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: WorkoutPlanState = {
  plans: [],
  loading: false,
  error: null,
};

/* =========================
   CREATE WORKOUT PLAN
========================= */

export const createWorkoutPlanThunk = createAsyncThunk<
  WorkoutPlanResponse, // ✅ Return type
  { data: WorkoutPlanRequest; token: string }, // Argument type
  { rejectValue: string } // rejectWithValue type
>(
  "workoutPlan/create",
  async ({ data, token }, thunkAPI) => {
    try {
      const response = await createWorkoutPlan(data, token);
      return response; // WorkoutPlanResponse
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* =========================
   FETCH WORKOUT PLANS THUNKS
========================= */

export const fetchWorkoutPlansThunk = createAsyncThunk<
  WorkoutPlanResponse[], // Return type
  string, // Argument: token
  { rejectValue: string }
>("workoutPlan/fetch", async (token, thunkAPI) => {
  try {
    const response = await fetchTrainerWorkoutPlans(token);
    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchMemberWorkoutPlansThunk = createAsyncThunk<
  WorkoutPlanResponse[], // Return type
  string, // token
  { rejectValue: string }
>("workoutPlan/fetchMember", async (token, thunkAPI) => {
  try {
    const response = await fetchMemberWorkoutPlans(token);
    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

/* =========================
   SLICE
========================= */

const workoutPlanSlice = createSlice({
  name: "workoutPlan",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* CREATE PLAN */
      .addCase(createWorkoutPlanThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createWorkoutPlanThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload); // ✅ TS knows payload is WorkoutPlanResponse
      })
      .addCase(createWorkoutPlanThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })

      /* FETCH PLANS */
      .addCase(fetchWorkoutPlansThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkoutPlansThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchWorkoutPlansThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })

      /* FETCH MEMBER PLANS */
      .addCase(fetchMemberWorkoutPlansThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberWorkoutPlansThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchMemberWorkoutPlansThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export default workoutPlanSlice.reducer;