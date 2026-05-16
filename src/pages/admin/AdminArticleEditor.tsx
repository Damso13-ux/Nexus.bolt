import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Crown, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Article, Category, Tag } from '../../lib/types';

interface Props {
  article: Article | null;
  categories: Category[];
  onSave: () => void;
  onCancel: () => void;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminArticleEditor({ article, categories, onSave, onCancel }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [body, setBody] = useState(article?.body || '');
  const [coverImage, setCoverImage] = useState(article?.cover_image || '');
  const [categoryId, setCategoryId] = useState(article?.category_id || categories[0]?.id || '');
  const [isPremium, setIsPremium] = useState(article?.is_premium || false);
  const [readTime, setReadTime] = useState(article?.read_time || 5);
  const [scheduledAt, setScheduledAt] = useState(article?.scheduled_at?.slice(0, 16) || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadTags() {
      const { data } = await supabase.from('tags').select('*').order('name');
      setAllTags(data || []);

      if (article) {
        const { data: atData } = await supabase
          .from('article_tags')
          .select('tag_id')
          .eq('article_id', article.id);
        setSelectedTagIds((atData || []).map((r) => r.tag_id));
      }
    }
    loadTags();
  }, [article]);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!article) {
      setSlug(slugify(val));
    }
  }

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !categoryId) {
      setError('Titre, slug et categorie sont requis.');
      return;
    }
    setSaving(true);
    setError('');

    const data = {
      title,
      slug,
      excerpt,
      body,
      cover_image: coverImage,
      category_id: categoryId,
      is_premium: isPremium,
      read_time: readTime,
      scheduled_at: scheduledAt || null,
      updated_at: new Date().toISOString(),
    };

    let articleId = article?.id;

    if (article) {
      const { error: err } = await supabase.from('articles').update(data).eq('id', article.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data: newArt, error: err } = await supabase.from('articles').insert({
        ...data,
        author_id: user!.id,
      }).select('id').maybeSingle();
      if (err) { setError(err.message); setSaving(false); return; }
      articleId = newArt?.id;
    }

    // Sync tags
    if (articleId) {
      await supabase.from('article_tags').delete().eq('article_id', articleId);
      if (selectedTagIds.length > 0) {
        await supabase.from('article_tags').insert(
          selectedTagIds.map((tagId) => ({ article_id: articleId!, tag_id: tagId }))
        );
      }
    }

    setSaving(false);
    onSave();
  }

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6 transition-colors">
        <ArrowLeft size={16} /> Retour aux articles
      </button>

      <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-6">
        {article ? 'Modifier l\'article' : 'Nouvel article'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Titre</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="input-field !text-base font-serif font-semibold"
                placeholder="Le titre de votre article"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="input-field font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Extrait</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Resume court de l'article"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                Contenu (HTML)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={20}
                className="input-field font-mono resize-y"
                placeholder="<p>Votre contenu ici...</p>"
              />
              <p className="text-xs text-neutral-400 mt-1">Balises supportees : h2, h3, p, blockquote, ul, ol, strong, a, img</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="card-surface rounded-xl p-5 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Categorie</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="input-field"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedTagIds.includes(tag.id)
                          ? 'bg-accent text-white border-accent'
                          : 'bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-600 hover:border-accent hover:text-accent'
                      }`}
                    >
                      {tag.name}
                      {selectedTagIds.includes(tag.id) && <X size={10} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Image de couverture (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="input-field flex-1"
                    placeholder="https://..."
                  />
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {coverImage ? (
                      <img src={coverImage} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ImageIcon size={16} className="text-neutral-400" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Temps de lecture (min)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={readTime}
                  onChange={(e) => setReadTime(parseInt(e.target.value) || 5)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Publication programmee</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setIsPremium(!isPremium)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isPremium ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isPremium ? 'translate-x-5' : ''}`} />
                </button>
                <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Crown size={14} className={isPremium ? 'text-amber-500' : 'text-neutral-400'} /> Article Premium
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {article ? 'Enregistrer' : 'Creer l\'article'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
