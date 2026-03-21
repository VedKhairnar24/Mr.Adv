import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [barCouncilNumber, setBarCouncilNumber] = useState("");
  const [courts, setCourts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPwd, setChangingPwd] = useState(false);

  const [courtForm, setCourtForm] = useState({ court_name: "", location: "" });
  const [addingCourt, setAddingCourt] = useState(false);

  const [aiSettings, setAiSettings] = useState({
    aiNotes: true,
    aiCaseSummary: true,
    aiLegalSuggestions: false,
    responseLength: "Medium",
  });

  const [notifications, setNotifications] = useState({
    hearingReminder: true,
    caseUpdates: true,
    taskDeadlines: true,
  });

  const tabs = useMemo(
    () => [
      { id: "profile", label: "Profile Settings" },
      { id: "courts", label: "Court Management" },
      { id: "security", label: "Security" },
      { id: "ai", label: "AI Settings" },
      { id: "notifications", label: "Notifications" },
    ],
    []
  );

  useEffect(() => {
    fetchProfile();
    fetchCourts();
    const savedAi = localStorage.getItem("aiSettings");
    if (savedAi) setAiSettings(JSON.parse(savedAi));
    const savedNotif = localStorage.getItem("notifSettings");
    if (savedNotif) setNotifications(JSON.parse(savedNotif));
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/settings/profile");
      setProfile(res.data || {});
    } catch {
      setProfile({ name: "ved khairnar", email: "ved@test.com", phone: "7972606935" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCourts = async () => {
    try {
      const res = await API.get("/courts");
      setCourts(res.data || []);
    } catch {
      setCourts([]);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.put("/settings/profile", { name: profile.name, phone: profile.phone });
      const adv = JSON.parse(localStorage.getItem("advocate") || "{}");
      adv.name = profile.name;
      localStorage.setItem("advocate", JSON.stringify(adv));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelProfile = () => {
    fetchProfile();
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
      toast.success("Password changed successfully");
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
      toast.success("Court added");
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
    } catch {
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

  const panelCardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "32px",
    position: "relative",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1 className="app-header-title">Settings</h1>
          <p className="app-header-subtitle">Manage your account and preferences</p>
        </div>
      </header>

      <div className="app-body">
        <div style={{ borderBottom: "var(--border-1)", marginBottom: "28px", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: "Rajdhani, sans-serif",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                height: "48px",
                padding: "0 22px",
                color: activeTab === tab.id ? "var(--gold)" : "var(--muted)",
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid var(--gold)" : "2px solid transparent",
                background: "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) e.currentTarget.style.color = "var(--white)";
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) e.currentTarget.style.color = "var(--muted)";
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="card-corners" style={panelCardStyle}>
            <p className="label text-gold" style={{ letterSpacing: "3px", marginBottom: "24px" }}>Profile Settings</p>

            {loadingProfile ? (
              <div className="empty-state" style={{ minHeight: "220px" }}>
                <div className="inline-block animate-spin rounded-full h-8 w-8" style={{ border: "2px solid var(--gold)", borderTopColor: "transparent" }}></div>
              </div>
            ) : (
              <form onSubmit={saveProfile}>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "32px", alignItems: "start" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "var(--gold)",
                        border: "2px solid var(--gold2)",
                        color: "var(--bg)",
                        fontFamily: "Cormorant Garamond, serif",
                        fontSize: "32px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {(profile.name?.charAt(0) || "V").toUpperCase()}
                    </div>
                    <button type="button" style={{ border: "none", background: "none", color: "var(--gold)", fontFamily: "Rajdhani, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer" }}>
                      Change Photo
                    </button>
                  </div>

                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0 28px" }}>
                      <div>
                        <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Advocate Name</label>
                        <input type="text" value={profile.name || ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                      </div>

                      <div style={{ position: "relative" }}>
                        <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Email (Read-only)</label>
                        <input type="email" value={profile.email || "ved@test.com"} readOnly style={{ opacity: 0.5, cursor: "not-allowed" }} />
                        <span
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "32px",
                            transform: "translateY(-50%)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            fontFamily: "Rajdhani, sans-serif",
                            fontSize: "9px",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            color: "var(--muted2)",
                            background: "rgba(255,255,255,0.05)",
                            padding: "3px 8px",
                            borderRadius: "2px",
                            textTransform: "uppercase",
                          }}
                        >
                          <span style={{ width: "12px", height: "12px", display: "inline-flex" }}><LockIcon /></span>
                          Read-only
                        </span>
                      </div>

                      <div>
                        <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Phone</label>
                        <input type="text" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                      </div>

                      <div>
                        <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Bar Council Number</label>
                        <input type="text" value={barCouncilNumber} onChange={(e) => setBarCouncilNumber(e.target.value)} placeholder="Enter bar council number" />
                      </div>
                    </div>

                    <div style={{ marginTop: "24px", display: "flex", gap: "12px", alignItems: "center" }}>
                      <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                        {saving ? "Saving..." : "Save Profile"}
                      </button>
                      <button type="button" className="btn-ghost" onClick={cancelProfile}>Cancel</button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === "courts" && (
          <div style={panelCardStyle}>
            <p className="label text-gold" style={{ letterSpacing: "3px", marginBottom: "22px" }}>Court Management</p>

            <form onSubmit={addCourt} style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px", alignItems: "end" }}>
              <div>
                <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Court Name</label>
                <input type="text" value={courtForm.court_name} onChange={(e) => setCourtForm({ ...courtForm, court_name: e.target.value })} placeholder="District Court" required />
              </div>
              <div>
                <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Location</label>
                <input type="text" value={courtForm.location} onChange={(e) => setCourtForm({ ...courtForm, location: e.target.value })} placeholder="Nashik" />
              </div>
              <button type="submit" className="btn-primary" disabled={addingCourt} style={{ opacity: addingCourt ? 0.6 : 1 }}>
                {addingCourt ? "Adding..." : "Add Court"}
              </button>
            </form>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {courts.length === 0 ? (
                <div className="empty-state" style={{ minHeight: "150px" }}>
                  <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "var(--muted)" }}>No courts registered yet</p>
                </div>
              ) : (
                courts.map((court) => (
                  <div key={court.id} style={{ border: "1px solid var(--border)", borderRadius: "3px", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "13px", fontWeight: 600 }}>{court.court_name}</p>
                      <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "11px", color: "var(--muted)" }}>{court.location || "Location not set"}</p>
                    </div>
                    <button className="btn-danger" onClick={() => deleteCourt(court.id)}>Delete</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div style={panelCardStyle}>
            <p className="label text-gold" style={{ letterSpacing: "3px", marginBottom: "22px" }}>Security Settings</p>
            <form onSubmit={changePassword} style={{ maxWidth: "540px" }}>
              <div style={{ marginBottom: "14px" }}>
                <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Current Password</label>
                <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>New Password</label>
                <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Confirm New Password</label>
                <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary" disabled={changingPwd} style={{ opacity: changingPwd ? 0.6 : 1 }}>
                {changingPwd ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "ai" && (
          <div style={panelCardStyle}>
            <p className="label text-gold" style={{ letterSpacing: "3px", marginBottom: "22px" }}>AI Settings</p>
            <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
              Configure AI-powered features for notes, summaries, and legal suggestions.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
              {[{ key: "aiNotes", label: "AI Notes" }, { key: "aiCaseSummary", label: "AI Case Summary" }, { key: "aiLegalSuggestions", label: "AI Legal Suggestions" }].map((item) => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)", borderRadius: "3px", padding: "10px 12px" }}>
                  <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--white)" }}>{item.label}</span>
                  <button className="btn-ghost" type="button" onClick={() => saveAiSettings(item.key, !aiSettings[item.key])}>
                    {aiSettings[item.key] ? "Enabled" : "Disabled"}
                  </button>
                </div>
              ))}

              <div>
                <label className="label text-white" style={{ display: "block", marginBottom: "8px" }}>Response Length</label>
                <select value={aiSettings.responseLength} onChange={(e) => saveAiSettings("responseLength", e.target.value)} style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--white)", padding: "10px 12px", fontFamily: "Rajdhani, sans-serif", fontSize: "13px" }}>
                  <option value="Short">Short</option>
                  <option value="Medium">Medium</option>
                  <option value="Detailed">Detailed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div style={panelCardStyle}>
            <p className="label text-gold" style={{ letterSpacing: "3px", marginBottom: "22px" }}>Notifications</p>
            <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "var(--muted)", marginBottom: "16px" }}>
              Configure email and alert preferences for your practice updates.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
              {[{ key: "hearingReminder", label: "Hearing Reminders" }, { key: "caseUpdates", label: "Case Updates" }, { key: "taskDeadlines", label: "Task Deadlines" }].map((item) => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)", borderRadius: "3px", padding: "10px 12px" }}>
                  <span style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--white)" }}>{item.label}</span>
                  <button className="btn-ghost" type="button" onClick={() => saveNotifSettings(item.key, !notifications[item.key])}>
                    {notifications[item.key] ? "Enabled" : "Disabled"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
