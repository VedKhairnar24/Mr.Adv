import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function DocumentList({ caseId }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
    const handleRefresh = () => fetchDocuments();
    window.addEventListener("documentUploaded", handleRefresh);
    return () => window.removeEventListener("documentUploaded", handleRefresh);
  }, [caseId]);

  const fetchDocuments = async () => {
    try {
      const res = await API.get(`/documents/case/${caseId}`);
      setDocuments(res.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const getDocUrl = (filePath) => {
    const normalized = filePath.replace(/\\/g, "/").replace(/^\//, "");
    return `http://localhost:5000/${normalized}`;
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await API.delete(`/documents/${id}`);
      toast.success("Document deleted");
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="detail-card" style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div className="detail-card-label" style={{ marginBottom: 0 }}>Case Documents</div>
        <span
          style={{
            height: "22px",
            display: "inline-flex",
            alignItems: "center",
            border: "1px solid var(--border)",
            borderRadius: "2px",
            padding: "0 10px",
            fontSize: "10px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          {documents.length} Documents
        </span>
      </div>

      {documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 20px" }}>
          <svg className="mx-auto w-9 h-9 text-gold/50 mb-3" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
            <path d="M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 3v6h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-slate-300 text-sm">No documents uploaded yet.</p>
          <p className="text-slate-500 text-xs mt-1">Upload files from the section above.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ tableLayout: "auto" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Date</th>
                <th>View</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={doc.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: 600 }}>{doc.document_name}</td>
                  <td style={{ fontSize: "12px", color: "var(--muted)" }}>
                    {new Date(doc.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>
                    <a href={getDocUrl(doc.file_path)} target="_blank" rel="noopener noreferrer"
                      className="detail-btn-ghost"
                      style={{ textDecoration: "none", height: "34px" }}>
                      View
                    </a>
                  </td>
                  <td>
                    <button onClick={() => deleteDocument(doc.id)}
                      className="detail-btn-danger"
                      type="button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
