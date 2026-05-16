import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Calendar, Crown, Bookmark, BookmarkCheck, Eye, Tag as TagIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Article, Tag } from '../lib/types';
import PremiumWall from '../components/PremiumWall';
import ShareButtons from '../components/ShareButtons';
import ArticleCard from '../components/ArticleCard';
import MetaTags from '../components/MetaTags';

function getSessionId() {
  let id = sessionStorage.getItem('nexus-session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('nexus-session', id);
  }
  return id;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [viewCount, setViewCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const viewRecorded = useRef(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      setProgress(0);
      viewRecorded.current = false;

      const { data: art } = await supabase
        .from('articles')
        .select('*, category:categories(*), author:profiles(full_name, email, author_slug, avatar_url)')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      setArticle(art);

      if (art) {
        const [relRes, tagRes, viewRes] = await Promise.all([
          supabase
            .from('articles')
            .select('*, category:categories(*)')
            .eq('is_published', true)
            .eq('category_id', art.category_id)
            .neq('id', art.id)
            .order('published_at', { ascending: false })
            .limit(3),
          supabase
            .from('article_tags')
            .select('tag:tags(*)')
            .eq('article_id', art.id),
          supabase
            .from('article_views')
            .select('id', { count: 'exact', head: true })
            .eq('article_id', art.id),
        ]);

        setRelated(relRes.data || []);
        setTags((tagRes.data || []).map((r: { tag: Tag }) => r.tag).filter(Boolean));
        setViewCount(viewRes.count || 0);

        if (user) {
          const { data: bm } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', user.id)
            .eq('article_id', art.id)
            .maybeSingle();
          setBookmarked(!!bm);
        }

        // Record view
        if (!viewRecorded.current) {
          viewRecorded.current = true;
          if (user) {
            supabase.from('article_views').insert({
              article_id: art.id,
              user_id: user.id,
              session_id: getSessionId(),
            }).then();
            supabase.from('reading_history').upsert({
              user_id: user.id,
              article_id: art.id,
              read_at: new Date().toISOString(),
              progress: 0,
            }, { onConflict: 'user_id,article_id' }).then();
          } else {
            supabase.from('article_views').insert({
              article_id: art.id,
              session_id: getSessionId(),
            }).then();
          }
        }
      }

      setLoading(false);
    }
    load();
  }, [slug, user]);

  const updateReadingProgress = useCallback((pct: number) => {
    if (user && article && pct > 0) {
      supabase.from('reading_history').upsert({
        user_id: user.id,
        article_id: article.id,
        read_at: new Date().toISOString(),
        progress: Math.round(pct),
      }, { onConflict: 'user_id,article_id' }).then();
    }
  }, [user, article]);

  useEffect(() => {
    let lastSaved = 0;
    function handleScroll() {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(100, (scrolled / (total - window.innerHeight)) * 100);
      setProgress(pct);

      if (pct - lastSaved > 10) {
        lastSaved = pct;
        updateReadingProgress(pct);
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article, updateReadingProgress]);

  async function toggleBookmark() {
    if (!user || !article) return;
    if (bookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('article_id', article.id);
      setBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({ user_id: user.id, article_id: article.id });
      setBookmarked(true);
    }
  }

  if (loading) {
    return (
      <div className="max-w-article mx-auto px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
          <div className="h-80 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-article mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-4">Article introuvable</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6">Cet article n'existe pas ou n'est plus disponible.</p>
        <Link to="/" className="btn-primary">Retour a l'accueil</Link>
      </div>
    );
  }

  const canRead = !article.is_premium || profile?.is_premium || profile?.role === 'admin';
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const authorName = article.author?.full_name || article.author?.email || 'Redaction Nexus';
  const authorSlug = (article.author as { author_slug?: string })?.author_slug;

  return (
    <>
      <MetaTags
        title={article.title}
        description={article.excerpt}
        image={article.cover_image}
      />
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      <article className="max-w-article mx-auto px-4 pt-8 pb-16" ref={contentRef}>
        {/* Meta */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            {article.category && (
              <Link to={`/categorie/${article.category.slug}`} className="category-pill">
                {article.category.name}
              </Link>
            )}
            {article.is_premium && <span className="premium-badge"><Crown size={10} /> Premium</span>}
          </div>

          <h1 className="font-serif text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">{article.excerpt}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 pb-6 border-b border-neutral-200 dark:border-neutral-700">
            {authorSlug ? (
              <Link to={`/auteur/${authorSlug}`} className="font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent transition-colors">
                {authorName}
              </Link>
            ) : (
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{authorName}</span>
            )}
            <span className="flex items-center gap-1"><Calendar size={14} /> {dateStr}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {article.read_time} min de lecture</span>
            <span className="flex items-center gap-1"><Eye size={14} /> {viewCount} vue{viewCount !== 1 ? 's' : ''}</span>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={toggleBookmark}
                  className={`p-2 rounded-lg transition-colors ${bookmarked ? 'text-accent bg-red-50 dark:bg-red-900/20' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  aria-label={bookmarked ? 'Retirer des signets' : 'Ajouter aux signets'}
                >
                  {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                </button>
              )}
              <ShareButtons title={article.title} url={window.location.href} />
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <TagIcon size={14} className="text-neutral-400" />
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/recherche?q=${encodeURIComponent(tag.name)}`}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Cover */}
        {article.cover_image && (
          <div className="rounded-xl overflow-hidden mb-10">
            <img src={article.cover_image} alt={article.title} className="w-full aspect-[16/9] object-cover" />
          </div>
        )}

        {/* Body */}
        {canRead ? (
          <div className="article-body" dangerouslySetInnerHTML={{ __html: article.body }} />
        ) : (
          <>
            <div className="article-body" dangerouslySetInnerHTML={{ __html: article.body.slice(0, 600) + '...' }} />
            <PremiumWall />
          </>
        )}

        {/* Share bottom */}
        {canRead && (
          <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {(article.author as { avatar_url?: string })?.avatar_url && (
                <img
                  src={(article.author as { avatar_url: string }).avatar_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Ecrit par{' '}
                {authorSlug ? (
                  <Link to={`/auteur/${authorSlug}`} className="font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent transition-colors">
                    {authorName}
                  </Link>
                ) : (
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{authorName}</span>
                )}
              </div>
            </div>
            <ShareButtons title={article.title} url={window.location.href} />
          </div>
        )}
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="border-t border-neutral-200 dark:border-neutral-700 pt-12">
            <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-8">Articles similaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
