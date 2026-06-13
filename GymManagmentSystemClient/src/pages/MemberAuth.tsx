import React, { useState } from 'react';
import './MemberAuth.css';
import { Dumbbell, Mail, Lock, User, Phone, Calendar, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../redux/store';
import { login, register } from '../redux/memberSlice';
import type { RegisterMemberRequest, LoginMemberRequest } from '../API/memberAPI.ts';
import { useNavigate } from 'react-router';

type AuthMode = 'login' | 'register';

const MemberAuth: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.member);

  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState<LoginMemberRequest>({
    email: '',
    password: '',
  });

  const [registerData, setRegisterData] = useState<RegisterMemberRequest & { confirmPassword: string; agreeToTerms: boolean }>({
    fullname: '',
    phonenumber: '',
    email: '',
    dateofbirth: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  // ------------------ LOGIN ------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { email, password } = loginData;
    if (!email || !password) {
     alert('Please fill in all the fields.');
     return;
    }
    try {
      const resultAction = await dispatch(login(loginData));
      if (login.fulfilled.match(resultAction)) {
        alert('Login successful!');
        navigate('/memberdashboard');
      } else {
        alert('Login failed: ' + (resultAction.payload || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ REGISTER ------------------
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  // Check all fields filled
  const { fullname, phonenumber, email, dateofbirth, password, confirmPassword, agreeToTerms } = registerData;
  if (!fullname || !phonenumber || !email || !dateofbirth || !password || !confirmPassword) {
    alert('Please fill in all the fields.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  if (!agreeToTerms) {
    alert('You must agree to the Terms & Conditions.');
    return;
  }

  try {
    const payload: RegisterMemberRequest = {
      fullname,
      phonenumber,
      email,
      dateofbirth,
      password,
    };

    const resultAction = await dispatch(register(payload));
    if (register.fulfilled.match(resultAction)) {
      alert('Registration successful! Please login.');
      setMode('login');
    } else {
      const err = resultAction.payload as any;
      const msg = 'Registration failed. This User Already Exists';
      alert(msg);
    }
  } catch (err) {
    alert('An unexpected error occurred. Please try again.');
    console.error(err);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-pattern"></div>
      </div>

      <div className="auth-container">
        <div className="auth-branding">
          <div className="branding-content">
            <div className="logo-large">
              <Dumbbell size={48} />
              <span>FitIQ</span>
            </div>
            <h1>Transform Your Fitness Journey</h1>
            <p>Join thousands of members achieving their fitness goals with personalized training, nutrition plans, and expert guidance.</p>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Personal Training Sessions</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>AI-Powered Diet Plans</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>QR-Based Attendance</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <span>Progress Tracking</span>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">5000+</span>
                <span className="stat-label">Active Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Expert Trainers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-card">
            <div className="mode-switcher">
              <button
                className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => setMode('login')}
              >
                Login
              </button>
              <button
                className={`mode-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => setMode('register')}
              >
                Register
              </button>
              <div className={`mode-indicator ${mode === 'register' ? 'right' : ''}`}></div>
            </div>

            {loading && <p style={{ color: 'blue', textAlign: 'center' }}>Processing...</p>}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            {mode === 'login' && (
              <form className="auth-form" onSubmit={handleLogin} noValidate>
                <div className="form-header">
                  <h2>Welcome Back!</h2>
                  <p>Login to access your fitness dashboard</p>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={20} />
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <div className="input-wrapper">
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
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  <span>Login to Dashboard</span>
                  <ArrowRight size={20} />
                </button>

                <div className="form-footer">
                  <p>Don't have an account? <button type="button" onClick={() => setMode('register')}>Register now</button></p>
                </div>
              </form>
            )}

            {mode === 'register' && (
              <form className="auth-form" onSubmit={handleRegister} noValidate>
                <div className="form-header">
                  <h2>Create Account</h2>
                  <p>Start your fitness journey today getting 1 month free</p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                      <User size={20} />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={registerData.fullname}
                        onChange={(e) => setRegisterData({ ...registerData, fullname: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={20} />
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={registerData.phonenumber}
                        onChange={(e) => setRegisterData({ ...registerData, phonenumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={20} />
                    <input
                      type="email"
                      placeholder="your.email@example.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <div className="input-wrapper">
                    <Calendar size={20} />
                    <input
                      type="date"
                      value={registerData.dateofbirth}
                      onChange={(e) => setRegisterData({ ...registerData, dateofbirth: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-wrapper">
                      <Lock size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <div className="input-wrapper">
                      <Lock size={20} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm passw.."
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={registerData.agreeToTerms}
                      onChange={(e) => setRegisterData({ ...registerData, agreeToTerms: e.target.checked })}
                      required
                    />
                    <span>I agree to the <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a></span>
                  </label>
                </div>

                <button type="submit" className="submit-btn">
                  <span>Create Account</span>
                  <ArrowRight size={20} />
                </button>

                <div className="form-footer">
                  <p>Already have an account? <button type="button" onClick={() => setMode('login')}>Login here</button></p>
                </div>
              </form>
            )}
          </div>

          <div className="trust-badges">
            <div className="badge">🔒 Secure & Encrypted</div>
            <div className="badge">⚡ Instant Access</div>
            <div className="badge">💯 100% Privacy</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberAuth;