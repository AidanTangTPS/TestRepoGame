import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import BentoGrid from './components/BentoGrid';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import GameModal from './components/GameModal';
import Skeleton from './components/Skeleton';
import { useGames } from './hooks/useGames';
import { useFavorites } from './hooks/useFavorites';
import './styles/global.css';
import './App.css';

export default function App() {
  const { games, loading, error } = useGames();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedGame, setSelectedGame] = useState(null);

  const filteredGames = games.filter((game) => {
    if (!game || typeof game !== 'object') return false;
    const matchesCategory =
      activeCategory === 'all' || game.cat === activeCategory;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (game.title && game.title.toLowerCase().includes(searchLower)) ||
      (game.desc && game.desc.toLowerCase().includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  const handlePlay = (game) => {
    setSelectedGame(game);
  };

  const handleClose = () => {
    setSelectedGame(null);
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__logo">
          <Gamepad2 size={28} className="app__logo-icon" />
          <span className="app__logo-text">
            UNBLOCK<span>MATH</span>
          </span>
        </div>
        <SearchBar value={search} onChange={setSearch} />
      </header>

      <main className="app__main">
        <CategoryFilter
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        {error && (
          <div className="app__error">
            <p>Failed to load games: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="app__skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant={i < 2 ? 'featured' : 'card'} />
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <BentoGrid
            games={filteredGames}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onPlay={handlePlay}
          />
        ) : (
          <div className="app__empty">
            <p className="app__empty-text">No games found</p>
            <p className="app__empty-hint">Try a different search or category</p>
          </div>
        )}
      </main>

      <footer className="app__footer">
        <span>UNBLOCKMATH ARCADE</span>
        <span>•</span>
        <span>Self-hosted</span>
        <span>•</span>
        <span>© 2025</span>
      </footer>

      <GameModal game={selectedGame} onClose={handleClose} />
    </div>
  );
}
