import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, Article } from '../lib/types';
import ArticleCard from '../components/ArticleCard';

export default function AuthorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [author, setAuthor] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('author_slug', slug)
        .maybeSingle();

      setAuthor(prof);

      if (prof) {
        const { data: arts } = await supabase
          .from('articles')
          .select('*, category:categories(*)')
          .eq('author_id', prof.id)
          .eq('is_published', true)
          .order('published_at', { ascending: false });
        setArticles(arts || []);
      }

      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-4">Auteur introuvable</h1>
        <Link to="/" className="btn-primary">Retour a l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Author header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-12 pb-8 border-b border-neutral-200 dark:border-neutral-700">
        <div className="w-24 h-24 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {author.avatar_url ? (
            <img src={author.avatar_url} alt={author.full_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-serif font-bold text-neutral-400">
              {author.full_name[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
            {author.full_name}
          </h1>
          {author.bio && (
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-xl">{author.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <FileText size={14} /> {articles.length} article{articles.length !== 1 ? 's' : ''}
            </span>
            {author.is_premium && (
              <span className="premium-badge"><Crown size={10} /> Premium</span>
            )}
          </div>
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 dark:text-neutral-400">Aucun article publie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
