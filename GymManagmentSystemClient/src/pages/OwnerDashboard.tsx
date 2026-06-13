import React, { useState } from 'react';
import './MemberDashboard.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../redux/store';

import OwnerOverview from '../components/OwnerOverview';
import { BarChart3, UserCog, FileText, Menu, X } from 'lucide-react';
import OwnerAnalytics from '../components/OwnerAnalytics';
import MemberManagement from '../components/MemberManagement';

const OwnerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Pull owner from Redux instead of hardcoding
  const owner = useSelector((state: RootState) => state.owner.owner);

  // ✅ Fallback for page refresh (owner is null until re-login since slice doesn't persist it)
  const fullName = owner?.fullname ?? 'Owner';
  const firstName = fullName.split(' ')[0];
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const menuItems = [
    { id: 'overview',  label: 'Overview',            icon: BarChart3 },
    { id: 'members',  label: 'Member Management', icon: UserCog   },
    { id: 'reports',   label: 'Reports & Analytics', icon: FileText  },
    { id: 'access',   label: 'Access Control', icon: FileText  },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'reports':  return <OwnerAnalytics />;
      case 'members': return <MemberManagement />;
      default:         return <OwnerOverview />;
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
            <BarChart3 size={32} />
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
            {/* ✅ Dynamic initials instead of hardcoded "MJ" */}
            <div className="member-avatar">{initials}</div>
            <div className="member-details">
              <p className="member-name">{fullName}</p>
              <p className="member-type">Gym Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-content">
            {/* ✅ Dynamic first name */}
            <h1>Welcome back, {firstName}!</h1>
            <p className="header-subtitle">
              Monitor system performance, members, trainers and payments
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

export default OwnerDashboard;