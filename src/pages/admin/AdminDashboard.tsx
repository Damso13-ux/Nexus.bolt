import { useEffect, useState } from 'react';
import { Users, Crown, FileText, DollarSign, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  viewsThisWeek: number;
}

interface TopArticle {
  article_id: string;
  view_count: number;
  title: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, premiumUsers: 0, totalArticles: 0,
    publishedArticles: 0, totalViews: 0, viewsThisWeek: 0,
  });
  const [topArticles, setTopArticles] = useState<TopArticle[]>([]);
  const [recentViews, setRecentViews] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    async function load() {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [usersRes, premiumRes, articlesRes, publishedRes, viewsRes, weekViewsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('article_views').select('id', { count: 'exact', head: true }),
        supabase.from('article_views').select('id', { count: 'exact', head: true }).gte('viewed_at', weekAgo),
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        premiumUsers: premiumRes.count || 0,
        totalArticles: articlesRes.count || 0,
        publishedArticles: publishedRes.count || 0,
        totalViews: viewsRes.count || 0,
        viewsThisWeek: weekViewsRes.count || 0,
      });

      // Top articles by views
      const { data: viewData } = await supabase
        .from('article_views')
        .select('article_id');

      if (viewData && viewData.length > 0) {
        const countMap: Record<string, number> = {};
        for (const v of viewData) {
          countMap[v.article_id] = (countMap[v.article_id] || 0) + 1;
        }

        const sorted = Object.entries(countMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        const articleIds = sorted.map(([id]) => id);
        const { data: articles } = await supabase
          .from('articles')
          .select('id, title')
          .in('id', articleIds);

        const titleMap: Record<string, string> = {};
        for (const a of articles || []) {
          titleMap[a.id] = a.title;
        }

        setTopArticles(sorted.map(([id, count]) => ({
          article_id: id,
          view_count: count,
          title: titleMap[id] || 'Article inconnu',
        })));
      }

      // Recent daily views (last 7 days)
      const days: { date: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const start = dateStr + 'T00:00:00.000Z';
        const end = dateStr + 'T23:59:59.999Z';
        const { count } = await supabase
          .from('article_views')
          .select('id', { count: 'exact', head: true })
          .gte('viewed_at', start)
          .lte('viewed_at', end);
        days.push({
          date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          count: count || 0,
        });
      }
      setRecentViews(days);
    }
    load();
  }, []);

  const cards = [
    { label: 'Abonnes total', value: stats.totalUsers, icon: Users, color: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
    { label: 'Abonnes Premium', value: stats.premiumUsers, icon: Crown, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
    { label: 'Articles publies', value: stats.publishedArticles, icon: FileText, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
    { label: 'Vues totales', value: stats.totalViews, icon: Eye, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: 'Vues cette semaine', value: stats.viewsThisWeek, icon: TrendingUp, color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
    { label: 'Revenus mensuels est.', value: `${stats.premiumUsers * 6}EUR`, icon: DollarSign, color: 'bg-red-50 text-accent dark:bg-red-900/30 dark:text-red-400' },
  ];

  const maxViews = Math.max(...recentViews.map((d) => d.count), 1);

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-6">Tableau de bord</h2>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{c.label}</span>
              <div className={`w-9 h-9 rounded-lg ${c.color} flex items-center justify-center`}>
                <c.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views chart */}
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-neutral-500 dark:text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Vues - 7 derniers jours</h3>
          </div>
          <div className="flex items-end gap-2 h-40">
            {recentViews.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {d.count}
                </span>
                <div
                  className="w-full bg-accent/20 dark:bg-accent/30 rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(4, (d.count / maxViews) * 100)}%`,
                    background: d.count === maxViews ? 'var(--tw-accent, #c8102e)' : undefined,
                  }}
                />
                <span className="text-[10px] text-neutral-400 truncate w-full text-center">{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top articles */}
        <div className="card-surface rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-neutral-500 dark:text-neutral-400" />
            <h3 className="font-semibold text-neutral-900 dark:text-white">Articles les plus lus</h3>
          </div>
          {topArticles.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 py-8 text-center">
              Pas encore de donnees de vues
            </p>
          ) : (
            <div className="space-y-3">
              {topArticles.map((a, i) => (
                <div key={a.article_id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    i === 1 ? 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300' :
                    'bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400'
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm text-neutral-700 dark:text-neutral-300 truncate font-medium">
                    {a.title}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1 flex-shrink-0">
                    <Eye size={12} /> {a.view_count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
