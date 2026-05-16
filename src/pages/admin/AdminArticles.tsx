import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Crown, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Article, Category } from '../../lib/types';
import AdminArticleEditor from './AdminArticleEditor';

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [artRes, catRes] = await Promise.all([
      supabase
        .from('articles')
        .select('*, category:categories(name, slug)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setArticles(artRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePublish(article: Article) {
    await supabase
      .from('articles')
      .update({
        is_published: !article.is_published,
        published_at: !article.is_published ? new Date().toISOString() : null,
      })
      .eq('id', article.id);
    load();
  }

  async function deleteArticle(id: string) {
    if (!confirm('Supprimer cet article ?')) return;
    await supabase.from('articles').delete().eq('id', id);
    load();
  }

  if (creating || editing) {
    return (
      <AdminArticleEditor
        article={editing}
        categories={categories}
        onSave={() => { setEditing(null); setCreating(false); load(); }}
        onCancel={() => { setEditing(null); setCreating(false); }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Articles</h2>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-neutral-200 rounded-lg" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
          Aucun article. Créez votre premier article !
        </div>
      ) : (
        <div className="card-surface rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Titre</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400 hidden md:table-cell">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400 hidden sm:table-cell">Statut</th>
                <th className="text-right px-4 py-3 font-medium text-neutral-600 dark:text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((art) => (
                <tr key={art.id} className="border-b border-neutral-100 dark:border-neutral-700/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white truncate max-w-xs">{art.title}</span>
                      {art.is_premium && <Crown size={14} className="text-amber-500 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400 hidden md:table-cell">{art.category?.name}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {art.is_published ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Eye size={12} /> Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                        <EyeOff size={12} /> Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => togglePublish(art)}
                        className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400"
                        title={art.is_published ? 'Dépublier' : 'Publier'}
                      >
                        {art.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => setEditing(art)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-neutral-500 dark:text-neutral-400" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => deleteArticle(art.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-neutral-400 hover:text-accent" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
