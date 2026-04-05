import React from 'react';
import { Calendar, Phone, CheckCircle2, Edit3, Trash2, Star, MapPin, Package } from 'lucide-react';
import { calculateStatus } from '../utils/dateUtils';

const MurojaatCard = ({ data, onEdit, onDelete }) => {
  const isClosed = !!data.yopilganSana;
  const { status, statusText, color, daysLeft } = isClosed 
    ? { status: 'ok', statusText: 'Bajarilgan', color: '#10b981', daysLeft: null }
    : calculateStatus(data.sana);

  // Status Badge Class
  const badgeClass = status === 'overdue' ? 'badge-overdue' : (status === 'soon' ? 'badge-soon' : 'badge-ok');

  return (
    <div className="mijoz-card fade-in" onClick={() => onEdit(data)}>
      <div className={`card-status-bar ${status}`}></div>
      
      <div className="card-header">
        {data.rasm ? (
          <img src={data.rasm} className="card-avatar" alt="mijoz" />
        ) : (
          <div className="card-avatar-placeholder">
            {data.ism?.[0] || 'G'}
          </div>
        )}
        <div className="card-ball">
          <Package size={14} fill="none" strokeWidth={2.5} />
          <span>{data.balonSoni || data.ball || 1} ta</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-name">{data.ism || 'Ism'} {data.familya || ''}</h3>
        <div className="card-phone">
          <Phone size={14} /> {data.telefon || 'N/A'}
        </div>
        
        <div className="card-info-row">
          <Calendar size={14} /> <span>{data.sana || 'N/A'}</span>
        </div>
        
        {data.manzil && (
          <div className="card-info-row">
            <MapPin size={14} /> <span>{data.manzil}</span>
          </div>
        )}

        <div className={`card-badge ${badgeClass}`}>
          <div className="status-dot" style={{ background: 'currentColor', width: 6, height: 6, borderRadius: '50%' }}></div>
          {statusText} {daysLeft !== null && `(${daysLeft} kun)`}
        </div>
        
        <div className="progress-bar-wrap">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${Math.max(0, Math.min(100, (daysLeft || 0) * 2.2))}%`,
              background: color,
              boxShadow: `0 0 10px ${color}`
            }}
          ></div>
        </div>
      </div>

      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
        <button className="card-btn" style={{ background: 'var(--neon-blue-glow)', borderColor: 'var(--neon-blue)', color: 'var(--neon-blue)' }} onClick={() => onEdit(data)}>
          <Edit3 size={15} /> Edit
        </button>
        <button className="card-btn card-btn-del" onClick={() => onDelete(data.id)}>
          <Trash2 size={15} /> O'chirish
        </button>
      </div>
    </div>
  );
};

export default MurojaatCard;
