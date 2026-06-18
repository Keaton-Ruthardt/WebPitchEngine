
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navLinkClass = (active: boolean) =>
    `text-[15px] font-medium transition-colors ${
      active ? "text-[#C26F4F]" : "text-[#57544B] hover:text-[#1A1915]"
    }`;

  return (
    <nav className="sticky top-0 left-0 right-0 z-40 bg-[#F5F4EE]/[0.82] backdrop-blur-md border-b border-[#E7E2D6]">
      <div className="max-w-[1160px] mx-auto px-7 py-3.5 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/push-performance-logo.png"
            alt="Push Performance"
            className="h-9 w-auto block"
          />
          <span className="font-display text-[19px] font-semibold tracking-[-0.01em] text-[#1A1915]">
            Push Performance AZ
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-9">
          <Link to="/" className={navLinkClass(location.pathname === "/")}>
            Home
          </Link>
          <Link
            to="/analytics"
            className={navLinkClass(location.pathname === "/analytics")}
          >
            Analytics
          </Link>
        </div>

        {/* Login */}
        <Button
          asChild
          className="bg-[#C26F4F] hover:bg-[#A85638] text-white rounded-lg px-[18px] py-[9px] text-sm font-semibold h-auto"
        >
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
