import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export function PolitiqueConfidentialite() {
  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-brand-green-600 font-bold text-sm mb-3">
          <ShieldCheck className="w-4 h-4" /> Vie privée
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Politique de confidentialité</h1>

        <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-10">
          <Section title="Responsable du traitement">
            <p>
              L'Association des Jeunes de la Diaspora Congolaise au Bénin (AJDCB), siège au 3<sup>ème</sup> Arrondissement
              de Cotonou (Akpakpa / Ayélawadjè), est responsable du traitement des données personnelles collectées via ce site.
            </p>
          </Section>

          <Section title="Données que nous collectons">
            <p>Selon les formulaires que vous utilisez, nous pouvons collecter :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom, prénom, email, téléphone (formulaire de contact, adhésion) ;</li>
              <li>Informations complémentaires liées à votre profil de membre (niveau d'étude, motivation, compétences, disponibilité, etc.) si vous soumettez une demande d'adhésion ;</li>
              <li>Adresse email (inscription à la newsletter) ;</li>
              <li>Identifiants de connexion, si vous créez un compte sur l'espace membre ;</li>
              <li>Informations nécessaires au traitement d'un paiement de cotisation.</li>
            </ul>
          </Section>

          <Section title="Paiement en ligne">
            <p>
              Les paiements de cotisation sont traités par notre prestataire <strong>FedaPay</strong>. L'AJDCB ne collecte ni ne
              conserve aucune donnée de carte bancaire ou de moyen de paiement — celles-ci transitent directement entre vous et
              FedaPay, selon sa propre politique de confidentialité.
            </p>
          </Section>

          <Section title="Pourquoi nous utilisons ces données">
            <ul className="list-disc pl-5 space-y-1">
              <li>Traiter votre demande d'adhésion ou de contact ;</li>
              <li>Gérer le registre des membres et le suivi des cotisations ;</li>
              <li>Vous envoyer notre newsletter si vous y êtes inscrit(e) ;</li>
              <li>Vous donner accès à l'espace membre ;</li>
              <li>Assurer le bon fonctionnement et la sécurité du site.</li>
            </ul>
            <p>Nous ne vendons ni ne louons vos données personnelles à des tiers, et ne les partageons qu'avec les prestataires strictement nécessaires au fonctionnement du site (hébergement, paiement).</p>
          </Section>

          <Section title="Durée de conservation">
            <p>
              Vos données sont conservées pour la durée nécessaire aux finalités décrites ci-dessus (gestion de votre adhésion,
              relation avec l'association), et au maximum jusqu'à votre demande de suppression ou votre désinscription. Une durée
              de conservation précise par type de donnée sera publiée sur cette page dès qu'elle aura été formellement fixée par
              le Bureau Exécutif.
            </p>
          </Section>

          <Section title="Cookies et traceurs">
            <p>
              Ce site n'utilise, à ce jour, aucun cookie de suivi publicitaire ni outil d'analyse tiers (type Google Analytics).
              Seuls les éléments techniques strictement nécessaires au fonctionnement du site (ex. maintien de votre session sur
              l'espace membre) sont utilisés.
            </p>
          </Section>

          <Section title="Vos droits">
            <p>
              Conformément à la loi n° 2017-20 portant Code du numérique en République du Bénin, vous disposez d'un droit d'accès,
              de rectification, d'opposition et de suppression de vos données personnelles. Pour l'exercer, contactez-nous à{' '}
              <a href="mailto:contact@ajdcb.org" className="text-brand-green-600 hover:underline">contact@ajdcb.org</a>.
            </p>
            <p>
              Vous pouvez également adresser une réclamation à l'Autorité de Protection des Données Personnelles (APDP) du Bénin,
              autorité administrative indépendante compétente en la matière.
            </p>
          </Section>

          <Section title="Contact">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-green-600 shrink-0" />
              <a href="mailto:contact@ajdcb.org" className="text-brand-green-600 hover:underline">contact@ajdcb.org</a>
              {' '}— ou via notre <Link to="/contact" className="text-brand-green-600 hover:underline">page de contact</Link>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
