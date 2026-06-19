import { X, Mail } from 'lucide-react';

export default function ResultModal({ result, onClose }) {
  // Extract native Reacher fields
  const status = result?.is_reachable || 'unknown';
  const domain = result?.syntax?.domain || 'Unknown';
  const username = result?.syntax?.username || 'Unknown';
  const mxFound = result?.mx?.accepts_mail ? 'Yes' : 'No';
  
  // Calculate Sub-Status for Cold Outreach
  let subStatus = 'None';
  if (result?.misc?.is_disposable) subStatus = 'Disposable Email';
  else if (result?.misc?.is_role_account) subStatus = 'Role-Based Account';
  else if (result?.smtp?.is_catch_all) subStatus = 'Catch-All Server';
  else if (result?.smtp?.has_full_inbox) subStatus = 'Full Inbox';

  const getStatusColor = (status) => {
    switch(status) {
      case 'safe': return 'var(--success)';
      case 'invalid': return 'var(--error)';
      case 'risky': return 'var(--warning)';
      default: return 'var(--muted)';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="modal-header">
          <div className="modal-icon">
            <Mail size={20} />
          </div>
          <h3>{result?.input || 'Unknown Email'}</h3>
        </div>

        <div className="modal-grid">
          <div className="modal-field">
            <label>STATUS</label>
            <div className="field-value" style={{ borderColor: getStatusColor(status) }}>
              {status}
            </div>
          </div>
          
          <div className="modal-field">
            <label>SUB-STATUS</label>
            <div className="field-value" style={{ 
              borderColor: subStatus !== 'None' ? 'var(--warning)' : 'var(--success)' 
            }}>
              {subStatus}
            </div>
          </div>

          <div className="modal-field">
            <label>ACCOUNT</label>
            <div className="field-value">{username}</div>
          </div>

          <div className="modal-field">
            <label>DOMAIN</label>
            <div className="field-value">{domain}</div>
          </div>

          <div className="modal-field">
            <label>MX FOUND</label>
            <div className="field-value">{mxFound}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
