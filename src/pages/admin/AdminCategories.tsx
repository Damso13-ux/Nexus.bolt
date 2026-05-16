import { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../lib/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setCreating(false);
  }

  function startCreate() {
    setCreating(true);
    setEditing(null);
    setName('');
    setSlug('');
    setDescription('');
  }

  function cancel() {
    setEditing(null);
    setCreating(false);
    setName('');
    setSlug('');
    setDescription('');
  }

  async function save() {
    if (!name || !slug) return;
    setSaving(true);

    if (editing) {
      await supabase.from('categories').update({ name, slug, description }).eq('id', editing.id);
    } else {
      await supabase.from('categories').insert({ name, slug, description });
    }

    setSaving(false);
    cancel();
    load();
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Catégories</h2>
        {!creating && !editing && (
          <button onClick={startCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Nouvelle catégorie
          </button>
        )}
      </div>

      {(creating || editing) && (
        <div className="card-surface rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">{editing ? 'Modifier' : 'Nouvelle catégorie'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nom</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="input-field font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Enregistrer' : 'Créer'}
            </button>
            <button onClick={cancel} className="btn-outline text-sm">Annuler</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between card-surface rounded-xl px-5 py-4">
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-white">{cat.name}</h4>
                <p className="text-xs text-neutral-400 font-mono">{cat.slug}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(cat)} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400" title="Modifier">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => remove(cat.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-accent" title="Supprimer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
