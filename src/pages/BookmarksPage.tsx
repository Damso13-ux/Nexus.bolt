import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Article } from '../lib/types';
import ArticleCard from '../components/ArticleCard';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;

      const { data } = await supabase
        .from('bookmarks')
        .select('article_id, articles:article_id(*, category:categories(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      const arts = (data || [])
        .map((b: any) => b.articles)
        .filter(Boolean);
      setArticles(arts);
      setLoading(false);
    }
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Bookmark className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" size={48} />
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-3">Mes signets</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">Connectez-vous pour sauvegarder vos articles favoris.</p>
        <Link to="/connexion" className="btn-primary">Se connecter</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-8">Mes signets</h1>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-neutral-400" size={32} />
        </div>
      )}

      {!loading && articles.length === 0 && (
        <div className="text-center py-20">
          <Bookmark className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" size={48} />
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">Vous n'avez pas encore sauvegarde d'articles</p>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">
            Cliquez sur l'icone signet sur un article pour le sauvegarder
          </p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
