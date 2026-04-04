import GameCard from '../GameCard';
import './BentoGrid.css';

export default function BentoGrid({
  games,
  favorites,
  onToggleFavorite,
  onPlay,
}) {
  if (!games || games.length === 0) return null;

  return (
    <div className="bento-grid">
      <div className="bento-grid__standard">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
}
