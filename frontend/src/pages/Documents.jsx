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

  // Fetch all cases for dropdown
  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await API.get("/cases/all");
      setCases(res.data);
      
      // Auto-select first case if available
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

  // Fetch documents for selected case
  const fetchDocuments = async () => {
    if (!caseId) return;
    
    try {
      const res = await API.get(`/documents/${caseId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      // Don't show error for empty document lists
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (caseId) {
      fetchDocuments();
    }
  }, [caseId]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setError("Only PDF and Word documents (.pdf, .doc, .docx) are allowed");
      setFile(null);
      e.target.value = ""; // Reset file input
      return;
    }
    
    // Validate file size (10MB max)
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      setFile(null);
      e.target.value = "";
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  // Upload document
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

      await API.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Document uploaded successfully!");
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
      
      // Refresh documents list
      fetchDocuments();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  // Delete document
  const deleteDocument = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await API.delete(`/documents/${docId}`);
      setSuccess("Document deleted successfully!");
      fetchDocuments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Failed to delete document");
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return '📄';
    } else if (fileType?.includes('word') || fileType?.includes('document')) {
      return '📝';
    } else {
      return '📎';
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file name from path
  const getFileName = (filePath) => {
    if (!filePath) return '';
    return filePath.split('/').pop();
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600 mt-1">Upload and manage case documents</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={uploadDocument} className="space-y-4">
          {/* Case Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Case *
            </label>
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a case...</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.case_title} {c.case_number ? `(${c.case_number})` : ''} - {c.client_name}
                </option>
              ))}
            </select>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOC, DOCX (Max 10MB)
                </p>
              </label>
              {file && (
                <div className="mt-3 text-sm text-gray-700">
                  <span className="font-medium">Selected:</span> {file.name} ({formatFileSize(file.size)})
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !file || !caseId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload Document"
            )}
          </button>
        </form>
      </div>

      {/* Documents List */}
      {caseId && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Documents for This Case</h2>
            <span className="text-sm text-gray-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && documents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2">No documents uploaded yet</p>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {/* File Icon */}
                      <div className="text-3xl">
                        {getFileIcon(doc.file_type)}
                      </div>
                      
                      {/* File Info */}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {doc.document_name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>
                            Uploaded: {new Date(doc.uploaded_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Download/View Button */}
                      <a
                        href={`http://localhost:5000${doc.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View
                      </a>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
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
