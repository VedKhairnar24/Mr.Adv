import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Documents() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [caseId, setCaseId] = useState("");
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cases/all");
      setCases(res.data);
      if (res.data.length > 0 && !caseId) {
        setCaseId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!caseId) return;
    try {
      const res = await API.get(`/documents/${caseId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  useEffect(() => { fetchCases(); }, []);
  useEffect(() => { if (caseId) fetchDocuments(); }, [caseId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF and Word documents (.pdf, .doc, .docx) are allowed");
      setFile(null);
      e.target.value = "";
      return;
    }
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setFile(null);
      e.target.value = "";
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!file) { setError("Please select a file to upload"); return; }
    if (!caseId) { setError("Please select a case"); return; }
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("case_id", caseId);
      await API.post("/documents/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setSuccess("Document uploaded successfully!");
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      fetchDocuments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await API.delete(`/documents/${docId}`);
      setSuccess("Document deleted successfully!");
      fetchDocuments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete document");
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const inputClass = "w-full bg-primary border border-gold/15 rounded px-4 py-2.5 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-white text-sm";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white tracking-wide">Document Management</h1>
        <p className="text-slate-500 text-sm mt-1">Upload and manage case documents</p>
      </div>

      {/* Upload Form */}
      <div className="bg-card rounded-lg border border-gold/10 p-6 mb-8">
        <h2 className="text-base font-bold mb-5 text-white tracking-wide">Upload Document</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-4 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded mb-4 text-sm">{success}</div>
        )}

        <form onSubmit={uploadDocument} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">SELECT CASE *</label>
            <select value={caseId} onChange={(e) => setCaseId(e.target.value)} className={inputClass} required>
              <option value="">Choose a case...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_title} {c.case_number ? `(${c.case_number})` : ''} - {c.client_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">SELECT FILE *</label>
            <div className="border-2 border-dashed border-gold/15 rounded p-6 text-center hover:border-gold/30 transition-colors bg-primary/50">
              <input type="file" onChange={handleFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <svg className="mx-auto h-10 w-10 text-slate-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-slate-400">
                  <span className="font-semibold text-gold">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-[10px] text-slate-600 tracking-wide">PDF, DOC, DOCX (Max 10MB)</p>
              </label>
              {file && (
                <div className="mt-3 text-xs text-slate-400">
                  <span className="font-semibold">Selected:</span> {file.name} ({formatFileSize(file.size)})
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={uploading || !file || !caseId}
            className="w-full bg-gold hover:bg-gold/85 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-primary py-3 rounded font-bold text-sm tracking-wider transition-colors">
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                UPLOADING...
              </span>
            ) : "UPLOAD DOCUMENT"}
          </button>
        </form>
      </div>

      {/* Documents List */}
      {caseId && (
        <div className="bg-card rounded-lg border border-gold/10 p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-base font-bold text-white tracking-wide">Documents for This Case</h2>
            <span className="text-[10px] font-bold tracking-wider text-slate-500">{documents.length} DOCUMENT{documents.length !== 1 ? 'S' : ''}</span>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gold border-t-transparent"></div>
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="text-center py-10">
              <svg className="mx-auto h-10 w-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-3 text-slate-500 text-sm">No documents uploaded yet</p>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="border border-gold/10 rounded p-4 hover:border-gold/25 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="text-2xl">{getFileIcon(doc.file_type)}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm">{doc.document_name}</h3>
                        <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-500">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>·</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a href={`http://localhost:5000${doc.file_path}`} target="_blank" rel="noopener noreferrer"
                        className="text-gold hover:text-gold/80 text-xs font-bold tracking-wider px-3 py-1.5 border border-gold/30 rounded hover:bg-gold/10 transition-colors">
                        VIEW
                      </a>
                      <button onClick={() => deleteDocument(doc.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold tracking-wider px-3 py-1.5 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors">
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Documents;
