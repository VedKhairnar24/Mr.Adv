import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen flex justify-center items-center bg-primary px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card shadow-2xl rounded-lg p-8 border border-gold/10">
          {/* Gold scales icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-2 border-gold/30 flex items-center justify-center bg-primary">
              <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3v18M12 3l-8 6h16l-8-6zM4 9l2 8h2l-2-8M16 9l2 8h-2l-2-8M8 21h8M6 17h2M16 17h2" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-extrabold text-white text-center tracking-wide">MR. ADVOCATE</h1>
          <p className="text-slate-500 text-xs text-center mt-1 tracking-wider">CASE MANAGEMENT SYSTEM</p>

          <h2 className="text-lg font-bold text-white mt-8 mb-6 text-center">Sign In</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-white placeholder-slate-600 text-sm"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">PASSWORD</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-white placeholder-slate-600 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded font-bold text-sm tracking-wider transition-colors ${
                loading
                  ? 'bg-gold/40 cursor-not-allowed text-primary/60'
                  : 'bg-gold hover:bg-gold/85 text-primary'
              }`}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold hover:text-gold/80 font-semibold">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
