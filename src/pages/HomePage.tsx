import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Bitcoin, Brain, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Article, Category } from '../lib/types';
import ArticleCard from '../components/ArticleCard';

const CATEGORY_ICONS: Record<string, typeof TrendingUp> = {
  'finance-marches': TrendingUp,
  'crypto-web3': Bitcoin,
  'intelligence-artificielle': Brain,
  'cybersecurite': Shield,
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [artRes, catRes] = await Promise.all([
        supabase
          .from('articles')
          .select('*, category:categories(*), author:profiles(full_name, email)')
          .eq('is_published', true)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })
          .limit(13),
        supabase.from('categories').select('*').order('name'),
      ]);
      setArticles(artRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const hero = articles[0];
  const featured = articles.slice(1, 5);
  const latest = articles.slice(5);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-80 bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-44 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {hero && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <ArticleCard article={hero} variant="hero" />
        </section>
      )}

      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-white dark:bg-neutral-800 border-y border-neutral-150 dark:border-neutral-700 py-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2">Nos rubriques</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-10">Explorez nos domaines d'expertise</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.slug] || TrendingUp;
              return (
                <Link
                  key={cat.id}
                  to={`/categorie/${cat.slug}`}
                  className="group p-6 rounded-xl border border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 hover:shadow-md transition-all duration-300 bg-cream dark:bg-neutral-800/50"
                >
                  <Icon className="text-accent mb-4" size={28} strokeWidth={1.5} />
                  <h3 className="font-serif text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-accent transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">{cat.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm text-accent font-medium mt-4 group-hover:gap-2 transition-all">
                    Explorer <ArrowRight size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">Derniers articles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latest.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-neutral-900 dark:bg-neutral-800 rounded-2xl p-8 md:p-14 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Restez informe
          </h2>
          <p className="text-neutral-400 max-w-lg mx-auto mb-8">
            Inscrivez-vous gratuitement pour recevoir nos analyses et decryptages chaque semaine dans votre boite mail.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/inscription" className="btn-primary">
              Creer un compte gratuit
            </Link>
            <Link to="/tarifs" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors px-4 py-3">
              Decouvrir le Premium &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
