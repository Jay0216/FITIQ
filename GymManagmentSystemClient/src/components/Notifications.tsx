import React, { useState } from 'react';
import './Notifications.css';
import { Bell, CheckCircle, AlertCircle, Calendar, CreditCard, Dumbbell, Apple, X } from 'lucide-react';

interface Notification {
  id: number;
  type: 'reminder' | 'alert' | 'update' | 'announcement';
  category: 'membership' | 'appointment' | 'workout' | 'diet' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'reminder',
      category: 'membership',
      title: 'Membership Renewal Coming Up',
      message: 'Your Premium membership will renew on March 1, 2026. Make sure your payment method is up to date.',
      date: '2026-02-01T09:00:00',
      read: false,
    },
    {
      id: 2,
      type: 'alert',
      category: 'appointment',
      title: 'Upcoming Training Session',
      message: 'You have a training session with Coach Mike tomorrow at 10:00 AM in Studio A.',
      date: '2026-02-01T08:30:00',
      read: false,
    },
    {
      id: 3,
      type: 'update',
      category: 'workout',
      title: 'New Workout Plan Assigned',
      message: 'Coach Mike has assigned you a new Upper Body Strength workout plan. Check it out in the Workouts section.',
      date: '2026-01-31T15:00:00',
      read: false,
    },
    {
      id: 4,
      type: 'update',
      category: 'diet',
      title: 'Diet Plan Updated',
      message: 'Your AI-generated diet plan has been reviewed and approved by Nutritionist Sarah.',
      date: '2026-01-30T14:00:00',
      read: true,
    },
    {
      id: 5,
      type: 'announcement',
      category: 'general',
      title: 'New Yoga Classes Starting Soon',
      message: 'Join our new morning yoga classes every Monday, Wednesday, and Friday at 7:00 AM. Sign up at the front desk!',
      date: '2026-01-29T10:00:00',
      read: true,
    },
    {
      id: 6,
      type: 'reminder',
      category: 'workout',
      title: 'Complete Today\'s Workout',
      message: 'Don\'t forget to complete your Upper Body Strength workout today. You\'re on a 5-day streak!',
      date: '2026-01-28T07:00:00',
      read: true,
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'membership':
        return <CreditCard size={20} />;
      case 'appointment':
        return <Calendar size={20} />;
      case 'workout':
        return <Dumbbell size={20} />;
      case 'diet':
        return <Apple size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reminder':
        return 'reminder';
      case 'alert':
        return 'alert';
      case 'update':
        return 'update';
      case 'announcement':
        return 'announcement';
      default:
        return '';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications">
      <div className="notifications-header">
        <div className="notifications-header-content">
          <h1>Notifications</h1>
          <p>Stay updated with your fitness journey</p>
        </div>
        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={markAllAsRead}>
            <CheckCircle size={18} />
            Mark All as Read
          </button>
        )}
      </div>

      <div className="notifications-controls">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Notifications
            <span className="count">{notifications.length}</span>
          </button>
          <button 
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread
            {unreadCount > 0 && <span className="count unread">{unreadCount}</span>}
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''} ${getTypeColor(notification.type)}`}
            >
              <div className="notification-indicator">
                {!notification.read && <div className="unread-dot"></div>}
              </div>
              
              <div className="notification-icon">
                {getIcon(notification.category)}
              </div>

              <div className="notification-content">
                <div className="notification-header-row">
                  <h3>{notification.title}</h3>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        className="action-icon read"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button 
                      className="action-icon delete"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <p>{notification.message}</p>
                <div className="notification-footer">
                  <span className="notification-time">
                    {new Date(notification.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className={`notification-badge ${notification.type}`}>
                    {notification.type}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-notifications">
            <Bell size={64} />
            <h3>No {filter === 'unread' ? 'unread' : ''} notifications</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;