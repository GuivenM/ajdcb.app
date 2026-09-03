import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, ArrowRight, Loader2, Check } from 'lucide-react';
import { api, ApiError } from '../../lib/api';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'loading' || !email.trim()) return;
    setStatus('loading');
    setErrorMsg(null);
    try {
      await api.post('/v1/newsletter', { email: email.trim(), source: 'footer' });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof ApiError ? err.message : 'Erreur lors de l\'inscription');
    }
  }

  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-black/20 p-1">
                <img src="/logo-mark-ajdcb.png" alt="AJDCB" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">AJDCB</span>
            </Link>
            <p className="text-slate-500 mb-8 leading-relaxed max-w-sm">
              L’Association des Jeunes de la Diaspora Congolaise au Bénin. <br/>
              Fédérer, intégrer et valoriser la jeunesse congolaise pour un avenir d'excellence.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61582856854028', label: 'Facebook' },
                { Icon: Instagram, href: null, label: 'Instagram (bientôt)' },
                { Icon: Youtube, href: null, label: 'YouTube (bientôt)' },
              ].map(({ Icon, href, label }, i) =>
                href ? (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-brand-green-600 hover:text-white transition-all duration-300 group"
                  >
                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                  </a>
                ) : (
                  <span
                    key={i}
                    aria-label={label}
                    title={label}
                    className="w-10 h-10 rounded-full bg-slate-900/50 flex items-center justify-center text-slate-700 cursor-not-allowed"
                  >
                    <Icon size={18} />
                  </span>
                )
              )}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6">Navigation</h3>
            <ul className="space-y-4">
              {[
                { label: 'Accueil', to: '/' },
                { label: 'L’AJDCB', to: '/about' },
                { label: 'Nos Actions', to: '/actions' },
                { label: 'Guide', to: '/guide' },
                { label: 'Actualités', to: '/news' },
              ].map(({ label, to }, i) => (
                <li key={i}>
                  <Link to={to} className="hover:text-brand-green-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-brand-green-500 transition-colors"></span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6">Légal</h3>
            <ul className="space-y-4">
              {['Mentions légales', 'Politique de confidentialité', 'Statuts (PDF)', 'Règlement (PDF)'].map((item, i) => (
                <li key={i}>
                  <Link to="#" className="hover:text-brand-green-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-bold mb-6">Restez informés</h3>
            {status === 'success' ? (
              <div className="flex items-center gap-2 text-brand-green-500 text-sm mb-8 bg-slate-900 border border-slate-800 rounded-full px-4 py-3">
                <Check size={16} /> Inscription confirmée, merci !
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mb-8">
                <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex items-center focus-within:border-brand-green-600 transition-colors">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre email"
                    className="bg-transparent border-none text-white px-4 py-2 w-full focus:ring-0 placeholder:text-slate-600 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-10 h-10 rounded-full bg-brand-green-600 flex items-center justify-center text-white hover:bg-brand-green-500 transition-colors disabled:opacity-60"
                  >
                    {status === 'loading' ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-red-400 text-xs mt-2">{errorMsg}</p>
                )}
              </form>
            )}
            
            <div className="space-y-3 text-sm">
               <div className="flex items-center gap-3">
                 <MapPin size={16} className="text-brand-green-600" /> Akpakpa / Ayélawadjè, Cotonou
               </div>
               <div className="flex items-center gap-3">
                 <Mail size={16} className="text-brand-green-600" /> contact@ajdcb.org
               </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} AJDCB. Tous droits réservés.</p>
          <p>Designed with excellence for the Youth.</p>
        </div>
      </div>
    </footer>
  );
}
