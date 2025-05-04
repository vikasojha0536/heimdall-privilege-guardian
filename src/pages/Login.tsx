
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [clientId, setClientId] = useState('dot--tyrell--westbound');

  const handleLogin = () => {
    // Store the client ID in local storage
    localStorage.setItem('currentUserId', clientId);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f2c]">
      <div className="w-full max-w-md p-8 bg-[#232838] rounded-lg shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-[#E20074] p-3 rounded">
            <img 
              src="public/lovable-uploads/c984b240-49e0-40ca-91a1-d9394eaba530.png" 
              alt="T Logo" 
              className="w-8 h-8"
            />
          </div>
          
          <h1 className="text-3xl font-bold text-white mt-4">Welcome to Heimdall</h1>
          <p className="text-gray-300">Sign in to access your dashboard</p>
          
          <div className="w-full mt-6">
            <Label htmlFor="clientId" className="text-gray-300">Client ID</Label>
            <Input 
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="bg-[#2d344a] border-gray-700 text-white mt-1"
              placeholder="Enter your client ID"
            />
          </div>
          
          <div className="w-full bg-[#2d344a] p-4 rounded mt-4 text-center text-gray-300">
            Development Mode Active - Using Client ID Login
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
