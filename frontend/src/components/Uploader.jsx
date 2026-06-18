import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';

export default function Uploader({ onJobCreated }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setIsLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError('The CSV file is empty.');
          setIsLoading(false);
          return;
        }

        // Try to automatically find the email column
        const headers = results.meta.fields || [];
        let emailColumn = headers.find(h => 
          ['email', 'e-mail', 'mail', 'email address', 'contact', 'to', 'recipient'].includes(h.toLowerCase().trim())
        );

        // Fallback: scan first row for something that looks like an email
        if (!emailColumn) {
          const firstRow = results.data[0];
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          for (const key in firstRow) {
            if (emailRegex.test(String(firstRow[key]).trim())) {
              emailColumn = key;
              break;
            }
          }
        }

        if (!emailColumn) {
          setError('Could not automatically find an email column in the CSV. Please ensure your column is named "email".');
          setIsLoading(false);
          return;
        }

        const emails = results.data
          .map(row => String(row[emailColumn]).trim())
          .filter(email => email.length > 0);

        if (emails.length === 0) {
          setError('No valid emails found in the selected column.');
          setIsLoading(false);
          return;
        }

        // Send to backend
        submitToAPI(emails);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsLoading(false);
      }
    });
  };

  const submitToAPI = async (emails) => {
    try {
      const response = await fetch('/v1/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: emails })
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      if (data.job_id) {
        onJobCreated(data.job_id);
      } else {
        throw new Error('No job ID returned from server.');
      }
    } catch (err) {
      setError(`Failed to submit job: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <div className="text-center mb-4">
        <h2>Upload your CSV</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          We will automatically detect the email column and verify them.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      <label 
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          accept=".csv" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isLoading ? (
          <div className="text-center">
            <div style={{ display: 'inline-block', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
            <p className="mt-4">Processing and uploading CSV...</p>
          </div>
        ) : (
          <>
            <UploadCloud size={48} className="dropzone-icon" />
            <div>
              <p className="dropzone-text">Click or drag & drop your CSV file here</p>
              <p className="dropzone-subtext">Supports thousands of rows</p>
            </div>
            <div className="btn btn-primary mt-4">
              <FileType size={18} /> Select File
            </div>
          </>
        )}
      </label>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
