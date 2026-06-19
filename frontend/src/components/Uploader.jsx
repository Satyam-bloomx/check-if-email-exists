import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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

  const processFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const validExts = ['csv', 'txt', 'json', 'xlsx', 'xls'];
    
    if (!validExts.includes(ext)) {
      setError('Please upload a valid file (.csv, .txt, .json, .xlsx, .xls).');
      return;
    }

    setIsLoading(true);

    try {
      let emails = [];

      if (ext === 'txt') {
        const text = await file.text();
        emails = text.split(/\r?\n/).map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
      } else if (ext === 'json') {
        const text = await file.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          emails = data.map(item => typeof item === 'string' ? item : item.email || item.mail || '').map(e => String(e).trim()).filter(e => e.length > 0 && e.includes('@'));
        } else {
          throw new Error("JSON file must contain an array of emails or objects with an 'email' field.");
        }
      } else if (ext === 'xlsx' || ext === 'xls') {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (json.length === 0) throw new Error("Spreadsheet is empty.");
        
        let emailColumn = Object.keys(json[0]).find(h => 
          ['email', 'e-mail', 'mail', 'email address', 'contact', 'to', 'recipient'].includes(h.toLowerCase().trim())
        );

        if (!emailColumn) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          for (const key in json[0]) {
            if (emailRegex.test(String(json[0][key]).trim())) {
              emailColumn = key;
              break;
            }
          }
        }
        
        if (!emailColumn) throw new Error('Could not find an email column in the spreadsheet.');
        emails = json.map(row => String(row[emailColumn] || '').trim()).filter(e => e.length > 0 && e.includes('@'));

      } else if (ext === 'csv') {
        emails = await new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (!results.data || results.data.length === 0) return reject(new Error('The CSV file is empty.'));
              
              let emailColumn = (results.meta.fields || []).find(h => 
                ['email', 'e-mail', 'mail', 'email address', 'contact', 'to', 'recipient'].includes(h.toLowerCase().trim())
              );

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

              if (!emailColumn) return reject(new Error('Could not automatically find an email column in the CSV.'));
              resolve(results.data.map(row => String(row[emailColumn] || '').trim()).filter(e => e.length > 0 && e.includes('@')));
            },
            error: (err) => reject(new Error(`Failed to parse CSV: ${err.message}`))
          });
        });
      }

      if (emails.length === 0) {
        throw new Error('No valid emails found in the file.');
      }

      submitToAPI(emails);

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
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
        <h2>Upload your List</h2>
        <p className="text-muted" style={{ marginTop: '0.5rem' }}>
          Upload your emails and we will automatically verify them.
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
          accept=".csv,.txt,.json,.xlsx,.xls" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          disabled={isLoading}
        />
        {isLoading ? (
          <div className="text-center">
            <div style={{ display: 'inline-block', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}></div>
            <p className="mt-4">Processing and uploading file...</p>
          </div>
        ) : (
          <>
            <UploadCloud size={48} className="dropzone-icon" />
            <div>
              <p className="dropzone-text">Click or drag & drop your file here</p>
              <p className="dropzone-subtext">Supports CSV, TXT, JSON, Excel (.xlsx, .xls)</p>
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
