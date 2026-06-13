import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { generateDietPlan, saveDietPlan, getDietPlansByAssessment, getMyDietPlans } from "../API/dietPlanAPI";
import type { DietPlan, DietPlanAIRequest, DietPlanAIResponse } from "../API/dietPlanAPI";

// -------------------------
// Add new type for saving
// -------------------------
export interface SaveDietPlanRequest extends DietPlanAIResponse {
  memberId: string;
  fitnessAssessmentId: string;
  startDate: string;
  endDate: string;
}

interface DietPlanState {
  plans: DietPlanAIResponse[];
  memberPlans: DietPlan[];
  loading: boolean;
  error: string | null;
}

const initialState: DietPlanState = {
  plans: [],
  memberPlans: [],
  loading: false,
  error: null,
};

/* -------------------------
   CREATE DIET PLAN (AI)
--------------------------*/
export const createDietPlanThunk = createAsyncThunk(
  "diet/create",
  async (
    { data, token }: { data: DietPlanAIRequest; token: string },
    thunkAPI
  ) => {
    try {
      return await generateDietPlan(data, token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* -------------------------
   SAVE DIET PLAN (WITH MEMBER & DATES)
--------------------------*/
export const saveDietPlanThunk = createAsyncThunk(
  "diet/save",
  async (
    { data, token }: { data: SaveDietPlanRequest; token: string },
    thunkAPI
  ) => {
    try {
      return await saveDietPlan(data, token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* -------------------------
   FETCH DIET PLANS BY ASSESSMENT
--------------------------*/
export const fetchDietPlansThunk = createAsyncThunk(
  "diet/getAll",
  async (
    { assessmentId, token }: { assessmentId: string; token: string },
    thunkAPI
  ) => {
    try {
      return await getDietPlansByAssessment(assessmentId, token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* -------------------------
   FETCH MEMBER DIET PLANS
--------------------------*/
export const fetchMyDietPlansThunk = createAsyncThunk(
  "diet/getMyPlans",
  async (token: string, thunkAPI) => {
    try {
      return await getMyDietPlans(token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* -------------------------
   SET ACTIVE DIET PLAN
--------------------------*/
export const setActiveDietPlanThunk = createAsyncThunk(
  "diet/setActive",
  async ({ planId }: { planId: string }, thunkAPI) => {
    return planId;
  }
);

const dietSlice = createSlice({
  name: "diet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // CREATE AI
      .addCase(createDietPlanThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDietPlanThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload);
      })
      .addCase(createDietPlanThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // SAVE
      .addCase(saveDietPlanThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveDietPlanThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.plans.push(action.payload);
      })
      .addCase(saveDietPlanThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH
      .addCase(fetchDietPlansThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDietPlansThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchDietPlansThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // SET ACTIVE
      .addCase(setActiveDietPlanThunk.fulfilled, (state, action) => {
        const activeId = action.payload;
        state.plans = state.plans.map((p) => ({
          ...p,
          active: p.title === activeId,
        }));
      })

      // MEMBER FETCH
      .addCase(fetchMyDietPlansThunk.pending, (state) => {
         state.loading = true;
     })
      .addCase(fetchMyDietPlansThunk.fulfilled, (state, action) => {
         state.loading = false;
         state.memberPlans = action.payload; // ✅ separate state
      })
      .addCase(fetchMyDietPlansThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export default dietSlice.reducer;