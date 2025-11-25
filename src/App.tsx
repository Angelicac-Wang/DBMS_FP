import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Badge } from 'antd';
import { HomeOutlined, CalendarOutlined, SaveOutlined } from '@ant-design/icons';
import { CoverGroupProvider, useCoverGroups } from './context/CoverGroupContext';
import { HomePage } from './pages/HomePage';
import { CalendarPage } from './pages/CalendarPage';
import { SavedListPage } from './pages/SavedListPage';
import './App.css';

const { Header, Content, Footer } = Layout;

const AppContent: React.FC = () => {
  const location = useLocation();
  const { savedGroupIds } = useCoverGroups();
  
  const totalSaved = savedGroupIds.length;
  
  const getNavIcon = (path: string, icon: React.ReactNode) => {
    const isActive = location.pathname === path;
    return (
      <div style={{
        color: isActive ? '#ff6b9d' : '#666',
        fontSize: isActive ? 20 : 18,
        transition: 'all 0.3s ease'
      }}>
        {icon}
      </div>
    );
  };
  
  const getNavText = (path: string, text: string) => {
    const isActive = location.pathname === path;
    return (
      <span style={{
        color: isActive ? '#ff6b9d' : '#666',
        fontSize: 12,
        fontWeight: isActive ? 'bold' : 'normal',
        transition: 'all 0.3s ease'
      }}>
        {text}
      </span>
    );
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        position: 'fixed', 
        zIndex: 10, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        borderBottom: 'none',
        boxShadow: 'none',
        height: 150,
        pointerEvents: 'none'
      }}>
        <img 
          src="/logo.png" 
          alt="舞告 Match" 
          style={{ 
            height: 150,
            maxWidth: '100%',
            objectFit: 'contain'
          }}
        />
      </Header>
      
      <Content style={{ 
        paddingTop: 200, 
        paddingBottom: 300,
        minHeight: 'calc(100vh - 230px)',
        position: 'relative',
        zIndex: 5
      }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/saved" element={<SavedListPage />} />
        </Routes>
      </Content>
      
      {/* 底部導覽列 */}
      <Footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 107, 157, 0.2)',
        padding: '8px 0',
        height: 60
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: 600,
          margin: '0 auto'
        }}>
          <Link to="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {getNavIcon('/', <HomeOutlined />)}
              {getNavText('/', '舞團瀏覽')}
            </div>
          </Link>
          
          <Link to="/calendar" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {getNavIcon('/calendar', <CalendarOutlined />)}
              {getNavText('/calendar', '行事曆')}
            </div>
          </Link>
          
          <Link to="/saved" style={{ textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
              {getNavIcon('/saved', <SaveOutlined />)}
              {getNavText('/saved', '我的清單')}
              {totalSaved > 0 && (
                <Badge 
                  count={totalSaved} 
                  style={{ 
                    position: 'absolute', 
                    top: -50, 
                    right: -30,
                    fontSize: 10,
                    minWidth: 16,
                    height: 16,
                    lineHeight: '16px'
                  }} 
                />
              )}
            </div>
          </Link>
        </div>
      </Footer>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <CoverGroupProvider>
        <AppContent />
      </CoverGroupProvider>
    </Router>
  );
}

export default App;
