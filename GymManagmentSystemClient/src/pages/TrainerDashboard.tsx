import React, { useState } from 'react';
import './MemberDashboard.css';

import TrainerOverview from '../components/TrainerOverview';
import TrainerWorkoutManagement from '../components/TrainerWorkoutManagement';
import TrainerDietManagement from '../components/TrainerDietManagment';
import TrainerAppointments from '../components/TrainerAppointments';
import TrainerWorkoutTracking from '../components/TrainerWorkoutTracking';

import { User, Calendar, Dumbbell, Apple, Menu, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store'; // ✅ adjust path if needed

const TrainerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Pull trainer from Redux store (persisted across refresh)
  const trainer = useSelector((state: RootState) => state.trainer.trainer);

  const trainerData = {
    name: trainer?.fullname ?? 'Trainer',
    role: trainer?.type
      ? trainer.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) // e.g. "weight_loss" → "Weight Loss"
      : 'Certified Fitness Trainer',
    avatar: trainer?.fullname
      ? trainer.fullname.split(' ').map((n: string) => n[0]).join('').toUpperCase()
      : 'T',
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'workouts', label: 'Workout Management', icon: Dumbbell },
    { id: 'diet', label: 'Diet Plan Requests', icon: Apple },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':      return <TrainerOverview />;
      case 'workouts':      return <TrainerWorkoutManagement />;
      case 'diet':          return <TrainerDietManagement />;
      case 'appointments':  return <TrainerAppointments />;
      default:              return <TrainerOverview />;
    }
  };

  return (
    <div className="member-dashboard">
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Dumbbell size={32} />
            <span>FitIQ</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="member-info">
            {/* ✅ Real avatar and name from Redux */}
            <div className="member-avatar">{trainerData.avatar}</div>
            <div className="member-details">
              <p className="member-name">{trainerData.name}</p>
              <p className="member-type">{trainerData.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            {/* ✅ Real first name in greeting */}
            <h1>Welcome back, {trainerData.name.split(' ')[0]}!</h1>
            <p className="header-subtitle">
              Manage members, workouts, and diet plans efficiently
            </p>
          </div>
        </div>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default TrainerDashboard;