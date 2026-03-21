import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import AddHearing from "../components/AddHearing";
import HearingList from "../components/HearingList";
import DocumentList from "../components/DocumentList";
import CaseTimeline from "../components/CaseTimeline";
import AINotes from "../components/AINotes";

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 6V4h8v2" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="6" y="6" width="12" height="14" rx="2" strokeWidth="1.8" />
      <path d="M10 10v6M14 10v6" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function toDisplay(value) {
  return value && String(value).trim() ? value : "-";
}

function toDisplayDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusSaving, setStatusSaving] = useState(false);

  const statusClass = useMemo(() => {
    const status = (caseData?.status || "").toLowerCase();
    if (status === "active") return "active";
    if (status === "pending" || status === "on hold") return "pending";
    if (status === "closed") return "closed";
    return "disposed";
  }, [caseData?.status]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/cases/${id}`);
      setCaseData(res.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setCaseData(null);
      } else {
        toast.error(error.response?.data?.message || "Failed to load case details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const updateStatus = async (nextStatus) => {
    if (!caseData || nextStatus === caseData.status) return;

    try {
      setStatusSaving(true);
      await API.put(`/cases/${id}/status`, { status: nextStatus });
      setCaseData((prev) => ({ ...prev, status: nextStatus }));
      toast.success("Case status updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setStatusSaving(false);
    }
  };

  const deleteCase = async () => {
    if (!window.confirm("Delete this case? This action cannot be undone.")) return;

    try {
      await API.delete(`/cases/${id}`);
      toast.success("Case deleted");
      navigate("/cases");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete case");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent"></div>
          <p className="mt-3 text-slate-400 text-sm">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 mb-4">Case not found.</p>
        <Link to="/cases" className="detail-btn-ghost" style={{ textDecoration: "none" }}>
          <BackArrowIcon /> Back to Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="detail-page-shell">
      <header className="app-header">
        <div className="app-header-title-wrap">
          <Link to="/cases" className="back-nav-link">
            <BackArrowIcon />
            Back to Cases
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h1 className="app-header-title">{toDisplay(caseData.case_title)}</h1>
            <span className={`badge badge-${statusClass}`}>{toDisplay(caseData.status).toUpperCase()}</span>
          </div>

          <p className="app-header-subtitle">Case number: {toDisplay(caseData.case_number)}</p>
        </div>

        <div className="detail-header-actions">
          <select
            value={caseData.status || "Pending"}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={statusSaving}
            className="detail-select"
            style={{ minWidth: "150px", height: "40px" }}
          >
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Closed">Closed</option>
            <option value="Disposed">Disposed</option>
          </select>

          <button type="button" className="detail-btn-danger" onClick={deleteCase}>
            <TrashIcon /> Delete
          </button>
        </div>
      </header>

      <div className="detail-content detail-two-col">
        <main>
          <section className="detail-card with-corners" style={{ marginBottom: "20px" }}>
            <div className="detail-card-label">Case Information</div>

            <div className="detail-info-grid">
              <div className="detail-field">
                <span className="detail-field-label">Case Title</span>
                <span className="detail-field-value">{toDisplay(caseData.case_title)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Case Number</span>
                <span className="detail-field-value mono">{toDisplay(caseData.case_number)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Case Type</span>
                <span className="detail-field-value">{toDisplay(caseData.case_type)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Court</span>
                <span className="detail-field-value">{toDisplay(caseData.court_name)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Filing Date</span>
                <span className="detail-field-value">{toDisplayDate(caseData.filing_date)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Created</span>
                <span className="detail-field-value">{toDisplayDate(caseData.created_at)}</span>
              </div>
            </div>
          </section>

          <section className="detail-card" style={{ marginBottom: "20px" }}>
            <div className="detail-card-label">Client Information</div>
            <div className="detail-info-grid">
              <div className="detail-field">
                <span className="detail-field-label">Client Name</span>
                <span className="detail-field-value">{toDisplay(caseData.client_name)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Phone</span>
                <span className="detail-field-value">{toDisplay(caseData.client_phone)}</span>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Email</span>
                <span className="detail-field-value">{toDisplay(caseData.client_email)}</span>
              </div>
            </div>
          </section>

          <DocumentList caseId={id} />
          <CaseTimeline caseId={id} />
          <AINotes caseId={id} />
        </main>

        <aside>
          <AddHearing caseId={id} />
          <div style={{ height: "20px" }} />
          <HearingList caseId={id} />
        </aside>
      </div>
    </div>
  );
}
