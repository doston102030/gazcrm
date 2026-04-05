import React from 'react';
import { useApp } from '../context/AppContext';
import { calculateStatus } from '../utils/dateUtils';
import StatsCard from '../components/StatsCard';
import MurojaatCard from '../components/MurojaatCard';
import { AlertCircle, Clock, Users, FileBox } from 'lucide-react';

const Dashboard = () => {
  const { murojaatlar, braqlar, updateMurojaat, deleteMurojaat } = useApp();

  const stats = murojaatlar.reduce((acc, m) => {
    if (m.yopilganSana) return acc;
    const { status } = calculateStatus(m.sana);
    if (acc[status] !== undefined) acc[status]++;
    acc.total++;
    return acc;
  }, { total: 0, overdue: 0, soon: 0, ok: 0 });

  const overdueList = murojaatlar
    .filter(m => !m.yopilganSana && calculateStatus(m.sana).status === 'overdue')
    .slice(0, 5);

  const soonList = murojaatlar
    .filter(m => !m.yopilganSana && calculateStatus(m.sana).status === 'soon')
    .slice(0, 5);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Boshqaruv Paneli</h1>
        <p className="page-sub">Umumiy holat va real-vaqt statistikasi</p>
      </div>

      <div className="stats-grid">
        <StatsCard 
          icon={<Users size={32} />} 
          num={stats.total} 
          label="Aktiv Murojaatlar" 
          colorClass="stat-blue" 
        />
        <StatsCard 
          icon={<AlertCircle size={32} />} 
          num={stats.overdue} 
          label="Muddati o'tgan" 
          colorClass="stat-red" 
        />
        <StatsCard 
          icon={<Clock size={32} />} 
          num={stats.soon} 
          label="Yaqin orada tugaydi" 
          colorClass="stat-yellow" 
        />
        <StatsCard 
          icon={<FileBox size={32} />} 
          num={braqlar.length} 
          label="Braq Balonlar" 
          colorClass="stat-purple" 
        />
      </div>

      <div className="dashboard-panels">
        <div className="panel">
          <div className="panel-header">
            <h2>🚨 Muddati o'tgan (Kutilayotgan)</h2>
          </div>
          <div className="panel-body">
            {overdueList.length > 0 ? (
              <div className="mini-list">
                {overdueList.map(m => (
                  <MurojaatCard key={m.id} data={m} onEdit={(data) => updateMurojaat(m.id, data)} onDelete={deleteMurojaat} />
                ))}
              </div>
            ) : <p className="empty-text">Hozircha hamma narsa joyida ✅</p>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>⚠️ Tez orada muddati tugaydi</h2>
          </div>
          <div className="panel-body">
            {soonList.length > 0 ? (
              <div className="mini-list">
                {soonList.map(m => (
                  <MurojaatCard key={m.id} data={m} onEdit={(data) => updateMurojaat(m.id, data)} onDelete={deleteMurojaat} />
                ))}
              </div>
            ) : <p className="empty-text">Yaqin muddatli murojaatlar yo'q</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
