import React from 'react';
import { motion } from 'motion/react';
import { Users, GraduationCap, Palette, Handshake, ChevronRight, Check } from 'lucide-react';

const axes = [
  {
    id: "solidarite",
    title: "Solidarité & Intégration",
    icon: <Users className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop",
    desc: "Nous créons un filet de sécurité social et émotionnel pour chaque jeune Congolais, dès son arrivée et tout au long de son séjour.",
    tags: ["Accueil", "Entraide", "Santé"],
    stats: "500+ Bénéficiaires",
    color: "emerald"
  },
  {
    id: "education",
    title: "Éducation & Leadership",
    icon: <GraduationCap className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop",
    desc: "Nous investissons dans le capital humain par des formations de pointe, du mentorat et des opportunités de réseautage.",
    tags: ["Mentorat", "Formation", "Carrière"],
    stats: "50+ Ateliers",
    color: "blue"
  },
  {
    id: "culture",
    title: "Culture & Identité",
    icon: <Palette className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1516934551100-c976d8b63486?q=80&w=1000&auto=format&fit=crop",
    desc: "Nous célébrons notre héritage à travers les arts, la gastronomie et le dialogue interculturel avec nos frères béninois.",
    tags: ["Arts", "Events", "Tradition"],
    stats: "3 Grands Festivals",
    color: "red"
  },
  {
    id: "partenariats",
    title: "Diplomatie & Partenariats",
    icon: <Handshake className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop",
    desc: "Nous construisons des ponts durables avec les institutions, les entreprises et les ONG pour maximiser notre impact.",
    tags: ["Coopération", "Lobbying", "Réseau"],
    stats: "25+ Partenaires",
    color: "purple"
  }
];

export function Actions() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header with Pattern */}
      <div className="relative bg-slate-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 font-medium text-sm mb-6 backdrop-blur-md">
              Nos domaines d'intervention
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Impact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">Actions</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
              Découvrez comment nous transformons la vie de la communauté congolaise au Bénin à travers quatre piliers d'excellence.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-24 space-y-32">
        {axes.map((axis, index) => (
          <motion.div 
            key={axis.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center`}
          >
            {/* Visual Side */}
            <div className="w-full lg:w-1/2 group">
              <div className="relative">
                {/* Decorative border offset */}
                <div className={`absolute inset-0 border-2 border-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-500/20 rounded-[2rem] transform translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500`}></div>
                
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3]">
                  <img 
                    src={axis.image} 
                    alt={axis.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                     <div className="flex gap-2 mb-2">
                       {axis.tags.map((tag, i) => (
                         <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-lg">
                           {tag}
                         </span>
                       ))}
                     </div>
                  </div>
                </div>
                
                {/* Floating Stat Badge */}
                <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                   <div className={`w-10 h-10 rounded-full bg-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-100 flex items-center justify-center text-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-600`}>
                     {axis.icon}
                   </div>
                   <span className="font-bold text-slate-900">{axis.stats}</span>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2">
              <div className="mb-6 flex items-center gap-2">
                <span className={`w-12 h-1 bg-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-500 rounded-full`}></span>
                <span className={`text-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-600 font-bold uppercase tracking-widest text-sm`}>
                  Pilier 0{index + 1}
                </span>
              </div>
              
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{axis.title}</h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed font-light">
                {axis.desc}
              </p>

              <div className="space-y-4 mb-10">
                {["Programme certifié", "Impact mesurable", "Suivi continu"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full bg-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-100 flex items-center justify-center`}>
                      <Check size={14} className={`text-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-600`} />
                    </div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <button className={`px-8 py-4 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:bg-${axis.color === 'emerald' ? 'emerald' : axis.color === 'blue' ? 'blue' : axis.color === 'red' ? 'red' : 'purple'}-600 hover:text-white hover:border-transparent transition-all`}>
                En savoir plus
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
