import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 2v4h-4M3 22v-4h4" />
      <path d="M21 3a9 9 0 0 0-15.36-3.36L3 6M3 21a9 9 0 0 0 15.36 3.36L21 18" />
    </svg>
  );
}

function CaseLookup() {
  const [searchType, setSearchType] = useState('cnr');
  const [searchValue, setSearchValue] = useState('');
  const [courtName, setCourtName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importData, setImportData] = useState({
    client_id: '',
    phone: '',
    email: '',
    address: ''
  });

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setSearchResult(null);
    setShowImportForm(false);

    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    // Validate CNR format (16 alphanumeric characters: 4 letters + 12 digits)
    if (searchType === 'cnr') {
      const cnrPattern = /^[A-Z]{4}[0-9]{12}$/i;
      if (!cnrPattern.test(searchValue.trim())) {
        setError('Invalid CNR format. Must be 16 characters (e.g., MHAU030080742026)');
        return;
      }
    }

    try {
      setLoading(true);

      let endpoint, payload;

      if (searchType === 'cnr') {
        endpoint = '/case-lookup/search/cnr';
        payload = { cnr_number: searchValue.trim() };
      } else {
        endpoint = '/case-lookup/search/case-number';
        payload = { 
          case_number: searchValue.trim(),
          court_name: courtName.trim()
        };
      }

      const response = await API.post(endpoint, payload);

      if (response.data.success) {
        setSearchResult(response.data.data);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        cache_id: searchResult.cache_id,
        ...importData
      };

      const response = await API.post('/case-lookup/import', payload);

      if (response.data.success) {
        alert('Case imported successfully to your dashboard!');
        navigate(`/cases/${response.data.case_id}`);
      } else {
        alert(response.data.message);
        navigate(`/cases/${response.data.case_id}`);
      }
    } catch (err) {
      console.error('Import error:', err);
      alert(err.response?.data?.message || 'Failed to import case');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const value = status?.toLowerCase() || '';
    if (value === 'active' || value === 'completed') return 'badge-active';
    if (value === 'pending') return 'badge-pending';
    if (value === 'disposed') return 'badge-disposed';
    if (value === 'closed') return 'badge-closed';
    return 'badge-pending';
  };

  const inputClass = "w-full bg-primary border border-gold/15 rounded px-4 py-2.5 focus:ring-2 focus:ring-gold/40 focus:border-gold/40 text-white placeholder-slate-600 text-sm";

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header className="app-header">
        <div className="app-header-title-wrap">
          <h1 className="app-header-title">Case Lookup</h1>
          <p className="app-header-subtitle">Search Indian Judicial Database (eCourts/NJDG)</p>
        </div>
      </header>

      <div className="app-body">
        {/* Search Form */}
        <div className="card" style={{ borderRadius: "3px", padding: "24px", marginBottom: "20px" }}>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
            Search Case
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Type Selection */}
            <div className="flex gap-4 mb-4">
              <button
                type="button"
                onClick={() => { setSearchType('cnr'); setSearchValue(''); }}
                className={`px-4 py-2 rounded text-sm font-semibold transition-all ${
                  searchType === 'cnr' 
                    ? 'bg-gold text-black' 
                    : 'bg-primary border border-gold/30 text-gold hover:bg-gold/10'
                }`}
              >
                Search by CNR
              </button>
              <button
                type="button"
                onClick={() => { setSearchType('case_number'); setSearchValue(''); }}
                className={`px-4 py-2 rounded text-sm font-semibold transition-all ${
                  searchType === 'case_number' 
                    ? 'bg-gold text-black' 
                    : 'bg-primary border border-gold/30 text-gold hover:bg-gold/10'
                }`}
              >
                Search by Case Number
              </button>
            </div>

            {/* Search Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">
                  {searchType === 'cnr' ? 'CNR NUMBER (16 characters) *' : 'CASE NUMBER *'}
                </label>
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
                  placeholder={searchType === 'cnr' ? 'e.g., MHAU030080742026' : 'e.g., CS/1234/2024'}
                  maxLength={searchType === 'cnr' ? 16 : undefined}
                  required
                  className={inputClass}
                />
                {searchType === 'cnr' && (
                  <p className="text-[10px] text-slate-600 mt-1">CNR is a unique 16-character identifier (4 letters + 12 digits)</p>
                )}
              </div>

              {searchType === 'case_number' && (
                <div>
                  <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">
                    COURT NAME (Optional)
                  </label>
                  <input
                    type="text"
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    placeholder="e.g., District Court - Mumbai"
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <SearchIcon />
                  Search Case
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Search Result */}
        {searchResult && (
          <>
            <div className="card" style={{ borderRadius: "3px", padding: "24px", marginBottom: "20px" }}>
              <div className="flex justify-between items-start mb-4">
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 600 }}>
                  Case Details
                </h2>
                <span className={`badge ${getStatusBadgeClass(searchResult.case_status)}`}>
                  {(searchResult.case_status || 'Unknown').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">CNR NUMBER</p>
                  <p className="text-white font-mono text-sm">{searchResult.cnr_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">CASE NUMBER</p>
                  <p className="text-white font-mono text-sm">{searchResult.case_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">COURT</p>
                  <p className="text-white text-sm">{searchResult.court_name || 'N/A'}</p>
                  {(searchResult.court_district || searchResult.court_state) && (
                    <p className="text-slate-400 text-xs mt-1">
                      {searchResult.court_district}, {searchResult.court_state}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">CASE TYPE</p>
                  <p className="text-white text-sm">{searchResult.case_type || 'N/A'}</p>
                  <p className="text-slate-400 text-xs mt-1">{searchResult.case_category || ''}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">PETITIONER</p>
                  <p className="text-white text-sm">{searchResult.petitioner_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">RESPONDENT</p>
                  <p className="text-white text-sm">{searchResult.respondent_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">FILING DATE</p>
                  <p className="text-white text-sm">{searchResult.filing_date || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-semibold mb-1">NEXT HEARING</p>
                  <p className="text-gold text-sm font-semibold">{searchResult.next_hearing_date || 'N/A'}</p>
                </div>
              </div>

              {searchResult.case_description && (
                <div className="mb-4">
                  <p className="text-slate-400 text-xs font-semibold mb-2">DESCRIPTION</p>
                  <p className="text-white text-sm">{searchResult.case_description}</p>
                </div>
              )}

              {searchResult.proceedings && (
                <div className="mb-4">
                  <p className="text-slate-400 text-xs font-semibold mb-2">LAST PROCEEDINGS</p>
                  <p className="text-white text-sm">{searchResult.proceedings}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gold/10">
                <button
                  onClick={() => setShowImportForm(!showImportForm)}
                  className="btn-primary"
                >
                  <span className="flex items-center gap-2">
                    <PlusIcon />
                    Add to My Cases
                  </span>
                </button>
                <button
                  onClick={() => { setSearchResult(null); setSearchValue(''); }}
                  className="btn-ghost"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Import Form */}
            {showImportForm && (
              <div className="card" style={{ borderRadius: "3px", padding: "24px", marginBottom: "20px" }}>
                <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
                  Import Case to Dashboard
                </h2>
                <form onSubmit={handleImport} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">
                        CLIENT (Auto-created from petitioner)
                      </label>
                      <input
                        type="text"
                        value={searchResult.petitioner_name || ''}
                        disabled
                        className={`${inputClass} opacity-60`}
                      />
                      <p className="text-[10px] text-slate-600 mt-1">A new client will be created automatically</p>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">
                        PHONE (Optional)
                      </label>
                      <input
                        type="text"
                        value={importData.phone}
                        onChange={(e) => setImportData({...importData, phone: e.target.value})}
                        placeholder="Client phone number"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">
                        EMAIL (Optional)
                      </label>
                      <input
                        type="email"
                        value={importData.email}
                        onChange={(e) => setImportData({...importData, email: e.target.value})}
                        placeholder="Client email"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xs font-semibold mb-2 tracking-wide">
                        ADDRESS (Optional)
                      </label>
                      <input
                        type="text"
                        value={importData.address}
                        onChange={(e) => setImportData({...importData, address: e.target.value})}
                        placeholder="Client address"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Importing...' : 'Import Case'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImportForm(false)}
                      className="btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!searchResult && !loading && (
          <div className="empty-state" style={{ minHeight: "300px" }}>
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginBottom: "12px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="empty-title" style={{ fontSize: "18px" }}>Search for a case</h3>
            <p className="empty-text" style={{ fontSize: "12px" }}>
              Enter CNR number or case number to search Indian judicial databases
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CaseLookup;
