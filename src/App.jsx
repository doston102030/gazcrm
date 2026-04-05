import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PortalMurojaatlari from './pages/PortalMurojaatlari'
import Muddatlar from './pages/Muddatlar'
import BraqBalonlar from './pages/BraqBalonlar'
import Qidiruv from './pages/Qidiruv'
import Hisobotlar from './pages/Hisobotlar'
import { Menu } from 'lucide-react'

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AppProvider>
      <Router>
        <div className="layout">
          {/* Glass Decor BLOBS */}
          <div className="glass-glow-blob" style={{ top: '-10%', left: '-5%', opacity: 0.3 }}></div>
          <div className="glass-glow-blob" style={{ bottom: '-10%', right: '-5%', opacity: 0.2, background: 'radial-gradient(circle, var(--neon-purple-glow) 0%, transparent 70%)' }}></div>
          
          <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)} />
          
          <main className="main-wrapper">
            <header className="topbar">
              <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <div className="topbar-logo">GAZ BALON PORTAL</div>
            </header>

            <div className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/murojaatlar" element={<PortalMurojaatlari />} />
                <Route path="/muddatlar" element={<Muddatlar />} />
                <Route path="/braq-balonlar" element={<BraqBalonlar />} />
                <Route path="/qidirish" element={<Qidiruv />} />
                <Route path="/hisobotlar" element={<Hisobotlar />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AppProvider>
  )
}

export default App
