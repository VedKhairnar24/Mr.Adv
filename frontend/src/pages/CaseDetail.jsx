import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import AddHearing from "../components/AddHearing";
import HearingList from "../components/HearingList";

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
      formData.append("caseId", id);

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
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              caseData.status === "Active" ? "bg-green-100 text-green-800" :
              caseData.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
              caseData.status === "Closed" ? "bg-gray-100 text-gray-800" :
              "bg-blue-100 text-blue-800"
            }`}>
              {caseData.status}
            </span>
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

      {/* Documents Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Documents
        </h2>

        {/* Upload Form */}
        <form onSubmit={uploadDocument} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3">Upload New Document</h3>
          
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
              Select File (PDF, DOC, DOCX)
            </label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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

        {documents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No documents uploaded yet
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors bg-white"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    {/* Document Icon */}
                    <div className="flex-shrink-0">
                      {doc.file_type?.includes('pdf') ? (
                        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    
                    {/* Document Info */}
                    <div>
                      <p className="font-medium text-gray-900">{doc.file_name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Uploaded: {new Date(doc.created_at).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {doc.file_type?.split('/')[1]?.toUpperCase() || 'Document'} • {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3">
                    <a
                      href={`http://localhost:7000/${doc.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </a>
                    
                    <a
                      href={`http://localhost:7000/${doc.file_path}`}
                      download={doc.file_name}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hearing Section */}
      <AddHearing caseId={id} />
      <HearingList caseId={id} />
    </div>
  );
}

export default CaseDetail;
