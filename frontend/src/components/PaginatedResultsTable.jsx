import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function PaginatedResultsTable({ jobId, totalRecords }) {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  
  const totalPages = Math.ceil(totalRecords / limit);

  useEffect(() => {
    fetchResults(currentPage);
  }, [currentPage, jobId]);

  const fetchResults = async (page) => {
    setIsLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * limit;
      const response = await fetch(`/v0/bulk/${jobId}/results?format=json&limit=${limit}&offset=${offset}`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'safe':
        return <span className="badge badge-success">Safe</span>;
      case 'invalid':
        return <span className="badge badge-error">Invalid</span>;
      case 'risky':
        return <span className="badge badge-warning">Risky</span>;
      default:
        return <span className="badge badge-unknown">Unknown</span>;
    }
  };

  return (
    <div className="results-table-container">
      <div className="table-responsive">
        <table className="results-table">
          <thead>
            <tr>
              <th>Email Address</th>
              <th>Status</th>
              <th>Sub-Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="3" className="text-center py-4">Loading results...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-error">{error}</td>
              </tr>
            ) : results.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4">No results found.</td>
              </tr>
            ) : (
              results.map((item, idx) => (
                <tr key={idx}>
                  <td className="email-cell">{item.input}</td>
                  <td>{getStatusBadge(item.is_reachable)}</td>
                  <td className="substatus-cell">
                    {item.misc?.is_disposable ? 'Disposable' : 
                     item.smtp?.has_full_inbox ? 'Full Inbox' : 
                     item.syntax?.is_valid_syntax === false ? 'Invalid Syntax' : 'None'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            className="btn-icon" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft size={18} />
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="btn-icon" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
