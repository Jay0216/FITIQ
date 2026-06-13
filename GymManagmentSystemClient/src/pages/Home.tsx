import React from "react";
import { Dumbbell, ArrowRight, QrCode, Zap } from "lucide-react";
import landingImage from "../assets/2150845530.jpg";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-page">

      {/* ── Background image ── */}
      <div
        className="home-bg-image"
        style={{ backgroundImage: `url(${landingImage})` }}
      />

      {/* ── Animated orbs ── */}
      <div className="home-orbs">
        <div className="home-orb home-orb-1" />
        <div className="home-orb home-orb-2" />
        <div className="home-orb home-orb-3" />
      </div>

      {/* ── Grid texture ── */}
      <div className="home-grid" />

      {/* ── Navbar ── */}
      <nav className="home-nav">
        <a href="/" className="home-nav-logo">
          <div className="home-nav-logo-icon">
            <Dumbbell size={22} />
          </div>
          <span>FitIQ</span>
        </a>

        <div className="home-nav-links">
          <a href="#" className="home-nav-link">Features</a>
          <a href="#" className="home-nav-link">For Members</a>
          <a href="#" className="home-nav-link">For Trainers</a>
          <a href="#" className="home-nav-link">Pricing</a>
        </div>

        <div className="home-nav-cta">
          <a href="/trainerauth" className="home-btn-ghost">Trainer Login</a>
          <a href="/memberauth" className="home-btn-primary">Get Started</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="home-hero">
        <div className="home-hero-inner">

          {/* Badge */}
          <div className="home-hero-badge">
            <span className="home-hero-badge-dot" />
            Smart Gym Management Platform
          </div>

          {/* Heading */}
          <h1 className="home-hero-heading">
            <span className="home-hero-heading-accent">FitIQ</span>
            <br />
            Scan. Track. Achieve.
          </h1>

          {/* Subtext */}
          <p className="home-hero-sub">
            Your all-in-one fitness hub — QR, Fingerprint attendance, personalised workout &amp; diet plans,
            trainer sessions, and real-time progress tracking.
          </p>

          {/* CTA buttons */}
          <div className="home-hero-actions">
            <a href="/memberauth" className="home-btn-hero-primary">
              Start Your Journey
              <ArrowRight size={18} />
            </a>
            <a href="/trainerauth" className="home-btn-hero-secondary">
              <Zap size={18} />
              Trainer Portal
            </a>
          </div>

        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="home-stats">
        <div className="home-stat-item">
          <span className="home-stat-number">5,000+</span>
          <span className="home-stat-label">Active Members</span>
        </div>
        <div className="home-stat-item">
          <span className="home-stat-number">50+</span>
          <span className="home-stat-label">Expert Trainers</span>
        </div>
        <div className="home-stat-item">
          <span className="home-stat-number">4.9 ★</span>
          <span className="home-stat-label">Member Rating</span>
        </div>
      </div>

    </div>
  );
};

export default Home;