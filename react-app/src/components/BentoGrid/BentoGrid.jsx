import GameCard from '../GameCard';
import './BentoGrid.css';

export default function BentoGrid({
  games,
  favorites,
  onToggleFavorite,
  onPlay,
}) {
  if (!games || games.length === 0) return null;

  const featuredGames = games.filter((g) => g && g.featured);
  const standardGames = games.filter((g) => g && !g.featured);

  return (
    <div className="bento-grid">
      {featuredGames.length > 0 && (
        <div className="bento-grid__featured">
          {featuredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              size="featured"
              isFavorite={favorites.includes(game.id)}
              onToggleFavorite={onToggleFavorite}
              onPlay={onPlay}
            />
          ))}
        </div>
      )}

      <div className="bento-grid__standard">
        {standardGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            size="standard"
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
            onPlay={onPlay}
          />
        ))}
      </div>
    </div>
  );
}
