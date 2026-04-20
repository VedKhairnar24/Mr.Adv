import { useEffect, useRef, useState } from "react";
import API from "../services/api";

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 16V8" />
      <path d="M8.5 11.5 12 8l3.5 3.5" />
      <path d="M20 15.5a3.5 3.5 0 0 1-3.5 3.5h-9A4.5 4.5 0 0 1 7 10a5.5 5.5 0 0 1 10.6-1.8A4 4 0 0 1 20 15.5Z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M1.5 12s3.5-6 10.5-6 10.5 6 10.5 6-3.5 6-10.5 6S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 4v11" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 19h16" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <rect x="6" y="6" width="12" height="14" rx="2" />
      <path d="M10 10v6M14 10v6" />
    </svg>
  );
}

function Documents() {
  const [file, setFile] = useState(null);
  const [caseId, setCaseId] = useState("");
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [viewMode, setViewMode] = useState("case"); // "case" or "all"
  const fileInputRef = useRef(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cases/all");
      setCases(res.data || []);
      if (res.data?.length > 0 && !caseId) {
        setCaseId(String(res.data[0].id));
      }
    } catch (err) {
      setError("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!caseId) return;
    try {
      const res = await API.get(`/documents/${caseId}`);
      setDocuments(res.data || []);
    } catch (err) {
      setDocuments([]);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const res = await API.get("/documents/all/advocate");
      setAllDocuments(res.data || []);
    } catch (err) {
      setAllDocuments([]);
    }
  };

  useEffect(() => {
    fetchCases();
    fetchAllDocuments();
  }, []);

  useEffect(() => {
    if (caseId) fetchDocuments();
  }, [caseId]);

  useEffect(() => {
    // Listen for document upload events to refresh
    const handleRefresh = () => {
      fetchDocuments();
      fetchAllDocuments();
    };
    window.addEventListener("documentUploaded", handleRefresh);
    return () => window.removeEventListener("documentUploaded", handleRefresh);
  }, [caseId]);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF, Word documents (.pdf, .doc, .docx), and text files (.txt) are allowed");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setFile(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const uploadDocument = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    if (!caseId) {
      setError("Please select a case");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("case_id", caseId);
      await API.post("/documents/upload", formData);
      setSuccess("Document uploaded successfully!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchDocuments();
      fetchAllDocuments();
      // Dispatch event to notify other components of document upload
      window.dispatchEvent(new Event("documentUploaded"));
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
      fetchAllDocuments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete document");
    }
  };

  const formatFileSize = (bytes = 0) => {
    if (!bytes) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  const getFileTheme = (fileType = "") => {
    const type = fileType.toLowerCase();
    if (type.includes("pdf")) {
      return {
        bg: "rgba(192,57,43,0.15)",
        border: "rgba(192,57,43,0.35)",
        color: "#f87171",
        tag: "PDF",
      };
    }
    return {
      bg: "var(--info-dim)",
      border: "rgba(96,165,250,0.35)",
      color: "#60a5fa",
      tag: "DOC",
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1 className="app-header-title">Document Management</h1>
          <p className="app-header-subtitle">Upload and manage case documents</p>
        </div>
      </header>

      <div className="app-body">
        {(error || success) && (
          <div style={{ marginBottom: "16px" }}>
            {error && <div className="badge badge-cancelled" style={{ fontSize: "10px" }}>{error}</div>}
            {success && <div className="badge badge-active" style={{ fontSize: "10px", marginLeft: "8px" }}>{success}</div>}
          </div>
        )}

        <div className="documents-grid" style={{ display: "grid", gap: "24px" }}>
          <section className="card" style={{ borderRadius: "4px", minHeight: "480px", padding: "24px", display: "flex", flexDirection: "column" }}>
            <p className="label text-gold" style={{ letterSpacing: "3px", marginBottom: "16px" }}>Upload Document</p>

            <form onSubmit={uploadDocument} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div>
                <label className="label text-white" style={{ marginBottom: "8px", display: "block" }}>Select Case *</label>
                <select
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "3px",
                    color: "var(--white)",
                    height: "48px",
                    padding: "0 40px 0 14px",
                    fontFamily: "Rajdhani, sans-serif",
                    fontSize: "13px",
                  }}
                >
                  <option value="">Select case...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.case_title} {c.case_number ? `(${c.case_number})` : ""} - {c.client_name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: "16px" }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  style={{ display: "none" }}
                  id="document-file-input"
                />

                <label
                  htmlFor="document-file-input"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    border: "1.5px dashed rgba(200,168,75,0.3)",
                    borderRadius: "3px",
                    minHeight: "200px",
                    padding: "40px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    background: "rgba(200,168,75,0.03)",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--gold)";
                    e.currentTarget.style.background = "var(--gold-dim)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(200,168,75,0.3)";
                    e.currentTarget.style.background = "rgba(200,168,75,0.03)";
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      margin: "0 auto 16px",
                      background: "var(--gold-dim)",
                      border: "1px solid rgba(200,168,75,0.35)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--gold)",
                    }}
                  >
                      <span style={{ width: "24px", height: "24px" }}><UploadIcon /></span>
                  </div>

                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", color: "var(--white)" }}>
                    <span style={{ color: "var(--gold)" }}>Click to upload</span> or drag & drop
                  </p>
                  <p style={{ marginTop: "8px", marginBottom: "16px", fontFamily: "Rajdhani, sans-serif", fontSize: "13px", color: "var(--muted)" }}>
                    PDF, DOC, DOCX, TXT (Max 10MB)
                  </p>

                  <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                    {[
                      "PDF",
                      "DOC",
                      "DOCX",
                      "TXT",
                    ].map((chip) => (
                      <span
                        key={chip}
                        style={{
                          fontFamily: "Rajdhani, sans-serif",
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          height: "28px",
                          padding: "0 12px",
                          borderRadius: "2px",
                          border: "1px solid var(--border)",
                          color: "var(--muted)",
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {file && (
                    <p style={{ marginTop: "12px", fontFamily: "Rajdhani, sans-serif", fontSize: "11px", color: "var(--gold)" }}>
                      {file.name} · {formatFileSize(file.size)}
                    </p>
                  )}
                </label>
              </div>

              <button type="submit" className="btn-primary" disabled={uploading || !file || !caseId} style={{ width: "100%", marginTop: "auto", opacity: uploading || !file || !caseId ? 0.6 : 1 }}>
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </form>
          </section>

          <section className="card" style={{ borderRadius: "4px", minHeight: "480px", padding: "24px" }}>
            <div className="flex-between" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p className="label text-gold" style={{ letterSpacing: "3px", marginBottom: "8px" }}>
                  {viewMode === "case" ? "Documents For This Case" : "All Documents"}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setViewMode("case")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "3px",
                      border: viewMode === "case" ? "2px solid var(--gold)" : "1px solid var(--border)",
                      background: viewMode === "case" ? "rgba(200,168,75,0.1)" : "transparent",
                      color: viewMode === "case" ? "var(--gold)" : "var(--muted)",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontFamily: "Rajdhani, sans-serif",
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== "case") {
                        e.currentTarget.style.borderColor = "rgba(200,168,75,0.35)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== "case") {
                        e.currentTarget.style.borderColor = "var(--border)";
                      }
                    }}
                  >
                    Per Case
                  </button>
                  <button
                    onClick={() => setViewMode("all")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "3px",
                      border: viewMode === "all" ? "2px solid var(--gold)" : "1px solid var(--border)",
                      background: viewMode === "all" ? "rgba(200,168,75,0.1)" : "transparent",
                      color: viewMode === "all" ? "var(--gold)" : "var(--muted)",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontFamily: "Rajdhani, sans-serif",
                      fontWeight: 600,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (viewMode !== "all") {
                        e.currentTarget.style.borderColor = "rgba(200,168,75,0.35)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (viewMode !== "all") {
                        e.currentTarget.style.borderColor = "var(--border)";
                      }
                    }}
                  >
                    All Documents
                  </button>
                </div>
              </div>
              <p className="label text-muted" style={{ letterSpacing: "3px" }}>
                {viewMode === "case" ? documents.length : allDocuments.length} Documents
              </p>
            </div>

            {loading ? (
              <div className="empty-state" style={{ minHeight: "220px" }}>
                <div className="inline-block animate-spin rounded-full h-8 w-8" style={{ border: "2px solid var(--gold)", borderTopColor: "transparent" }}></div>
              </div>
            ) : (viewMode === "case" ? documents.length === 0 : allDocuments.length === 0) ? (
              <div className="empty-state" style={{ minHeight: "220px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)", marginBottom: "12px" }}>
                  <span style={{ width: "20px", height: "20px" }}><FileIcon /></span>
                </div>
                <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", color: "var(--white)" }}>No documents uploaded yet</p>
                <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "12px", color: "var(--muted)" }}>
                  {viewMode === "case" ? "Upload documents to see them here" : "Create cases and upload documents to see them here"}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {(viewMode === "case" ? documents : allDocuments).map((doc) => {
                  const theme = getFileTheme(doc.file_type || doc.document_name || "");
                  return (
                    <article
                      key={doc.id}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderLeft: "3px solid transparent",
                        minHeight: "64px",
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderLeftColor = "var(--gold)";
                        e.currentTarget.style.background = "var(--surface2)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderLeftColor = "transparent";
                        e.currentTarget.style.background = "var(--surface)";
                      }}
                    >
                      <div style={{ width: "42px", height: "42px", borderRadius: "3px", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, border: `1px solid ${theme.border}`, color: theme.color, flexShrink: 0 }}>
                        <span style={{ width: "18px", height: "18px" }}><FileIcon /></span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--white)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>
                          {doc.document_name}
                        </p>
                        <p style={{ marginTop: "2px", fontFamily: "Rajdhani, sans-serif", fontSize: "11px", color: "var(--muted)" }}>
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} · {formatFileSize(doc.file_size)}
                          {viewMode === "all" && doc.case_title && (
                            <span> · Case: <span style={{ color: "var(--gold)" }}>{doc.case_title}</span></span>
                          )}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                        <a href={`http://localhost:5000${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View document">
                          <EyeIcon />
                        </a>
                        <a href={`http://localhost:5000${doc.file_path}`} download className="btn-icon" title="Download document">
                          <DownloadIcon />
                        </a>
                        <button className="btn-danger" style={{ width: "34px", height: "34px", minHeight: "34px", padding: 0, justifyContent: "center" }} title="Delete document" onClick={() => deleteDocument(doc.id)}>
                          <span style={{ width: "16px", height: "16px", display: "inline-flex" }}><TrashIcon /></span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Documents;
