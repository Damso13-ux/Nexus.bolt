import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, X, Crown, Zap, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const FREE_FEATURES = [
  { text: 'Articles gratuits illimites', included: true },
  { text: 'Newsletter hebdomadaire', included: true },
  { text: 'Sauvegarde d\'articles', included: true },
  { text: 'Articles premium & analyses exclusives', included: false },
  { text: 'Newsletter Premium quotidienne', included: false },
  { text: 'Acces anticipe aux contenus', included: false },
];

const PREMIUM_FEATURES = [
  { text: 'Tous les articles sans restriction', included: true },
  { text: 'Analyses & decryptages exclusifs', included: true },
  { text: 'Newsletter Premium quotidienne', included: true },
  { text: 'Sauvegarde d\'articles', included: true },
  { text: 'Acces anticipe aux contenus', included: true },
  { text: 'Sans engagement, annulez a tout moment', included: true },
];

export default function PricingPage() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
  const [error, setError] = useState('');

  const success = searchParams.get('success') === 'true';

  async function handleSubscribe(plan: 'monthly' | 'annual') {
    if (!user) return;
    setError('');
    setLoading(plan);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ plan }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue.');
        setLoading(null);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Impossible de contacter le serveur de paiement.');
      setLoading(null);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold uppercase tracking-wider mb-4">
          <Crown size={16} /> Abonnements
        </span>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
          Choisissez votre formule
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
          Accedez a l'integralite de nos contenus premium, analyses exclusives et newsletters specialisees.
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center mb-12 flex items-center justify-center gap-3">
          <CheckCircle className="text-emerald-600 dark:text-emerald-400" size={22} />
          <p className="text-emerald-800 dark:text-emerald-300 font-medium">
            Paiement reussi ! Votre acces Premium est desormais actif.
          </p>
        </div>
      )}

      {profile?.is_premium && !success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center mb-12">
          <p className="text-emerald-800 dark:text-emerald-300 font-medium">
            Vous etes abonne Premium ({profile.subscription_plan === 'annual' ? 'annuel' : 'mensuel'}). Merci pour votre confiance !
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center mb-8">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {/* Free */}
        <div className="card-surface rounded-2xl p-8">
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-1">Gratuit</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Pour decouvrir Nexus</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-bold text-neutral-900 dark:text-white">0EUR</span>
            <span className="text-neutral-400 text-sm ml-1">/mois</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                {f.included ? (
                  <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <X size={16} className="text-neutral-300 dark:text-neutral-600 mt-0.5 flex-shrink-0" />
                )}
                <span className={f.included ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}>{f.text}</span>
              </li>
            ))}
          </ul>
          {!user ? (
            <Link to="/inscription" className="block text-center btn-outline w-full">
              Creer un compte gratuit
            </Link>
          ) : (
            <div className="text-center text-sm text-neutral-400 py-3">Votre plan actuel</div>
          )}
        </div>

        {/* Premium */}
        <div className="card-surface border-2 !border-neutral-900 dark:!border-white rounded-2xl p-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold px-4 py-1 rounded-full uppercase tracking-wider">
              Populaire
            </span>
          </div>
          <div className="mb-6">
            <h3 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-1">Premium</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Pour les passionnes</p>
          </div>

          <div className="flex items-end gap-4 mb-2">
            <div>
              <span className="text-4xl font-bold text-neutral-900 dark:text-white">6EUR</span>
              <span className="text-neutral-400 text-sm ml-1">/mois</span>
            </div>
            <div className="pb-1">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">ou </span>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">49EUR</span>
              <span className="text-neutral-400 text-sm">/an</span>
              <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">-32%</span>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mb-6">Soit 4,08EUR/mois avec l'offre annuelle</p>

          <ul className="space-y-3 mb-8">
            {PREMIUM_FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <Zap size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <span className="text-neutral-700 dark:text-neutral-300">{f.text}</span>
              </li>
            ))}
          </ul>

          {profile?.is_premium ? (
            <div className="text-center text-sm text-emerald-600 dark:text-emerald-400 font-medium py-3">Votre plan actuel</div>
          ) : !user ? (
            <Link to="/inscription" className="block text-center btn-primary w-full">
              Creer un compte pour s'abonner
            </Link>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => handleSubscribe('monthly')}
                disabled={loading !== null}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading === 'monthly' ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
                S'abonner -- 6EUR/mois
              </button>
              <button
                onClick={() => handleSubscribe('annual')}
                disabled={loading !== null}
                className="w-full btn-secondary flex items-center justify-center gap-2 text-sm disabled:opacity-60"
              >
                {loading === 'annual' && <Loader2 size={16} className="animate-spin" />}
                S'abonner -- 49EUR/an (economisez 32%)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white text-center mb-8">Questions frequentes</h2>
        <div className="space-y-6">
          {[
            { q: 'Puis-je annuler a tout moment ?', a: 'Oui, vous pouvez annuler votre abonnement a tout moment. Vous conserverez l\'acces Premium jusqu\'a la fin de la periode payee.' },
            { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Nous acceptons les cartes bancaires (Visa, Mastercard, Amex) via notre partenaire Stripe.' },
            { q: 'Les articles gratuits le resteront-ils ?', a: 'Oui, nos articles marques comme gratuits le restent a vie. Le Premium debloque les analyses exclusives et approfondies.' },
          ].map((faq, i) => (
            <div key={i} className="border-b border-neutral-200 dark:border-neutral-700 pb-6">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
