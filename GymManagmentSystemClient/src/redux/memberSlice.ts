import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerMember,
  loginMember,
  fetchMemberCount,
} from "../API/memberAPI.ts";

import type {
  RegisterMemberRequest,
  LoginMemberRequest,
  RegisterMemberResponse,
} from "../API/memberAPI.ts";
import { fetchMySubscription, type Subscription } from "../API/subscriptionAPI.ts";

// ✅ Helper functions to persist member in localStorage
const saveMember = (member: any) => {
  localStorage.setItem("member", JSON.stringify(member));
};

const loadMember = () => {
  try {
    const stored = localStorage.getItem("member");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

interface MemberState {
  member: RegisterMemberResponse["member"] | null;
  token: string | null;
  qrCode: string | null;
  totalMembers: number;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

const initialState: MemberState = {
  member: loadMember(), // ✅ rehydrate member on refresh
  token: localStorage.getItem("memberToken"),
  qrCode: localStorage.getItem("qrCode"),
  totalMembers: 0,
  subscription: null,
  loading: false,
  error: null,
};

// Register async thunk
export const register = createAsyncThunk(
  "member/register",
  async (data: RegisterMemberRequest, thunkAPI) => {
    try {
      return await registerMember(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Registration failed");
    }
  }
);

// Login async thunk
export const login = createAsyncThunk(
  "member/login",
  async (data: LoginMemberRequest, thunkAPI) => {
    try {
      return await loginMember(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || "Login failed");
    }
  }
);

export const fetchSubscriptionThunk = createAsyncThunk(
  "member/fetchSubscription",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchMySubscription();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch subscription");
    }
  }
);

export const fetchMemberCountThunk = createAsyncThunk(
  "members/fetchCount",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchMemberCount();
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch member count");
    }
  }
);

// Slice
const memberSlice = createSlice({
  name: "member",
  initialState,
  reducers: {
    logout: (state) => {
      state.member = null;
      state.token = null;
      state.subscription = null;
      localStorage.removeItem("memberToken"); // ✅ fixed key name
      localStorage.removeItem("member");      // ✅ clear persisted member
      localStorage.removeItem("qrCode");
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.member = action.payload.member;
        saveMember(action.payload.member); // ✅ persist on register
      })
      .addCase(register.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.member = action.payload.member;
        state.token = action.payload.token;
        saveMember(action.payload.member); // ✅ persist on login
        localStorage.setItem("qrCode", action.payload.qrCode);
        localStorage.setItem("memberToken", action.payload.token);
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch member count
      .addCase(fetchMemberCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.totalMembers = action.payload.totalMembers;
      })
      .addCase(fetchMemberCountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch subscription
      .addCase(fetchSubscriptionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscriptionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = memberSlice.actions;
export default memberSlice.reducer;