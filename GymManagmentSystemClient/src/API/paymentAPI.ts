// paymentApi.ts

// ==========================
// ✅ Data Models / Interfaces
// ==========================

// Saved payment method
export interface PaymentMethod {
  id: string;
  memberId: string;
  cardHolderName: string;
  cardBrand: string;
  last4: string;
  expiry: string; // "MM/YY"
  token: string;
  isDefault: boolean;
  createdAt: string;
}

// Request to add a payment method
export interface PaymentMethodRequest {
  cardHolderName: string;
  cardNumber: string;
  expiry: string; // "MM/YY"
  isDefault: boolean;
}

// Request to complete a payment
export interface DonePaymentRequest {
  subscriptionId: string;
  subscriptionType: string; // basic / standard / premium
  amount: number;
  savePaymentMethod: boolean;
  cardHolderName?: string;
  cardNumber?: string;
  expiry?: string;
  isDefault?: boolean;
}


export interface PaymentTransaction {
  id: string;
  memberId: string;
  subscriptionId: string;
  amount: number;
  transactionDate: string; // ✅ FIXED (matches backend)
}

export interface DonePaymentResponse {
  transaction: PaymentTransaction; // ✅ use correct model
  paymentMethod?: PaymentMethod;
}

// ==========================
// ✅ Helper: Get token headers
// ==========================
const getHeaders = () => {
  const token = localStorage.getItem("memberToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// ==========================
// ✅ API Functions
// ==========================

// Fetch all saved payment methods
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await fetch("http://localhost:8080/api/payments/methods", {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch payment methods");
  }

  const data: PaymentMethod[] = await response.json();
  return data;
};

// Add a new payment method
export const addPaymentMethod = async (
  requestBody: PaymentMethodRequest
): Promise<PaymentMethod> => {
  const response = await fetch("http://localhost:8080/api/payments/method", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to add payment method");
  }

  const data: PaymentMethod = await response.json();
  return data;
};

// Delete a payment method
export const deletePaymentMethod = async (id: string): Promise<string> => {
  const response = await fetch(
    `http://localhost:8080/api/payments/method/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to delete payment method");
  }

  const data = await response.text();
  return data;
};

// Complete a payment & optionally save the card
export const completePayment = async (
  requestBody: DonePaymentRequest
): Promise<DonePaymentResponse> => {
  const response = await fetch("http://localhost:8080/api/payments/done", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Payment failed");
  }

  const data: DonePaymentResponse = await response.json();
  return data;
};

// Fetch all transactions for logged-in member
export const fetchTransactions = async (): Promise<PaymentTransaction[]> => {
  const response = await fetch("http://localhost:8080/api/payments/transactions", {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch transactions");
  }

  const data: PaymentTransaction[] = await response.json();
  return data;
};