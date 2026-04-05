import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Star } from 'lucide-react';

const MurojaatModal = ({ isOpen, onClose, onSave, editData }) => {
  const initialState = {
    ism: '',
    familya: '',
    telefon: '',
    sana: new Date().toISOString().split('T')[0],
    balonSoni: 1,
    manzil: '',
    izoh: '',
    rasm: null,
    pdf: null,
    yopilganSana: null,
    prezidentPortali: false,
    hududGazPortali: false,
    monopoliya: false
  };

  const [formData, setFormData] = useState(initialState);
  const [isYopilgan, setIsYopilgan] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
        balonSoni: editData.balonSoni || editData.ball || 1,
      });
      setIsYopilgan(!!editData.yopilganSana);
    } else {
      setFormData(initialState);
      setIsYopilgan(false);
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [e.target.name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (isYopilgan && !finalData.yopilganSana) {
      finalData.yopilganSana = new Date().toISOString();
    } else if (!isYopilgan) {
      finalData.yopilganSana = null;
    }
    onSave(finalData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h2>{editData ? "Murojaatni tahrirlash" : "Yangi murojaat qo'shish"}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Ism <span className="req">*</span></label>
              <input type="text" name="ism" value={formData.ism} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Familya</label>
              <input type="text" name="familya" value={formData.familya} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefon <span className="req">*</span></label>
              <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange} required placeholder="+998" />
            </div>
            <div className="form-group">
              <label>Sana (Balon olgan sana) <span className="req">*</span></label>
              <input type="date" name="sana" value={formData.sana} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Olgan baloni (dona) <span className="req">*</span></label>
              <div className="ball-selector">
                {[1,2,3,4,5,6,7,8,9,10].map(b => (
                  <button 
                    key={b}
                    type="button"
                    className={`ball-btn ${formData.balonSoni === b ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, balonSoni: b }))}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Manzil</label>
              <input type="text" name="manzil" value={formData.manzil} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: '4px' }}>
            <label style={{ marginBottom: '4px' }}>Murojaat turi (Manba)</label>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text)', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.prezidentPortali || false} 
                  onChange={(e) => setFormData(p => ({ ...p, prezidentPortali: e.target.checked }))} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--neon-blue)' }}
                />
                Prezident portali
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text)', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.hududGazPortali || false} 
                  onChange={(e) => setFormData(p => ({ ...p, hududGazPortali: e.target.checked }))} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--neon-blue)' }}
                />
                Hudud gaz portali
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text)', fontSize: '14px' }}>
                <input 
                  type="checkbox" 
                  checked={formData.monopoliya || false} 
                  onChange={(e) => setFormData(p => ({ ...p, monopoliya: e.target.checked }))} 
                  style={{ width: '18px', height: '18px', accentColor: 'var(--neon-blue)' }}
                />
                Monopoliya
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Izoh</label>
            <textarea name="izoh" value={formData.izoh} onChange={handleChange} rows={2}></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rasm (Profil)</label>
              <div className="file-upload-box">
                {formData.rasm ? (
                  <img src={formData.rasm} className="file-preview-img" alt="preview" />
                ) : (
                  <div className="file-upload-label">
                    <Upload size={24} />
                    <span>Rasm tanlang</span>
                  </div>
                )}
                <input type="file" name="rasm" accept="image/*" onChange={handleFile} />
              </div>
            </div>
            <div className="form-group">
              <label>PDF Hujjat</label>
              <div className="file-upload-box">
                {formData.pdf ? (
                  <div className="pdf-preview">
                    <FileText size={24} />
                    <span>PDF tanlangan</span>
                  </div>
                ) : (
                  <div className="file-upload-label">
                    <Upload size={24} />
                    <span>PDF tanlang</span>
                  </div>
                )}
                <input type="file" name="pdf" accept=".pdf" onChange={handleFile} />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '16px', marginBottom: '24px', background: 'var(--neon-blue-glow)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--text)', fontWeight: 600, fontSize: '15px' }}>
              <input 
                type="checkbox" 
                checked={isYopilgan} 
                onChange={(e) => setIsYopilgan(e.target.checked)} 
                style={{ width: '20px', height: '20px', margin: 0, accentColor: 'var(--neon-blue)' }}
              />
              <span style={{ color: 'var(--neon-blue)' }}>Ushbu murojaat yopilgan (bajarilgan) sifatida kiritilsin</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Bekor qilish</button>
            <button type="submit" className="btn btn-primary">Saqlash</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MurojaatModal;
