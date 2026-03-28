import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import './GameCard.css';

export default function GameCard({
  game,
  size = 'standard',
  isFavorite,
  onToggleFavorite,
  onPlay,
}) {
  if (!game) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleClick = () => {
    onPlay(game);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(game.id);
  };

  return (
    <motion.article
      className="game-card"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, backgroundColor: 'var(--bg-card-hover)' }}
      transition={{ duration: 0.1 }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Play ${game.title}`}
    >
      <div className="game-card__thumb">
        <span className="game-card__icon">{game.icon}</span>
      </div>

      <div className="game-card__content">
        <div className="game-card__header">
          <span className="game-card__category">{game.cat}</span>
          <button
            className={`game-card__fav ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </div>
        <h3 className="game-card__title">{game.title}</h3>
        <p className="game-card__desc">{game.desc}</p>
      </div>

      <div className="game-card__play-indicator">
        <Play size={12} />
      </div>
    </motion.article>
  );
}
