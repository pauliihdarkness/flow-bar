import React from 'react';

const CategoryFilter = ({ categories, selected, onSelect }) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide no-scrollbar -mx-6 px-6">
      {/* Opción 'Todos' manual */}
      <button
        onClick={() => onSelect('all')}
        className={`
          whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
          ${selected === 'all' 
            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}
        `}
      >
        Todos
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.slug)}
          className={`
            whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
            ${selected === cat.slug 
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}
          `}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
