import { X, Mail, Info } from 'lucide-react';

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

  const subStatusExplanations = {
    'Disposable Email': 'This is a temporary, throwaway email address often used to bypass registration forms. It will likely bounce or be ignored.',
    'Role-Based Account': 'This email is associated with a company role (e.g., admin@, support@) rather than a specific person. They usually have low reply rates.',
    'Catch-All Server': 'The domain accepts all emails sent to it, even if the user does not exist. We cannot guarantee this specific email is actively checked.',
    'Full Inbox': 'The recipient\'s inbox is currently full and cannot accept new emails. Your email will bounce.',
    'None': 'No specific issues detected with this email account.'
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
            <label style={{ display: 'flex', alignItems: 'center' }}>
              STATUS
              <div className="info-icon-wrapper">
                <Info size={14} />
                <span className="custom-tooltip">The overall deliverability rating of the email address (Safe, Risky, Invalid, or Unknown).</span>
              </div>
            </label>
            <div className="field-value" style={{ borderColor: getStatusColor(status) }}>
              {status}
            </div>
          </div>
          
          <div className="modal-field">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              SUB-STATUS
              <div className="info-icon-wrapper">
                <Info size={14} />
                <span className="custom-tooltip">{subStatusExplanations[subStatus]}</span>
              </div>
            </label>
            <div className="field-value" style={{ 
              borderColor: subStatus !== 'None' ? 'var(--warning)' : 'var(--success)' 
            }}>
              {subStatus}
            </div>
          </div>

          <div className="modal-field">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              ACCOUNT
              <div className="info-icon-wrapper">
                <Info size={14} />
                <span className="custom-tooltip">The local part of the email address (everything before the @ symbol).</span>
              </div>
            </label>
            <div className="field-value">{username}</div>
          </div>

          <div className="modal-field">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              DOMAIN
              <div className="info-icon-wrapper">
                <Info size={14} />
                <span className="custom-tooltip">The domain part of the email address (everything after the @ symbol).</span>
              </div>
            </label>
            <div className="field-value">{domain}</div>
          </div>

          <div className="modal-field">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              MX FOUND
              <div className="info-icon-wrapper">
                <Info size={14} />
                <span className="custom-tooltip">Indicates whether a Mail Exchanger server was found. If 'No', the domain cannot receive emails and will bounce.</span>
              </div>
            </label>
            <div className="field-value">{mxFound}</div>
          </div>
        </div>

      </div>
    </div>
  );
}
