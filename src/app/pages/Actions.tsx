import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Users, GraduationCap, Palette, Handshake, Loader2, ArrowRight } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Action, SectionAction } from '../admin/types';

// Les 4 piliers sont fixes (mêmes valeurs que la Commission choisie en admin)
// et gardent toujours leur propre nom/texte de présentation — les actions
// créées dessous n'apparaissent jamais à la place, seulement en cliquant
// sur le pilier (page /actions/{section}).
const PILLARS: { section: SectionAction; title: string; fallbackDesc: string; icon: React.ReactNode; color: 'emerald' | 'blue' | 'red' | 'purple' }[] = [
  {
    section: 'solidarite',
    title: 'Solidarité & Intégration',
    fallbackDesc: "Renforcer l'entraide entre les membres et faciliter l'intégration harmonieuse des jeunes Congolais dans la société béninoise.",
    icon: <Users className="w-6 h-6" />,
    color: 'emerald',
  },
  {
    section: 'education',
    title: 'Éducation & Formation',
    fallbackDesc: "Promouvoir l'accès à l'information, au savoir et au renforcement des capacités à travers des initiatives éducatives et formatives.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: 'blue',
  },
  {
    section: 'culture',
    title: 'Culture & Identité',
    fallbackDesc: "Valoriser la culture congolaise et préserver l'identité à travers des activités culturelles, artistiques et communautaires.",
    icon: <Palette className="w-6 h-6" />,
    color: 'red',
  },
  {
    section: 'communication',
    title: 'Communication & Partenariats',
    fallbackDesc: "Développer la visibilité de l'association et établir des collaborations stratégiques avec des institutions, entreprises et organisations.",
    icon: <Handshake className="w-6 h-6" />,
    color: 'purple',
  },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop';

export function Actions() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Action[]>('/v1/actions?statut=actif')
      .then(setActions)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Pattern */}
      <div className="relative bg-slate-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-green-300 font-medium text-sm mb-6 backdrop-blur-md">
              Nos domaines d'intervention
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Impact & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green-400 to-brand-gold-400">Actions</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto font-light">
              Découvrez comment nous transformons la vie de la communauté congolaise au Bénin à travers quatre piliers d'excellence.
            </p>
          </motion.div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-24 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-24 text-slate-500">{error}</div>
      )}

      <div className="container mx-auto px-4 md:px-6 py-24 space-y-32">
        {!loading && !error && PILLARS.map((pillar, index) => {
          // Le pilier garde toujours son propre nom/texte. Les actions créées
          // dessous (ex: "Nettoyage de plage 2026") ne sont que des éléments
          // du pilier, visibles en cliquant dessus — jamais affichées ici à
          // la place de l'identité du pilier.
          const actionsDuPilier = actions.filter((a) => a.section === pillar.section);
          const derniere = [...actionsDuPilier].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];

          return (
          <Link to={`/actions/${pillar.section}`} key={pillar.section} className="block group/pillar">
          <motion.div 
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
                <div className={`absolute inset-0 border-2 border-${pillar.color}-500/20 rounded-[2rem] transform translate-x-4 translate-y-4 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500`}></div>
                
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3]">
                  <img 
                    src={derniere?.image_url || FALLBACK_IMAGE} 
                    alt={pillar.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Floating count badge */}
                {actionsDuPilier.length > 0 && (
                  <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
                     <div className={`w-10 h-10 rounded-full bg-${pillar.color}-100 flex items-center justify-center text-${pillar.color}-600`}>
                       {pillar.icon}
                     </div>
                     <span className="font-bold text-slate-900">
                       {actionsDuPilier.length} réalisation{actionsDuPilier.length > 1 ? 's' : ''}
                     </span>
                  </div>
                )}
              </div>
            </div>

            {/* Content Side */}
            <div className="w-full lg:w-1/2">
              <div className="mb-6 flex items-center gap-2">
                <span className={`w-12 h-1 bg-${pillar.color}-500 rounded-full`}></span>
                <span className={`text-${pillar.color}-600 font-bold uppercase tracking-widest text-sm`}>
                  Pilier 0{index + 1}
                </span>
              </div>
              
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{pillar.title}</h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed font-light">
                {pillar.fallbackDesc}
              </p>

              <span className={`inline-flex items-center gap-2 font-bold text-${pillar.color}-600 group-hover/pillar:gap-3 transition-all`}>
                Voir les réalisations
                <ArrowRight size={18} />
              </span>
            </div>
          </motion.div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
