
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // In a real implementation, this would trigger the OAuth flow
    // For development, we'll just navigate to the dashboard
    localStorage.setItem('currentUserId', 'dot--tyrell--northbound');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f2c]">
      <div className="w-full max-w-md p-8 bg-[#232838] rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-[#E20074] p-3 rounded">
            <span className="text-3xl font-bold text-white">T</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mt-4">Welcome to OrchesTT</h1>
          <p className="text-gray-300">Sign in to access your dashboard</p>
          
          <div className="w-full bg-[#2d344a] p-4 rounded mt-4 text-center text-gray-300">
            Development Mode Active - Using Automatic Login
          </div>
          
          <Button 
            onClick={handleLogin} 
            className="w-full bg-[#E20074] hover:bg-[#c90066] text-white font-medium py-3 mt-4 flex items-center justify-center"
          >
            <User className="mr-2 h-5 w-5" />
            Development Login
          </Button>
          
          <p className="text-xs text-gray-400 mt-4 text-center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
