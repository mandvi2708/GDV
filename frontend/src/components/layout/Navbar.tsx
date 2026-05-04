'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, User, Video, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-[100] glass-nav rounded-2xl border border-white/10 shadow-2xl">
        <div className="px-6 sm:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white">GD<span className="text-primary">Verse</span></span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-all hover:scale-105">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link href="/analytics" className="text-sm font-bold text-gray-400 hover:text-white transition-all hover:scale-105">
                    Analytics
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Profile/Auth Buttons */}
              <div className="hidden md:flex items-center gap-4">
                {isAuthenticated ? (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-bold">{user?.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="btn-secondary text-sm px-6">
                      Login
                    </Link>
                    <Link href="/register" className="btn-primary text-sm px-6">
                      Join GDVerse
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 w-[90%] z-[90] glass-nav rounded-3xl border border-white/10 p-8 shadow-2xl md:hidden"
          >
            <div className="flex flex-col gap-6">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user?.email}</p>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-lg font-black text-gray-400 hover:text-primary transition-colors"
                  >
                    <LayoutDashboard className="w-6 h-6" />
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 text-lg font-black text-red-500/80 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-6 h-6" />
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-secondary w-full py-4 text-center"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary w-full py-4 text-center"
                  >
                    Join GDVerse
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
