import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';

export function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé !");
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Info Side */}
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-slate-900 mb-6"
            >
              Parlons de <br/> <span className="text-brand-green-600">votre projet.</span>
            </motion.h1>
            <p className="text-xl text-slate-500 mb-12">
              Que vous souhaitiez adhérer, devenir partenaire ou simplement poser une question, notre équipe est à votre écoute.
            </p>

            <div className="space-y-8 mb-12">
              {[
                { icon: <MapPin />, title: "Siège Social", desc: "3e Arrondissement de Cotonou (Akpakpa / Ayélawadjè)" },
                { icon: <Mail />, title: "Email", desc: "contact@ajdcb.org" },
                { icon: <Phone />, title: "Téléphone", desc: "+229 01 66 24 62 68 / +229 01 58 70 70 57" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-slate-50 p-8 md:p-12 rounded-[2.5rem]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 ml-1">Nom</label>
                  <input type="text" className="w-full px-6 py-4 rounded-xl border border-transparent bg-white focus:ring-2 focus:ring-brand-green-500 transition-all outline-none" placeholder="Votre nom" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 ml-1">Prénom</label>
                  <input type="text" className="w-full px-6 py-4 rounded-xl border border-transparent bg-white focus:ring-2 focus:ring-brand-green-500 transition-all outline-none" placeholder="Votre prénom" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 ml-1">Email</label>
                <input type="email" className="w-full px-6 py-4 rounded-xl border border-transparent bg-white focus:ring-2 focus:ring-brand-green-500 transition-all outline-none" placeholder="nom@exemple.com" />
              </div>

              <div className="space-y-2">
                 <label className="text-sm font-bold text-slate-900 ml-1">Message</label>
                 <textarea rows={4} className="w-full px-6 py-4 rounded-xl border border-transparent bg-white focus:ring-2 focus:ring-brand-green-500 transition-all outline-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>

              <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-brand-green-600 transition-colors flex items-center justify-center gap-2">
                Envoyer le message <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
