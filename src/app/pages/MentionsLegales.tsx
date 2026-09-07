import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, FileDown, Mail, MapPin } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export function MentionsLegales() {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-brand-green-600 font-bold text-sm mb-3">
          <Scale className="w-4 h-4" /> Informations légales
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Mentions légales</h1>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10">
          <Section title="Éditeur du site">
            <p>
              Le présent site est édité par l'<strong>Association des Jeunes de la Diaspora Congolaise au Bénin (AJDCB)</strong>,
              association apolitique, non confessionnelle et à but non lucratif dont le siège est fixé au 3<sup>ème</sup> Arrondissement
              de Cotonou (Akpakpa / Ayélawadjè), République du Bénin.
            </p>
            <p>
              Constituée par son Assemblée Générale Constitutive du 26 avril 2026, l'AJDCB est en cours de formalisation de sa
              reconnaissance juridique auprès des autorités compétentes (Consulat et Ministère de l'Intérieur du Bénin). Cette page
              sera mise à jour dès l'obtention du récépissé officiel.
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-green-600 shrink-0" /> contact@ajdcb.org
            </p>
          </Section>

          <Section title="Directeur de la publication">
            <p>
              Le Président de l'AJDCB, représentant légal de l'association, est responsable de la publication du présent site.
            </p>
          </Section>

          <Section title="Hébergement">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-brand-green-600 shrink-0 mt-1" />
              <span>
                Namecheap, Inc.<br />
                4600 East Washington Street, Suite 300<br />
                Phoenix, AZ 85034 — États-Unis d'Amérique<br />
                <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="text-brand-green-600 hover:underline">
                  www.namecheap.com
                </a>
              </span>
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L'ensemble des contenus présents sur ce site (textes, logo, visuels, mise en page) est la propriété de l'AJDCB, sauf
              mention contraire. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation préalable
              est interdite.
            </p>
          </Section>

          <Section title="Textes fondateurs">
            <p>Les statuts et le règlement intérieur de l'association, adoptés par l'Assemblée Générale Constitutive du 26 avril 2026, sont consultables ci-dessous :</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <a
                href="/documents/Statuts_AJDCB.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-brand-green-600 transition-colors"
              >
                <FileDown className="w-4 h-4" /> Statuts (PDF)
              </a>
              <a
                href="/documents/Reglement_Interieur_AJDCB.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-brand-green-600 transition-colors"
              >
                <FileDown className="w-4 h-4" /> Règlement Intérieur (PDF)
              </a>
            </div>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative au site, écrivez-nous à{' '}
              <a href="mailto:contact@ajdcb.org" className="text-brand-green-600 hover:underline">contact@ajdcb.org</a>, ou
              via notre <Link to="/contact" className="text-brand-green-600 hover:underline">page de contact</Link>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
