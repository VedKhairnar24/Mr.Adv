import Sidebar from "../components/Sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div className={`main-content ${collapsed ? "sidebar-collapsed" : ""}`}>
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}
