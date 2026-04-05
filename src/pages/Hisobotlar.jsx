import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TrendingUp, Award, CheckCircle2, Package } from 'lucide-react';

const Hisobotlar = () => {
  const { murojaatlar } = useApp();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
  ];

  const recordsThisMonth = murojaatlar.filter(m => {
    if (!m.sana) return false;
    const d = new Date(m.sana);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalBalloons = recordsThisMonth.reduce((acc, curr) => acc + (curr.balonSoni || curr.ball || 1), 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Oylik Hisobotlar</h1>
        <p className="page-sub">Tashkilot ish ko'rsatkichlari tahlili</p>
      </div>

      <div className="report-selector">
        <label>Davrni tanlang:</label>
        <div className="select-group">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="report-summary-grid">
        <div className="report-card">
          <div className="report-card-icon blue"><TrendingUp size={24} /></div>
          <div className="report-card-info">
            <div className="report-card-val">{recordsThisMonth.length}</div>
            <div className="report-card-label">Shu oy kiritilgan</div>
          </div>
        </div>
        <div className="report-card">
          <div className="report-card-icon green"><CheckCircle2 size={24} /></div>
          <div className="report-card-info">
            <div className="report-card-val">{recordsThisMonth.length}</div>
            <div className="report-card-label">Xizmat ko'rsatilgan (Bajarilgan)</div>
          </div>
        </div>
        <div className="report-card">
          <div className="report-card-icon yellow"><Package size={24} /></div>
          <div className="report-card-info">
            <div className="report-card-val">{totalBalloons}</div>
            <div className="report-card-label">Tarqatilgan balonlar</div>
          </div>
        </div>
      </div>

      <div className="report-details panel">
        <div className="panel-header">
          <h2>{months[selectedMonth]} {selectedYear} — Bajarilgan ishlar ro'yxati</h2>
        </div>
        <div className="panel-body">
          {recordsThisMonth.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Ism Familya</th>
                    <th>Xizmat Sanasi</th>
                    <th>Telefon</th>
                    <th>Manzil</th>
                    <th>Balon (dona)</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsThisMonth.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{m.ism || 'N/A'} {m.familya || ''}</td>
                      <td>{m.sana || 'N/A'}</td>
                      <td>{m.telefon || 'N/A'}</td>
                      <td>{m.manzil || 'N/A'}</td>
                      <td className="bold" style={{ color: 'var(--neon-yellow)' }}>{m.balonSoni || m.ball || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>Ushbu oy uchun kiritilgan ma'lumotlar yo'q</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hisobotlar;
