import React, { useState, useEffect } from 'react';
import { X, Upload, CheckSquare } from 'lucide-react';

const BraqModal = ({ isOpen, onClose, onSave, editData }) => {
  const options = [
    { id: 'kran', label: 'Kranidan', text: 'Balonning tepasidan kranidan qo\'yilmoqda.' },
    { id: 'lebza', label: 'Lebzasidan', text: '2-chisi balonning lebzasidan qo\'yilmoqda.' },
    { id: 'sinov', label: 'Sinov', text: 'Shu ikkitasidan bitta sinab ko\'rib qo\'yilgan.' }
  ];

  const initialState = {
    ism: '',
    familya: '',
    telefon: '',
    sana: new Date().toISOString().split('T')[0],
    sabab: '',
    rasm: null,
    selectedOpts: []
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editData) setFormData({ ...editData, selectedOpts: [] });
    else setFormData(initialState);
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuickPick = (opt) => {
    setFormData(prev => {
      const isSelected = prev.selectedOpts.includes(opt.id);
      const nextOpts = isSelected 
        ? prev.selectedOpts.filter(id => id !== opt.id)
        : [...prev.selectedOpts, opt.id];
      
      const newSabab = options
        .filter(o => nextOpts.includes(o.id))
        .map(o => o.text)
        .join('\n');
        
      return { ...prev, selectedOpts: nextOpts, sabab: newSabab };
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, rasm: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <h2>{editData ? "Braqni tahrirlash" : "Braq balon qo'shish"}</h2>
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

          <div className="form-group">
            <label>Telefon raqam <span className="req">*</span></label>
            <input type="tel" name="telefon" value={formData.telefon} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Sana <span className="req">*</span></label>
            <input type="date" name="sana" value={formData.sana} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Sabab / Izoh</label>
            <div className="quick-pick-group">
              {options.map(opt => (
                <div 
                  key={opt.id} 
                  className={`quick-chip ${formData.selectedOpts.includes(opt.id) ? 'active' : ''}`}
                  onClick={() => handleQuickPick(opt)}
                >
                  <CheckSquare size={14} />
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
            <textarea 
              name="sabab" 
              value={formData.sabab} 
              onChange={handleChange}
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Rasm (Balon holati)</label>
            <div className="file-upload-box">
              {formData.rasm ? (
                <img src={formData.rasm} className="file-preview-img" alt="preview" />
              ) : (
                <div className="file-upload-label">
                  <Upload size={24} />
                  <span>Rasm tanlang</span>
                </div>
              )}
              <input type="file" onChange={handleFile} />
            </div>
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

export default BraqModal;
