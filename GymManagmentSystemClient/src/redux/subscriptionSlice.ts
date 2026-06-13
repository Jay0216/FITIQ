import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchMySubscription, fetchSubscriptionCount } from "../API/subscriptionAPI";
import type { Subscription } from "../API/subscriptionAPI";

// ✅ Thunk
export const fetchMySubscriptionThunk = createAsyncThunk<
  Subscription,
  void,
  { rejectValue: string }
>("subscription/fetchMy", async (_, { rejectWithValue }) => {
  try {
    return await fetchMySubscription();
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// ✅ State Type
interface SubscriptionState {
  data: Subscription | null;
  totalSubscriptions: number;
  loading: boolean;
  error: string | null;
}

// ✅ Initial State
const initialState: SubscriptionState = {
  data: null,
  totalSubscriptions: 0,
  loading: false,
  error: null,
};

export const fetchSubscriptionCountThunk = createAsyncThunk(
  "subscriptions/fetchCount",
  async (token: string, { rejectWithValue }) => {
    try {
      return await fetchSubscriptionCount(token);
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch subscription count");
    }
  }
);

// ✅ Slice
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMySubscriptionThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubscriptionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchMySubscriptionThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      })

       .addCase(fetchSubscriptionCountThunk.pending, (state) => {
         state.loading = true;
         state.error = null;
      })
      .addCase(fetchSubscriptionCountThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.totalSubscriptions = action.payload.totalSubscriptions;
      })
     .addCase(fetchSubscriptionCountThunk.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload as string;
     });
  },
});

export default subscriptionSlice.reducer;