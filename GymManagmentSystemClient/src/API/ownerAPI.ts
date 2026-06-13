export interface Owner {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  role: "OWNER";
}

export interface OwnerLoginRequest {
  email: string;
  password: string;
}

export interface OwnerLoginResponse {
  owner: Owner;
  message: string;
  token: string;
}


const BASE_URL = "http://localhost:8080/api/owner/auth";

export async function loginOwner(request: OwnerLoginRequest): Promise<OwnerLoginResponse> {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to login");
  }

  const data: OwnerLoginResponse = await response.json();
  return data;
}