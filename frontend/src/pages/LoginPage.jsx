import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  LogOut,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.jsx';
import { formatDate } from '../lib/format.js';

export default function LoginPage() {
  const { user, login, register, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Target to redirect after successful login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(cleanEmail, password);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => navigate(from, { replace: true }), 400);
      } else {
        await register(cleanEmail, password, name.trim());
        setSuccessMsg('Account created successfully! Welcome to SatarkSetu.');
        setTimeout(() => navigate(from, { replace: true }), 400);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  // If already authenticated, show user profile card
  if (user && !authLoading) {
    return (
      <div className="login-page-container">
        <motion.div
          className="form-card glass login-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="login-avatar-glow">
            <User size={36} />
          </div>

          <div className="login-card-header">
            <h2>Welcome, {user.name}</h2>
            <span className="chip" style={{ '--c': 'var(--teal)' }}>
              <ShieldCheck size={14} /> Account Active
            </span>
          </div>

          <div className="user-details-box">
            <div className="user-detail-row">
              <span className="user-detail-label">Email address</span>
              <span className="user-detail-value mono">{user.email}</span>
            </div>
            <div className="user-detail-row">
              <span className="user-detail-label">Display name</span>
              <span className="user-detail-value">{user.name}</span>
            </div>
            {user.createdAt && (
              <div className="user-detail-row">
                <span className="user-detail-label">Member since</span>
                <span className="user-detail-value">{formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>

          <div className="login-profile-actions">
            <Link to="/report" className="btn btn-primary">
              <ShieldAlert size={16} /> Report a Scam
            </Link>
            <Link to="/alerts" className="btn btn-ghost">
              Browse Alerts
            </Link>
            <button
              onClick={() => logout()}
              className="btn btn-danger"
              style={{ marginLeft: 'auto' }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="login-page-container">
      <motion.div
        className="form-card glass login-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="login-icon-badge">
          <ShieldCheck size={32} />
        </div>

        <div className="login-header-text">
          <h2>{mode === 'login' ? 'Sign in to SatarkSetu' : 'Create an Account'}</h2>
          <p>
            {mode === 'login'
              ? 'Access community scam alerts and report anonymously with your account.'
              : 'Sign up securely with just your email and password. No Google or third-party tracking.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccessMsg('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccessMsg('');
            }}
          >
            Create Account
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              className="form-error auth-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              className="form-success auth-success"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <motion.label
              className="field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <span>Display Name or Alias (optional)</span>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Aman, Priya or Anonymous Citizen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={submitting}
                  autoComplete="name"
                />
              </div>
            </motion.label>
          )}

          <label className="field">
            <span>
              Email Address <b>*</b>
            </span>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                autoComplete="email"
              />
            </div>
          </label>

          <label className="field">
            <span>
              Password <b>*</b>
            </span>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="icon-btn-ghost password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {mode === 'register' && (
              <small className="field-hint">Must be at least 6 characters</small>
            )}
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit-btn"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="spin" />
                {mode === 'login' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-card-foot">
          <p>
            {mode === 'login' ? "Don't have an account yet?" : 'Already have an account?'}
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
                setSuccessMsg('');
              }}
            >
              {mode === 'login' ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
