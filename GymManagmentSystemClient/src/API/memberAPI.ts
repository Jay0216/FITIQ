// ----------------------
// Data Models / Types
// ----------------------

export interface RegisterMemberRequest {
  fullname: string;
  phonenumber: string;
  email: string;
  dateofbirth: string; // "YYYY-MM-DD"
  password: string;
}

export interface LoginMemberRequest {
  email: string;
  password: string;
}

export interface MemberResponse {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  dateofbirth: string;
  membershipId: string;
}

export interface RegisterMemberResponse {
  member: MemberResponse;
  qrCode: string; // Base64 QR code string
}

export interface LoginMemberResponse {
  message: string;
  token: string;
  member: MemberResponse;
  qrCode: string;
}

// ----------------------
// API Functions (fetch)
// ----------------------

const BASE_URL = "http://localhost:8080/api/members";

// Register member
export const registerMember = async (
  data: RegisterMemberRequest
): Promise<RegisterMemberResponse> => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};

// Login member
export const loginMember = async (
  data: LoginMemberRequest
): Promise<LoginMemberResponse> => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};


export interface MemberCountResponse {
  totalMembers: number;
}

// Get total members count
export const fetchMemberCount = async (): Promise<MemberCountResponse> => {
  const response = await fetch(`${BASE_URL}/count`);

  if (!response.ok) {
    const err = await response.json();
    throw err;
  }

  return await response.json();
};