'use client';

import { cn } from '@/lib/utils';
import {
  BookOpenText,
  Home,
  Search,
  SquarePen,
  Settings,
  LogOut,
  User,
  LogIn,
} from 'lucide-react';
import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';
import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import Layout from './Layout';
import { useAuth } from '@/lib/hooks/useAuth';

const VerticalIconContainer = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col items-center gap-y-3 w-full">{children}</div>
  );
};

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const segments = useSelectedLayoutSegments();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    {
      icon: Home,
      href: '/',
      active: segments.length === 0 || segments.includes('c'),
      label: 'Home',
    },
    {
      icon: Search,
      href: '/discover',
      active: segments.includes('discover'),
      label: 'Discover',
    },
    {
      icon: BookOpenText,
      href: '/library',
      active: segments.includes('library'),
      label: 'Library',
    },
  ];

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <div>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-20 lg:flex-col">
        <div className="flex grow flex-col items-center justify-between gap-y-5 overflow-y-auto bg-light-secondary dark:bg-dark-secondary px-2 py-8">
          <a href="/">
            <SquarePen className="cursor-pointer" />
          </a>
          <VerticalIconContainer>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={cn(
                  'relative flex flex-row items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 duration-150 transition w-full py-2 rounded-lg',
                  link.active
                    ? 'text-black dark:text-white'
                    : 'text-black/70 dark:text-white/70',
                )}
              >
                <link.icon />
                {link.active && (
                  <div className="absolute right-0 -mr-2 h-full w-1 rounded-l-lg bg-black dark:bg-white" />
                )}
              </Link>
            ))}
          </VerticalIconContainer>

          <div className="flex flex-col space-y-2">
            {/* Settings - only show if authenticated */}
            {isAuthenticated && (
              <Link
                href="/settings"
                className={cn(
                  'flex items-center justify-center p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
                  segments.includes('settings')
                    ? 'text-black dark:text-white'
                    : 'text-black/70 dark:text-white/70',
                )}
              >
                <Settings className="cursor-pointer" />
              </Link>
            )}

            {/* Auth status */}
            {!isLoading && (
              <div className="relative" ref={menuRef}>
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black/70 dark:text-white/70"
                  >
                    <User size={24} />
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-black/70 dark:text-white/70"
                  >
                    <LogIn size={24} />
                  </Link>
                )}

                {/* User menu dropdown */}
                {showUserMenu && isAuthenticated && (
                  <div className="absolute bottom-full left-full ml-2 mb-2 w-48 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-3 py-2 border-b border-light-200 dark:border-dark-200">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {user?.email}
                      </p>
                      <p className="text-xs text-black/60 dark:text-white/60 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-light-200 dark:hover:bg-dark-200 transition-colors text-black/70 dark:text-white/70"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-light-200 dark:hover:bg-dark-200 transition-colors text-black/70 dark:text-white/70"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full z-50 flex flex-row items-center gap-x-6 bg-light-primary dark:bg-dark-primary px-4 py-4 shadow-sm lg:hidden">
        {navLinks.map((link, i) => (
          <Link
            href={link.href}
            key={i}
            className={cn(
              'relative flex flex-col items-center space-y-1 text-center w-full',
              link.active
                ? 'text-black dark:text-white'
                : 'text-black dark:text-white/70',
            )}
          >
            {link.active && (
              <div className="absolute top-0 -mt-4 h-1 w-full rounded-b-lg bg-black dark:bg-white" />
            )}
            <link.icon />
            <p className="text-xs">{link.label}</p>
          </Link>
        ))}

        {/* Mobile auth status */}
        {!isLoading && (
          <div className="relative w-full" ref={menuRef}>
            {isAuthenticated ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={cn(
                  'relative flex flex-col items-center space-y-1 text-center w-full',
                  'text-black dark:text-white/70',
                )}
              >
                <User size={24} />
                <p className="text-xs">Account</p>
              </button>
            ) : (
              <Link
                href="/auth/login"
                className={cn(
                  'relative flex flex-col items-center space-y-1 text-center w-full',
                  'text-black dark:text-white/70',
                )}
              >
                <LogIn size={24} />
                <p className="text-xs">Sign In</p>
              </Link>
            )}

            {/* Mobile user menu */}
            {showUserMenu && isAuthenticated && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg shadow-lg py-2 z-50">
                <div className="px-3 py-2 border-b border-light-200 dark:border-dark-200">
                  <p className="text-sm font-medium text-black dark:text-white">
                    {user?.email}
                  </p>
                  <p className="text-xs text-black/60 dark:text-white/60 capitalize">
                    {user?.role}
                  </p>
                </div>
                <Link
                  href="/profile"
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-light-200 dark:hover:bg-dark-200 transition-colors text-black/70 dark:text-white/70"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/settings"
                    className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-light-200 dark:hover:bg-dark-200 transition-colors text-black/70 dark:text-white/70"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-light-200 dark:hover:bg-dark-200 transition-colors text-black/70 dark:text-white/70"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Layout>{children}</Layout>
    </div>
  );
};

export default Sidebar;
