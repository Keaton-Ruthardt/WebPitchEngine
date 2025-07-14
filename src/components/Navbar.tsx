
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { BarChart3 } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Push Performance AZ</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-lg font-medium transition-colors ${
                location.pathname === "/" 
                  ? "text-blue-400" 
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/analytics" 
              className={`text-lg font-medium transition-colors ${
                location.pathname === "/analytics" 
                  ? "text-blue-400" 
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Analytics
            </Link>
          </div>

          {/* Login Button */}
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
