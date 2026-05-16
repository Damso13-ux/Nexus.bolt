import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Loader2, Filter, X, Calendar, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Article, Category } from '../lib/types';
import ArticleCard from '../components/ArticleCard';

type SortBy = 'recent' | 'oldest';
type DateRange = 'all' | 'week' | 'month' | '3months' | 'year';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('cat') || '');
  const [dateRange, setDateRange] = useState<DateRange>((searchParams.get('date') as DateRange) || 'all');
  const [sortBy, setSortBy] = useState<SortBy>((searchParams.get('sort') as SortBy) || 'recent');
  const [premiumOnly, setPremiumOnly] = useState(searchParams.get('premium') === 'true');

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams]);

  async function doSearch(q: string) {
    setLoading(true);
    setSearched(true);

    let qb = supabase
      .from('articles')
      .select('*, category:categories(*)')
      .eq('is_published', true);

    if (q.trim()) {
      qb = qb.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
    }

    if (categoryFilter) {
      qb = qb.eq('category_id', categoryFilter);
    }

    if (premiumOnly) {
      qb = qb.eq('is_premium', true);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const map: Record<string, number> = { week: 7, month: 30, '3months': 90, year: 365 };
      const days = map[dateRange] || 365;
      const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
      qb = qb.gte('published_at', since);
    }

    qb = qb.order('published_at', { ascending: sortBy === 'oldest' });
    qb = qb.limit(30);

    const { data } = await qb;
    setResults(data || []);
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (query.trim()) params.q = query.trim();
    if (categoryFilter) params.cat = categoryFilter;
    if (dateRange !== 'all') params.date = dateRange;
    if (sortBy !== 'recent') params.sort = sortBy;
    if (premiumOnly) params.premium = 'true';
    setSearchParams(params);
  }

  function clearFilters() {
    setCategoryFilter('');
    setDateRange('all');
    setSortBy('recent');
    setPremiumOnly(false);
  }

  const hasActiveFilters = categoryFilter || dateRange !== 'all' || sortBy !== 'recent' || premiumOnly;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-8">Recherche</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article, un sujet..."
            className="w-full pl-12 pr-4 py-4 border border-neutral-300 dark:border-neutral-600 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </form>

      {/* Filters toggle */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filtersOpen || hasActiveFilters
              ? 'bg-accent/10 text-accent'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          <Filter size={16} /> Filtres
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1"
          >
            <X size={14} /> Effacer les filtres
          </button>
        )}
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="card-surface rounded-xl p-5 mb-8 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <FolderOpen size={14} /> Categorie
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Toutes</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                <Calendar size={14} /> Periode
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="input-field"
              >
                <option value="all">Toutes les dates</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
                <option value="3months">3 derniers mois</option>
                <option value="year">Cette annee</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Tri</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="input-field"
              >
                <option value="recent">Plus recents</option>
                <option value="oldest">Plus anciens</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Type</label>
              <button
                type="button"
                onClick={() => setPremiumOnly(!premiumOnly)}
                className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  premiumOnly
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                    : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {premiumOnly ? 'Premium uniquement' : 'Tous les articles'}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit as unknown as () => void}
            className="btn-primary text-sm"
          >
            Appliquer
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-neutral-400" size={32} />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">Aucun resultat pour "{searchParams.get('q')}"</p>
          <p className="text-neutral-400 dark:text-neutral-500 text-sm mt-2">Essayez avec d'autres mots-cles ou modifiez les filtres</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{results.length} resultat{results.length > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {results.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
