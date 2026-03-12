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
    { path: "/settings", label: "Settings" },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div className="w-64 h-screen bg-[#0f2a37] text-white fixed flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-[#c4a675]">
          ⚖ Advocate System
        </h1>
      </div>

      <nav className="flex flex-col gap-2 p-6 text-sm flex-1">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`p-2 rounded transition-colors ${
              isActive(link.path)
                ? "bg-[#1c3d4d] text-[#c4a675]"
                : "hover:bg-[#1c3d4d]"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* User info & Logout */}
      <div className="p-6 border-t border-gray-700">
        {advocate?.name && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded bg-[#c4a675]/20 text-[#c4a675] flex items-center justify-center text-xs font-bold border border-[#c4a675]/30">
              {advocate.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-none">{advocate.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{advocate.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-xs font-bold tracking-wider text-gray-400 hover:text-red-400 transition-colors px-3 py-2 border border-gray-600 rounded hover:border-red-400/50"
        >
          LOGOUT
        </button>
      </div>
    </div>
  );
}
