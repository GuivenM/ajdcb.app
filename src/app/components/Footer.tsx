import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-10 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/20">
                A
              </div>
              <span className="font-bold text-2xl text-white tracking-tight">AJECB</span>
            </Link>
            <p className="text-slate-500 mb-8 leading-relaxed max-w-sm">
              L’Association des Jeunes Élites Congolaises au Bénin. <br/>
              Structurer, intégrer et valoriser la jeunesse congolaise pour un avenir d'excellence.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-300 group">
                  <Icon size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6">Navigation</h3>
            <ul className="space-y-4">
              {['Accueil', 'L’AJECB', 'Nos Actions', 'Guide', 'Actualités'].map((item, i) => (
                <li key={i}>
                  <Link to="#" className="hover:text-emerald-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-emerald-500 transition-colors"></span>
                    {item}
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
                  <Link to="#" className="hover:text-emerald-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-bold mb-6">Restez informés</h3>
            <div className="bg-slate-900 p-1 rounded-full border border-slate-800 flex items-center mb-8 focus-within:border-emerald-600 transition-colors">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="bg-transparent border-none text-white px-4 py-2 w-full focus:ring-0 placeholder:text-slate-600 outline-none"
              />
              <button className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-500 transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
               <div className="flex items-center gap-3">
                 <MapPin size={16} className="text-emerald-600" /> Cotonou, Bénin
               </div>
               <div className="flex items-center gap-3">
                 <Mail size={16} className="text-emerald-600" /> contact@ajecb.org
               </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} AJECB. Tous droits réservés.</p>
          <p>Designed with excellence for the Youth.</p>
        </div>
      </div>
    </footer>
  );
}
