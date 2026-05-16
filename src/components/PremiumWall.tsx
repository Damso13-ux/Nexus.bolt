import { Link } from 'react-router-dom';
import { Crown, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PremiumWall() {
  const { user, profile } = useAuth();

  if (profile?.is_premium || profile?.role === 'admin') return null;

  return (
    <div className="relative mt-8">
      <div className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-t from-cream dark:from-neutral-900 to-transparent pointer-events-none" />
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-8 md:p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-center justify-center mx-auto mb-5">
          <Lock className="text-amber-600 dark:text-amber-400" size={24} />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
          Contenu reserve aux abonnes Premium
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
          Accedez a l'integralite de nos analyses, decryptages exclusifs et a la newsletter Premium.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/tarifs" className="btn-primary inline-flex items-center gap-2">
            <Crown size={16} /> Decouvrir l'offre Premium
          </Link>
          {!user && (
            <Link to="/connexion" className="btn-outline text-sm">
              Deja abonne ? Connexion
            </Link>
          )}
        </div>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-4">A partir de 6EUR/mois. Annulez quand vous voulez.</p>
      </div>
    </div>
  );
}
