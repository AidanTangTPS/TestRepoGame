import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SearchBar.css';

export default function SearchBar({ value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <motion.div
      className={`search-bar ${isFocused ? 'focused' : ''}`}
      animate={{ width: isFocused ? '100%' : 'auto' }}
      transition={{ duration: 0.15 }}
    >
      <Search className="search-bar__icon" size={18} />
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search games..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Search games"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            className="search-bar__clear"
            onClick={handleClear}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
            aria-label="Clear search"
          >
            <X size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
