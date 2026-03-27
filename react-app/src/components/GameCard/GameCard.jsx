import { motion } from 'framer-motion';
import { Play, Heart } from 'lucide-react';
import { CATEGORY_COLORS } from '../../data/constants';
import './GameCard.css';

export default function GameCard({
  game,
  size = 'standard',
  isFavorite,
  onToggleFavorite,
  onPlay,
}) {
  if (!game) return null;

  const categoryColor = CATEGORY_COLORS[game.cat] || '#00ff88';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const sizeClasses = {
    featured: 'game-card--featured',
    wide: 'game-card--wide',
    standard: '',
  };

  return (
    <motion.article
      className={`game-card ${sizeClasses[size] || ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.15 }}
      style={
        {
          '--accent': categoryColor,
        }
      }
    >
      <div className="game-card__thumb">
        <span className="game-card__icon">{game.icon}</span>
      </div>

      <div className="game-card__body">
        <div className="game-card__header">
          <h3 className="game-card__title">{game.title}</h3>
          <span className="game-card__category">{game.cat}</span>
        </div>

        {size !== 'standard' && (
          <p className="game-card__desc">{game.desc}</p>
        )}

        <div className="game-card__actions">
          <motion.button
            className="game-card__play"
            onClick={() => onPlay(game)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Play ${game.title}`}
          >
            <Play size={16} />
            <span>Play</span>
          </motion.button>

          <motion.button
            className={`game-card__fav ${isFavorite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game.id);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
        </div>
      </div>

      <div className="game-card__glow" />
    </motion.article>
  );
}
