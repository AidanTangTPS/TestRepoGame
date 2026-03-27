import { motion } from 'framer-motion';
import { CATEGORIES } from '../../data/constants';
import './CategoryFilter.css';

export default function CategoryFilter({ activeCategory, onChange }) {
  return (
    <nav className="category-filter" aria-label="Game categories">
      {CATEGORIES.map((cat) => (
        <motion.button
          key={cat.id}
          className={`category-filter__btn ${
            activeCategory === cat.id ? 'active' : ''
          }`}
          onClick={() => onChange(cat.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={
            activeCategory === cat.id
              ? {
                  '--cat-color': cat.color,
                  background: cat.color,
                  borderColor: cat.color,
                }
              : { '--cat-color': cat.color }
          }
          aria-pressed={activeCategory === cat.id}
        >
          {cat.label}
        </motion.button>
      ))}
    </nav>
  );
}
