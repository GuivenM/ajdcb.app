import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Search,
  Loader2,
  Menu,
  X,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import type { GuideSection, GuideSousSection, GuideDocument } from '../admin/types';

function DocumentRow({ doc }: { doc: GuideDocument }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(e: React.MouseEvent) {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await api.post<{ download_url: string }>(
        `/v1/guide/documents/${doc.id}/telecharger`,
        {}
      );
      window.open(res.download_url || doc.fichier_url, '_blank', 'noopener');
    } catch {
      // Si le compteur échoue, on laisse quand même l'utilisateur récupérer le fichier.
      window.open(doc.fichier_url, '_blank', 'noopener');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <a
      href={doc.fichier_url}
      onClick={handleDownload}
      className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-brand-green-50 border border-slate-100 hover:border-brand-green-200 transition-colors"
    >
      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-brand-green-200">
        <FileText className="w-4 h-4 text-slate-400 group-hover:text-brand-green-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{doc.titre}</p>
        {doc.description && (
          <p className="text-xs text-slate-400 truncate">{doc.description}</p>
        )}
      </div>
      <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
        {doc.type_fichier?.toUpperCase()} · {doc.taille_formatee}
      </span>
      {downloading ? (
        <Loader2 className="w-4 h-4 shrink-0 text-brand-green-600 animate-spin" />
      ) : (
        <Download className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-brand-green-600" />
      )}
    </a>
  );
}

function SousSectionBlock({ sous }: { sous: GuideSousSection }) {
  return (
    <div className="pt-8 first:pt-0">
      <h3 className="text-lg font-bold text-slate-900 mb-3">{sous.titre}</h3>
      {sous.image_url && (
        <img
          src={sous.image_url}
          alt={sous.titre}
          className="w-full max-h-72 object-cover rounded-2xl mb-4"
        />
      )}
      {sous.contenu && (
        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-4">{sous.contenu}</p>
      )}
      {sous.documents.length > 0 && (
        <div className="space-y-2">
          {sous.documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Guide() {
  const [sections, setSections] = useState<GuideSection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api
      .get<GuideSection[]>('/v1/guide')
      .then((data) => {
        setSections(data);
        if (data.length > 0) setActiveId(data[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Erreur de chargement'));
  }, []);

  const grouped = useMemo(() => {
    const list = sections || [];
    const filtered = query.trim()
      ? list.filter((s) => s.titre.toLowerCase().includes(query.trim().toLowerCase()))
      : list;
    const groups = new Map<string, GuideSection[]>();
    filtered.forEach((s) => {
      const key = s.categorie || 'Général';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(s);
    });
    return Array.from(groups.entries());
  }, [sections, query]);

  const active = sections?.find((s) => s.id === activeId) || null;

  function selectSection(id: number) {
    setActiveId(id);
    setMobileNavOpen(false);
  }

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  }

  // Sommaire (utilisé en sidebar desktop et en drawer mobile)
  const sommaire = (
    <nav className="space-y-1">
      {grouped.map(([categorie, items]) => {
        const isOpen = openCategories[categorie] ?? true;
        return (
          <div key={categorie}>
            <button
              onClick={() => toggleCategory(categorie)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600"
            >
              {categorie}
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {isOpen && (
              <div className="space-y-0.5 mb-2">
                {items.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => selectSection(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      activeId === s.id
                        ? 'bg-brand-green-50 text-brand-green-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.titre}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-brand-green-600 font-bold text-sm mb-3">
            <BookOpen className="w-4 h-4" /> Ressource communautaire
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Guide du Congolais</h1>
          <p className="text-xl text-slate-500 max-w-2xl">
            Tout ce qu'il faut savoir pour votre installation et votre vie au Bénin : logement, études,
            démarches administratives, et plus encore.
          </p>
        </div>

        {sections === null && !error && (
          <div className="flex justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-slate-500">{error}</div>
        )}

        {sections !== null && !error && sections.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Le guide arrive bientôt. Revenez prochainement !</p>
          </div>
        )}

        {sections !== null && !error && sections.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            {/* Sidebar desktop */}
            <aside className="hidden lg:block sticky top-28 bg-white rounded-3xl border border-slate-100 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green-500/40"
                />
              </div>
              {sommaire}
            </aside>

            {/* Bouton sommaire mobile */}
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-slate-100 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <Menu className="w-4 h-4" /> Sommaire du guide
            </button>

            {/* Contenu */}
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10"
                >
                  {active.image_url && (
                    <img
                      src={active.image_url}
                      alt={active.titre}
                      className="w-full max-h-80 object-cover rounded-2xl mb-6"
                    />
                  )}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {active.categorie && (
                      <span className="px-3 py-1 bg-brand-gold-100 text-brand-gold-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {active.categorie}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{active.titre}</h2>
                  {active.description && (
                    <p className="text-lg text-slate-500 mb-6">{active.description}</p>
                  )}
                  {active.contenu && (
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
                      {active.contenu}
                    </p>
                  )}

                  {active.sous_sections.length > 0 && (
                    <div className="divide-y divide-slate-100 mt-8">
                      {active.sous_sections.map((sous) => (
                        <SousSectionBlock key={sous.id} sous={sous} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Drawer sommaire mobile */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-50 p-5 overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-slate-900">Sommaire</span>
                <button onClick={() => setMobileNavOpen(false)}>
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green-500/40"
                />
              </div>
              {sommaire}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
