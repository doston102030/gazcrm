import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateStatus } from '../utils/dateUtils';
import MurojaatCard from '../components/MurojaatCard';
import MurojaatModal from '../components/MurojaatModal';
import { Plus, Search } from 'lucide-react';

const PortalMurojaatlari = () => {
  const { murojaatlar, addMurojaat, updateMurojaat, deleteMurojaat } = useApp();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const handleOpenAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (data) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editData) updateMurojaat(editData.id, data);
    else addMurojaat(data);
  };

  const filtered = murojaatlar.filter(m => {
    if (m.yopilganSana) return false;

    const ism = (m.ism || '').toLowerCase();
    const familya = (m.familya || '').toLowerCase();
    const tel = (m.telefon || '');
    
    const matchesSearch = 
      ism.includes(searchTerm.toLowerCase()) || 
      familya.includes(searchTerm.toLowerCase()) ||
      tel.includes(searchTerm);
    
    const { status } = calculateStatus(m.sana);
    const matchesFilter = filter === 'all' || status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fade-in">
      <div className="page-header header-flex">
        <div>
          <h1>Portal Murojaatlari</h1>
          <p className="page-sub">Barcha aktiv murojaatlar ro'yxati</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Yangi Qo'shish
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Ism, familya yoki telefon bo'yicha qidirish..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Hammasi</button>
        <button className={`filter-btn ${filter === 'overdue' ? 'active' : ''}`} onClick={() => setFilter('overdue')}>Muddati o'tgan</button>
        <button className={`filter-btn ${filter === 'soon' ? 'active' : ''}`} onClick={() => setFilter('soon')}>Tugaydi (≤7)</button>
        <button className={`filter-btn ${filter === 'ok' ? 'active' : ''}`} onClick={() => setFilter('ok')}>Normal</button>
      </div>

      {filtered.length > 0 ? (
        <div className="cards-grid">
          {filtered.map(m => (
            <MurojaatCard 
              key={m.id} 
              data={m} 
              onEdit={handleOpenEdit} 
              onDelete={deleteMurojaat} 
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <p>Murojaatlar topilmadi</p>
        </div>
      )}

      <MurojaatModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave}
        editData={editData}
      />
    </div>
  );
};

export default PortalMurojaatlari;
