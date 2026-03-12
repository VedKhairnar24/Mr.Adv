import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-primary">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
