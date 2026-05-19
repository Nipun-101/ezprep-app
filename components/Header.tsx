'use client';

import { Menu, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { isAuthenticated, logout } from '@/lib/auth';
import SearchBox from '@/components/dashboard/SearchBox';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleAuthClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center shrink-0">
              <div className="relative h-14 w-36">
                <Image
                  src="/ezprep-logo-1.png"
                  alt="EzPrep"
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-md">
              <SearchBox />
            </div>

            <div className="hidden md:flex items-center space-x-4 shrink-0">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={handleAuthClick}
                    className="flex items-center space-x-2 text-gray-700 hover:text-teal-600 font-medium transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 font-medium transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Login / Signup
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="md:hidden pb-4">
            <SearchBox />
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col space-y-3">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={handleAuthClick}
                      className="flex items-center justify-center space-x-2 text-gray-700 py-2"
                    >
                      <User className="w-5 h-5" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center space-x-2 text-red-600 py-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAuthClick}
                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                  >
                    Login / Signup
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
