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
  
  // Upload form state
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // PDF Viewer modal state
  const [viewerDoc, setViewerDoc] = useState(null);

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = ["Pending", "Active", "On Hold", "Closed", "Disposed"];
  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Active: "bg-green-100 text-green-800 border-green-300",
    "On Hold": "bg-orange-100 text-orange-800 border-orange-300",
    Closed: "bg-gray-100 text-gray-800 border-gray-300",
    Disposed: "bg-red-100 text-red-800 border-red-300",
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

  // Build the correct URL for a document (handles both / and \ path separators)
  const getDocUrl = (filePath) => {
    const normalized = filePath.replace(/\\/g, '/').replace(/^\//, '');
    return `http://localhost:5000/${normalized}`;
  };

  // Check if a document is a PDF
  const isPdf = (doc) => {
    return doc.file_type?.toLowerCase().includes('pdf') || doc.file_path?.toLowerCase().endsWith('.pdf');
  };

  // Check if a document is an image
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
      formData.append("case_id", id);  // Changed from "caseId" to "case_id"

      await API.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Document uploaded successfully!");
      setUploadTitle("");
      setSelectedFile(null);
      loadDocuments(); // Refresh document list
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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading case details...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Case not found</p>
        <button
          onClick={() => navigate("/cases")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Back to Cases
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/cases")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Cases
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Case Details</h1>
      </div>

      {/* Case Information Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Case Information
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Case Title</p>
            <p className="font-medium text-gray-900">{caseData.case_title}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Case Number</p>
            <p className="font-medium text-gray-900">
              {caseData.case_number || "N/A"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Court</p>
            <p className="font-medium text-gray-900">{caseData.court_name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Case Type</p>
            <p className="font-medium text-gray-900">
              {caseData.case_type || "N/A"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <div className="flex items-center space-x-2">
              <select
                value={caseData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  statusColors[caseData.status] || "bg-blue-100 text-blue-800 border-blue-300"
                } ${updatingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {updatingStatus && (
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Filing Date</p>
            <p className="font-medium text-gray-900">
              {caseData.filing_date 
                ? new Date(caseData.filing_date).toLocaleDateString('en-IN')
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Client Information Card */}
      {caseData.client_name && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Client Information
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Client Name</p>
              <p className="font-medium text-gray-900">{caseData.client_name}</p>
            </div>
            
            {caseData.client_phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{caseData.client_phone}</p>
              </div>
            )}
            
            {caseData.client_email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{caseData.client_email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          📤 Upload Document
        </h2>

        <form onSubmit={uploadDocument} className="p-4 border rounded-lg bg-gray-50">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., Evidence PDF, Contract, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select File (PDF, DOC, DOCX, JPG, PNG)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
          </div>
          
          <button
            type="submit"
            disabled={uploading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>

      {/* Documents Table */}
      <DocumentList caseId={id} />

      {/* ===== PDF / Image Viewer Modal ===== */}
      {viewerDoc && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col">
          {/* Modal Header */}
          <div className="bg-white px-6 py-3 flex items-center justify-between shadow">
            <div className="flex items-center space-x-3">
              {isPdf(viewerDoc) ? (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              )}
              <div>
                <h3 className="font-semibold text-gray-900">{viewerDoc.document_name}</h3>
                <p className="text-xs text-gray-500">
                  {isPdf(viewerDoc) ? 'PDF Document' : 'Image'} • {viewerDoc.file_size ? `${(viewerDoc.file_size / 1024).toFixed(1)} KB` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href={getDocUrl(viewerDoc.file_path)}
                download={viewerDoc.document_name}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
              <a
                href={getDocUrl(viewerDoc.file_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in Tab
              </a>
              <button
                onClick={() => setViewerDoc(null)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body — PDF or Image */}
          <div className="flex-1 overflow-auto p-2">
            {isPdf(viewerDoc) ? (
              <iframe
                src={getDocUrl(viewerDoc.file_path)}
                className="w-full h-full rounded bg-white"
                title={viewerDoc.document_name}
              />
            ) : isImage(viewerDoc) ? (
              <div className="flex items-center justify-center h-full">
                <img
                  src={getDocUrl(viewerDoc.file_path)}
                  alt={viewerDoc.document_name}
                  className="max-w-full max-h-full object-contain rounded"
                />
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
