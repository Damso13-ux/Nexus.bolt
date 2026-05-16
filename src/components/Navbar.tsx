import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LogOut, Bookmark, Crown, LayoutDashboard, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-cream/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-700 transition-colors">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
              <span className="font-serif text-2xl font-bold text-neutral-900 dark:text-white tracking-tight group-hover:text-accent transition-colors">
                NEXUS
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-sans font-medium mt-1">
                Tech & Finance
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              <Link to="/categorie/finance-marches" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Finance & Marches
              </Link>
              <Link to="/categorie/crypto-web3" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Crypto & Web3
              </Link>
              <Link to="/categorie/intelligence-artificielle" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Intelligence Artificielle
              </Link>
              <Link to="/categorie/cybersecurite" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Cybersecurite
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label={dark ? 'Mode clair' : 'Mode sombre'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  autoFocus
                  className="w-40 sm:w-56 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg px-3 py-1.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors" aria-label="Rechercher">
                <Search size={20} />
              </button>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-sm font-medium text-neutral-600 dark:text-neutral-300 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.full_name || profile?.email || user?.email || '?')[0].toUpperCase()
                    )}
                  </div>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 py-2">
                      <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-700">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{profile?.full_name || 'Utilisateur'}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{profile?.email}</p>
                        {profile?.is_premium && (
                          <span className="premium-badge mt-1">
                            <Crown size={10} /> Premium
                          </span>
                        )}
                      </div>
                      <Link to="/profil" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        <User size={16} /> Mon profil
                      </Link>
                      <Link to="/signets" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        <Bookmark size={16} /> Mes signets
                      </Link>
                      {profile?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                          <LayoutDashboard size={16} /> Administration
                        </Link>
                      )}
                      {!profile?.is_premium && (
                        <Link to="/tarifs" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Crown size={16} /> Passer Premium
                        </Link>
                      )}
                      <div className="border-t border-neutral-100 dark:border-neutral-700 mt-1 pt-1">
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors w-full text-left"
                        >
                          <LogOut size={16} /> Deconnexion
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/connexion" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3 py-2 transition-colors">
                  Connexion
                </Link>
                <Link to="/inscription" className="text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors">
                  S'inscrire
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-700 py-4 space-y-1">
            <Link to="/categorie/finance-marches" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              Finance & Marches
            </Link>
            <Link to="/categorie/crypto-web3" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              Crypto & Web3
            </Link>
            <Link to="/categorie/intelligence-artificielle" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              Intelligence Artificielle
            </Link>
            <Link to="/categorie/cybersecurite" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              Cybersecurite
            </Link>
            {!user && (
              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 mt-3 flex gap-2 px-3">
                <Link to="/connexion" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                  Connexion
                </Link>
                <Link to="/inscription" onClick={() => setMobileOpen(false)} className="flex-1 text-center text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 py-2.5 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
