import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowUpRight } from 'lucide-react';

const news = [
  {
    id: 1,
    category: "Événement",
    title: "Grande Nuit du Congo à Cotonou",
    date: "15 Février 2026",
    image: "https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=800&auto=format&fit=crop",
    desc: "Une soirée d'exception pour célébrer notre culture avec artistes, gastronomie et défilé de mode.",
    size: "large"
  },
  {
    id: 2,
    category: "Éducation",
    title: "Bourses d'Excellence 2026",
    date: "10 Février 2026",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
    desc: "Lancement de l'appel à candidatures pour les étudiants méritants.",
    size: "small"
  },
  {
    id: 3,
    category: "Solidarité",
    title: "Campagne de don de sang",
    date: "05 Février 2026",
    image: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=800&auto=format&fit=crop",
    desc: "La communauté se mobilise pour sauver des vies au CNHU.",
    size: "small"
  },
  {
    id: 4,
    category: "Partenariat",
    title: "Accord signé avec l'UAC",
    date: "01 Février 2026",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop",
    desc: "Facilitation des inscriptions pour les nouveaux bacheliers congolais.",
    size: "small"
  },
  {
    id: 5,
    category: "Communauté",
    title: "Tournoi de Football de l'Indépendance",
    date: "28 Janvier 2026",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
    desc: "32 équipes, un seul vainqueur. Retour en images sur la finale.",
    size: "small"
  }
];

export function News() {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Journal</h1>
            <p className="text-xl text-slate-500">L'actualité de l'AJECB et de la communauté.</p>
          </div>
          
          <div className="flex gap-2 mt-6 md:mt-0">
            {['Tous', 'Événements', 'Éducation', 'Culture'].map((filter, i) => (
              <button 
                key={i}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${i === 0 ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-200'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid Layout for News */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} bg-white`}
            >
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                      {item.category}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="text-white" size={20} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-xs mb-2">
                    <Calendar size={12} /> {item.date}
                  </div>
                  <h3 className={`font-bold text-white mb-2 ${index === 0 ? 'text-3xl' : 'text-xl'}`}>
                    {item.title}
                  </h3>
                  {index === 0 && (
                    <p className="text-white/80 line-clamp-2 text-sm">{item.desc}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
