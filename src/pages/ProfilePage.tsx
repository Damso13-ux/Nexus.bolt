import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Loader2, Camera, Clock, BookOpen, Crown, Settings, History } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Category, ReadingHistory } from '../lib/types';
import ArticleCard from '../components/ArticleCard';

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [tab, setTab] = useState<'history' | 'settings'>('history');
  const [categories, setCategories] = useState<Category[]>([]);
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [authorSlug, setAuthorSlug] = useState('');
  const [preferredCats, setPreferredCats] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '');
      setAuthorSlug(profile.author_slug || '');
      setPreferredCats(profile.preferred_categories || []);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [catRes, histRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase
          .from('reading_history')
          .select('*, article:articles(*, category:categories(*))')
          .eq('user_id', user!.id)
          .order('read_at', { ascending: false })
          .limit(20),
      ]);
      setCategories(catRes.data || []);
      setHistory(histRes.data || []);
      setLoadingData(false);
    }
    load();
  }, [user]);

  if (authLoading || (user && !profile)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-neutral-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (!profile) {
    return <Navigate to="/connexion" replace />;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        avatar_url: avatarUrl || null,
        author_slug: authorSlug || null,
        preferred_categories: preferredCats,
      })
      .eq('id', user!.id);

    if (error) {
      setSaveMsg(error.message);
    } else {
      setSaveMsg('Profil mis a jour.');
      await refreshProfile();
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(''), 3000);
  }

  function toggleCategory(slug: string) {
    setPreferredCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  const tabs = [
    { id: 'history' as const, label: 'Historique', icon: History },
    { id: 'settings' as const, label: 'Parametres', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-serif font-bold text-neutral-500 dark:text-neutral-400">
                {profile.full_name[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <button
            onClick={() => setTab('settings')}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-neutral-500 hover:text-accent transition-colors"
          >
            <Camera size={14} />
          </button>
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">{profile.full_name}</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">{profile.email}</p>
          <div className="flex items-center gap-3 mt-2">
            {profile.is_premium && (
              <span className="premium-badge"><Crown size={10} /> Premium</span>
            )}
            {profile.role === 'admin' && (
              <span className="inline-flex items-center gap-1 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
            {profile.bio && (
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{profile.bio}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* History tab */}
      {tab === 'history' && (
        <div>
          {loadingData ? (
            <div className="animate-pulse space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={40} className="mx-auto text-neutral-300 dark:text-neutral-600 mb-4" />
              <p className="text-neutral-500 dark:text-neutral-400 text-lg">Aucun article lu pour le moment</p>
              <Link to="/" className="text-accent text-sm font-medium mt-2 inline-block hover:underline">
                Decouvrir des articles
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((h) => (
                h.article && (
                  <div key={h.id} className="flex items-center gap-4 card-surface rounded-xl p-4">
                    <div className="flex-1 min-w-0">
                      <ArticleCard article={h.article} variant="compact" />
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock size={12} />
                        {new Date(h.read_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="mt-1 w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${h.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-neutral-400">{h.progress}%</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <form onSubmit={handleSave} className="space-y-6">
          {saveMsg && (
            <div className={`text-sm rounded-lg px-4 py-3 ${saveMsg.includes('mis a jour') ? 'bg-success-50 text-success-700 border border-success-100' : 'bg-error-50 text-error-700 border border-error-100'}`}>
              {saveMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Slug auteur (URL publique)</label>
              <input
                type="text"
                value={authorSlug}
                onChange={(e) => setAuthorSlug(e.target.value)}
                placeholder="mon-nom"
                className="input-field font-mono"
              />
              {authorSlug && (
                <p className="text-xs text-neutral-400 mt-1">/auteur/{authorSlug}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Biographie</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Quelques mots sur vous..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Avatar (URL)</label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="input-field flex-1"
                placeholder="https://..."
              />
              {avatarUrl && (
                <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-600" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Categories preferees</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    preferredCats.includes(cat.slug)
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-600 hover:border-accent hover:text-accent'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}
