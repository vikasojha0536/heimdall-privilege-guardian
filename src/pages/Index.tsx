
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { useTheme } from "next-themes";

const Index = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Initialize theme based on user preference
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(userPrefersDark ? "dark" : "light");
    
    // Redirect to login
    navigate("/login");
  }, [navigate, setTheme]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default Index;
