import { useEffect, useState } from 'react';
import { Plus, X, Loader2, Tag as TagIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Tag } from '../../lib/types';

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  async function load() {
    const { data } = await supabase.from('tags').select('*').order('name');
    setTags(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function addTag() {
    if (!newName.trim()) return;
    setSaving(true);
    await supabase.from('tags').insert({
      name: newName.trim(),
      slug: slugify(newName.trim()),
    });
    setNewName('');
    setSaving(false);
    load();
  }

  async function updateTag(id: string) {
    if (!editName.trim()) return;
    await supabase.from('tags').update({
      name: editName.trim(),
      slug: slugify(editName.trim()),
    }).eq('id', id);
    setEditingId(null);
    setEditName('');
    load();
  }

  async function deleteTag(id: string) {
    if (!confirm('Supprimer ce tag ?')) return;
    await supabase.from('article_tags').delete().eq('tag_id', id);
    await supabase.from('tags').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white mb-6">Tags</h2>

      {/* Add new tag */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nouveau tag..."
          className="input-field flex-1"
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <button
          onClick={addTag}
          disabled={saving || !newName.trim()}
          className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Ajouter
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />)}
        </div>
      ) : tags.length === 0 ? (
        <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
          Aucun tag. Creez votre premier tag !
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="group inline-flex items-center gap-2 card-surface rounded-full px-4 py-2"
            >
              <TagIcon size={12} className="text-neutral-400" />
              {editingId === tag.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') updateTag(tag.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onBlur={() => updateTag(tag.id)}
                  autoFocus
                  className="bg-transparent text-sm font-medium text-neutral-900 dark:text-white focus:outline-none w-24"
                />
              ) : (
                <span
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer"
                  onClick={() => { setEditingId(tag.id); setEditName(tag.name); }}
                >
                  {tag.name}
                </span>
              )}
              <button
                onClick={() => deleteTag(tag.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-accent transition-all"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
