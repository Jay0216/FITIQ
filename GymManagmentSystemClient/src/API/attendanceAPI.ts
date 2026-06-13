const BASE_URL = "http://localhost:8080/api/attendance";

export const getAttendanceReport = async () => {

  const token = localStorage.getItem("memberToken");

  const response = await fetch(`${BASE_URL}/member/attendancereport`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch attendance report");
  }

  return await response.json();
};


export const qrUnlockDoorAPI = async () => {
  const token = localStorage.getItem("memberToken");

  const response = await fetch(`${BASE_URL}/door/qr-unlock`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("QR unlock failed");
  }

  return await response.json();
};