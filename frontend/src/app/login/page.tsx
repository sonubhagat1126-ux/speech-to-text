'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, login, registerUser, loading } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setErrorMsg('Please fill in all fields.');
      setSubmitting(false);
      return;
    }

    try {
      if (isSignUp) {
        if (trimmedPass.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setSubmitting(false);
          return;
        }
        
        const registerRes = await registerUser(trimmedUser, trimmedPass);
        if (registerRes.success) {
          // Instantly login after registration success
          const loginSuccess = await login(trimmedUser, trimmedPass);
          if (!loginSuccess) {
            setErrorMsg('Account created! Please log in manually.');
            setIsSignUp(false);
          }
        } else {
          setErrorMsg(registerRes.error || 'Registration failed.');
        }
      } else {
        const loginSuccess = await login(trimmedUser, trimmedPass);
        if (!loginSuccess) {
          setErrorMsg('Invalid username or password.');
        }
      }
    } catch (err) {
      console.error('Authentication request failed:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[300px] text-zinc-400 dark:text-zinc-500">
        <svg className="animate-spin h-5 w-5 mr-3 text-zinc-550" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white border border-zinc-150 rounded-2xl shadow-sm dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden p-8">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-2 text-xs text-zinc-450 dark:text-zinc-400">
            {isSignUp ? 'Enter your details to register a profile' : 'Sign in to access your transcript logs'}
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-xs font-semibold text-zinc-650 dark:text-zinc-405">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              disabled={submitting}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-zinc-850 dark:border-zinc-750 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-400 disabled:opacity-60"
              placeholder="e.g. alex_stone"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-zinc-650 dark:text-zinc-405">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={submitting}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-zinc-850 dark:border-zinc-750 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-zinc-400 disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-650 border border-red-150 rounded-xl dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-zinc-950 hover:bg-zinc-850 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : null}
            {isSignUp ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle option */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(prev => !prev);
              setErrorMsg(null);
            }}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-all hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account yet? Register"}
          </button>
        </div>

      </div>
    </div>
  );
}
