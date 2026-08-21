import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, GraduationCap, Globe, Handshake, ChevronRight, Play } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const stats = [
  { label: "Membres Actifs", value: "500+" },
  { label: "Années d'Actions", value: "10+" },
  { label: "Partenaires", value: "25+" },
  { label: "Vies Impactées", value: "10k+" },
];

const axes = [
  {
    title: "Solidarité",
    icon: <Users className="w-8 h-8" />,
    desc: "Un réseau d'entraide puissant pour chaque Congolais.",
    color: "from-amber-400 to-orange-500",
    bg: "bg-amber-50"
  },
  {
    title: "Éducation",
    icon: <GraduationCap className="w-8 h-8" />,
    desc: "Programmes de mentorat et bourses d'excellence.",
    color: "from-blue-400 to-indigo-500",
    bg: "bg-blue-50"
  },
  {
    title: "Culture",
    icon: <Globe className="w-8 h-8" />,
    desc: "Rayonnement de l'identité congolaise au Bénin.",
    color: "from-emerald-400 to-green-500",
    bg: "bg-emerald-50"
  },
  {
    title: "Partenariats",
    icon: <Handshake className="w-8 h-8" />,
    desc: "Collaborations stratégiques institutionnelles.",
    color: "from-purple-400 to-pink-500",
    bg: "bg-purple-50"
  }
];

export function Home() {
  return (
    <div className="overflow-hidden bg-white">
      {/* 
        HERO SECTION 
        Modern, Bold, with a deep gradient overlay
      */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like fix */}
        <div className="absolute inset-0 z-0">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 via-emerald-900/80 to-slate-900/40" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 pt-20">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-6"
            >
              <div className="h-1 w-20 bg-amber-400 rounded-full"></div>
              <span className="text-amber-400 font-bold tracking-widest uppercase text-sm">Solidarité – Réﬂexion – Action</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tight"
            >
              La Diaspora Congolaise <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white">
                au cœur du Bénin.
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg md:text-2xl text-slate-300 mb-12 max-w-2xl leading-relaxed font-light"
            >
              Nous bâtissons une communauté forte, intégrée et influente. 
              Rejoignez le mouvement de la jeunesse qui ose et qui agit.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-6 items-start"
            >
              <Link to="/join" className="group relative px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-full overflow-hidden shadow-2xl transition-all hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center gap-2">
                  Rejoindre l'AJDCB <ArrowRight size={20} />
                </span>
              </Link>
              <Link to="/about" className="flex items-center gap-4 px-8 py-4 text-white font-medium hover:text-emerald-300 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all">
                  <Play size={20} fill="currentColor" className="ml-1" />
                </div>
                <span>Découvrir notre vision</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats Card - Absolute positioned at bottom right on desktop */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="hidden lg:block absolute bottom-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl max-w-sm"
        >
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 
        INTRODUCTION SECTION 
        Clean typography, minimal layout
      */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
               <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100 to-amber-100 rounded-[2rem] rotate-3 opacity-70"></div>
               <ImageWithFallback 
                 src="https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?q=80&w=800&auto=format&fit=crop" 
                 alt="AJDCB Community" 
                 className="relative rounded-[1.5rem] shadow-2xl w-full object-cover aspect-[4/3]"
               />
               <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 hidden md:block">
                 <p className="font-serif italic text-xl text-slate-800">"Unis pour réussir"</p>
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">Qui sommes-nous ?</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                Une organisation apolitique au service de l'<span className="text-amber-500">Excellence</span>.
              </h3>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Créée par de jeunes Congolais établis au Bénin, l’AJDCB est plus qu'une association : c'est un écosystème de croissance.
              </p>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                Nous offrons un cadre structuré où chaque membre peut s'intégrer, se former et contribuer au rayonnement de notre culture et de nos compétences.
              </p>
              
              <Link to="/about" className="inline-flex items-center gap-2 text-emerald-800 font-bold border-b-2 border-emerald-800 pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-all">
                En savoir plus <ChevronRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 
        AXES D'ACTION - BENTO GRID
      */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Nos Piliers Stratégiques</h2>
            <p className="text-slate-600 text-lg">
              Une approche holistique pour accompagner la jeunesse congolaise dans toutes les étapes de sa vie au Bénin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {axes.map((axis, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative bg-white p-8 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden border border-slate-100"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${axis.color} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-150 duration-500`}></div>
                
                <div className={`w-14 h-14 ${axis.bg} rounded-2xl flex items-center justify-center mb-8 text-slate-800 relative z-10 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300`}>
                  {axis.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">{axis.title}</h3>
                <p className="text-slate-500 mb-8 relative z-10 group-hover:text-slate-600">{axis.desc}</p>
                
                <Link to="/actions" className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-slate-400 group-hover:bg-emerald-600 group-hover:border-transparent group-hover:text-white transition-all">
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        NEWS HIGHLIGHT - Modern Cards
      */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">Actualités & Events</h2>
              <div className="h-1.5 w-24 bg-emerald-500 rounded-full"></div>
            </div>
            <Link to="/news" className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors">
              Voir tout le journal
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl mb-6 aspect-[16/10]">
                  <ImageWithFallback 
                    src={`https://images.unsplash.com/photo-${i === 1 ? '1523580494863-6f3031224c94' : i === 2 ? '1543269865-cbf427effbad' : '1531545514254-3d0b71430260'}?q=80&w=800&auto=format&fit=crop`}
                    alt="News" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                     <span className="text-white font-semibold flex items-center gap-2">Lire l'article <ArrowRight size={16} /></span>
                  </div>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-emerald-800 shadow-sm">
                    {i === 1 ? 'Culture' : 'Éducation'}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                  <span className="font-medium text-emerald-600">12 Février 2026</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span>5 min de lecture</span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-emerald-700 transition-colors">
                  {i === 1 ? 'Retour sur la soirée culturelle "Nuit du Congo"' : i === 2 ? 'Lancement officiel du programme de bourses 2026' : 'Rencontre avec les nouveaux étudiants à Cotonou'}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        CTA SECTION - Innovative Gradient
      */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900">
           <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900"></div>
           <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
           {/* Animated blobs */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
              Prêt à impacter votre avenir ?
            </h2>
            <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto font-light">
              Rejoignez une communauté d'élite. Ensemble, transformons les défis en opportunités.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/join" className="px-10 py-5 bg-white text-emerald-900 font-bold text-lg rounded-full shadow-2xl hover:bg-emerald-50 hover:scale-105 transition-all duration-300">
                Devenir membre
              </Link>
              <Link to="/contact" className="px-10 py-5 bg-transparent border border-white/30 text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all duration-300">
                Nous contacter
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
