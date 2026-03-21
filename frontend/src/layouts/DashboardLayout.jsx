import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
        setCollapsed(tablet);
      }
      if (mobile) {
        setCollapsed(false);
      }
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => {
          if (isMobile) {
            setMobileOpen((prev) => !prev);
          } else {
            setCollapsed((prev) => !prev);
          }
        }}
      />
      {isMobile && !mobileOpen ? (
        <button
          className="mobile-sidebar-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
      {isMobile && mobileOpen ? <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} /> : null}
      <div className={`main-content ${collapsed ? "sidebar-collapsed" : ""}`}>
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
