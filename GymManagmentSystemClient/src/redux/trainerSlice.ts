import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllTrainers, fetchTrainerCount, loginTrainer, registerTrainer } from "../API/trainerAPI.ts";
import type { TrainerLoginRequest, TrainerLoginResponse, TrainerRegisterRequest, TrainerRegisterResponse, TrainerResponse } from "../API/trainerAPI.ts";

// ✅ Persist helpers
const saveTrainer = (trainer: any) => {
  localStorage.setItem("trainer", JSON.stringify(trainer));
};

const loadTrainer = () => {
  try {
    const stored = localStorage.getItem("trainer");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

interface TrainerState {
  trainer: TrainerResponse | null;
  trainers: TrainerResponse[];
  token: string | null;
  loading: boolean;
  error: string | null;
  totalTrainers: number;
}

const initialState: TrainerState = {
  trainer: loadTrainer(), // ✅ rehydrate on refresh
  trainers: [],
  token: localStorage.getItem("trainerToken"),
  loading: false,
  error: null,
  totalTrainers: 0,
};

export const login = createAsyncThunk(
  "trainer/login",
  async (data: TrainerLoginRequest, thunkAPI) => {
    try {
      return await loginTrainer(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Login failed");
    }
  }
);

export const getAllTrainers = createAsyncThunk(
  "trainer/getAll",
  async (token: string, thunkAPI) => {
    try {
      return await fetchAllTrainers(token);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Failed to fetch trainers");
    }
  }
);

export const register = createAsyncThunk(
  "trainer/register",
  async (data: TrainerRegisterRequest, thunkAPI) => {
    try {
      return await registerTrainer(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Registration failed");
    }
  }
);

export const fetchTrainerCountThunk = createAsyncThunk(
  "trainers/fetchCount",
  async (token: string, { rejectWithValue }) => {
    try {
      return await fetchTrainerCount(token);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch trainer count");
    }
  }
);

const trainerSlice = createSlice({
  name: "trainer",
  initialState,
  reducers: {
    logout: (state) => {
      state.trainer = null;
      state.token = null;
      localStorage.removeItem("trainerToken");
      localStorage.removeItem("trainer"); // ✅ clear on logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; })
      .addCase(login.fulfilled, (state, action: { payload: TrainerLoginResponse }) => {
        state.loading = false;
        state.trainer = action.payload.trainer;
        state.token = action.payload.token;
        saveTrainer(action.payload.trainer); // ✅ persist on login
        localStorage.setItem("trainerToken", action.payload.token);
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllTrainers.pending, (state) => { state.loading = true; })
      .addCase(getAllTrainers.fulfilled, (state, action: any) => {
        state.loading = false;
        state.trainers = action.payload.trainers;
      })
      .addCase(getAllTrainers.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(register.pending, (state) => { state.loading = true; })
      .addCase(register.fulfilled, (state, action: { payload: TrainerRegisterResponse }) => {
        state.loading = false;
        state.trainer = action.payload.trainer;
        saveTrainer(action.payload.trainer); // ✅ persist on register
      })
      .addCase(register.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTrainerCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrainerCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.totalTrainers = action.payload.totalTrainers;
      })
      .addCase(fetchTrainerCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = trainerSlice.actions;
export default trainerSlice.reducer;