import { motion } from 'framer-motion';
import './Skeleton.css';

export default function Skeleton({ variant = 'card' }) {
  if (variant === 'card') {
    return (
      <div className="skeleton skeleton--card">
        <div className="skeleton__thumb" />
        <div className="skeleton__body">
          <div className="skeleton__header">
            <div className="skeleton__badge" />
            <div className="skeleton__fav" />
          </div>
          <div className="skeleton__title" />
          <div className="skeleton__text" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="skeleton skeleton--generic"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}
