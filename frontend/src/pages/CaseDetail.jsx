import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import AddHearing from "../components/AddHearing";
import HearingList from "../components/HearingList";
import CaseTimeline from "../components/CaseTimeline";
import DocumentList from "../components/DocumentList";

function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = ["Pending", "Active", "On Hold", "Closed", "Disposed"];
  const statusColors = {
    Pending: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    Active: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    "On Hold": "text-orange-400 border-orange-500/30 bg-orange-500/10",
    Closed: "text-slate-400 border-slate-500/30 bg-slate-500/10",
    Disposed: "text-red-400 border-red-500/30 bg-red-500/10",
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === caseData.status) return;
    try {
      setUpdatingStatus(true);
      await API.put(`/cases/status/${id}`, { status: newStatus });
      setCaseData((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to "${newStatus}"`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const loadCase = async () => {
    try {
      const res = await API.get(`/cases/${id}`);
      setCaseData(res.data);
    } catch (error) {
      console.error("Error loading case:", error);
    }
  };

  const loadDocuments = async () => {
    try {
      const res = await API.get(`/documents/case/${id}`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await API.delete(`/documents/${docId}`);
      toast.success("Document deleted successfully");
      loadDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete document");
    }
  };

  const getDocUrl = (filePath) => {
    const normalized = filePath.replace(/\\/g, '/').replace(/^\//, '');
    return `http://localhost:5000/${normalized}`;
  };

  const isPdf = (doc) => {
    return doc.file_type?.toLowerCase().includes('pdf') || doc.file_path?.toLowerCase().endsWith('.pdf');
  };

  const isImage = (doc) => {
    return doc.file_type?.includes('image') || doc.file_path?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadTitle) {
      toast.error("Please select a file and enter a title");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", uploadTitle);
      formData.append("case_id", id);
      await API.post("/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Document uploaded successfully!");
      setUploadTitle("");
      setSelectedFile(null);
      loadDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadCase();
    loadDocuments();
    setLoading(false);
  }, []);

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
        <p className="text-slate-400 mb-4">Case not found</p>
        <button onClick={() => navigate("/cases")}
          className="bg-gold hover:bg-gold/85 text-primary px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors">
          BACK TO CASES
        </button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white placeholder-slate-600 text-sm";

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate("/cases")}
          className="text-gold hover:text-gold/80 text-xs font-bold tracking-wider mb-3 inline-block">
          ← BACK TO CASES
        </button>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Case Details</h1>
      </div>

      {/* Case Information Card */}
      <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
        <h2 className="text-sm font-bold mb-5 text-white tracking-wide">CASE INFORMATION</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CASE TITLE</p>
            <p className="font-semibold text-white text-sm">{caseData.case_title}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CASE NUMBER</p>
            <p className="font-semibold text-white text-sm">{caseData.case_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">COURT</p>
            <p className="font-semibold text-white text-sm">{caseData.court_name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CASE TYPE</p>
            <p className="font-semibold text-white text-sm">{caseData.case_type || "N/A"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">STATUS</p>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={caseData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`text-[10px] font-bold tracking-wider px-2.5 py-1.5 rounded border cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30 ${
                  statusColors[caseData.status] || "text-blue-400 border-blue-500/30 bg-blue-500/10"
                } ${updatingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updatingStatus && (
                <div className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-gold border-t-transparent"></div>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">FILING DATE</p>
            <p className="font-semibold text-white text-sm">
              {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString('en-IN') : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Client Information Card */}
      {caseData.client_name && (
        <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
          <h2 className="text-sm font-bold mb-5 text-white tracking-wide">CLIENT INFORMATION</h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">CLIENT NAME</p>
              <p className="font-semibold text-white text-sm">{caseData.client_name}</p>
            </div>
            {caseData.client_phone && (
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">PHONE</p>
                <p className="font-semibold text-white text-sm">{caseData.client_phone}</p>
              </div>
            )}
            {caseData.client_email && (
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-500 mb-1">EMAIL</p>
                <p className="font-semibold text-white text-sm">{caseData.client_email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Section */}
      <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
        <h2 className="text-sm font-bold mb-5 text-white tracking-wide">UPLOAD DOCUMENT</h2>
        <form onSubmit={uploadDocument} className="p-4 border border-gold/10 rounded bg-primary/50">
          <div className="mb-3">
            <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">DOCUMENT TITLE</label>
            <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., Evidence PDF, Contract, etc." className={inputClass} required />
          </div>
          <div className="mb-3">
            <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">SELECT FILE</label>
            <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              className="w-full px-3 py-2 bg-primary border border-gold/15 rounded focus:outline-none focus:ring-2 focus:ring-gold/40 text-white text-sm file:bg-gold file:text-primary file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:font-bold file:text-xs"
              required />
            <p className="text-[10px] text-slate-600 mt-1">Max file size: 10MB</p>
          </div>
          <button type="submit" disabled={uploading}
            className={`px-5 py-2 rounded font-bold text-sm tracking-wider transition-colors ${
              uploading ? "bg-slate-700 cursor-not-allowed text-slate-500" : "bg-gold hover:bg-gold/85 text-primary"
            }`}>
            {uploading ? "UPLOADING..." : "UPLOAD"}
          </button>
        </form>
      </div>

      {/* Documents Table */}
      <DocumentList caseId={id} />

      {/* PDF / Image Viewer Modal */}
      {viewerDoc && (
        <div className="fixed inset-0 bg-white/80 z-50 flex flex-col">
          <div className="bg-card px-6 py-3 flex items-center justify-between border-b border-gold/10">
            <div className="flex items-center space-x-3">
              {isPdf(viewerDoc) ? (
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <h3 className="font-bold text-white text-sm">{viewerDoc.document_name}</h3>
                <p className="text-[10px] text-slate-500">
                  {isPdf(viewerDoc) ? 'PDF' : 'Image'} · {viewerDoc.file_size ? `${(viewerDoc.file_size / 1024).toFixed(1)} KB` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <a href={getDocUrl(viewerDoc.file_path)} download={viewerDoc.document_name}
                className="text-emerald-400 text-xs font-bold tracking-wider px-3 py-1.5 border border-emerald-500/30 rounded hover:bg-emerald-500/10 transition-colors">
                DOWNLOAD
              </a>
              <a href={getDocUrl(viewerDoc.file_path)} target="_blank" rel="noopener noreferrer"
                className="text-gold text-xs font-bold tracking-wider px-3 py-1.5 border border-gold/30 rounded hover:bg-gold/10 transition-colors">
                OPEN TAB
              </a>
              <button onClick={() => setViewerDoc(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-primary rounded transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {isPdf(viewerDoc) ? (
              <iframe src={getDocUrl(viewerDoc.file_path)} className="w-full h-full rounded bg-white" title={viewerDoc.document_name} />
            ) : isImage(viewerDoc) ? (
              <div className="flex items-center justify-center h-full">
                <img src={getDocUrl(viewerDoc.file_path)} alt={viewerDoc.document_name} className="max-w-full max-h-full object-contain rounded" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                <p>Preview not available for this file type. Use the download button.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Case Timeline */}
      <CaseTimeline caseId={id} />

      {/* Hearing Section */}
      <AddHearing caseId={id} />
      <HearingList caseId={id} />
    </div>
  );
}

export default CaseDetail;
