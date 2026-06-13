import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  activateFitnessAssessment,
  createFitnessAssessment,
  getAllActiveAssessments,
  getMemberAssessments,
  
} from "../API/fitnessAssessmentAPI";

import type { FitnessAssessmentRequest, FitnessAssessmentResponse } from "../API/fitnessAssessmentAPI";


interface FitnessAssessmentState {
  assessments: FitnessAssessmentResponse[];
  loading: boolean;
  error: string | null;
}

const initialState: FitnessAssessmentState = {
  assessments: [],
  loading: false,
  error: null,
};


/* -------------------------
   CREATE FITNESS ASSESSMENT
--------------------------*/
export const createFitnessAssessmentThunk = createAsyncThunk(
  "fitnessAssessment/create",
  async (
    { data, token }: { data: FitnessAssessmentRequest; token: string },
    thunkAPI
  ) => {
    try {
      return await createFitnessAssessment(data, token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


/* -------------------------
   GET MEMBER ASSESSMENTS
--------------------------*/
export const fetchFitnessAssessments = createAsyncThunk(
  "fitnessAssessment/getAll",
  async (token: string, thunkAPI) => {
    try {
      return await getMemberAssessments(token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


/* -------------------------
   ACTIVATE ASSESSMENT
--------------------------*/
export const activateAssessmentThunk = createAsyncThunk(
  "fitnessAssessment/activate",
  async (
    { assessmentId, token }: { assessmentId: string; token: string },
    thunkAPI
  ) => {
    try {
      await activateFitnessAssessment(assessmentId, token);
      return assessmentId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchActiveAssessmentsThunk = createAsyncThunk(
  "fitnessAssessment/getActive",
  async (token: string, thunkAPI) => {
    try {
      return await getAllActiveAssessments(token);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);


const fitnessAssessmentSlice = createSlice({
  name: "fitnessAssessment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // CREATE
      .addCase(createFitnessAssessmentThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(createFitnessAssessmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments.push(action.payload);
      })

      .addCase(createFitnessAssessmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // FETCH
      .addCase(fetchFitnessAssessments.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchFitnessAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })

      .addCase(fetchFitnessAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchActiveAssessmentsThunk.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchActiveAssessmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })

      .addCase(fetchActiveAssessmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(activateAssessmentThunk.fulfilled, (state, action) => {

        const activatedId = action.payload;
        state.assessments = state.assessments.map((a) => ({
          ...a,
          active: a.id === activatedId
      }));

      
    })
  },
});

export default fitnessAssessmentSlice.reducer;