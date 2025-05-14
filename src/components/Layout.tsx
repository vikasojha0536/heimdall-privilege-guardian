
import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Key, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { environment } from '@/config/environment';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('currentUserId');
    if (!userId) {
      navigate('/login');
    }
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    navigate('/login');
  };

  const navItems = [
    {
      name: 'My Privileges',
      path: '/privileges',
      icon: <Key className="mr-2 h-4 w-4" />,
    },
    {
      name: 'Access Requests',
      path: '/requests',
      icon: <Shield className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-[#1a1f2c] text-primary-foreground transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-primary-foreground/20 px-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-[#E20074] p-2 rounded">
              <img
                  src="public/lovable-uploads/c984b240-49e0-40ca-91a1-d9394eaba530.png"
                  alt="T Logo"
                  className="w-8 h-8"
              />
            </div>
            <span className="text-xl font-bold text-primary-foreground">Heimdall</span>
          </Link>
        </div>
        <nav className="space-y-1 p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                location.pathname === item.path
                  ? "bg-[#E20074] text-white"
                  : "hover:bg-primary-foreground/20 text-primary-foreground"
              )}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {environment.production ? 'Production' : 'Development'} Mode
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
