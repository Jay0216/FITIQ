// subscriptionApi.ts

// ✅ Data Model (inside same file)
export interface Subscription {
  id: string;
  memberId: string;
  type: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

// ✅ Fetch API function
export const fetchMySubscription = async (): Promise<Subscription> => {
  const token = localStorage.getItem("memberToken");

  const response = await fetch(
    "http://localhost:8080/api/subscriptions/member",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch subscription");
  }

  const data: Subscription = await response.json();
  return data;
};


export interface SubscriptionCountResponse {
  totalSubscriptions: number;
}

const SUBSCRIPTION_BASE_URL = "http://localhost:8080/api/subscriptions";

// Get total subscriptions count (Owner only)
export const fetchSubscriptionCount = async (token: string): Promise<SubscriptionCountResponse> => {
  const response = await fetch(`${SUBSCRIPTION_BASE_URL}/count`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};