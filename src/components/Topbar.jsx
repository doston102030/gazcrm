import React from 'react';
import { Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
  return (
    <header className="topbar">
      <button className="menu-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>
      <div className="logo-text">
        <span className="logo-title">GAZ BALON</span>
      </div>
      <div style={{ width: 24 }}></div>
    </header>
  );
};

export default Topbar;
