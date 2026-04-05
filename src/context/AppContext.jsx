import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [murojaatlar, setMurojaatlar] = useState([]);
  const [braqlar, setBraqlar] = useState([]);
  const [dbError, setDbError] = useState(null);

  // Data Cleansing Utility
  const cleanData = (list) => {
    return list.map(item => {
      if (!item.sana) return item;
      let dateStr = item.sana;
      if (dateStr.startsWith('320')) dateStr = dateStr.replace('320', '20');
      return { ...item, sana: dateStr, balonSoni: item.balonSoni || item.ball || 1 };
    });
  };

  // Firebase Auto Migration Helper
  const runMigration = async () => {
    try {
      const localM = JSON.parse(localStorage.getItem('gaz_balon_murojaatlar') || '[]');
      const localB = JSON.parse(localStorage.getItem('gaz_balon_braqlar') || '[]');
      
      // Upload local murojaatlar if they don't exist
      for (const m of localM) {
        if (!m.id) continue;
        await setDoc(doc(db, 'murojaatlar', m.id.toString()), m);
      }
      for (const b of localB) {
        if (!b.id) continue;
        await setDoc(doc(db, 'braqlar', b.id.toString()), b);
      }
      
      // Clear localStorage so we don't migrate again
      localStorage.removeItem('gaz_balon_murojaatlar');
      localStorage.removeItem('gaz_balon_braqlar');
      console.log("Firebase Migration Complete!");
    } catch (e) {
      console.warn("Migration failed or partially completed:", e);
    }
  };

  useEffect(() => {
    let unsubM = () => {};
    let unsubB = () => {};

    try {
      unsubM = onSnapshot(collection(db, 'murojaatlar'), (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // If Firestore is empty and local data exists, migrate!
        const localM = localStorage.getItem('gaz_balon_murojaatlar');
        if (data.length === 0 && localM && JSON.parse(localM).length > 0) {
          runMigration();
        } else {
          setMurojaatlar(cleanData(data));
        }
        setDbError(null);
      }, (err) => {
        console.error("Firestore Error (Murojaat):", err);
        setDbError(err.message);
        // Fallback to local
        setMurojaatlar(cleanData(JSON.parse(localStorage.getItem('gaz_balon_murojaatlar') || '[]')));
      });

      unsubB = onSnapshot(collection(db, 'braqlar'), (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setBraqlar(cleanData(data));
      }, (err) => {
        console.error("Firestore Error (Braq):", err);
        setBraqlar(cleanData(JSON.parse(localStorage.getItem('gaz_balon_braqlar') || '[]')));
      });

    } catch(err) {
      console.error(err);
    }

    return () => { unsubM(); unsubB(); };
  }, []);

  // Upload Base64 to Firebase Storage
  const uploadFileIfBase64 = async (fileStr, path) => {
    if (!fileStr || !fileStr.startsWith('data:')) return fileStr;
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}-${Math.random().toString(36).substr(2, 6)}`);
      await uploadString(storageRef, fileStr, 'data_url');
      return await getDownloadURL(storageRef);
    } catch(e) {
      console.error("Storage Error:", e);
      return fileStr; // Fallback to raw base64 if upload fails (might exceed firestore limits)
    }
  };

  // Actions
  const addMurojaat = async (data) => {
    const id = Date.now().toString();
    try {
      const rasmUrl = await uploadFileIfBase64(data.rasm, 'images');
      const pdfUrl = await uploadFileIfBase64(data.pdf, 'pdfs');
      await setDoc(doc(db, 'murojaatlar', id), { ...data, rasm: rasmUrl, pdf: pdfUrl, id });
      alert("Muvaffaqiyatli qo'shildi!");
    } catch (e) {
      console.error(e);
      alert("Qo'shishda xatolik: " + e.message);
    }
  };

  const updateMurojaat = async (id, data) => {
    try {
      const rasmUrl = await uploadFileIfBase64(data.rasm, 'images');
      const pdfUrl = await uploadFileIfBase64(data.pdf, 'pdfs');
      await updateDoc(doc(db, 'murojaatlar', id.toString()), { ...data, rasm: rasmUrl, pdf: pdfUrl });
      alert("Muvaffaqiyatli tahrirlandi!");
    } catch (e) { 
      console.error(e); 
      alert("Tahrirlashda xatolik: " + e.message);
    }
  };

  const deleteMurojaat = async (id) => {
    try { 
      await deleteDoc(doc(db, 'murojaatlar', id.toString())); 
      alert("Muvaffaqiyatli o'chirildi!");
    } catch(e) { 
      console.error(e); 
      alert("O'chirishda xatolik: " + e.message);
    }
  };

  const addBraq = async (data) => {
    const id = Date.now().toString();
    try {
      const rasmUrl = await uploadFileIfBase64(data.rasm, 'braq_images');
      await setDoc(doc(db, 'braqlar', id), { ...data, rasm: rasmUrl, id });
    } catch(e) { console.error(e); alert("Xatolik: " + e.message); }
  };

  const deleteBraq = async (id) => {
    try { await deleteDoc(doc(db, 'braqlar', id.toString())); } catch(e) { console.error(e); }
  };

  // Reporting Logic
  const getMonthlyReport = (month, year) => {
    return murojaatlar.filter(m => {
      if (!m.yopilganSana) return false;
      const d = new Date(m.yopilganSana);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  };

  return (
    <AppContext.Provider value={{
      murojaatlar, addMurojaat, updateMurojaat, deleteMurojaat,
      braqlar, addBraq, deleteBraq,
      getMonthlyReport, dbError
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
