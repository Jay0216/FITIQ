import React, { useEffect, useState } from "react";
import "./QRAttendance.css";
import {
  QrCode,
  Calendar,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Camera,
  CameraOff,
} from "lucide-react";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { fetchAttendance, qrUnlockDoor } from "../redux/attendanceSlice";

interface MonthYearOption {
  label: string;
  month: number;
  year: number;
}

type ScanStatus = "idle" | "processing" | "success" | "failed";

interface FeedbackConfig {
  className: string;
  message: string;
}

const feedbackConfig: Record<string, FeedbackConfig> = {
  processing: { className: "processing", message: "⏳ Processing..." },
  success:    { className: "success",    message: "✅ Door Unlocked!" },
  failed:     { className: "error",      message: "❌ Scan Failed. Try again." },
};

const QRAttendance: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [showHistory, setShowHistory]       = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState<MonthYearOption | null>(null);
  const [cameraOn, setCameraOn]             = useState(false);
  const [scanStatus, setScanStatus]         = useState<ScanStatus>("idle");

  const { attendance, loading, error } = useSelector(
    (state: RootState) => state.attendance
  );

  useEffect(() => {
    dispatch(fetchAttendance());
  }, [dispatch]);

  // ── QR scan handler ─────────────────────────────────────────────
  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (scanStatus !== "idle") return;

    const value = detectedCodes?.[0]?.rawValue;
    if (!value) return;

    setScanStatus("processing");

    try {
      await dispatch(qrUnlockDoor()).unwrap();
      setScanStatus("success");
      dispatch(fetchAttendance());
    } catch {
      setScanStatus("failed");
    }

    setTimeout(() => setScanStatus("idle"), 4000);
  };

  const handleError = () => {
    setScanStatus("failed");
    setTimeout(() => setScanStatus("idle"), 4000);
  };

  const toggleCamera = () => {
    setCameraOn((prev) => !prev);
    setScanStatus("idle");
  };

  // ── Month-year filter ────────────────────────────────────────────
  const monthYearOptions: MonthYearOption[] = Array.from(
    new Set(
      attendance.map((a) => {
        const date = new Date(a.markedAt);
        return `${date.getMonth()}-${date.getFullYear()}`;
      })
    )
  ).map((key) => {
    const [month, year] = key.split("-").map(Number);
    const monthName = new Date(year, month).toLocaleString("en-US", {
      month: "short",
    });
    const yearTwoDigit = String(year).slice(-2);
    return { month, year, label: `${monthName} - ${yearTwoDigit}` };
  });

  const filteredAttendance = selectedMonthYear
    ? attendance.filter((a) => {
        const date = new Date(a.markedAt);
        return (
          date.getMonth() === selectedMonthYear.month &&
          date.getFullYear() === selectedMonthYear.year
        );
      })
    : attendance;

  const now = new Date();

  const thisMonthAttendance = filteredAttendance.filter(
    (a) => new Date(a.markedAt).getMonth() === now.getMonth()
  );

  const lastMonthAttendance = filteredAttendance.filter(
    (a) => new Date(a.markedAt).getMonth() === now.getMonth() - 1
  );

  const stats = {
    thisMonth: thisMonthAttendance.length,
    streak:    0,
    totalHours: 0,
  };

  const feedback = scanStatus !== "idle" ? feedbackConfig[scanStatus] : null;

  return (
    <div className="qr-attendance">

      {/* ── Page Header ── */}
      <div className="qr-header">
        <div className="qr-header-content">
          <h1>QR Attendance</h1>
          <p>Scan the gym door QR code to unlock and mark attendance</p>
        </div>
      </div>

      <div className="qr-container">

        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div className="qr-left-column">
          <div className="qr-code-card">

            <div className="qr-code-header">
              <QrCode size={24} />
              <span>Scan QR Code</span>
            </div>

            {/* Scanner box */}
            <div className="qr-code-display">
              <div className="qr-scanner-box">
                {cameraOn ? (
                  <>
                    <Scanner
                      onScan={handleScan}
                      onError={handleError}
                      constraints={{ facingMode: "environment" }}
                      styles={{ container: { width: "100%", height: "100%" } }}
                    />
                    {/* Feedback overlay — only shown after result is known */}
                    {feedback && (
                      <div className={`scan-feedback ${feedback.className}`}>
                        <span>{feedback.message}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="qr-camera-off">
                    <CameraOff size={48} strokeWidth={1.5} />
                    <span>Camera is off</span>
                  </div>
                )}
              </div>
            </div>

            {/* Camera toggle button */}
            <button
              className={`camera-toggle-btn ${cameraOn ? "on" : "off"}`}
              onClick={toggleCamera}
            >
              {cameraOn ? <CameraOff size={18} /> : <Camera size={18} />}
              <span>{cameraOn ? "Turn Camera Off" : "Turn Camera On"}</span>
            </button>

            <div className="qr-instructions">
              <p>📱 Point camera at the GYM Door QR code</p>
              <p>🔍 Hold steady within the frame</p>
              <p>✅ Get Lock Unlocked and Enter the Gym</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stat-card-compact">
              <div className="stat-icon"><Calendar size={20} /></div>
              <div className="stat-content">
                <span className="stat-value">{stats.thisMonth}</span>
                <span className="stat-label">This Month</span>
              </div>
            </div>
            <div className="stat-card-compact">
              <div className="stat-icon"><TrendingUp size={20} /></div>
              <div className="stat-content">
                <span className="stat-value">{stats.streak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            </div>
            <div className="stat-card-compact">
              <div className="stat-icon"><Clock size={20} /></div>
              <div className="stat-content">
                <span className="stat-value">{stats.totalHours}h</span>
                <span className="stat-label">Total Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════ */}
        <div className="qr-right-column">

          {/* Attendance History */}
          <div className="attendance-history">
            <div className="history-header">
              <h2>Attendance History</h2>
              <div className="history-header-actions">

                <button
                  className="toggle-history-btn"
                  onClick={() => setShowHistory((prev) => !prev)}
                >
                  {showHistory ? (
                    <><span>Show Less</span><ChevronUp size={18} /></>
                  ) : (
                    <><span>Show All</span><ChevronDown size={18} /></>
                  )}
                </button>

                <div className="month-year-select-wrapper">
                  <select
                    className="toggle-history-btn month-year-filter"
                    value={selectedMonthYear?.label ?? ""}
                    onChange={(e) => {
                      const selected =
                        monthYearOptions.find((opt) => opt.label === e.target.value) ?? null;
                      setSelectedMonthYear(selected);
                    }}
                  >
                    <option value="">All</option>
                    {monthYearOptions.map((opt) => (
                      <option key={`${opt.month}-${opt.year}`} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="month-filter-chevron" size={16} />
                </div>

              </div>
            </div>

            {loading ? (
              <p className="empty-message">Loading attendance records...</p>
            ) : error ? (
              <p className="empty-message">Error: {error}</p>
            ) : filteredAttendance.length === 0 ? (
              <p className="empty-message">No attendance records found</p>
            ) : (
              <div className={`history-list ${showHistory ? "expanded" : ""}`}>
                {(showHistory
                  ? filteredAttendance
                  : filteredAttendance.slice(0, 5)
                ).map((record) => (
                  <div key={record.id} className="history-item">
                    <div className="history-date">
                      <Calendar size={18} />
                      <span>
                        {new Date(record.markedAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month:   "short",
                          day:     "numeric",
                        })}
                      </span>
                    </div>
                    <div className="history-details">
                      <div className="history-time">
                        <Clock size={16} />
                        <span>
                          {new Date(record.markedAt).toLocaleTimeString("en-US", {
                            hour:   "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!showHistory && filteredAttendance.length > 5 && (
              <div className="history-footer">
                <p>Showing 5 of {filteredAttendance.length} records</p>
              </div>
            )}
          </div>

          {/* Monthly Overview */}
          <div className="monthly-stats">
            <h3>Monthly Overview</h3>
            <div className="stats-comparison">
              <div className="month-stat">
                <span className="month-label">This Month</span>
                <span className="month-value">{thisMonthAttendance.length} visits</span>
                <div className="stat-bar">
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${Math.min(
                        (thisMonthAttendance.length /
                          Math.max(lastMonthAttendance.length, 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div className="month-stat">
                <span className="month-label">Last Month</span>
                <span className="month-value">{lastMonthAttendance.length} visits</span>
                <div className="stat-bar">
                  <div className="stat-bar-fill" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
            <div className="comparison-note">
              <span
                className={
                  thisMonthAttendance.length >= lastMonthAttendance.length
                    ? "positive"
                    : "negative"
                }
              >
                {thisMonthAttendance.length >= lastMonthAttendance.length ? "▲" : "▼"}{" "}
                {Math.abs(thisMonthAttendance.length - lastMonthAttendance.length)} visits{" "}
                {thisMonthAttendance.length >= lastMonthAttendance.length
                  ? "increase"
                  : "decrease"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default QRAttendance;