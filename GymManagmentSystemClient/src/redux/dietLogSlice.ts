import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { analyzeMeal, fetchDietLogsByPlan, saveDietLog } from "../API/dietLogAPI";
import type { DietLogAIRequest, DietLogAIResponse, DietLogFetchResponse, DietLogSaveRequest, DietLogSaveResponse,  } from "../API/dietLogAPI";

/* -------------------------
   STATE
--------------------------*/
interface DietLogState {
  analysis: DietLogAIResponse | null;
  savedLog: DietLogSaveResponse | null; // new
  logs: DietLogFetchResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: DietLogState = {
  analysis: null,
  savedLog: null,
  logs: [],
  loading: false,
  error: null,
};

/* -------------------------
   THUNK
--------------------------*/
export const analyzeMealThunk = createAsyncThunk(
  "dietLog/analyzeMeal",
  async (
    { data, token }: { data: DietLogAIRequest; token: string },
    thunkAPI
  ) => {
    try {
      return await analyzeMeal(data, token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* -------------------------
   SAVE DIET LOG THUNK
--------------------------*/
export const saveDietLogThunk = createAsyncThunk(
  "dietLog/saveDietLog",
  async (
    { data, token }: { data: DietLogSaveRequest; token: string },
    thunkAPI
  ) => {
    try {
      return await saveDietLog(data, token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

/* -------------------------
   FETCH LOGS BY PLAN THUNK
--------------------------*/
export const fetchDietLogsByPlanThunk = createAsyncThunk(
  "dietLog/fetchByPlan",
  async ({ dietPlanId, token }: { dietPlanId: string; token: string }, thunkAPI) => {
    try {
      return await fetchDietLogsByPlan(dietPlanId, token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


/* -------------------------
   SLICE
--------------------------*/
const dietLogSlice = createSlice({
  name: "dietLog",
  initialState,
  reducers: {
    clearAnalysis: (state) => {
      state.analysis = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(analyzeMealThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeMealThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })
      .addCase(analyzeMealThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ------------------------- SAVE LOG ------------------------- */
    .addCase(saveDietLogThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(saveDietLogThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.savedLog = action.payload;
    })
    .addCase(saveDietLogThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(fetchDietLogsByPlanThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchDietLogsByPlanThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.logs = action.payload;
    })
    .addCase(fetchDietLogsByPlanThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAnalysis } = dietLogSlice.actions;
export default dietLogSlice.reducer;