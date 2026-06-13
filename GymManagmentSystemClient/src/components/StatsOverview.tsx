import React from 'react';
import './StatsOverview.css';
import { TrendingUp, Target, Flame, Award } from 'lucide-react';

const StatsOverview: React.FC = () => {
  const stats = [
    {
      icon: Flame,
      label: 'Streak',
      value: '12',
      unit: 'days',
      trend: '+3 from last week',
      color: 'var(--primary)',
    },
    {
      icon: Target,
      label: 'Current Diet Goal',
      value: '8',
      unit: '/10',
      trend: '80% completion',
      color: 'var(--accent)',
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      value: '65',
      unit: '%',
      trend: '+12% this month',
      color: 'var(--success)',
    },
    {
      icon: Award,
      label: 'Workouts',
      value: '24',
      unit: 'total',
      trend: 'This month',
      color: 'var(--secondary)',
    },
  ];

  return (
    <div className="stats-overview">
      <h2 className="stats-title">Your Progress</h2>
      <div className="stats-cards">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card-overview" style={{ '--stat-color': stat.color } as React.CSSProperties}>
              <div className="stat-card-header">
                <div className="stat-icon-wrapper">
                  <Icon size={24} />
                </div>
                <span className="stat-label">{stat.label}</span>
              </div>
              <div className="stat-value-wrapper">
                <span className="stat-value-large">{stat.value}</span>
                <span className="stat-unit">{stat.unit}</span>
              </div>
              <div className="stat-trend">{stat.trend}</div>
              <div className="stat-progress-bar">
                <div className="stat-progress-fill" style={{ width: stat.label === 'Progress' ? `${stat.value}%` : '75%' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatsOverview;