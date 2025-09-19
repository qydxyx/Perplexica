'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  ArrowLeft,
  Loader2,
  Lock,
  Mail,
  Calendar,
  Shield,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ProfilePage = () => {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary">
        <Loader2 className="w-8 h-8 animate-spin text-black/70 dark:text-white/70" />
      </div>
    );
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-light-primary dark:bg-dark-primary px-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
              <Lock className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
              Access Restricted
            </h1>
            <p className="text-black/70 dark:text-white/70 mb-6">
              You must be logged in to access your profile.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center px-4 py-2 bg-[#24A0ED] hover:bg-[#1E8ED6] text-white rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-primary dark:bg-dark-primary">
        <Loader2 className="w-8 h-8 animate-spin text-black/70 dark:text-white/70" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col pt-4">
        <div className="flex items-center space-x-2">
          <Link href="/" className="lg:hidden">
            <ArrowLeft className="text-black/70 dark:text-white/70" />
          </Link>
          <div className="flex flex-row space-x-2 items-center">
            <User size={23} />
            <h1 className="text-3xl font-medium p-2">Profile</h1>
          </div>
        </div>
        <hr className="border-t border-[#2B2C2C] my-4 w-full" />
      </div>

      {message && (
        <div
          className={cn(
            'mb-6 p-4 rounded-lg border',
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
          )}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="space-y-6 pb-28 lg:pb-8">
        {/* Account Information */}
        <div className="flex flex-col space-y-4 p-6 bg-light-secondary/50 dark:bg-dark-secondary/50 rounded-xl border border-light-200 dark:border-dark-200">
          <h2 className="text-xl font-semibold text-black/90 dark:text-white/90 mb-4">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-black/60 dark:text-white/60" />
                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                  Email Address
                </label>
              </div>
              <div className="px-3 py-2 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg">
                <p className="text-black dark:text-white">{user.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-black/60 dark:text-white/60" />
                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                  Account Role
                </label>
              </div>
              <div className="px-3 py-2 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                    user.role === 'admin'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                  )}
                >
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-black/60 dark:text-white/60" />
                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                  Member Since
                </label>
              </div>
              <div className="px-3 py-2 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg">
                <p className="text-black dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-black/60 dark:text-white/60" />
                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                  Account ID
                </label>
              </div>
              <div className="px-3 py-2 bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 rounded-lg">
                <p className="text-xs font-mono text-black/60 dark:text-white/60">
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="flex flex-col space-y-4 p-6 bg-light-secondary/50 dark:bg-dark-secondary/50 rounded-xl border border-light-200 dark:border-dark-200">
          <h2 className="text-xl font-semibold text-black/90 dark:text-white/90 mb-4">
            Security & Privacy
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200">
              <div>
                <h3 className="font-medium text-black dark:text-white">
                  Password
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Your password was last updated when you created your account
                </p>
              </div>
              <button
                className="px-4 py-2 text-sm bg-light-200 dark:bg-dark-200 hover:bg-light-300 dark:hover:bg-dark-300 text-black dark:text-white rounded-lg transition-colors"
                disabled
              >
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-light-secondary dark:bg-dark-secondary rounded-lg border border-light-200 dark:border-dark-200">
              <div>
                <h3 className="font-medium text-black dark:text-white">
                  API Access
                </h3>
                <p className="text-sm text-black/60 dark:text-white/60">
                  Your personalized API configuration and settings
                </p>
              </div>
              <Link
                href="/settings"
                className="px-4 py-2 text-sm bg-[#24A0ED] hover:bg-[#1E8ED6] text-white rounded-lg transition-colors"
              >
                Manage Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="flex flex-col space-y-4 p-6 bg-light-secondary/50 dark:bg-dark-secondary/50 rounded-xl border border-light-200 dark:border-dark-200">
          <h2 className="text-xl font-semibold text-black/90 dark:text-white/90 mb-4">
            Account Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/settings"
              className="flex items-center justify-center space-x-2 p-3 bg-light-secondary dark:bg-dark-secondary hover:bg-light-200 dark:hover:bg-dark-200 border border-light-200 dark:border-dark-200 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Manage Settings</span>
            </Link>

            <button
              disabled
              className="flex items-center justify-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg opacity-50 cursor-not-allowed"
            >
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
