import React from 'react';

const StatsCard = ({ icon, num, label, colorClass }) => {
  return (
    <div className={`stat-card ${colorClass}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-num">{num}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatsCard;
