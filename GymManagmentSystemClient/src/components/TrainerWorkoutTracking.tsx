import React, { useState } from 'react';
import './TrainerWorkoutTracking.css';

interface WorkoutLog {
  id: number;
  memberName: string;
  date: string;
  workoutTitle: string;
  completed: boolean;
  memberNote: string;
  trainerFeedback?: string;
  performanceRating?: string;
}

const TrainerWorkoutTracking: React.FC = () => {

  const [logs, setLogs] = useState<WorkoutLog[]>([
    {
      id: 1,
      memberName: 'John Carter',
      date: '2026-03-02',
      workoutTitle: 'Chest & Triceps',
      completed: true,
      memberNote: 'Felt strong today. Increased weight.',
    },
    {
      id: 2,
      memberName: 'Alex Morgan',
      date: '2026-03-02',
      workoutTitle: 'HIIT Cardio',
      completed: false,
      memberNote: 'Could not finish due to fatigue.',
    }
  ]);

  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState('');

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLog) return;

    const updatedLogs = logs.map(log =>
      log.id === selectedLog.id
        ? { ...log, trainerFeedback: feedback, performanceRating: rating }
        : log
    );

    setLogs(updatedLogs);
    setSelectedLog(null);
    setFeedback('');
    setRating('');
  };

  return (
    <div className="tracking-container">
      <h2>Workout Logs & Feedback</h2>

      <div className="tracking-table-wrapper">
        <table className="tracking-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Date</th>
              <th>Workout</th>
              <th>Status</th>
              <th>Feedback</th>
            </tr>
          </thead>

          <tbody>
            {logs.map(log => (
              <tr key={log.id}>
                <td>{log.memberName}</td>
                <td>{log.date}</td>
                <td>{log.workoutTitle}</td>
                <td>
                  {log.completed ? 
                    <span className="status-done">Completed</span> :
                    <span className="status-missed">Missed</span>
                  }
                </td>
                <td>
                  <button
                    className="feedback-btn"
                    onClick={() => setSelectedLog(log)}
                  >
                    Give Feedback
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feedback Modal */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-content">

            <h3>Feedback for {selectedLog.memberName}</h3>

            <p className="log-meta">
              {selectedLog.workoutTitle} | {selectedLog.date}
            </p>

            <p className="member-note">
              <strong>Member Note:</strong> {selectedLog.memberNote}
            </p>

            <form onSubmit={submitFeedback} className="modal-form">

              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              >
                <option value="">Select Performance</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Needs Improvement">Needs Improvement</option>
              </select>

              <textarea
                placeholder="Write feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />

              <div className="modal-actions">
                <button type="submit" className="confirm-btn">
                  Submit Feedback
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedLog(null)}
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerWorkoutTracking;