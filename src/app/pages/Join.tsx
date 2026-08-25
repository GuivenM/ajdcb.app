import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../../lib/api';
import { FedaPayButton } from '../components/FedaPayButton';

interface AdhesionForm {
  nom: string;
  prenom: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  profession: string;
  niveau_etude: string;
  etablissement?: string;
  motivation: string;
}

const moisCourant = new Date().toISOString().slice(0, 7); // format AAAA-MM attendu par l'API

export function Join() {
  const [activePlan, setActivePlan] = useState('membre');
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState<AdhesionForm | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<AdhesionForm>();

  const onSubmit = async (data: AdhesionForm) => {
    setLoading(true);
    try {
      await api.post('/adhesions', data);
      setSubmitted(data);
      toast.success("Demande d'adhésion envoyée ! Un email de confirmation vous a été adressé.");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          setError(field as keyof AdhesionForm, { message: messages[0] });
        });
        toast.error('Merci de corriger les champs indiqués.');
      } else {
        toast.error(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande pour l'instant.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          <div className={`bg-white p-10 rounded-[2.5rem] text-left transition-all duration-300 ${activePlan === 'membre' ? 'shadow-2xl scale-105 border-2 border-brand-green-500 relative z-10' : 'shadow-lg border border-slate-100 opacity-60'}`}>
            {activePlan === 'membre' && (
              <div className="absolute top-0 right-0 bg-brand-green-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl rounded-tr-[2.2rem]">RECOMMANDÉ</div>
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
                  <div className="w-6 h-6 rounded-full bg-brand-green-100 text-brand-green-600 flex items-center justify-center shrink-0"><Check size={14} /></div>
                  {feat}
                </li>
              ))}
            </ul>

            {!showForm && !submitted && (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-4 bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-green-200"
              >
                Adhérer maintenant
              </button>
            )}
          </div>

          {/* Card 2: Partner */}
          <div className={`bg-slate-900 p-10 rounded-[2.5rem] text-left transition-all duration-300 text-white ${activePlan === 'partenaire' ? 'shadow-2xl scale-105 border-2 border-brand-gold-500 relative z-10' : 'shadow-lg border border-slate-800 opacity-80'}`}>
             <h3 className="text-2xl font-bold mb-2">Partenaire / Sponsor</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-black">Sur mesure</span>
            </div>
            <p className="text-slate-400 mb-8">Pour les entreprises et institutions souhaitant soutenir la jeunesse.</p>

            <ul className="space-y-4 mb-8">
              {['Visibilité sur nos événements', 'Accès à notre vivier de talents', 'Responsabilité Sociale (RSE)', 'Opportunités B2B'].map((feat, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-brand-gold-500/20 text-brand-gold-500 flex items-center justify-center shrink-0"><Check size={14} /></div>
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              to="/contact"
              className="w-full py-4 bg-brand-gold-500 hover:bg-brand-gold-400 text-slate-900 font-bold rounded-xl transition-colors shadow-lg shadow-brand-gold-900/20 flex items-center justify-center gap-2"
            >
              Contacter le Bureau <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Formulaire d'adhésion */}
        {showForm && !submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 mt-12 text-left"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Formulaire d'adhésion</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Nom" error={errors.nom?.message}>
                  <input className={inputClass} {...register('nom', { required: 'Requis' })} />
                </Field>
                <Field label="Prénom" error={errors.prenom?.message}>
                  <input className={inputClass} {...register('prenom', { required: 'Requis' })} />
                </Field>
                <Field label="Date de naissance" error={errors.date_naissance?.message}>
                  <input type="date" className={inputClass} {...register('date_naissance', { required: 'Requis' })} />
                </Field>
                <Field label="Lieu de naissance" error={errors.lieu_naissance?.message}>
                  <input className={inputClass} {...register('lieu_naissance', { required: 'Requis' })} />
                </Field>
                <Field label="Nationalité" error={errors.nationalite?.message}>
                  <input className={inputClass} defaultValue="Congolaise" {...register('nationalite', { required: 'Requis' })} />
                </Field>
                <Field label="Email" error={errors.email?.message}>
                  <input type="email" className={inputClass} {...register('email', { required: 'Requis' })} />
                </Field>
                <Field label="Téléphone" error={errors.telephone?.message}>
                  <input className={inputClass} placeholder="+229 00 00 00 00" {...register('telephone', { required: 'Requis' })} />
                </Field>
                <Field label="Ville" error={errors.ville?.message}>
                  <input className={inputClass} defaultValue="Cotonou" {...register('ville', { required: 'Requis' })} />
                </Field>
              </div>

              <Field label="Adresse" error={errors.adresse?.message}>
                <input className={inputClass} {...register('adresse', { required: 'Requis' })} />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Profession" error={errors.profession?.message}>
                  <input className={inputClass} {...register('profession', { required: 'Requis' })} />
                </Field>
                <Field label="Niveau d'étude" error={errors.niveau_etude?.message}>
                  <input className={inputClass} {...register('niveau_etude', { required: 'Requis' })} />
                </Field>
              </div>

              <Field label="Établissement (optionnel)">
                <input className={inputClass} {...register('etablissement')} />
              </Field>

              <Field label="Motivation (min. 50 caractères)" error={errors.motivation?.message}>
                <textarea
                  rows={4}
                  className={inputClass}
                  placeholder="Pourquoi souhaitez-vous rejoindre l'AJDCB ?"
                  {...register('motivation', {
                    required: 'Requis',
                    minLength: { value: 50, message: 'Au moins 50 caractères' },
                  })}
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-green-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight size={18} />}
                Envoyer ma demande d'adhésion
              </button>
            </form>
          </motion.div>
        )}

        {/* Confirmation + paiement de la première cotisation */}
        {submitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 mt-12 text-center"
          >
            <PartyPopper className="w-10 h-10 text-brand-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Demande envoyée, {submitted.prenom} !</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Le bureau traite votre demande sous peu. Vous pouvez dès maintenant régler votre première
              cotisation ({moisCourant}) pour accélérer votre intégration.
            </p>
            <div className="flex justify-center">
              <FedaPayButton
                endpoint="/paiements/cotisation"
                extraPayload={{ mois: moisCourant }}
                montant={1000}
                label="Payer ma première cotisation"
                defaultValues={{
                  nom_payeur: `${submitted.prenom} ${submitted.nom}`,
                  telephone_payeur: submitted.telephone,
                  email_payeur: submitted.email,
                }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-green-500 focus:border-transparent outline-none transition-all";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-900 ml-1">{label}</label>
      {children}
      {error && <span className="text-red-500 text-xs ml-1">{error}</span>}
    </div>
  );
}
