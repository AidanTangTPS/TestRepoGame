import { Responsive, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import GameCard from '../GameCard';
import './BentoGrid.css';

export default function BentoGrid({
  games,
  favorites,
  onToggleFavorite,
  onPlay,
}) {
  const { width, containerRef, mounted } = useContainerWidth();

  if (!games || games.length === 0) return null;

  const featuredGames = games.filter((g) => g && g.featured);
  const standardGames = games.filter((g) => g && !g.featured);

  const generateLayout = (items, startRow = 0, isFeatured = false) => {
    return items.map((game, index) => {
      if (isFeatured) {
        return {
          i: game.id.toString(),
          x: (index % 2) * 6,
          y: startRow + Math.floor(index / 2) * 2,
          w: 6,
          h: 2,
        };
      }
      return {
        i: game.id.toString(),
        x: (index % 4) * 3,
        y: startRow + Math.floor(index / 4) * 2,
        w: 3,
        h: 2,
      };
    });
  };

  const layouts = {
    lg: [
      ...generateLayout(featuredGames, 0, true),
      ...generateLayout(
        standardGames,
        featuredGames.length > 0 ? Math.ceil(featuredGames.length / 2) * 2 + 1 : 0,
        false
      ),
    ],
    md: [
      ...generateLayout(featuredGames, 0, true),
      ...generateLayout(
        standardGames,
        featuredGames.length > 0 ? Math.ceil(featuredGames.length / 2) * 2 + 1 : 0,
        false
      ),
    ],
    sm: games.map((game, index) => ({
      i: game.id.toString(),
      x: (index % 2) * 3,
      y: Math.floor(index / 2) * 2,
      w: 3,
      h: 2,
    })),
    xs: games.map((game, index) => ({
      i: game.id.toString(),
      x: 0,
      y: index * 2,
      w: 4,
      h: 2,
    })),
    xxs: games.map((game, index) => ({
      i: game.id.toString(),
      x: 0,
      y: index * 2,
      w: 2,
      h: 2,
    })),
  };

  const getGameSize = (game) => {
    if (game.featured) return 'featured';
    return 'standard';
  };

  return (
    <div className="bento-grid" ref={containerRef}>
      {mounted && (
        <Responsive
          className="layout"
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={120}
          margin={[16, 16]}
          isDraggable={false}
          isResizable={false}
        >
          {games.map((game) => (
            <div key={game.id.toString()}>
              <GameCard
                game={game}
                size={getGameSize(game)}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={onToggleFavorite}
                onPlay={onPlay}
              />
            </div>
          ))}
        </Responsive>
      )}
    </div>
  );
}
