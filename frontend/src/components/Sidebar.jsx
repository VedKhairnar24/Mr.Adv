import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Sidebar() {
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
    { path: "/dashboard", label: "Dashboard" },
    { path: "/clients", label: "Clients" },
    { path: "/cases", label: "Cases" },
    { path: "/hearings", label: "Hearings" },
    { path: "/documents", label: "Documents" },
    { path: "/notes", label: "Notes" },
    { path: "/settings", label: "Settings" },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="w-64 h-screen bg-[#0a1e2b] text-white fixed flex flex-col">
      <div className="p-6 border-b border-gold/20">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <span className="text-xl">⚖</span>
          <h1 className="text-lg font-extrabold text-gold group-hover:text-white transition-colors tracking-wide">
            Mr. Adv
          </h1>
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-4 text-sm flex-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`px-4 py-2.5 rounded-md font-semibold transition-all duration-200 ${
              isActive(link.path)
                ? "bg-gold/15 text-gold border-l-[3px] border-gold"
                : "text-white/80 hover:bg-white/10 hover:text-white border-l-[3px] border-transparent"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User info & Logout */}
      <div className="p-5 border-t border-gold/20">
        {advocate?.name && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gold/20 text-gold flex items-center justify-center text-sm font-bold border border-gold/40">
              {advocate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">{advocate.name}</p>
              <p className="text-[11px] text-white/50 mt-1">{advocate.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-xs font-bold tracking-wider text-white/60 hover:text-red-400 transition-colors px-3 py-2 border border-white/20 rounded hover:border-red-400/50 hover:bg-red-400/10"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
