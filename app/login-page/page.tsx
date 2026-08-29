'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowUp, Globe, Send, Camera, Link2, Video } from 'lucide-react';
import Navbar from '../component/navbar';
import { supabase } from '@/lib/supabase';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const errorParam = searchParams?.get('error') || '';
  const reasonParam = searchParams?.get('reason') || '';
  const [error, setError] = useState('');

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const email = form.get('email')?.toString().trim();
    const password = form.get('password')?.toString();

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Login failed');
      setLoading(false);
      return;
    }

    router.push(data.role === 'instructor' ? '/Instructor-Dashboard' : data.role === 'admin' ? '/Admin-Dashboard' : '/Student-Dashboard');
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const email = form.get('email')?.toString().trim();
    const password = form.get('password')?.toString();
    const confirmPassword = form.get('confirmPassword')?.toString();
    const username = form.get('username')?.toString();

    if (!email || !password || !confirmPassword || !username) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const res = await fetch('/api/auth/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, mode: 'register', username }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    router.push('/Student-Dashboard');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <Navbar />

      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-2">
          <span>Homepage</span> <span>&gt;</span> <span className="text-gray-800">Login / Register</span>
        </div>
      </div>

      <main className="flex-grow py-16 px-4 bg-gray-50/50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
            {(error || errorParam) && (
              <p className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {error || decodeURIComponent(reasonParam || 'Authentication failed')}
              </p>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <input name="email" type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition" />
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Password*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" /> Remember me
              </label>
              <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-bold transition shadow-md shadow-orange-200 disabled:opacity-50">{loading ? 'Logging in...' : 'Login'}</button>
              <a href="#" className="block text-center text-sm text-gray-500 hover:text-orange-500 transition mt-4">Lost your password?</a>
            </form>
            <div className="mt-6">
              <button type="button" onClick={handleGoogleAuth} disabled={loading} className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full py-3 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
                <span className="w-4 h-4 inline-flex items-center justify-center bg-blue-500 text-white rounded-full text-[10px] font-bold">G</span>
                Continue with Google
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Register</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input name="email" type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition" />
              <input name="username" type="text" placeholder="Username*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition" />
              <div className="relative">
                <input name="password" type={showPass ? 'text' : 'password'} placeholder="Password*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <div className="relative">
                <input name="confirmPassword" type={showConfirmPass ? 'text' : 'password'} placeholder="Confirm Password*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition pr-10" />
                <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full font-bold transition shadow-md shadow-orange-200 mt-2 disabled:opacity-50">{loading ? 'Creating account...' : 'Register'}</button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xl font-bold tracking-tight text-gray-900">EduPress</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Get Help</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Latest Articles</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Programs</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition">Art & Design</a></li>
                <li><a href="#" className="text-orange-500 font-medium">Business</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">IT & Software</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Languages</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Programming</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="leading-relaxed">Address: 2321 New Design Str, Lorem Ipsum10<br/>Hudson Yards, USA</li>
                <li>Tel: + (123) 2500-567-8988</li>
                <li>Mail: supportlms@gmail.com</li>
                <li className="flex gap-3 mt-4">
                  {[Globe, Send, Camera, Link2, Video].map((Icon, i) => (
                    <a key={i} href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition text-xs font-bold"><Icon className="w-3.5 h-3.5" /></a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">Copyright &copy; 2024 LearnPress LMS | Powered by ThimPress</p>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition shadow-lg"><ArrowUp className="w-5 h-5" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-gray-500">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
