
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call - replace with actual authentication
    setTimeout(() => {
      if (username && password) {
        localStorage.setItem("isAuthenticated", "true");
        toast({
          title: "Login Successful",
          description: "Welcome to the Analytics Platform",
        });
        navigate("/analytics");
      } else {
        toast({
          title: "Login Failed",
          description: "Please enter valid credentials",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const inputClass =
    "w-full bg-[#FBFAF6] border border-[#E0DACE] rounded-[9px] px-[13px] py-[11px] text-[15px] text-[#1A1915] outline-none focus:bg-white focus:border-[#C26F4F] placeholder:text-[#97948A]";

  return (
    <div className="min-h-screen bg-[#F5F4EE] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-[30px]">
          <Link to="/" className="inline-flex items-center gap-[11px]">
            <img
              src="/push-performance-logo.png"
              alt="Push Performance"
              className="h-10 w-auto"
            />
            <span className="font-display text-[22px] font-semibold text-[#1A1915]">
              Push Performance AZ
            </span>
          </Link>
          <p className="text-[#6E6B61] mt-3.5 text-[15px]">
            Access your analytics dashboard
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E7E2D6] rounded-2xl px-[34px] py-9 shadow-[0_8px_30px_rgba(40,38,30,0.05)]">
          <h2 className="font-display text-[26px] font-medium text-center mb-1 text-[#1A1915]">
            Welcome back
          </h2>
          <p className="text-center text-[#6E6B61] text-sm mb-7">
            Sign in to your account
          </p>
          <form onSubmit={handleLogin}>
            <label className="block text-[13px] font-medium text-[#57544B] mb-[7px]">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`${inputClass} mb-[18px]`}
              required
            />
            <label className="block text-[13px] font-medium text-[#57544B] mb-[7px]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} mb-6`}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C26F4F] hover:bg-[#A85638] disabled:opacity-70 text-white border-none rounded-[9px] py-[13px] text-base font-semibold cursor-pointer transition-colors"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p className="text-center text-[#6E6B61] text-[13px] mt-[22px]">
            Don't have an account?{" "}
            <a href="#" className="text-[#C26F4F] no-underline font-medium">
              Contact us for access
            </a>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-[22px]">
          <Link to="/" className="text-[#6E6B61] hover:text-[#1A1915] text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
