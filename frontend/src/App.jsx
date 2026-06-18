import { useState } from 'react';
import Uploader from './components/Uploader';
import ProgressMonitor from './components/ProgressMonitor';
import DownloadResults from './components/DownloadResults';

function App() {
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
      <div className="header">
        <h1>Reacher Bulk Verifier</h1>
        <p>Upload a CSV file of email addresses to verify them instantly.</p>
      </div>

      <main>
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
      </main>
    </div>
  );
}

export default App;
