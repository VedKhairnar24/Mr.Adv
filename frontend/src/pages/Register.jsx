import { useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import '../styles/auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

function LayeredLogoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ScalesOfJustice() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <rect x="97" y="60" width="6" height="110" fill="#c8a84b" rx="2" />
      <rect x="72" y="167" width="56" height="8" fill="#c8a84b" rx="2" />
      <rect x="30" y="78" width="140" height="5" fill="#c8a84b" rx="2" />
      <circle cx="100" cy="80" r="16" fill="#0d1a17" stroke="#c8a84b" strokeWidth="2" />
      <circle cx="100" cy="80" r="9" fill="#c8a84b" opacity="0.9" />
      <line x1="54" y1="83" x2="45" y2="123" stroke="#c8a84b" strokeWidth="2" />
      <line x1="70" y1="83" x2="54" y2="123" stroke="#c8a84b" strokeWidth="2" />
      <ellipse cx="39" cy="130" rx="24" ry="7" fill="#c8a84b" />
      <line x1="130" y1="83" x2="152" y2="110" stroke="#c8a84b" strokeWidth="2" />
      <line x1="146" y1="83" x2="162" y2="110" stroke="#c8a84b" strokeWidth="2" />
      <ellipse cx="161" cy="116" rx="20" ry="6" fill="#c8a84b" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="auth-spinner" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="none" strokeWidth="2" />
    </svg>
  );
}

function strengthFromPassword(password) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 10) score += 1;
  return Math.min(score, 4);
}

function strengthClass(score) {
  if (score <= 1) return 'weak';
  if (score === 2) return 'fair';
  if (score === 3) return 'good';
  return 'strong';
}

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [buttonShake, setButtonShake] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    barCouncilNo: '',
    password: '',
    confirmPassword: '',
    terms: false
  });

  const passwordStrength = useMemo(() => strengthFromPassword(form.password), [form.password]);
  const passwordStrengthColor = useMemo(() => strengthClass(passwordStrength), [passwordStrength]);
  const confirmHasValue = form.confirmPassword.length > 0;
  const passwordsMatch = form.password === form.confirmPassword;

  const validateField = (name, value) => {
    if (name === 'name') {
      if (!value.trim()) return 'Please enter your full name';
      if (value.trim().length < 2) return 'Full name must be at least 2 characters';
    }

    if (name === 'email') {
      if (!value.trim()) return 'Please enter your email';
      if (!emailRegex.test(value.trim())) return 'Please enter a valid email';
    }

    if (name === 'phone') {
      const normalized = value.replace(/\D/g, '');
      if (!normalized) return 'Please enter your phone number';
      if (!phoneRegex.test(normalized)) return 'Phone number must be 10 digits';
    }

    if (name === 'password') {
      if (!value) return 'Please create a password';
      if (value.length < 6) return 'Password must be at least 6 characters';
    }

    if (name === 'confirmPassword') {
      if (!value) return 'Please confirm your password';
      if (value !== form.password) return "Passwords don't match";
    }

    if (name === 'terms' && !value) {
      return 'Please accept Terms of Service and Privacy Policy';
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setForm({
      ...form,
      [name]: nextValue
    });

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, nextValue)
      }));
    }

    if (name === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField('confirmPassword', form.confirmPassword)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, nextValue)
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      phone: validateField('phone', form.phone),
      password: validateField('password', form.password),
      confirmPassword: validateField('confirmPassword', form.confirmPassword),
      terms: validateField('terms', form.terms)
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      email: true,
      phone: true,
      barCouncilNo: true,
      password: true,
      confirmPassword: true,
      terms: true
    });

    if (!form.terms) {
      setButtonShake(true);
      setTimeout(() => setButtonShake(false), 400);
    }

    if (!validateForm()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone
      });

      toast.success('Registration successful! Please login.');

      setTimeout(() => {
        navigate('/login', { state: { from: 'register' } });
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  const formEnterClass = location.state?.from === 'login' ? 'auth-enter-right' : 'auth-enter-left';

  return (
    <div className="auth-page register-page auth-transition-enter">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-noise" aria-hidden="true" />

      <section className="auth-left register-left">
        <div className="auth-left-content">
          <div className="scales-wrap">
            <ScalesOfJustice />
          </div>
          <p className="register-left-title">Join the modern way to manage your practice.</p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M3 7h6l2 2h10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
                </svg>
              </div>
              <div>
                <p className="feature-title">Case Management</p>
                <p className="feature-sub">Organize all your cases in one place</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <line x1="16" y1="3" x2="16" y2="7" />
                  <line x1="8" y1="3" x2="8" y2="7" />
                  <line x1="3" y1="11" x2="21" y2="11" />
                </svg>
              </div>
              <div>
                <p className="feature-title">Hearing Tracker</p>
                <p className="feature-sub">Never miss a court date again</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
              </div>
              <div>
                <p className="feature-title">Document Storage</p>
                <p className="feature-sub">Secure cloud storage for legal files</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="feature-title">Client Records</p>
                <p className="feature-sub">Complete client contact management</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <div className={`auth-form-wrap ${formEnterClass}`}>
          <div className="auth-logo-row">
            <div className="auth-logo-box" aria-hidden="true">
              <LayeredLogoIcon />
            </div>
            <div className="auth-brand">
              <p className="auth-brand-name">Mr. Advocate</p>
              <p className="auth-brand-sub">Create Your Account</p>
            </div>
          </div>

          <div className="auth-title-block">
            <h1 className="auth-title">Register</h1>
            <p className="auth-subtitle">Create your advocate account to get started</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="register-grid">
              <div className="auth-field auth-field-tight field-full">
                <label className="auth-label" htmlFor="name">FULL NAME</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your full name"
                  className={`auth-input ${errors.name ? 'is-error' : ''}`}
                  autoComplete="name"
                />
                {errors.name ? <p className="auth-error">{errors.name}</p> : null}
              </div>

              <div className="auth-field auth-field-tight field-full">
                <label className="auth-label" htmlFor="email">EMAIL ADDRESS</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={`auth-input ${errors.email ? 'is-error' : ''}`}
                  autoComplete="email"
                />
                {errors.email ? <p className="auth-error">{errors.email}</p> : null}
              </div>

              <div className="auth-field auth-field-tight field-half">
                <label className="auth-label" htmlFor="phone">PHONE NUMBER</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter phone number"
                  className={`auth-input ${errors.phone ? 'is-error' : ''}`}
                  autoComplete="tel"
                />
                {errors.phone ? <p className="auth-error">{errors.phone}</p> : null}
              </div>

              <div className="auth-field auth-field-tight field-half">
                <label className="auth-label" htmlFor="barCouncilNo">BAR COUNCIL NO.</label>
                <input
                  id="barCouncilNo"
                  type="text"
                  name="barCouncilNo"
                  value={form.barCouncilNo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. MH/1234/2020"
                  className="auth-input"
                />
              </div>

              <div className="auth-field auth-field-tight field-half">
                <label className="auth-label" htmlFor="password">PASSWORD</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a password"
                  className={`auth-input ${errors.password ? 'is-error' : ''}`}
                  autoComplete="new-password"
                />
                {errors.password ? <p className="auth-error">{errors.password}</p> : null}
                <div className="strength-bars" aria-label="Password strength">
                  {[0, 1, 2, 3].map((idx) => (
                    <span
                      key={idx}
                      className={`strength-bar ${idx < passwordStrength ? `filled ${passwordStrengthColor}` : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="auth-field auth-field-tight field-half">
                <label className="auth-label" htmlFor="confirmPassword">CONFIRM PASSWORD</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Confirm your password"
                  className={`auth-input ${errors.confirmPassword ? 'is-error' : ''}`}
                  autoComplete="new-password"
                />
                {errors.confirmPassword ? <p className="auth-error">{errors.confirmPassword}</p> : null}
                {confirmHasValue ? (
                  <p className={`match-indicator ${passwordsMatch ? 'ok' : 'bad'}`}>
                    {passwordsMatch ? '✓ Passwords match' : "✗ Passwords don't match"}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="terms-wrap">
              <input
                id="terms"
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                onBlur={handleBlur}
                className="terms-box"
              />
              <label htmlFor="terms" className="terms-text">
                I agree to the{' '}
                <a href="#" className="auth-link">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="auth-link">Privacy Policy</a>
              </label>
            </div>
            {errors.terms ? <p className="auth-error" style={{ marginBottom: 16 }}>{errors.terms}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className={`auth-cta ${buttonShake ? 'is-shaking' : ''}`}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Creating account...
                </>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="auth-link-row register-signin">
            <p>
              Already have an account?{' '}
              <Link to="/login" state={{ from: 'register' }} className="auth-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Register;
