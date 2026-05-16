import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Crown, Loader2, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Newsletter } from '../lib/types';

export default function NewslettersPage() {
  const { user, profile } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Newsletter | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('newsletters')
        .select('*')
        .not('sent_at', 'is', null)
        .order('sent_at', { ascending: false });
      setNewsletters(data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Mail className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" size={48} />
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-3">Archives Newsletter</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">Connectez-vous pour acceder aux archives de nos newsletters.</p>
        <Link to="/connexion" className="btn-primary">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-3">Archives Newsletter</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Retrouvez toutes nos newsletters passees.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-neutral-400" size={32} />
        </div>
      )}

      {!loading && newsletters.length === 0 && (
        <div className="text-center py-20">
          <Mail className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" size={48} />
          <p className="text-neutral-500 dark:text-neutral-400">Aucune newsletter archivee pour le moment.</p>
        </div>
      )}

      {selected ? (
        <div>
          <button onClick={() => setSelected(null)} className="text-sm text-accent hover:text-accent-dark font-medium mb-6 inline-block">
            &larr; Retour aux archives
          </button>
          <div className="card-surface rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">{selected.subject}</h2>
              {selected.is_premium && <span className="premium-badge"><Crown size={10} /> Premium</span>}
            </div>
            <p className="text-sm text-neutral-400 mb-6">
              {selected.sent_at && new Date(selected.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {selected.is_premium && !profile?.is_premium ? (
              <div className="text-center py-10">
                <Lock className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" size={32} />
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">Cette newsletter est reservee aux abonnes Premium.</p>
                <Link to="/tarifs" className="btn-primary">Decouvrir le Premium</Link>
              </div>
            ) : (
              <div className="article-body" dangerouslySetInnerHTML={{ __html: selected.body }} />
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletters.map((nl) => (
            <button
              key={nl.id}
              onClick={() => setSelected(nl)}
              className="w-full text-left card-surface rounded-xl p-5 hover:border-neutral-300 dark:hover:border-neutral-500 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-neutral-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-neutral-900 dark:text-white group-hover:text-accent transition-colors truncate">
                      {nl.subject}
                    </h3>
                    {nl.is_premium && <span className="premium-badge text-[9px]"><Crown size={8} /> Premium</span>}
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {nl.sent_at && new Date(nl.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
