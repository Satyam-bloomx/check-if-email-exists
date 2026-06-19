import { Download, CheckCircle, RefreshCcw } from 'lucide-react';
import PaginatedResultsTable from './PaginatedResultsTable';

export default function DownloadResults({ jobData, onReset }) {
  const { job_id, summary, total_records } = jobData;

  const handleDownload = () => {
    // Direct browser to the download endpoint
    window.location.href = `/v1/bulk/${job_id}/results?format=csv`;
  };

  return (
    <div className="glass-card text-center" style={{ maxWidth: '800px', width: '95%' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--success)' }}>
        <CheckCircle size={64} />
      </div>
      
      <h2>Verification Complete</h2>
      <p className="text-muted mt-4 mb-8">
        Successfully verified {total_records} email addresses.
      </p>

      <div className="stats-grid mb-8" style={{ marginTop: '0', marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-value stat-safe">{summary.total_safe}</div>
          <div className="stat-label">Safe</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-risky">{summary.total_risky}</div>
          <div className="stat-label">Risky</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-invalid">{summary.total_invalid}</div>
          <div className="stat-label">Invalid</div>
        </div>
        <div className="stat-card">
          <div className="stat-value stat-unknown">{summary.total_unknown}</div>
          <div className="stat-label">Unknown</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <button onClick={handleDownload} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          <Download size={20} />
          Download CSV Results
        </button>
      </div>

      <PaginatedResultsTable jobId={job_id} totalRecords={total_records} />

      <div className="mt-8">
        <button 
          onClick={onReset} 
          className="btn" 
          style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-color)' }}
        >
          <RefreshCcw size={16} />
          Verify Another File
        </button>
      </div>
    </div>
  );
}
