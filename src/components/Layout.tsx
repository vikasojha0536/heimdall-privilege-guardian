
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Shield, Key, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { environment } from '@/config/environment';

const Layout: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Simulate login/logout for development
  const handleLogout = () => {
    if (environment.useAuth) {
      // In production, this would call the actual logout function
      console.log("Logout triggered in production mode");
      // Redirect to login page or authentication service
    } else {
      // In development, just show a message
      console.log("Auth bypassed in development mode");
    }
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
          "fixed inset-y-0 left-0 z-30 w-64 transform bg-primary text-primary-foreground transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-primary-foreground/20 px-4">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary-foreground" />
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
                  ? "bg-primary-foreground text-primary"
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
            {environment.useAuth ? (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <span className="text-sm text-accent">Auth Bypassed</span>
            )}
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
