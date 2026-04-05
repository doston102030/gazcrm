import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import BraqCard from '../components/BraqCard';
import BraqModal from '../components/BraqModal';
import { Plus, Search } from 'lucide-react';

const BraqBalonlar = () => {
  const { braqlar, addBraq, deleteBraq } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSave = (data) => {
    addBraq(data);
  };

  const filtered = braqlar.filter(b => 
    b.ism.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.familya.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.telefon.includes(searchTerm) ||
    b.sabab.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="page-header header-flex">
        <div>
          <h1>Braq Balonlar</h1>
          <p className="page-sub">Almashtirilgan yoki shikastlangan balonlar hisobi</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Braq Qo'shish
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Qidirish (ism, telefon, sabab)..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="cards-grid">
          {filtered.map(b => (
            <BraqCard 
              key={b.id} 
              data={b} 
              onDelete={deleteBraq} 
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <p>Hech qanday braq balon yozuvi yo'q</p>
        </div>
      )}

      <BraqModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave}
      />

      <style jsx="true">{`
        .header-flex { display: flex; justify-content: space-between; align-items: flex-end; }
        .toolbar { margin-bottom: 24px; }
        .search-wrapper { position: relative; width: 100%; max-width: 400px; }
        .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3); }
        .search-input { padding-left: 42px !important; }
        
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .empty-state { text-align: center; padding: 60px 0; color: var(--text3); }
        .empty-icon { font-size: 40px; margin-bottom: 12px; }
      `}</style>
    </div>
  );
};

export default BraqBalonlar;
