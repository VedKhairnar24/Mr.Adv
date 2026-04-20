import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ThemeToggle from "./ThemeToggle";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 18c0-2.8 2.2-4.5 5.5-4.5S14.5 15.2 14.5 18" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M14.5 18c.2-2 1.6-3.4 4.2-3.8" />
    </svg>
  );
}

function CasesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7.5h7l2 2H21v8.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M3 7.5v-1.5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v1.5" />
    </svg>
  );
}

function HearingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h3M8 17h6" />
    </svg>
  );
}

function DocumentsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function NotesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20l4.5-1 9.8-9.8a1.8 1.8 0 0 0 0-2.5l-1-1a1.8 1.8 0 0 0-2.5 0L5 15.5z" />
      <path d="M13.5 6.5l4 4M4 20h16" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0L4.3 17.8a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H3.5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1.4-1.4a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.4 1.4a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const advocate = JSON.parse(localStorage.getItem("advocate") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("advocate");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
    { path: "/clients", label: "Clients", icon: ClientsIcon },
    { path: "/cases", label: "Cases", icon: CasesIcon },
    { path: "/hearings", label: "Hearings", icon: HearingsIcon },
    { path: "/documents", label: "Documents", icon: DocumentsIcon },
    { path: "/notes", label: "Notes", icon: NotesIcon },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const displayName = (advocate?.name || "ved khairnar").toLowerCase();
  const displayEmail = advocate?.email || "ved@test.com";
  const avatarInitial = (displayName?.charAt(0) || "V").toUpperCase();

  return (
    <aside className={`sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand">
          <span className="sidebar-logo-box" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="4" y="6" width="16" height="12" rx="1.5" />
              <path d="M8 6V4M16 6V4M8 18V20M16 18V20M4 10h16" strokeLinecap="round" />
            </svg>
          </span>
          <span className={`sidebar-brand-name ${collapsed ? "hidden-text" : ""}`}>
            <span className="brand-white">Mr.</span>
            <span className="brand-gold">Adv</span>
          </span>
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          <ThemeToggle />
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-item ${active ? "active" : ""} ${collapsed ? "collapsed-item" : ""}`}
              title={collapsed ? link.label : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className={`nav-label ${collapsed ? "hidden-text" : ""}`}>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">{avatarInitial}</div>
          <div className={`user-info ${collapsed ? "hidden-text" : ""}`}>
            <p className="user-name">{displayName}</p>
            <p className="user-email">{displayEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className={`btn-logout ${collapsed ? "collapsed-logout" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <span className="logout-icon" aria-hidden="true">
            <LogoutIcon />
          </span>
          <span className={`${collapsed ? "hidden-text" : ""}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
