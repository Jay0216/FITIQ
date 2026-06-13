import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginOwnerThunk } from '../redux/ownerSlice';
import type { RootState, AppDispatch } from '../redux/store';
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight, Crown } from 'lucide-react';
import './OwnerAuth.css';



const OwnerAuth: React.FC = () => {
  //const [showPassword, setShowPassword] = useState(false);

  // Form state
  //const [loginData, setLoginData] = useState({
    //email: '',
    //password: '',
    //rememberMe: false,
  //});

  //const handleLogin = (e: React.FormEvent) => {
    //e.preventDefault();
    //console.log('Owner Login:', loginData);
    // Add owner login logic here
  //};

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loading } = useSelector((state: RootState) => state.owner);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();



  // Basic validation
  if (!loginData.email || !loginData.password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    // Dispatch login thunk
    const resultAction = await dispatch(
      loginOwnerThunk({ email: loginData.email, password: loginData.password })
    );

    // If login failed
    if (loginOwnerThunk.rejected.match(resultAction)) {
      alert(resultAction.payload || "Login failed. Check your credentials.");
      return;
    }

    // Login successful
    alert("Login successful! Redirecting to dashboard...");
    navigate("/ownerdashboard"); // Redirect after success

  } catch (err) {
    alert("Unexpected error occurred. Please try again.");
    console.error(err);
  }
};

  return (
    <div className="owner-auth-page">
      {/* Background Elements */}
      <div className="owner-auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      {/* Auth Container */}
      <div className="owner-auth-container">
        {/* Left Side - Branding */}
        <div className="owner-auth-branding">
          <div className="owner-branding-content">
            <div className="owner-logo-large">
              <Dumbbell size={48} />
              <span>FitIQ</span>
            </div>
            <div className="owner-badge">
              <Crown size={24} />
              <span>Owner Dashboard</span>
            </div>
            <h1>Command Your Fitness Empire</h1>
            <p>Access your comprehensive admin dashboard to manage your entire gym operations, oversee staff, monitor revenue, and drive business growth.</p>
            
            <div className="owner-features-list">
              <div className="owner-feature-item">
                <div className="owner-feature-icon">✓</div>
                <span>Complete Business Analytics</span>
              </div>
              <div className="owner-feature-item">
                <div className="owner-feature-icon">✓</div>
                <span>Staff & Trainer Management</span>
              </div>
              <div className="owner-feature-item">
                <div className="owner-feature-icon">✓</div>
                <span>Member Oversight</span>
              </div>
              <div className="owner-feature-item">
                <div className="owner-feature-icon">✓</div>
                <span>Revenue & Financial Reports</span>
              </div>
              <div className="owner-feature-item">
                <div className="owner-feature-icon">✓</div>
                <span>Subscription Management</span>
              </div>
              <div className="owner-feature-item">
                <div className="owner-feature-icon">✓</div>
                <span>System Configuration</span>
              </div>
            </div>

            <div className="owner-stats-row">
              <div className="owner-stat-item">
                <span className="owner-stat-number">$125K</span>
                <span className="owner-stat-label">Monthly Revenue</span>
              </div>
              <div className="owner-stat-item">
                <span className="owner-stat-number">5,247</span>
                <span className="owner-stat-label">Total Members</span>
              </div>
              <div className="owner-stat-item">
                <span className="owner-stat-number">98%</span>
                <span className="owner-stat-label">Retention Rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="owner-auth-form-section">
          <div className="owner-auth-card">
            {/* Header Badge */}
            <div className="owner-header-badge">
              <Crown size={20} />
              <span>Owner Access</span>
            </div>

            {/* Login Form */}
            <form className="owner-auth-form" onSubmit={handleLogin} noValidate>
              <div className="owner-form-header">
                <h2>Welcome Back, Boss!</h2>
                <p>Login to access your admin dashboard</p>
              </div>

              <div className="owner-form-group">
                <label>Email Address</label>
                <div className="owner-input-wrapper">
                  <Mail size={20} />
                  <input
                    type="email"
                    placeholder="owner@fitiq.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="owner-form-group">
                <label>Password</label>
                <div className="owner-input-wrapper">
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
                    className="owner-toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="owner-form-options">
                <label className="owner-checkbox-label">
                  <input
                    type="checkbox"
                    checked={loginData.rememberMe}
                    onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#" className="owner-forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="owner-submit-btn">
                <span>Access Admin Dashboard</span>
                <ArrowRight size={20} />
              </button>

              <div className="owner-form-footer">
                <p>Need system support? <a href="#">Contact IT Support</a></p>
              </div>
            </form>
          </div>

          {/* Security Badges */}
          <div className="owner-trust-badges">
            <div className="owner-badge-item">🔒 Maximum Security</div>
            <div className="owner-badge-item">👑 Owner Access Only</div>
            <div className="owner-badge-item">🛡️ Encrypted Login</div>
          </div>

          {/* Other Login Links */}
          <div className="other-login-links">
            <p>Login as: <a href="#">Member</a> | <a href="#">Trainer</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerAuth;