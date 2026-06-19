import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import ResultModal from './ResultModal';

export default function SingleVerifier() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/v0/check_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to_email: email })
      });

      if (!response.ok) {
        throw new Error('Failed to verify email. Please try again later.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="single-verifier-container glass-card">
        <h2>Enter an email address below to test our free email verifier</h2>
        
        <form onSubmit={handleSubmit} className="single-verifier-form">
          <input
            type="email"
            className="single-email-input"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <button 
            type="submit" 
            className="single-verify-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner-small"></div>
            ) : (
              <><CheckCircle size={18} style={{ marginRight: '8px' }} /> Verify</>
            )}
          </button>
        </form>

        {error && (
          <div className="single-error">
            <AlertCircle size={16} style={{ marginRight: '6px' }} /> {error}
          </div>
        )}
      </div>

      {result && (
        <ResultModal result={result} onClose={() => setResult(null)} />
      )}
    </>
  );
}
