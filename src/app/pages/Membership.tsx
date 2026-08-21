import React from 'react';
import { Check, Heart, Handshake } from 'lucide-react';
import { useForm } from 'react-hook-form';

export const Membership = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    alert("Merci pour votre demande d'adhésion. Nous vous contacterons bientôt.");
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Adhésion & Partenariats</h1>
          <p className="text-xl text-slate-300 max-w-2xl">
            S’engager, soutenir et bâtir ensemble.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16">
        
        {/* Adhesion Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Heart size={20} />
              </div>
              Devenir Membre
            </h2>
            <div className="prose text-slate-600 mb-8">
              <p className="text-lg">
                Adhérer à l’AJDCB, c’est intégrer une communauté solidaire et organisée, et contribuer activement au rayonnement du Congo au Bénin.
              </p>
              
              <h4 className="text-slate-900 font-bold mt-6 mb-2">Conditions d'adhésion :</h4>
              <ul className="space-y-2 list-none pl-0">
                {[
                  "Être un(e) jeune Congolais(e)",
                  "Avoir entre 18 et 40 ans",
                  "Résider sur le territoire béninois",
                  "S'acquitter de la cotisation mensuelle (1 000 FCFA)"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <h4 className="font-bold text-emerald-800 mb-2">Pourquoi cotiser ?</h4>
              <p className="text-emerald-900/70 text-sm">
                La cotisation permet de ﬁnancer les actions solidaires (décès, maladie, urgences) et les activités communautaires. C'est le moteur de notre autonomie.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Formulaire d'adhésion</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                  <input {...register("nom", { required: true })} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
                  {errors.nom && <span className="text-red-500 text-xs">Requis</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                  <input {...register("prenom", { required: true })} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" {...register("email", { required: true })} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone / WhatsApp</label>
                <input type="tel" {...register("tel", { required: true })} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ville de résidence au Bénin</label>
                <select {...register("ville")} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                  <option value="Cotonou">Cotonou</option>
                  <option value="Abomey-Calavi">Abomey-Calavi</option>
                  <option value="Porto-Novo">Porto-Novo</option>
                  <option value="Parakou">Parakou</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                <select {...register("statut")} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
                  <option value="Etudiant">Étudiant</option>
                  <option value="Travailleur">Travailleur</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Chercheur">Chercheur d'emploi</option>
                </select>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md">
                  Envoyer ma demande
                </button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  Vos données sont traitées confidentiellement.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Partnership Section */}
        <div className="border-t border-slate-200 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1">
               <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">
                 <h3 className="text-2xl font-bold mb-4">Devenir Partenaire</h3>
                 <p className="text-slate-300 mb-6">
                   Associez votre image à une jeunesse dynamique et responsable. Nous sommes ouverts aux partenariats techniques, financiers et institutionnels.
                 </p>
                 <button className="px-6 py-3 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-100 transition-colors w-full sm:w-auto">
                   Contactez le service Partenariats
                 </button>
               </div>
             </div>
             <div className="order-1 lg:order-2">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Handshake size={20} />
                  </div>
                  Partenariats
                </h2>
                <p className="text-slate-600 text-lg mb-6">
                  S’associer à l’AJDCB, c’est soutenir des projets à fort impact social et renforcer la coopération Congo – Bénin.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['Institutions', 'ONG', 'Entreprises', 'Universités'].map((tag) => (
                    <div key={tag} className="bg-white border border-slate-200 p-3 rounded-lg text-center font-medium text-slate-700">
                      {tag}
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
