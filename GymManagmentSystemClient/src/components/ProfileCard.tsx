import React, { useState } from 'react';
import './ProfileCard.css';
import { Edit2, Mail, Calendar, Award, Save, X } from 'lucide-react';

interface MemberData {
  name: string;
  email: string;
  membershipStatus: string;
  membershipExpiry: string;
  joinDate: string;
  membershipType: string;
  avatar: string;
}

interface ProfileCardProps {
  memberData: MemberData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ memberData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(memberData);

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(memberData);
    setIsEditing(false);
  };

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <h2>Profile</h2>
        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <Edit2 size={18} />
            <span>Edit</span>
          </button>
        ) : (
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave}>
              <Save size={18} />
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              <X size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="profile-avatar-section">
        <div className="profile-avatar-large">{memberData.avatar}</div>
        {isEditing ? (
          <input
            type="text"
            className="profile-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        ) : (
          <h3>{memberData.name}</h3>
        )}
      </div>

      <div className="profile-details">
        <div className="detail-item">
          <div className="detail-icon">
            <Mail size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Email</span>
            {isEditing ? (
              <input
                type="email"
                className="profile-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            ) : (
              <span className="detail-value">{memberData.email}</span>
            )}
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <Award size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Membership Type</span>
            <span className="detail-value membership-type">{memberData.membershipType}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <Calendar size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Membership Expiry</span>
            <span className="detail-value">{new Date(memberData.membershipExpiry).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="detail-item">
          <div className="detail-icon">
            <Calendar size={18} />
          </div>
          <div className="detail-content">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">{new Date(memberData.joinDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="membership-status-bar">
        <div className="status-bar-header">
          <span>Membership Status</span>
          <span className="status-active">{memberData.membershipStatus}</span>
        </div>
        <div className="status-bar">
          <div className="status-bar-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;