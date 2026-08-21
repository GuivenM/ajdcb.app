import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function Join() {
  const [activePlan, setActivePlan] = useState('membre');

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <h1 className="text-5xl font-bold text-slate-900 mb-6">Rejoignez l'Élite.</h1>
        <p className="text-xl text-slate-500 mb-12">
          Choisissez votre niveau d'engagement. Que vous soyez étudiant, professionnel ou partenaire, vous avez votre place parmi nous.
        </p>

        {/* Pricing Toggle */}
        <div className="inline-flex p-1 bg-white rounded-full border border-slate-200 shadow-sm mb-16">
          <button 
            onClick={() => setActivePlan('membre')}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activePlan === 'membre' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Membre
          </button>
          <button 
            onClick={() => setActivePlan('partenaire')}
            className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activePlan === 'partenaire' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Partenaire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Card 1: Standard */}
          <div className={`bg-white p-10 rounded-[2.5rem] text-left transition-all duration-300 ${activePlan === 'membre' ? 'shadow-2xl scale-105 border-2 border-emerald-500 relative z-10' : 'shadow-lg border border-slate-100 opacity-60'}`}>
            {activePlan === 'membre' && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl rounded-tr-[2.2rem]">RECOMMANDÉ</div>
            )}
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Adhésion Membre</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black text-slate-900">1.000</span>
              <span className="text-slate-500 font-medium">FCFA / mois</span>
            </div>
            <p className="text-slate-500 mb-8">Pour les étudiants et jeunes professionnels qui veulent s'intégrer et grandir.</p>
            
            <ul className="space-y-4 mb-8">
              {['Carte de membre officielle', 'Accès aux formations', 'Réseau de mentorat', 'Assistance sociale'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={14} /></div>
                  {feat}
                </li>
              ))}
            </ul>
            
            <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-200">
              Adhérer maintenant
            </button>
          </div>

          {/* Card 2: Partner */}
          <div className={`bg-slate-900 p-10 rounded-[2.5rem] text-left transition-all duration-300 text-white ${activePlan === 'partenaire' ? 'shadow-2xl scale-105 border-2 border-amber-500 relative z-10' : 'shadow-lg border border-slate-800 opacity-80'}`}>
             <h3 className="text-2xl font-bold mb-2">Partenaire / Sponsor</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">Sur mesure</span>
            </div>
            <p className="text-slate-400 mb-8">Pour les entreprises et institutions souhaitant soutenir la jeunesse.</p>
            
            <ul className="space-y-4 mb-8">
              {['Visibilité sur nos événements', 'Accès à notre vivier de talents', 'Responsabilité Sociale (RSE)', 'Opportunités B2B'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0"><Check size={14} /></div>
                  {feat}
                </li>
              ))}
            </ul>
            
            <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-xl transition-colors shadow-lg shadow-amber-900/20">
              Contacter le Bureau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
