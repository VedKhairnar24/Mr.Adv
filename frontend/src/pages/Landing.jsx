import { useNavigate } from "react-router-dom";
import brandLogo from './img/Mr.Adv logo.png';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/landing.css';

export default function Landing() {
  const navigate = useNavigate();

  const practiceAreas = [
    "Civil Law",
    "Criminal Defense",
    "Family Court",
    "Corporate Legal",
    "Property Disputes",
    "Labour Matters",
    "High Court Advocacy",
    "Arbitration"
  ];

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--white)' }}>
      {/* ────── NAVBAR ────── */}
      <nav 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          background: 'rgba(10, 18, 16, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 60px',
          zIndex: 100,
          animation: 'fadeDown 0.7s ease-out'
        }}
      >
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '1.5px solid var(--gold)',
              borderRadius: '3px',
              background: 'var(--gold-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.5"
            >
              <rect x="4" y="6" width="16" height="12" rx="1.5" />
              <path d="M8 6V4M16 6V4M8 18V20M16 18V20M4 10h16" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', gap: '2px', fontFamily: "'Cormorant Garamond', serif", fontSize: '21px', fontWeight: 600 }}>
            <span style={{ color: 'var(--white)' }}>Mr.</span>
            <span style={{ color: 'var(--gold)' }}>Adv</span>
          </div>
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {['ABOUT', 'SERVICES', 'CASES'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                textDecoration: 'none',
                paddingBottom: '2px',
                background: `linear-gradient(to right, var(--gold) 0%, var(--gold) 0%, transparent 0%) no-repeat bottom`,
                backgroundSize: '0 1px',
                transition: 'background-size 200ms ease',
                fontFamily: "'Rajdhani', sans-serif"
              }}
              onMouseEnter={e => {
                e.target.style.backgroundSize = '100% 1px';
                e.target.style.color = 'var(--white)';
              }}
              onMouseLeave={e => {
                e.target.style.backgroundSize = '0 1px';
                e.target.style.color = 'var(--muted)';
              }}
            >
              {link}
            </a>
          ))}
          <ThemeToggle />
          <button
            onClick={() => navigate("/login")}
            style={{
              background: 'transparent',
              border: '1.5px solid var(--gold)',
              color: 'var(--gold)',
              padding: '7px 20px',
              borderRadius: '2px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '2.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: "'Rajdhani', sans-serif",
              transition: 'all 200ms ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'var(--gold)';
              e.target.style.color = 'var(--bg)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = 'var(--gold)';
            }}
          >
            LOGIN
          </button>
        </div>
      </nav>

      {/* ────── HERO SECTION ────── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          padding: '120px 60px 80px',
          maxWidth: '1400px',
          margin: '0 auto',
          minHeight: '100vh',
          marginTop: '64px',
          gap: '64px'
        }}
      >
        {/* LEFT COLUMN */}
        <div style={{ animation: 'fadeLeft 0.9s ease-out 0.3s both' }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '30px', height: '1px', background: 'var(--gold)' }}></div>
            <span
              style={{
                fontSize: '10px',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: 700,
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: 'var(--gold)'
              }}
            >
              Trusted Legal Counsel
            </span>
          </div>

          {/* H1 */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(50px, 5.5vw, 78px)',
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '-1px',
              marginBottom: '24px'
            }}
          >
            <span style={{ color: 'var(--white)' }}>We Will Defend</span>
            <br />
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: 'var(--gold)' }}>Your Legal</span>
            <br />
            <span style={{ color: 'var(--white)' }}>Rights</span>
          </h1>

          {/* Description */}
          <p
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.7,
              color: 'var(--muted)',
              maxWidth: '460px',
              marginBottom: '32px'
            }}
          >
            Trusted legal expertise for individuals and businesses. We are committed to providing reliable counsel and defending your rights with dedication and integrity.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '56px' }}>
            <button
              onClick={() => navigate("/register")}
              className="btn-primary"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
              }}
            >
              Get Started →
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-ghost"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
              }}
            >
              Login
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              paddingTop: '36px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '36px'
            }}
          >
            {[
              { value: '500+', label: 'Cases Won' },
              { value: '15+', label: 'Years Active' },
              { value: '98%', label: 'Success Rate' }
            ].map((stat, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                {idx > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '-18px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '1px',
                      height: '40px',
                      background: 'var(--border)'
                    }}
                  ></div>
                )}
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 700, color: 'var(--gold)', marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'var(--muted)'
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ animation: 'fadeRight 0.9s ease-out 0.5s both' }}>
          <div
            style={{
              maxWidth: '440px',
              position: 'relative',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '40px',
              margin: '0 auto'
            }}
            className="card"
          >
            {/* Corner Brackets */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '20px',
                height: '20px',
                borderTop: '1px solid var(--gold)',
                borderLeft: '1px solid var(--gold)',
                opacity: 0.4
              }}
            ></div>
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '20px',
                height: '20px',
                borderBottom: '1px solid var(--gold)',
                borderRight: '1px solid var(--gold)',
                opacity: 0.4
              }}
            ></div>

            {/* Glow Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle 200px at 50% 30%, rgba(200,168,75,0.08) 0%, transparent 70%)',
                borderRadius: '4px',
                pointerEvents: 'none'
              }}
            ></div>

            {/* Scales SVG */}
            <svg
              viewBox="0 0 220 240"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '220px',
                margin: '0 auto',
                animation: 'scalesSway 8s ease-in-out infinite',
                filter: 'drop-shadow(0 0 25px rgba(200,168,75,0.2))'
              }}
            >
              {/* Scales of Justice */}
              {/* Pole */}
              <rect x="100" y="80" width="8" height="130" fill="var(--gold)" />
              {/* Horizontal Beam */}
              <rect x="30" y="78" width="160" height="6" rx="3" fill="var(--gold)" />
              {/* Center Circle */}
              <circle cx="110" cy="81" r="12" fill="var(--surface)" stroke="var(--gold)" strokeWidth="2" />
              <circle cx="110" cy="81" r="5" fill="var(--gold)" opacity="0.6" />

              {/* Left Pan */}
              <g>
                <line x1="60" y1="80" x2="50" y2="140" stroke="var(--gold)" strokeWidth="1.5" />
                <line x1="60" y1="80" x2="70" y2="140" stroke="var(--gold)" strokeWidth="1.5" />
                <ellipse cx="60" cy="145" rx="25" ry="6" fill="var(--gold)" opacity="0.7" />
              </g>

              {/* Right Pan */}
              <g>
                <line x1="160" y1="80" x2="150" y2="125" stroke="var(--gold)" strokeWidth="1.5" />
                <line x1="160" y1="80" x2="170" y2="125" stroke="var(--gold)" strokeWidth="1.5" />
                <ellipse cx="160" cy="130" rx="25" ry="6" fill="var(--gold)" opacity="0.5" />
              </g>

              {/* Decorative circles */}
              <circle cx="45" cy="60" r="2" fill="var(--gold)" opacity="0.15" />
              <circle cx="175" cy="55" r="3" fill="var(--gold)" opacity="0.1" />
              <circle cx="35" cy="180" r="1.5" fill="var(--gold)" opacity="0.2" />
              <circle cx="185" cy="175" r="2" fill="var(--gold)" opacity="0.15" />
            </svg>

            {/* Footer Section */}
            <div
              style={{
                borderTop: '1px solid var(--border)',
                paddingTop: '20px',
                marginTop: '24px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '20px',
                  fontWeight: 600,
                  color: 'var(--white)',
                  marginBottom: '4px'
                }}
              >
                Justice & Integrity
              </div>
              <div
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: 'var(--gold)'
                }}
              >
                Since 2024
              </div>
            </div>

            {/* Floating Badge */}
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '-14px',
                background: 'var(--gold)',
                color: 'var(--bg)',
                padding: '6px 14px',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
                fontFamily: "'Rajdhani', sans-serif",
                boxShadow: '0 4px 16px rgba(200, 168, 75, 0.25)'
              }}
            >
              Est. 2024
            </div>
          </div>
        </div>
      </section>

      {/* ────── TICKER STRIP ────── */}
      <section
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg2)',
          padding: '12px 0',
          overflow: 'hidden',
          animation: 'fadeDown 0.9s ease-out 0.7s both'
        }}
      >
        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .ticker-content {
            display: flex;
            gap: 0;
            animation: tickerScroll 28s linear infinite;
            white-space: nowrap;
          }
          .ticker-item {
            flex-shrink: 0;
            padding: 0 44px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .ticker-item::before {
            content: '';
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: var(--gold);
          }
        `}</style>
        <div className="ticker-content">
          {[...practiceAreas, ...practiceAreas].map((area, idx) => (
            <div key={idx} className="ticker-item" style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {area}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
