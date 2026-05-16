import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Article, Category } from '../lib/types';
import ArticleCard from '../components/ArticleCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);

      const { data: cat } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      setCategory(cat);

      if (cat) {
        const { data: arts } = await supabase
          .from('articles')
          .select('*, category:categories(*), author:profiles(full_name, email)')
          .eq('is_published', true)
          .eq('category_id', cat.id)
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false });
        setArticles(arts || []);
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-44 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-4">Categorie introuvable</h1>
        <Link to="/" className="btn-primary">Retour a l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-4">
          <Link to="/" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-neutral-700 dark:text-neutral-300">{category.name}</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-3">{category.name}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-lg">{category.description}</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400">Aucun article dans cette categorie pour le moment.</p>
        </div>
      ) : (
        <>
          {articles[0] && (
            <div className="mb-12">
              <ArticleCard article={articles[0]} variant="hero" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.slice(1).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
