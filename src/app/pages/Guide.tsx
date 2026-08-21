import React from 'react';
import { motion } from 'motion/react';
import { Construction, Bell } from 'lucide-react';

export function Guide() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-200/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-200/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10 text-center max-w-2xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex p-6 bg-white rounded-3xl shadow-xl mb-8"
        >
          <Construction className="w-16 h-16 text-emerald-600" strokeWidth={1.5} />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight"
        >
          Guide du Congolais
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-slate-500 mb-10 leading-relaxed"
        >
          Nous préparons la ressource ultime pour votre installation et votre vie au Bénin. Logement, études, démarches administratives... tout y sera.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <div className="relative w-full sm:w-auto">
             <input 
              type="email" 
              placeholder="Votre email" 
              className="w-full sm:w-80 px-6 py-4 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
             />
          </div>
          <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg hover:shadow-emerald-200/50 transition-all flex items-center gap-2">
            <Bell size={18} /> Me prévenir
          </button>
        </motion.div>
        
        <p className="mt-6 text-xs text-slate-400 font-medium uppercase tracking-widest">Lancement : Juin 2026</p>
      </div>
    </div>
  );
}
