import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, SearchX } from 'lucide-react';
import MurojaatCard from '../components/MurojaatCard';
import BraqCard from '../components/BraqCard';

const Qidiruv = () => {
  const { murojaatlar, braqlar, updateMurojaat, deleteMurojaat, deleteBraq } = useApp();
  const [query, setQuery] = useState('');

  const filteredMurojaatlar = query.length > 0 ? murojaatlar.filter(m => 
    (m.ism || '').toLowerCase().includes(query.toLowerCase()) ||
    (m.familya || '').toLowerCase().includes(query.toLowerCase()) ||
    (m.telefon || '').includes(query) ||
    (m.manzil || '').toLowerCase().includes(query.toLowerCase()) ||
    (m.izoh || '').toLowerCase().includes(query.toLowerCase())
  ) : [];

  const filteredBraqlar = query.length > 0 ? braqlar.filter(b => 
    (b.ism || '').toLowerCase().includes(query.toLowerCase()) ||
    (b.familya || '').toLowerCase().includes(query.toLowerCase()) ||
    (b.telefon || '').includes(query) ||
    (b.sabab || '').toLowerCase().includes(query.toLowerCase())
  ) : [];

  const hasResults = filteredMurojaatlar.length > 0 || filteredBraqlar.length > 0;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Global Qidiruv</h1>
        <p className="page-sub">Tizimdagi barcha yozuvlar bo'yicha qidirish</p>
      </header>

      <div className="toolbar">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Ism, telefon, manzil yoki sabab bo'yicha qidirish..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {query.length > 0 ? (
        <div className="search-results">
          {hasResults ? (
            <>
              {filteredMurojaatlar.length > 0 && (
                <section style={{ marginBottom: 48 }}>
                  <h2 style={{ fontSize: 18, marginBottom: 20, color: 'var(--text2)' }}>Murojaatlar ({filteredMurojaatlar.length})</h2>
                  <div className="cards-grid">
                    {filteredMurojaatlar.map(m => (
                      <MurojaatCard key={m.id} data={m} onEdit={updateMurojaat} onDelete={deleteMurojaat} />
                    ))}
                  </div>
                </section>
              )}

              {filteredBraqlar.length > 0 && (
                <section>
                  <h2 style={{ fontSize: 18, marginBottom: 20, color: 'var(--neon-red)' }}>Braq Balonlar ({filteredBraqlar.length})</h2>
                  <div className="cards-grid">
                    {filteredBraqlar.map(b => (
                      <BraqCard key={b.id} data={b} onDelete={deleteBraq} />
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="empty-state">
              <SearchX size={64} className="empty-icon" />
              <p>Hech narsa topilmadi...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state" style={{ borderStyle: 'solid', background: 'transparent' }}>
          <Search size={64} className="empty-icon" />
          <p>Qidirishni boshlash uchun yuqoriga yozing</p>
        </div>
      )}
    </div>
  );
};

export default Qidiruv;
