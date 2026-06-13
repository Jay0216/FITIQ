import React, { useState } from 'react';
import './TrainerAuth.css';
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import type { TrainerLoginRequest } from '../API/trainerAPI';
import { useDispatch } from 'react-redux';
import { login } from '../redux/trainerSlice';
import type{ AppDispatch } from '../redux/store';
import { useNavigate } from 'react-router-dom';

const TrainerAuth: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  //const handleLogin = (e: React.FormEvent) => {
    //e.preventDefault();
    //console.log('Trainer Login:', loginData);
    // Add trainer login logic here
  //};

  const dispatch = useDispatch<AppDispatch>();;
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();



  // Basic validation
  if (!loginData.email || !loginData.password) {
    alert("Email and password are required.");
    return;
  }

  // Reset previous error
  //setErrorMessage(null);

  // Prepare login payload
  const payload: TrainerLoginRequest = {
    email: loginData.email.trim(),
    password: loginData.password,
  };

  try {
    // Dispatch Redux thunk to login
    const resultAction = await dispatch(login(payload));
    
    if (login.fulfilled.match(resultAction)) {
      // Success
      console.log("Trainer logged in:", resultAction.payload.trainer);

      alert("Login successful! Redirecting to dashboard...");
      navigate("/trainerdashboard");
      
    } else {
      // Error from backend
      const message = resultAction.payload || "Login failed";
      alert(message);
    }
  } catch (err: any) {
    setErrorMessage(err.message || "Something went wrong. Try again.");
  }
};



  return (
    <div className="trainer-auth-page">
      {/* Background Elements */}
      <div className="trainer-auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Auth Container */}
      <div className="trainer-auth-container">
        {/* Left Side - Branding */}
        <div className="trainer-auth-branding">
          <div className="trainer-branding-content">
            <div className="trainer-logo-large">
              <Dumbbell size={48} />
              <span>FitIQ</span>
            </div>
            <div className="trainer-badge">
              <Shield size={24} />
              <span>Trainer Portal</span>
            </div>
            <h1>Empower Your Members</h1>
            <p>Access your trainer dashboard to manage clients, create personalized workout plans, track progress, and deliver exceptional fitness guidance.</p>
            
            <div className="trainer-features-list">
              <div className="trainer-feature-item">
                <div className="trainer-feature-icon">✓</div>
                <span>Manage Client Profiles</span>
              </div>
              <div className="trainer-feature-item">
                <div className="trainer-feature-icon">✓</div>
                <span>Create Workout Plans</span>
              </div>
              <div className="trainer-feature-item">
                <div className="trainer-feature-icon">✓</div>
                <span>Design Diet Plans</span>
              </div>
              <div className="trainer-feature-item">
                <div className="trainer-feature-icon">✓</div>
                <span>Track Member Progress</span>
              </div>
              <div className="trainer-feature-item">
                <div className="trainer-feature-icon">✓</div>
                <span>Schedule Sessions</span>
              </div>
              <div className="trainer-feature-item">
                <div className="trainer-feature-icon">✓</div>
                <span>Real-time Analytics</span>
              </div>
            </div>

            <div className="trainer-stats-row">
              <div className="trainer-stat-item">
                <span className="trainer-stat-number">200+</span>
                <span className="trainer-stat-label">Active Clients</span>
              </div>
              <div className="trainer-stat-item">
                <span className="trainer-stat-number">1500+</span>
                <span className="trainer-stat-label">Workouts Created</span>
              </div>
              <div className="trainer-stat-item">
                <span className="trainer-stat-number">95%</span>
                <span className="trainer-stat-label">Success Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="trainer-auth-form-section">
          <div className="trainer-auth-card">
            {/* Header Badge */}
            <div className="trainer-header-badge">
              <Shield size={20} />
              <span>Trainer Login</span>
            </div>

            {/* Login Form */}
            <form className="trainer-auth-form" onSubmit={handleLogin} noValidate>
              <div className="trainer-form-header">
                <h2>Welcome Back, Coach!</h2>
                <p>Login to access your trainer dashboard</p>
              </div>

              <div className="trainer-form-group">
                <label>Email Address</label>
                <div className="trainer-input-wrapper">
                  <Mail size={20} />
                  <input
                    type="email"
                    placeholder="trainer@fitiq.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="trainer-form-group">
                <label>Password</label>
                <div className="trainer-input-wrapper">
                  <Lock size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="trainer-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="trainer-form-options">
                <label className="trainer-checkbox-label">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="trainer-forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="trainer-submit-btn">
                <span>Access Trainer Dashboard</span>
                <ArrowRight size={20} />
              </button>

              <div className="trainer-form-footer">
                <p>Need trainer access? <a href="#">Contact Admin</a></p>
              </div>
            </form>
          </div>

          {/* Security Badges */}
          <div className="trainer-trust-badges">
            <div className="trainer-badge-item">🔒 Secure Portal</div>
            <div className="trainer-badge-item">👨‍🏫 Verified Trainers Only</div>
            <div className="trainer-badge-item">💯 Data Protected</div>
          </div>

          {/* Member Login Link */}
          <div className="member-login-link">
            <p>Are you a member? <a href="#">Login to Member Portal</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerAuth;