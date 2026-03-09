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

  // Build the correct URL (handles Windows backslash paths)
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
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        📄 Case Documents
      </h2>

      {documents.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No documents uploaded</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 text-left text-sm font-semibold">#</th>
                <th className="p-3 text-left text-sm font-semibold">Title</th>
                <th className="p-3 text-left text-sm font-semibold">Date</th>
                <th className="p-3 text-center text-sm font-semibold">View</th>
                <th className="p-3 text-center text-sm font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, index) => (
                <tr
                  key={doc.id}
                  className="border-t border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-3 text-sm font-medium text-gray-900">
                    {doc.document_name}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(doc.uploaded_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3 text-center">
                    <a
                      href={getDocUrl(doc.file_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      View
                    </a>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="inline-block bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
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
