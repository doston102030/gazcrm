import React from 'react';
import { Calendar, Phone, Trash2, AlertTriangle } from 'lucide-react';

const BraqCard = ({ data, onDelete }) => {
  return (
    <div className="braq-card fade-in">
      <div className="card-status-bar overdue"></div>
      
      <div className="card-header">
        {data.rasm ? (
          <img src={data.rasm} className="card-avatar" alt="braq" />
        ) : (
          <div className="card-avatar-placeholder">
            <AlertTriangle size={32} color="#ef4444" />
          </div>
        )}
        <div className="card-ball" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <AlertTriangle size={14} />
          <span>BRAQ</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-name">{data.ism || 'Nomsiz'} {data.familya || ''}</h3>
        <div className="card-phone">
          <Phone size={14} /> {data.telefon || 'N/A'}
        </div>
        
        <div className="card-info-row">
          <Calendar size={14} /> <span>{data.sana || 'N/A'}</span>
        </div>

        <div className="braq-card-sabab-box">
          <div className="sabab-label">Shikastlanish:</div>
          <div className="sabab-text">{data.sabab || "Sabab ko'rsatilmadi"}</div>
        </div>
      </div>

      <div className="card-actions">
        <button className="card-btn card-btn-del" style={{ width: '100%' }} onClick={() => onDelete(data.id)}>
          <Trash2 size={16} /> O'chirish
        </button>
      </div>
    </div>
  );
};

export default BraqCard;
