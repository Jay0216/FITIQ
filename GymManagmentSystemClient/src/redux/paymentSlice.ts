// paymentSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  completePayment,
  type PaymentMethod,
  type PaymentMethodRequest,
  type DonePaymentRequest,
  type DonePaymentResponse,
  fetchTransactions,
  type PaymentTransaction,
} from "../API/paymentAPI";



// ==========================
// ✅ Async Thunks
// ==========================

// Fetch all payment methods
export const fetchPaymentMethodsThunk = createAsyncThunk<
  PaymentMethod[],
  void,
  { rejectValue: string }
>("payment/fetchMethods", async (_, { rejectWithValue }) => {
  try {
    return await fetchPaymentMethods();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Add a new payment method
export const addPaymentMethodThunk = createAsyncThunk<
  PaymentMethod,
  PaymentMethodRequest,
  { rejectValue: string }
>("payment/addMethod", async (request, { rejectWithValue }) => {
  try {
    return await addPaymentMethod(request);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Delete a payment method
export const deletePaymentMethodThunk = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("payment/deleteMethod", async (id, { rejectWithValue }) => {
  try {
    return await deletePaymentMethod(id);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// Complete a payment
export const completePaymentThunk = createAsyncThunk<
  DonePaymentResponse,
  DonePaymentRequest,
  { rejectValue: string }
>("payment/completePayment", async (request, { rejectWithValue }) => {
  try {
    return await completePayment(request);
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});


export const fetchTransactionsThunk = createAsyncThunk<
  PaymentTransaction[],
  void,
  { rejectValue: string }
>("payment/fetchTransactions", async (_, { rejectWithValue }) => {
  try {
    return await fetchTransactions();
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// ==========================
// ✅ Slice State
// ==========================
interface PaymentState {
  methods: PaymentMethod[];
  transactions: PaymentTransaction[];
  loading: boolean;
  error: string | null;
  lastPayment: DonePaymentResponse | null;
}

const initialState: PaymentState = {
  methods: [],
  transactions: [],
  loading: false,
  error: null,
  lastPayment: null,
};

// ==========================
// ✅ Slice
// ==========================
export const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearLastPayment: (state) => {
      state.lastPayment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch payment methods
    builder.addCase(fetchPaymentMethodsThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      fetchPaymentMethodsThunk.fulfilled,
      (state, action: PayloadAction<PaymentMethod[]>) => {
        state.loading = false;
        state.methods = action.payload;
      }
    );
    builder.addCase(fetchPaymentMethodsThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch payment methods";
    });

    // Add payment method
    builder.addCase(addPaymentMethodThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      addPaymentMethodThunk.fulfilled,
      (state, action: PayloadAction<PaymentMethod>) => {
        state.loading = false;
        state.methods.push(action.payload);
      }
    );
    builder.addCase(addPaymentMethodThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to add payment method";
    });

    // Delete payment method
    builder.addCase(deletePaymentMethodThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      deletePaymentMethodThunk.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.methods = state.methods.filter(
          (method) => method.id !== action.payload
        );
      }
    );
    builder.addCase(deletePaymentMethodThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete payment method";
    });

    // Complete payment
    builder.addCase(completePaymentThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.lastPayment = null;
    });
    builder.addCase(
      completePaymentThunk.fulfilled,
      (state, action: PayloadAction<DonePaymentResponse>) => {
        state.loading = false;
        state.lastPayment = action.payload;

        // If a payment method was returned, add/update it in state
        if (action.payload.paymentMethod) {
          const existingIndex = state.methods.findIndex(
            (m) => m.id === action.payload.paymentMethod!.id
          );
          if (existingIndex >= 0) {
            state.methods[existingIndex] = action.payload.paymentMethod!;
          } else {
            state.methods.push(action.payload.paymentMethod);
          }
        }
      }
    );
    builder.addCase(completePaymentThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Payment failed";
    });

    // Fetch transactions
builder.addCase(fetchTransactionsThunk.pending, (state) => {
  state.loading = true;
  state.error = null;
});

builder.addCase(
  fetchTransactionsThunk.fulfilled,
  (state, action: PayloadAction<PaymentTransaction[]>) => {
    state.loading = false;
    state.transactions = action.payload;
  }
);

builder.addCase(fetchTransactionsThunk.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload || "Failed to fetch transactions";
});
  },
});

export const { clearLastPayment, clearError } = paymentSlice.actions;
export default paymentSlice.reducer;