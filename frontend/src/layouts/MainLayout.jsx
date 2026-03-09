import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const advocate = JSON.parse(localStorage.getItem('advocate') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('advocate');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'DASHBOARD' },
    { path: '/clients', label: 'CLIENTS' },
    { path: '/cases', label: 'CASES' },
    { path: '/documents', label: 'DOCUMENTS' },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-primary">
      {/* ── Top Navigation ── */}
      <nav className="bg-card border-b border-gold/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3v18M12 3l-8 6h16l-8-6zM4 9l2 8h2l-2-8M16 9l2 8h-2l-2-8M8 21h8M6 17h2M16 17h2" />
              </svg>
              <span className="font-extrabold text-sm tracking-[0.2em] text-white">
                MR. ADVOCATE
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[11px] font-bold tracking-[0.18em] px-4 py-5 border-b-2 transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-gold border-gold'
                      : 'text-slate-400 border-transparent hover:text-white hover:border-white/20'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* User & Logout */}
            <div className="flex items-center gap-4">
              {advocate?.name && (
                <div className="hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gold/15 text-gold flex items-center justify-center text-xs font-bold border border-gold/30">
                    {advocate.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-white leading-none">{advocate.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{advocate.email}</p>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-[10px] font-bold tracking-[0.15em] text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 border border-slate-700 rounded hover:border-red-400/50"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gold/10 px-4 py-2 flex gap-1 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[10px] font-bold tracking-[0.15em] px-3 py-2 rounded whitespace-nowrap transition-colors ${
                isActive(link.path)
                  ? 'bg-gold/15 text-gold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;
