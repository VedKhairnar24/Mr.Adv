import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [courts, setCourts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPwd, setChangingPwd] = useState(false);

  // Court form
  const [courtForm, setCourtForm] = useState({ court_name: "", location: "" });
  const [addingCourt, setAddingCourt] = useState(false);

  // AI settings (local storage based)
  const [aiSettings, setAiSettings] = useState({
    aiNotes: true, aiCaseSummary: true, aiLegalSuggestions: false,
    responseLength: "Medium"
  });

  // Notification settings (local storage based)
  const [notifications, setNotifications] = useState({
    hearingReminder: true, caseUpdates: true, taskDeadlines: true
  });

  const tabs = [
    { id: "profile", label: "Profile Settings" },
    { id: "courts", label: "Court Management" },
    { id: "security", label: "Security" },
    { id: "ai", label: "AI Settings" },
    { id: "notifications", label: "Notifications" },
  ];

  useEffect(() => {
    fetchProfile();
    fetchCourts();
    // Load local settings
    const savedAi = localStorage.getItem("aiSettings");
    if (savedAi) setAiSettings(JSON.parse(savedAi));
    const savedNotif = localStorage.getItem("notifSettings");
    if (savedNotif) setNotifications(JSON.parse(savedNotif));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/settings/profile");
      setProfile(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCourts = async () => {
    try {
      const res = await API.get("/courts");
      setCourts(res.data);
    } catch (error) {
      console.error("Error fetching courts:", error);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put("/settings/profile", { name: profile.name, phone: profile.phone });
      // Update localStorage advocate info
      const adv = JSON.parse(localStorage.getItem("advocate") || "{}");
      adv.name = profile.name;
      localStorage.setItem("advocate", JSON.stringify(adv));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setChangingPwd(true);
      await API.put("/settings/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPwd(false);
    }
  };

  const addCourt = async (e) => {
    e.preventDefault();
    if (!courtForm.court_name) {
      toast.error("Court name is required");
      return;
    }
    try {
      setAddingCourt(true);
      await API.post("/courts", courtForm);
      toast.success("Court added!");
      setCourtForm({ court_name: "", location: "" });
      fetchCourts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add court");
    } finally {
      setAddingCourt(false);
    }
  };

  const deleteCourt = async (id) => {
    if (!window.confirm("Delete this court?")) return;
    try {
      await API.delete(`/courts/${id}`);
      toast.success("Court deleted");
      fetchCourts();
    } catch (error) {
      toast.error("Failed to delete court");
    }
  };

  const saveAiSettings = (key, value) => {
    const updated = { ...aiSettings, [key]: value };
    setAiSettings(updated);
    localStorage.setItem("aiSettings", JSON.stringify(updated));
    toast.success("AI setting updated");
  };

  const saveNotifSettings = (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem("notifSettings", JSON.stringify(updated));
    toast.success("Notification setting updated");
  };

  const inputClass = "w-full px-4 py-2.5 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm";

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-wide">Settings</h1>
        <p className="text-white/50 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs font-bold tracking-wider px-4 py-2.5 rounded whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-gold/15 text-gold border border-gold/30"
                : "text-white/50 hover:text-white border border-transparent hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <div className="bg-card rounded-lg border border-gold/10 p-6 max-w-xl">
          <h2 className="text-sm font-bold mb-5 text-white tracking-wide">PROFILE SETTINGS</h2>
          {loadingProfile ? (
            <p className="text-white/50 text-sm">Loading...</p>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">ADVOCATE NAME</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">EMAIL (Read-only)</label>
                <input type="email" value={profile.email} disabled
                  className={`${inputClass} opacity-50 cursor-not-allowed`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">PHONE</label>
                <input type="text" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="Phone number" className={inputClass} />
              </div>
              <button type="submit" disabled={saving}
                className={`px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors ${
                  saving ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
                }`}>
                {saving ? "SAVING..." : "SAVE PROFILE"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Court Management */}
      {activeTab === "courts" && (
        <div className="max-w-xl">
          <div className="bg-card rounded-lg border border-gold/10 p-6 mb-6">
            <h2 className="text-sm font-bold mb-5 text-white tracking-wide">ADD COURT</h2>
            <form onSubmit={addCourt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">COURT NAME *</label>
                <input type="text" value={courtForm.court_name}
                  onChange={(e) => setCourtForm({ ...courtForm, court_name: e.target.value })}
                  placeholder="e.g., District Court" className={inputClass} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">LOCATION</label>
                <input type="text" value={courtForm.location}
                  onChange={(e) => setCourtForm({ ...courtForm, location: e.target.value })}
                  placeholder="e.g., Mumbai" className={inputClass} />
              </div>
              <button type="submit" disabled={addingCourt}
                className={`px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors ${
                  addingCourt ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
                }`}>
                {addingCourt ? "ADDING..." : "+ ADD COURT"}
              </button>
            </form>
          </div>

          <div className="bg-card rounded-lg border border-gold/10 p-6">
            <h2 className="text-sm font-bold mb-4 text-white tracking-wide">YOUR COURTS</h2>
            {courts.length === 0 ? (
              <p className="text-white/50 text-sm">No courts added yet</p>
            ) : (
              <div className="space-y-3">
                {courts.map((court) => (
                  <div key={court.id} className="flex items-center justify-between p-3 bg-primary rounded border border-gold/10">
                    <div>
                      <p className="font-semibold text-white text-sm">{court.court_name}</p>
                      {court.location && <p className="text-xs text-white/40 mt-0.5">{court.location}</p>}
                    </div>
                    <button onClick={() => deleteCourt(court.id)}
                      className="text-[10px] font-bold tracking-wider text-red-400 hover:text-red-300 transition-colors">
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security */}
      {activeTab === "security" && (
        <div className="bg-card rounded-lg border border-gold/10 p-6 max-w-xl">
          <h2 className="text-sm font-bold mb-5 text-white tracking-wide">CHANGE PASSWORD</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">CURRENT PASSWORD</label>
              <input type="password" value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">NEW PASSWORD</label>
              <input type="password" value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">CONFIRM NEW PASSWORD</label>
              <input type="password" value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className={inputClass} required />
            </div>
            <button type="submit" disabled={changingPwd}
              className={`px-5 py-2.5 rounded font-bold text-sm tracking-wider transition-colors ${
                changingPwd ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
              }`}>
              {changingPwd ? "CHANGING..." : "CHANGE PASSWORD"}
            </button>
          </form>
        </div>
      )}

      {/* AI Settings */}
      {activeTab === "ai" && (
        <div className="bg-card rounded-lg border border-gold/10 p-6 max-w-xl">
          <h2 className="text-sm font-bold mb-5 text-white tracking-wide">AI SETTINGS</h2>
          <div className="space-y-5">
            {[
              { key: "aiNotes", label: "AI Notes" },
              { key: "aiCaseSummary", label: "AI Case Summary" },
              { key: "aiLegalSuggestions", label: "AI Legal Suggestions" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-white/80">{label}</span>
                <button
                  onClick={() => saveAiSettings(key, !aiSettings[key])}
                  className={`px-4 py-1.5 rounded text-xs font-bold tracking-wider border transition-colors ${
                    aiSettings[key]
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "bg-white/5 text-white/40 border-white/20"
                  }`}
                >
                  {aiSettings[key] ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            ))}
            <div className="pt-3 border-t border-gold/10">
              <label className="block text-xs font-semibold text-white/60 mb-2 tracking-wide">RESPONSE LENGTH</label>
              <select
                value={aiSettings.responseLength}
                onChange={(e) => saveAiSettings("responseLength", e.target.value)}
                className={inputClass}
              >
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Detailed">Detailed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-card rounded-lg border border-gold/10 p-6 max-w-xl">
          <h2 className="text-sm font-bold mb-5 text-white tracking-wide">NOTIFICATION SETTINGS</h2>
          <div className="space-y-5">
            {[
              { key: "hearingReminder", label: "Hearing Reminder" },
              { key: "caseUpdates", label: "Case Updates" },
              { key: "taskDeadlines", label: "Task Deadlines" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-white/80">{label}</span>
                <button
                  onClick={() => saveNotifSettings(key, !notifications[key])}
                  className={`w-12 h-6 rounded-full relative transition-colors ${
                    notifications[key] ? "bg-gold" : "bg-white/20"
                  }`}
                >
                  <span className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${
                    notifications[key] ? "left-6" : "left-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
