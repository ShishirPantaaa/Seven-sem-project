import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinkClass = ({ isActive }) =>
    `transition-all duration-300 ${
      isActive
        ? "text-cyan-300 border-b-2 border-cyan-300 pb-1"
        : "text-white hover:text-cyan-200"
    }`;

  const auth = useAuth();
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const handleAdminLogout = () => {
    adminLogout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 shadow-lg bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
      <div className="px-4 py-4 mx-auto sm:px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <img className="w-10 h-10 sm:w-12 sm:h-12" src="logo.png" alt="Priority OPD System Logo" />
            <h1 className="text-lg font-bold text-transparent sm:text-xl md:text-2xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
              PulseQueue
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="items-center hidden gap-8 md:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/departments" className={navLinkClass}>
              Departments
            </NavLink>
            <NavLink
              to="/contact"
              className={navLinkClass}
            >
              Contact
            </NavLink>
            <NavLink
              to="/book-token"
              className="px-4 py-2 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-lg hover:scale-105"
            >
              Book Token
            </NavLink>

            {admin ? (
              <div className="flex items-center gap-4">
                <span className="text-cyan-300 text-sm font-semibold">Admin: {admin.name}</span>
                <button
                  onClick={handleAdminLogout}
                  className="px-4 py-2 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:shadow-lg hover:scale-105"
                >
                  Admin Logout
                </button>
              </div>
            ) : (
              <>
                <NavLink
                  to="/admin-login"
                  className="px-4 py-2 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:shadow-lg hover:scale-105"
                >
                  Admin Login
                </NavLink>
                {auth.user ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 hover:shadow-lg hover:scale-105"
                  >
                    Logout
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    className="px-4 py-2 font-semibold text-white transition-all duration-300 transform rounded-lg shadow-md bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:shadow-lg hover:scale-105"
                  >
                    Login
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 transition-colors duration-300 rounded-lg md:hidden hover:bg-slate-700"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="pt-4 pb-4 mt-4 space-y-3 border-t md:hidden border-slate-700">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-600 text-white"
                    : "text-white hover:bg-slate-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-600 text-white"
                    : "text-white hover:bg-slate-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              About
            </NavLink>
            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-600 text-white"
                    : "text-white hover:bg-slate-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              Departments
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-600 text-white"
                    : "text-white hover:bg-slate-700"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              Contact
            </NavLink>
            <NavLink
              to="/book-token"
              className="block px-4 py-2 font-semibold text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              onClick={() => setIsOpen(false)}
            >
              Book Token
            </NavLink>

            {admin ? (
              <>
                <div className="px-4 py-2 text-sm font-semibold text-cyan-300">
                  Admin: {admin.name}
                </div>
                <button
                  onClick={() => {
                    handleAdminLogout();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 font-semibold text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  Admin Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/admin-login"
                  className="block px-4 py-2 font-semibold text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Login
                </NavLink>
                {auth.user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 font-semibold text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    Logout
                  </button>
                ) : (
                  <NavLink
                    to="/login"
                    className="block px-4 py-2 font-semibold text-center text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </NavLink>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
