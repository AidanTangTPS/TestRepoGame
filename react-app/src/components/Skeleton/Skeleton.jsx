import { motion } from 'framer-motion';
import './Skeleton.css';

export default function Skeleton({ variant = 'card' }) {
  if (variant === 'card') {
    return (
      <div className="skeleton skeleton--card">
        <div className="skeleton__thumb" />
        <div className="skeleton__body">
          <div className="skeleton__title" />
          <div className="skeleton__text" />
          <div className="skeleton__button" />
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="skeleton skeleton--featured">
        <div className="skeleton__thumb" />
        <div className="skeleton__body">
          <div className="skeleton__title skeleton__title--lg" />
          <div className="skeleton__text skeleton__text--lg" />
          <div className="skeleton__actions">
            <div className="skeleton__button skeleton__button--lg" />
            <div className="skeleton__icon" />
          </div>
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
