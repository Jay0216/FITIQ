import React, { useEffect, useState } from 'react';
import './MemberDashboard.css';
import ProfileCard from '../components/ProfileCard';
import QRAttendance from '../components/QRAttendance';
import WorkoutTracker from '../components/WorkoutTracker';
import DietPlan from '../components/DietPlan';
import Appointments from '../components/Appointments';
import Payments from '../components/Payments';
import Notifications from '../components/Notifications';
import StatsOverview from '../components/StatsOverview';
import { User, Calendar, Dumbbell, Apple, CreditCard, Bell, QrCode, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store'; // adjust path if needed
import { fetchSubscriptionThunk } from '../redux/memberSlice';

interface MemberData {
  name: string;
  email: string;
  membershipStatus: string;
  membershipExpiry: string;
  joinDate: string;
  membershipType: string;
  avatar: string;
}

const MemberDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  // ✅ Fetch member from Redux store
  const member = useSelector((state: RootState) => state.member.member);
  const subscription = useSelector((state: RootState) => state.member.subscription);

  useEffect(() => {
    dispatch(fetchSubscriptionThunk());
  }, [dispatch]);

  // ✅ Build memberData from Redux state using fullName field
  const memberData: MemberData = {
    name: member?.fullname ?? 'Member',
    email: member?.email ?? '',
    membershipStatus: subscription?.active ? 'Active' : 'Inactive',  // ✅ from API
    membershipExpiry: subscription?.endDate ?? '',                     // ✅ from API
    joinDate: subscription?.startDate ?? '',                           // ✅ from API
    membershipType: subscription?.type ?? 'Standard',                  // ✅ from API

    avatar: member?.fullname
      ? member.fullname.split(' ').map((n: string) => n[0]).join('').toUpperCase()
      : 'M',
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'qr-attendance', label: 'QR Attendance', icon: QrCode },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'diet', label: 'Diet Plan', icon: Apple },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="overview-grid">
            <StatsOverview />
            <ProfileCard memberData={memberData} />
            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-cards">
                <button className="action-card" onClick={() => setActiveSection('qr-attendance')}>
                  <QrCode size={32} />
                  <span>Scan QR</span>
                </button>
                <button className="action-card" onClick={() => setActiveSection('workouts')}>
                  <Dumbbell size={32} />
                  <span>Today's Workout</span>
                </button>
                <button className="action-card" onClick={() => setActiveSection('diet')}>
                  <Apple size={32} />
                  <span>Diet Plan</span>
                </button>
                <button className="action-card" onClick={() => setActiveSection('appointments')}>
                  <Calendar size={32} />
                  <span>Book Session</span>
                </button>
              </div>
            </div>
          </div>
        );
      case 'qr-attendance':
        return <QRAttendance />;
      case 'workouts':
        return <WorkoutTracker />;
      case 'diet':
        return <DietPlan />;
      case 'appointments':
        return <Appointments />;
      case 'payments':
        return <Payments />;
      case 'notifications':
        return <Notifications />;
      default:
        return <StatsOverview />;
    }
  };

  return (
    <div className="member-dashboard">
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
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
            {/* ✅ Avatar and name from Redux */}
            <div className="member-avatar">{memberData.avatar}</div>
            <div className="member-details">
              <p className="member-name">{memberData.name}</p>
              <p className="member-type">{memberData.membershipType}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            {/* ✅ First word of fullName as greeting */}
            <h1>Welcome back, {memberData.name.split(' ')[0]}!</h1>
            <p className="header-subtitle">Let's crush your fitness goals today</p>
          </div>
          <div className="header-actions">
            <div className="membership-badge">
              <span className="status-dot"></span>
              <span>{memberData.membershipStatus}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default MemberDashboard;