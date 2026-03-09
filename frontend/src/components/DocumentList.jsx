import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

export default function DocumentList({ caseId }) {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

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
    <div className="bg-card p-6 rounded-lg border border-gold/10 mb-6">
      <h2 className="text-sm font-bold mb-4 text-white tracking-wide">CASE DOCUMENTS</h2>

      {documents.length === 0 ? (
        <p className="text-slate-500 text-center py-6 text-sm">No documents uploaded</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gold/10">
                <th className="pb-3 text-left text-[10px] font-bold text-slate-500 tracking-[0.15em]">#</th>
                <th className="pb-3 text-left text-[10px] font-bold text-slate-500 tracking-[0.15em]">TITLE</th>
                <th className="pb-3 text-left text-[10px] font-bold text-slate-500 tracking-[0.15em]">DATE</th>
                <th className="pb-3 text-center text-[10px] font-bold text-slate-500 tracking-[0.15em]">VIEW</th>
                <th className="pb-3 text-center text-[10px] font-bold text-slate-500 tracking-[0.15em]">DELETE</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr key={doc.id} className="border-b border-gold/5 hover:bg-primary/50 transition-colors">
                  <td className="py-3 text-xs text-slate-500">{index + 1}</td>
                  <td className="py-3 text-sm font-semibold text-white">{doc.document_name}</td>
                  <td className="py-3 text-xs text-slate-400">
                    {new Date(doc.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 text-center">
                    <a href={getDocUrl(doc.file_path)} target="_blank" rel="noopener noreferrer"
                      className="text-gold text-[10px] font-bold tracking-wider px-3 py-1.5 border border-gold/30 rounded hover:bg-gold/10 transition-colors">
                      VIEW
                    </a>
                  </td>
                  <td className="py-3 text-center">
                    <button onClick={() => deleteDocument(doc.id)}
                      className="text-red-400 text-[10px] font-bold tracking-wider px-3 py-1.5 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors">
                      DELETE
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
