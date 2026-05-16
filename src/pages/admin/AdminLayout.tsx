import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderOpen, ArrowLeft, Menu, X, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminArticles from './AdminArticles';
import AdminCategories from './AdminCategories';
import AdminTags from './AdminTags';

type Tab = 'dashboard' | 'articles' | 'categories' | 'tags';

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'tags', label: 'Tags', icon: Tag },
];

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading || (profile === null && user !== null)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-neutral-400">Chargement...</div>
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Retour au site
          </Link>
          <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Administration</h1>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex gap-8">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-56 flex-shrink-0`}>
          <nav className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {tab === 'dashboard' && <AdminDashboard />}
          {tab === 'articles' && <AdminArticles />}
          {tab === 'categories' && <AdminCategories />}
          {tab === 'tags' && <AdminTags />}
        </main>
      </div>
    </div>
  );
}
