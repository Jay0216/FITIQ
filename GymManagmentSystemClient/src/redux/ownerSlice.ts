import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Owner, OwnerLoginRequest, OwnerLoginResponse } from "../API/ownerAPI";
import { loginOwner } from "../API/ownerAPI";

const saveOwner = (owner: Owner) => {
  localStorage.setItem('owner', JSON.stringify(owner));
};

const loadOwner = (): Owner | null => {
  try {
    const stored = localStorage.getItem('owner');
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
};


// Async thunk for login
export const loginOwnerThunk = createAsyncThunk<
  OwnerLoginResponse,
  OwnerLoginRequest,
  { rejectValue: string }
>("owner/login", async (request, thunkAPI) => {
  try {
    const data = await loginOwner(request);
    // Save token to localStorage
    localStorage.setItem("ownerToken", data.token);
    return data;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

interface OwnerState {
  owner: Owner | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: OwnerState = {
  owner: loadOwner(), 
  token: localStorage.getItem("ownerToken") || null,
  loading: false,
  error: null,
};

const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {
    logout: (state) => {
      state.owner = null;
      state.token = null;
      localStorage.removeItem("ownerToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginOwnerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginOwnerThunk.fulfilled, (state, action: PayloadAction<OwnerLoginResponse>) => {
        state.loading = false;
        state.owner = action.payload.owner;
        state.token = action.payload.token;
        saveOwner(action.payload.owner);
      })
      .addCase(loginOwnerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = ownerSlice.actions;
export default ownerSlice.reducer;