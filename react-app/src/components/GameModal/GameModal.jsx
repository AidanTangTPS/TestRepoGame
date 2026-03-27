import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import './GameModal.css';

export default function GameModal({ game, onClose }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (game) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [game, handleKeyDown]);

  return (
    <AnimatePresence>
      {game && (
        <motion.div
          className="game-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="game-modal__backdrop"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="game-modal__content"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-modal-title"
          >
            <header className="game-modal__header">
              <h2 id="game-modal-title" className="game-modal__title">
                {game.title}
              </h2>
              <motion.button
                className="game-modal__close"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close game"
              >
                <X size={24} />
              </motion.button>
            </header>

            <div className="game-modal__frame-wrap">
          <iframe
            className="game-modal__frame"
            src={game.url}
            title={game.title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            allow="fullscreen"
            allowFullScreen
          />
            </div>

            <footer className="game-modal__footer">
              <span className="game-modal__hint">Press ESC to exit</span>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
