import { Link } from 'react-router-dom';
import { Clock, Crown } from 'lucide-react';
import type { Article, Category } from '../lib/types';

interface Props {
  article: Article;
  category?: Category;
  variant?: 'default' | 'hero' | 'compact';
}

export default function ArticleCard({ article, category, variant = 'default' }: Props) {
  const cat = category || article.category;
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  if (variant === 'hero') {
    return (
      <Link to={`/article/${article.slug}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl aspect-[16/9] md:aspect-[21/9] bg-neutral-200 dark:bg-neutral-700">
          {article.cover_image && (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            {cat && <span className="text-xs font-semibold uppercase tracking-wider text-accent-light">{cat.name}</span>}
            <h2 className="font-serif text-2xl md:text-4xl lg:text-5xl font-bold text-white mt-2 leading-tight group-hover:text-neutral-100">
              {article.title}
            </h2>
            <p className="hidden md:block text-neutral-300 mt-3 max-w-2xl line-clamp-2">{article.excerpt}</p>
            <div className="flex items-center gap-3 mt-4 text-xs text-neutral-400">
              <span>{dateStr}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-500" />
              <span className="flex items-center gap-1"><Clock size={12} /> {article.read_time} min</span>
              {article.is_premium && (
                <>
                  <span className="w-1 h-1 rounded-full bg-neutral-500" />
                  <span className="premium-badge"><Crown size={10} /> Premium</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.slug}`} className="group flex gap-4 items-start py-4 border-b border-neutral-150 dark:border-neutral-700 last:border-0">
        {article.cover_image && (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200 dark:bg-neutral-700">
            <img src={article.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {cat && <span className="category-pill text-[10px]">{cat.name}</span>}
          <h4 className="font-serif text-base font-semibold text-neutral-900 dark:text-white group-hover:text-accent transition-colors mt-0.5 line-clamp-2 leading-snug">
            {article.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span>{dateStr}</span>
            {article.is_premium && <span className="premium-badge text-[9px]"><Crown size={8} /> Premium</span>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <div className="overflow-hidden rounded-xl aspect-[16/10] bg-neutral-200 dark:bg-neutral-700 mb-4">
        {article.cover_image && (
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
        )}
      </div>
      <div>
        <div className="flex items-center gap-3 mb-2">
          {cat && <span className="category-pill">{cat.name}</span>}
          {article.is_premium && <span className="premium-badge"><Crown size={10} /> Premium</span>}
        </div>
        <h3 className="font-serif text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-accent transition-colors leading-snug line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-neutral-400">
          <span>{dateStr}</span>
          <span className="w-1 h-1 rounded-full bg-neutral-400" />
          <span className="flex items-center gap-1"><Clock size={12} /> {article.read_time} min</span>
        </div>
      </div>
    </Link>
  );
}
