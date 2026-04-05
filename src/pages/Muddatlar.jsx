import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateStatus } from '../utils/dateUtils';
import { Calendar, Clock } from 'lucide-react';

const Muddatlar = () => {
  const { murojaatlar } = useApp();

  const items = murojaatlar
    .filter(m => !m.yopilganSana)
    .map(m => ({ ...m, ...calculateStatus(m.sana) }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Muddatlar Jadvali</h1>
        <p className="page-sub">45 kunlik balon almashtirish muddatlari</p>
      </div>

      <div className="timeline-container">
        {items.length > 0 ? items.map(item => (
          <div key={item.id} className={`timeline-item ${item.status}`}>
            <div className={`timeline-dot dot-${item.status}`}></div>
            <div className="timeline-content">
              <div className="timeline-name">{(item.ism || 'N/A')} {(item.familya || '')}</div>
              <div className="timeline-meta">
                <Calendar size={12} /> {item.sana || 'No Date'}
              </div>
            </div>
            <div className={`timeline-days ${item.status}`}>
              <Clock size={14} /> 
              <span>
                {item.daysLeft <= 0 ? 'Muddati o\'tgan' : `${item.daysLeft} kun qoldi`}
              </span>
            </div>
          </div>
        )) : (
          <div className="empty-state">Hali yozuvlar yo'q</div>
        )}
      </div>
    </div>
  );
};

export default Muddatlar;
