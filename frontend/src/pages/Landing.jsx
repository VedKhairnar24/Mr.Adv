import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f2a37] text-white">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <div className="text-yellow-400 text-2xl">⚖</div>
          <h1 className="font-bold text-lg tracking-wide">
            MR. ADVOCATE
          </h1>
        </div>

        <div className="flex items-center gap-10 text-sm">
          <a href="#about" className="hover:text-[#c4a675] transition-colors">ABOUT</a>
          <a href="#services" className="hover:text-[#c4a675] transition-colors">SERVICES</a>
          <a href="#cases" className="hover:text-[#c4a675] transition-colors">CASES</a>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#c4a675] text-black px-5 py-2 font-semibold hover:bg-[#b8975f] transition-colors"
          >
            LOGIN
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="grid md:grid-cols-2 items-center px-10 py-16 gap-10">

        {/* Left Content */}
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            We Will Defend <br />
            Your Legal Rights
          </h1>

          <p className="text-gray-300 mb-8 max-w-md">
            Trusted legal expertise for individuals and businesses.
            We are committed to providing reliable counsel and
            defending your rights with dedication and integrity.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-[#c4a675] text-black px-6 py-3 font-semibold hover:bg-[#b8975f] transition-colors"
            >
              GET STARTED
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-[#c4a675] text-[#c4a675] px-6 py-3 font-semibold hover:bg-[#c4a675] hover:text-black transition-colors"
            >
              LOGIN
            </button>
          </div>
        </div>

        {/* Right — Hero Image / Illustration */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-md">
            {/* Decorative background circle */}
            <div className="absolute -top-6 -right-6 w-72 h-72 bg-[#c4a675]/10 rounded-full blur-2xl"></div>

            {/* Illustration card */}
            <div className="relative bg-[#1a3d4d] rounded-2xl p-10 shadow-2xl border border-[#c4a675]/20">
              {/* Scale of Justice SVG */}
              <svg viewBox="0 0 200 220" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Base */}
                <rect x="85" y="200" width="30" height="10" rx="2" fill="#c4a675" />
                <rect x="95" y="80" width="10" height="125" fill="#c4a675" />

                {/* Top beam */}
                <rect x="20" y="72" width="160" height="8" rx="4" fill="#c4a675" />

                {/* Center circle */}
                <circle cx="100" cy="76" r="14" fill="#0f2a37" stroke="#c4a675" strokeWidth="3" />
                <text x="100" y="81" textAnchor="middle" fill="#c4a675" fontSize="14" fontWeight="bold">⚖</text>

                {/* Left pan strings */}
                <line x1="40" y1="80" x2="25" y2="140" stroke="#c4a675" strokeWidth="2" />
                <line x1="40" y1="80" x2="55" y2="140" stroke="#c4a675" strokeWidth="2" />

                {/* Left pan */}
                <ellipse cx="40" cy="145" rx="30" ry="8" fill="#c4a675" opacity="0.8" />

                {/* Right pan strings */}
                <line x1="160" y1="80" x2="145" y2="130" stroke="#c4a675" strokeWidth="2" />
                <line x1="160" y1="80" x2="175" y2="130" stroke="#c4a675" strokeWidth="2" />

                {/* Right pan */}
                <ellipse cx="160" cy="135" rx="30" ry="8" fill="#c4a675" opacity="0.8" />

                {/* Decorative dots */}
                <circle cx="40" cy="50" r="3" fill="#c4a675" opacity="0.3" />
                <circle cx="160" cy="45" r="4" fill="#c4a675" opacity="0.2" />
                <circle cx="30" cy="170" r="2" fill="#c4a675" opacity="0.4" />
                <circle cx="170" cy="165" r="3" fill="#c4a675" opacity="0.3" />
              </svg>

              {/* Text below illustration */}
              <div className="text-center mt-6">
                <p className="text-[#c4a675] font-semibold text-lg">Justice & Integrity</p>
                <p className="text-gray-400 text-sm mt-1">Since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-gray-700 mt-10 px-10 py-6 flex justify-between text-gray-400 text-sm">
        <p>© 2026 Mr. Advocate. All rights reserved.</p>
        <p>Advocate Case Management System</p>
      </div>
    </div>
  );
}
