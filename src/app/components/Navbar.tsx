import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'L’AJECB', path: '/about' },
    { name: 'Nos Actions', path: '/actions' },
    { name: 'Guide', path: '/guide' },
    { name: 'Actualités', path: '/news' },
    { name: 'Adhésion', path: '/join' },
    { name: 'Contacts', path: '/contact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-transparent",
          scrolled 
            ? "bg-white/90 backdrop-blur-xl shadow-lg py-3 border-gray-200/50" 
            : "bg-transparent py-6"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl transition-transform duration-300 group-hover:rotate-6",
                scrolled ? "bg-emerald-700" : "bg-white/20 backdrop-blur-md border border-white/20"
              )}>
                A
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "font-black text-xl leading-none tracking-tight transition-colors",
                  scrolled ? "text-slate-900" : "text-white"
                )}>
                  AJECB
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mt-0.5 transition-colors",
                  scrolled ? "text-emerald-600" : "text-white/80"
                )}>
                  Bénin
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => cn(
                    "relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full hover:bg-white/10",
                    isActive 
                      ? (scrolled ? "text-emerald-700 bg-emerald-50" : "text-white bg-white/20 backdrop-blur-md") 
                      : (scrolled ? "text-slate-600 hover:text-emerald-700" : "text-white/80 hover:text-white")
                  )}
                >
                  {link.name}
                </NavLink>
              ))}
              <Link
                to="/join"
                className={cn(
                  "ml-4 px-6 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl active:scale-95",
                  scrolled 
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:shadow-emerald-200" 
                    : "bg-white text-emerald-900 hover:bg-gray-100"
                )}
              >
                Rejoindre
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "lg:hidden p-2 rounded-xl transition-colors",
                scrolled ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"
              )}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 bg-white lg:hidden flex flex-col pt-28 px-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <NavLink
                    to={link.path}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between p-4 text-xl font-bold border-b border-gray-100 transition-colors",
                      isActive ? "text-emerald-600" : "text-slate-800"
                    )}
                  >
                    {link.name}
                    <ChevronRight size={20} className="text-gray-300" />
                  </NavLink>
                </motion.div>
              ))}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 grid grid-cols-2 gap-4"
              >
                 <Link to="/join" className="py-4 bg-emerald-600 text-white text-center font-bold rounded-2xl shadow-lg active:scale-95 transition-transform">
                   Adhérer
                 </Link>
                 <Link to="/contact" className="py-4 bg-slate-100 text-slate-900 text-center font-bold rounded-2xl active:scale-95 transition-transform">
                   Contact
                 </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
