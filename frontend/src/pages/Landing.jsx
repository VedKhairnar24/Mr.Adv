import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary text-white">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-gold/10">
        <div className="flex items-center gap-2.5">
          <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3v18M12 3l-8 6h16l-8-6zM4 9l2 8h2l-2-8M16 9l2 8h-2l-2-8M8 21h8M6 17h2M16 17h2" />
          </svg>
          <h1 className="font-extrabold text-sm tracking-[0.2em]">
            MR. ADVOCATE
          </h1>
        </div>

        <div className="flex items-center gap-8 text-[11px] font-bold tracking-[0.18em]">
          <a href="#about" className="text-slate-400 hover:text-gold transition-colors">ABOUT</a>
          <a href="#services" className="text-slate-400 hover:text-gold transition-colors">SERVICES</a>
          <a href="#cases" className="text-slate-400 hover:text-gold transition-colors">CASES</a>
          <button
            onClick={() => navigate("/login")}
            className="bg-gold text-primary px-5 py-2 rounded font-bold tracking-[0.12em] hover:bg-gold/85 transition-colors"
          >
            LOGIN
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="grid md:grid-cols-2 items-center px-10 py-20 gap-12 max-w-7xl mx-auto">

        {/* Left Content */}
        <div>
          <p className="text-gold text-[11px] font-bold tracking-[0.25em] mb-4">TRUSTED LEGAL COUNSEL</p>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            We Will Defend <br />
            Your Legal Rights
          </h1>

          <p className="text-slate-400 mb-10 max-w-md leading-relaxed">
            Trusted legal expertise for individuals and businesses.
            We are committed to providing reliable counsel and
            defending your rights with dedication and integrity.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-gold text-primary px-7 py-3 rounded font-bold text-sm tracking-[0.1em] hover:bg-gold/85 transition-colors"
            >
              GET STARTED
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-gold text-gold px-7 py-3 rounded font-bold text-sm tracking-[0.1em] hover:bg-gold hover:text-primary transition-all duration-200"
            >
              LOGIN
            </button>
          </div>
        </div>

        {/* Right — Illustration */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Decorative glow */}
            <div className="absolute -top-8 -right-8 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>

            {/* Illustration card */}
            <div className="relative bg-card rounded-2xl p-10 shadow-2xl border border-gold/15">
              {/* Scale of Justice SVG */}
              <svg viewBox="0 0 200 220" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="85" y="200" width="30" height="10" rx="2" fill="#C4A47C" />
                <rect x="95" y="80" width="10" height="125" fill="#C4A47C" />
                <rect x="20" y="72" width="160" height="8" rx="4" fill="#C4A47C" />
                <circle cx="100" cy="76" r="14" fill="#0D2329" stroke="#C4A47C" strokeWidth="3" />
                <text x="100" y="81" textAnchor="middle" fill="#C4A47C" fontSize="14" fontWeight="bold">⚖</text>
                <line x1="40" y1="80" x2="25" y2="140" stroke="#C4A47C" strokeWidth="2" />
                <line x1="40" y1="80" x2="55" y2="140" stroke="#C4A47C" strokeWidth="2" />
                <ellipse cx="40" cy="145" rx="30" ry="8" fill="#C4A47C" opacity="0.8" />
                <line x1="160" y1="80" x2="145" y2="130" stroke="#C4A47C" strokeWidth="2" />
                <line x1="160" y1="80" x2="175" y2="130" stroke="#C4A47C" strokeWidth="2" />
                <ellipse cx="160" cy="135" rx="30" ry="8" fill="#C4A47C" opacity="0.8" />
                <circle cx="40" cy="50" r="3" fill="#C4A47C" opacity="0.2" />
                <circle cx="160" cy="45" r="4" fill="#C4A47C" opacity="0.15" />
                <circle cx="30" cy="170" r="2" fill="#C4A47C" opacity="0.25" />
                <circle cx="170" cy="165" r="3" fill="#C4A47C" opacity="0.2" />
              </svg>

              <div className="text-center mt-6">
                <p className="text-gold font-bold text-lg tracking-wide">Justice & Integrity</p>
                <p className="text-slate-500 text-sm mt-1">Since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="border-t border-slate-800 mt-10 px-10 py-6 flex justify-between text-slate-500 text-xs tracking-wide">
        <p>© 2026 Mr. Advocate. All rights reserved.</p>
        <p>Advocate Case Management System</p>
      </div>
    </div>
  );
}
