import { useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/auth.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LayeredLogoIcon() {
  const isDarkMode = !document.documentElement.classList.contains('light-theme');
  const strokeColor = isDarkMode ? '#f0ebe0' : '#2a2620';
  
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" stroke={strokeColor} strokeWidth="1.5" fill="none">
      <path d="M12 3L2 8l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function ScalesOfJustice() {
  const isDarkMode = !document.documentElement.classList.contains('light-theme');
  const goldColor = isDarkMode ? '#c8a84b' : '#b8920f';
  const bgColor = isDarkMode ? '#0d1a17' : '#fafaf7';
  
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <rect x="97" y="60" width="6" height="110" fill={goldColor} rx="2" />
      <rect x="72" y="167" width="56" height="8" fill={goldColor} rx="2" />
      <rect x="30" y="78" width="140" height="5" fill={goldColor} rx="2" />
      <circle cx="100" cy="80" r="16" fill={bgColor} stroke={goldColor} strokeWidth="2" />
      <circle cx="100" cy="80" r="9" fill={goldColor} opacity="0.9" />
      <line x1="54" y1="83" x2="45" y2="123" stroke={goldColor} strokeWidth="2" />
      <line x1="70" y1="83" x2="54" y2="123" stroke={goldColor} strokeWidth="2" />
      <ellipse cx="39" cy="130" rx="24" ry="7" fill={goldColor} />
      <line x1="130" y1="83" x2="152" y2="110" stroke={goldColor} strokeWidth="2" />
      <line x1="146" y1="83" x2="162" y2="110" stroke={goldColor} strokeWidth="2" />
      <ellipse cx="161" cy="116" rx="20" ry="6" fill={goldColor} />
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

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value.trim()) {
        return 'Please enter your email';
      }
      if (!emailRegex.test(value.trim())) {
        return 'Please enter a valid email';
      }
    }

    if (name === 'password' && !value) {
      return 'Please enter your password';
    }

    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const validateForm = () => {
    const nextErrors = {
      email: validateField('email', form.email),
      password: validateField('password', form.password)
    };

    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true });
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/login', form);
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('advocate', JSON.stringify(res.data.advocate));
      
      toast.success('Login successful!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  const canSubmit = useMemo(
    () => emailRegex.test(form.email.trim()) && form.password.length > 0,
    [form.email, form.password]
  );

  const formEnterClass = location.state?.from === 'register' ? 'auth-enter-left' : 'auth-enter-left';

  return (
    <div className="auth-page auth-transition-enter">
      <div className="auth-blob auth-blob-1" aria-hidden="true" />
      <div className="auth-blob auth-blob-2" aria-hidden="true" />
      <div className="auth-noise" aria-hidden="true" />
      
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100 }}>
        <ThemeToggle />
      </div>

      <section className="auth-left">
        <div className="auth-left-content">
          <div className="scales-wrap">
            <ScalesOfJustice />
          </div>
          <p className="auth-quote">"The first duty of society is justice."</p>
          <p className="auth-attribution">- Alexander Hamilton</p>
          <div className="auth-divider-line" />
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
              <p className="auth-brand-sub">Case Management System</p>
            </div>
          </div>

          <div className="auth-title-block">
            <h1 className="auth-title">Sign In</h1>
            <p className="auth-subtitle">Access your legal practice dashboard</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
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

            <div className="auth-field" style={{ marginBottom: 8 }}>
              <label className="auth-label" htmlFor="password">PASSWORD</label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={`auth-input ${errors.password ? 'is-error' : ''}`}
                autoComplete="current-password"
              />
              {errors.password ? <p className="auth-error">{errors.password}</p> : null}
              <a className="auth-forgot" href="#">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="auth-cta"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-divider" aria-hidden="true">
            <div className="auth-divider-line-half" />
            <span className="auth-divider-text">Or</span>
            <div className="auth-divider-line-half" />
          </div>

          <div className="auth-link-row">
            <p>
              Don't have an account?{' '}
              <Link to="/register" state={{ from: 'login' }} className="auth-link">
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
