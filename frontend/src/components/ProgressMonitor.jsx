import { useState, useEffect } from 'react';
import { Activity, ShieldCheck, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export default function ProgressMonitor({ jobId, onComplete }) {
  const [jobData, setJobData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/v1/bulk/${jobId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.status}`);
        }
        
        const data = await response.json();
        setJobData(data);

        if (data.job_status === 'Completed') {
          clearInterval(intervalId);
          onComplete(data);
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching progress. We will keep trying...");
      }
    };

    // Initial fetch
    pollStatus();

    // Poll every 2 seconds
    intervalId = setInterval(pollStatus, 2000);

    return () => clearInterval(intervalId);
  }, [jobId, onComplete]);

  if (!jobData) {
    return (
      <div className="glass-card text-center">
        <h2>Connecting to Job #{jobId}...</h2>
        <p className="text-muted mt-4">Initializing verification queue...</p>
      </div>
    );
  }

  const { total_records, total_processed, summary, job_status } = jobData;
  const progressPercent = total_records > 0 
    ? Math.round((total_processed / total_records) * 100) 
    : 0;

  return (
    <div className="glass-card">
      <div className="text-center mb-4">
        <h2>Verifying Emails</h2>
        <p className="text-muted">Job #{jobId} • {job_status}</p>
      </div>

      <div className="progress-container">
        <div className="progress-header">
          <span>Processing {total_records} records</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <ShieldCheck className="stat-safe" size={24} style={{ margin: '0 auto' }} />
          <div className="stat-value stat-safe">{summary.total_safe}</div>
          <div className="stat-label">Safe</div>
        </div>
        
        <div className="stat-card">
          <AlertTriangle className="stat-risky" size={24} style={{ margin: '0 auto' }} />
          <div className="stat-value stat-risky">{summary.total_risky}</div>
          <div className="stat-label">Risky</div>
        </div>

        <div className="stat-card">
          <XCircle className="stat-invalid" size={24} style={{ margin: '0 auto' }} />
          <div className="stat-value stat-invalid">{summary.total_invalid}</div>
          <div className="stat-label">Invalid</div>
        </div>

        <div className="stat-card">
          <HelpCircle className="stat-unknown" size={24} style={{ margin: '0 auto' }} />
          <div className="stat-value stat-unknown">{summary.total_unknown}</div>
          <div className="stat-label">Unknown</div>
        </div>
      </div>

      {error && <p style={{ color: 'var(--warning)', marginTop: '1rem', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

      <div className="text-center mt-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Activity size={18} className="spin-slow" />
          <span>Verifying in real-time...</span>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .spin-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
