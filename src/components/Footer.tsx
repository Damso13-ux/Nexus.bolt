import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="font-serif text-2xl font-bold text-white tracking-tight">
              NEXUS
            </Link>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              Le media premium de la tech et de la finance en France. Analyses, decryptages et tendances.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Rubriques</h4>
            <ul className="space-y-2.5">
              <li><Link to="/categorie/finance-marches" className="text-sm hover:text-white transition-colors">Finance & Marches</Link></li>
              <li><Link to="/categorie/crypto-web3" className="text-sm hover:text-white transition-colors">Crypto & Web3</Link></li>
              <li><Link to="/categorie/intelligence-artificielle" className="text-sm hover:text-white transition-colors">Intelligence Artificielle</Link></li>
              <li><Link to="/categorie/cybersecurite" className="text-sm hover:text-white transition-colors">Cybersecurite</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Nexus</h4>
            <ul className="space-y-2.5">
              <li><Link to="/tarifs" className="text-sm hover:text-white transition-colors">Abonnement Premium</Link></li>
              <li><Link to="/newsletters" className="text-sm hover:text-white transition-colors">Archives Newsletter</Link></li>
              <li><Link to="/recherche" className="text-sm hover:text-white transition-colors">Recherche</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-neutral-500">Mentions legales</span></li>
              <li><span className="text-sm text-neutral-500">Politique de confidentialite</span></li>
              <li><span className="text-sm text-neutral-500">CGV</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Nexus Media. Tous droits reserves.
          </p>
          <p className="text-xs text-neutral-500">
            Fait avec rigueur, pour l'avenir.
          </p>
        </div>
      </div>
    </footer>
  );
}
