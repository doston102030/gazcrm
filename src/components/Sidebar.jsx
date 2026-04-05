import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Database, Search, FileBarChart, Menu } from 'lucide-react';

const Sidebar = ({ isOpen, toggle }) => {
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/murojaatlar', label: 'Murojaatlar', icon: <Users size={20} /> },
    { path: '/muddatlar', label: 'Muddatlar', icon: <Clock size={20} /> },
    { path: '/braq-balonlar', label: 'Braq Balonlar', icon: <Database size={20} /> },
    { path: '/qidirish', label: 'Qidirish', icon: <Search size={20} /> },
    { path: '/hisobotlar', label: 'Hisobotlar', icon: <FileBarChart size={20} /> },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={toggle} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">G</div>
          <div>
            <span className="logo-title">GAZ BALON</span>
            <span className="logo-sub">PORTAL TIZIMI</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => { if (window.innerWidth <= 900) toggle(); }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="current-time">
            {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <p>© 2026 Gaz Portal</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
