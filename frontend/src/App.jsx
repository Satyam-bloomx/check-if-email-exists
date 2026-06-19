import { useState } from 'react';
import Uploader from './components/Uploader';
import ProgressMonitor from './components/ProgressMonitor';
import DownloadResults from './components/DownloadResults';
import SingleVerifier from './components/SingleVerifier';

function App() {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [jobId, setJobId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'polling', 'completed'

  const handleJobCreated = (id) => {
    setJobId(id);
    setStatus('polling');
  };

  const handleJobCompleted = (data) => {
    setJobData(data);
    setStatus('completed');
  };

  const handleReset = () => {
    setJobId(null);
    setJobData(null);
    setStatus('idle');
  };

  return (
    <div className="app-container">
      <nav className="top-navbar">
        <div className="brand-logo">
          <img src="/logo.png" alt="Reacher Logo" className="logo-img" />
        </div>
      </nav>

      <div className="mode-tabs">
        <button 
          className={`tab-btn ${mode === 'single' ? 'active' : ''}`} 
          onClick={() => setMode('single')}
        >
          Single Email
        </button>
        <button 
          className={`tab-btn ${mode === 'bulk' ? 'active' : ''}`} 
          onClick={() => setMode('bulk')}
        >
          Bulk List
        </button>
      </div>

      <main>
        {mode === 'single' ? (
          <SingleVerifier />
        ) : (
          <>
            {status === 'idle' && (
              <Uploader onJobCreated={handleJobCreated} />
            )}

            {status === 'polling' && jobId && (
              <ProgressMonitor
                jobId={jobId}
                onComplete={handleJobCompleted}
              />
            )}

            {status === 'completed' && jobData && (
              <DownloadResults
                jobData={jobData}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
