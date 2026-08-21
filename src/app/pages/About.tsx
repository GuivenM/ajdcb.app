import React from 'react';
import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

export function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-slate-900 pt-32 pb-20 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-slate-900/50"></div>
        <div className="container mx-auto px-4 relative z-10 text-center">
           <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">L’AJECB</h1>
           <p className="text-xl text-slate-300 max-w-2xl mx-auto">
             Découvrez l'histoire, la vision et l'équipe qui porte les ambitions de la jeunesse congolaise au Bénin.
           </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-24">
        {/* Mission Vision Values - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 -mt-32 relative z-20">
          {[
            { title: "Vision", desc: "Être le catalyseur d'une diaspora congolaise d'excellence.", color: "bg-emerald-600", text: "text-white" },
            { title: "Mission", desc: "Fédérer, former et valoriser les talents pour un impact durable.", color: "bg-white", text: "text-slate-900" },
            { title: "Valeurs", desc: "Solidarité, Intégrité, Innovation et Patriotisme.", color: "bg-amber-400", text: "text-emerald-950" }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${card.color} ${card.text} p-10 rounded-3xl shadow-xl flex flex-col justify-between h-80 hover:transform hover:-translate-y-2 transition-transform duration-300`}
            >
              <h3 className="text-3xl font-bold">{card.title}</h3>
              <p className="text-lg opacity-90 font-medium leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Story Section */}
        <div className="max-w-4xl mx-auto mb-32">
          <div className="flex gap-4 mb-8">
            <span className="text-8xl font-serif text-emerald-100 leading-none -mt-8">"</span>
            <p className="text-2xl md:text-3xl font-light text-slate-800 leading-relaxed text-center">
              L’AJECB est née d’une conviction simple : <span className="font-bold text-emerald-600">une jeunesse organisée</span> est une force de transformation irrésistible.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden">
               {/* President Photo Placeholder */}
               <div className="w-full h-full bg-slate-300"></div>
            </div>
            <div className="font-bold text-slate-900">S. Reynold TOKANOU</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">Président de l'AJECB</div>
          </div>
        </div>

        {/* Team Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Bureau Exécutif National</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "S. Reynold TOKANOU", role: "Président" },
              { name: "P. Clesh BASSADILA", role: "Vice-Président" },
              { name: "Dieuveil ONGANDZA", role: "Secrétaire Général" },
              { name: "Love MOUNGONDO", role: "Trésorière" }
            ].map((member, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl text-center hover:bg-white hover:shadow-lg transition-all border border-slate-100">
                <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4"></div>
                <h3 className="font-bold text-slate-900">{member.name}</h3>
                <p className="text-sm text-emerald-600 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
