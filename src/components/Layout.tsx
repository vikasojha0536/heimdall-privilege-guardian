
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shield, Key, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from './LanguageProvider';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { t } = useLanguage();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-[#982166] text-white' : 'hover:bg-[#982166]/80 hover:text-white';
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#E20074] text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/public/lovable-uploads/c984b240-49e0-40ca-91a1-d9394eaba530.png"
              alt="T Logo"
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold">{t('welcome')}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-5 w-5 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-[#1a1f2c] text-gray-300">
          <nav className="p-4 space-y-2">
            <Link to="/">
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActive('/')}`}
              >
                <Home className="mr-2 h-5 w-5" /> {t('dashboard')}
              </Button>
            </Link>
            
            <Link to="/privileges">
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActive('/privileges')}`}
              >
                <Key className="mr-2 h-5 w-5" /> {t('privileges')}
              </Button>
            </Link>
            
            <Link to="/access-requests">
              <Button
                variant="ghost"
                className={`w-full justify-start ${isActive('/access-requests')}`}
              >
                <Shield className="mr-2 h-5 w-5" /> {t('accessRequests')}
              </Button>
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-auto bg-background">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
