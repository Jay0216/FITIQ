import React from 'react';
import './TrainerOverview.css';

const TrainerOverview : React.FC = () => {
  return (
    <div className="trainer-overview">
      <div className="overview-card">
        <h3>Assigned Members</h3>
        <p className="overview-number">24</p>
      </div>

      <div className="overview-card">
        <h3>Pending Diet Requests</h3>
        <p className="overview-number">5</p>
      </div>

      <div className="overview-card">
        <h3>Today's Appointments</h3>
        <p className="overview-number">3</p>
      </div>
    </div>
  );
};

export default TrainerOverview;