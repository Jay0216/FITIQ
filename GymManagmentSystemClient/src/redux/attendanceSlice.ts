import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAttendanceReport, qrUnlockDoorAPI } from "../API/attendanceAPI";

interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  markedAt: string;
}

interface AttendanceState {
  attendance: Attendance[];
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  attendance: [],
  loading: false,
  error: null,
};

export const fetchAttendance = createAsyncThunk(
  "attendance/fetchAttendance",
  async () => {
    return await getAttendanceReport();
  }
);

export const qrUnlockDoor = createAsyncThunk(
  "attendance/qrUnlockDoor",
  async () => {
    return await qrUnlockDoorAPI();
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state) => {
        state.loading = false;
        state.error = "Failed to fetch attendance";
      })

      // 🔥 QR UNLOCK
      .addCase(qrUnlockDoor.pending, (state) => {
        state.loading = true;
      })
      .addCase(qrUnlockDoor.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(qrUnlockDoor.rejected, (state) => {
        state.loading = false;
        state.error = "QR unlock failed";
      });
  },
});

export default attendanceSlice.reducer;