import React from 'react';
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, selected, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide no-scrollbar -mx-6 px-6 scroll-smooth">
      {/* Opción 'Todos' manual */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect('all')}
        className={`
          whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all duration-300 border
          ${selected === 'all' 
            ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' 
            : 'bg-white/[0.03] text-gray-500 border-white/5 hover:bg-white/[0.08] hover:text-gray-300'}
        `}
      >
        Todos
      </motion.button>

      {categories.map((cat) => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(cat.slug)}
          className={`
            whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] uppercase font-black tracking-widest transition-all duration-300 border
            ${selected === cat.slug 
              ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' 
              : 'bg-white/[0.03] text-gray-500 border-white/5 hover:bg-white/[0.08] hover:text-gray-300'}
          `}
        >
          {cat.name}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;
