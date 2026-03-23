import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const ProductCard = ({ product, onAdd }) => {
  const { name, price, image, category, description } = product;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl">
      <div className="relative h-60 overflow-hidden">
        {!imgError && product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-gray-600">
            <Package size={48} className="mb-2 opacity-20" />
            <span className="text-xs uppercase tracking-widest font-black opacity-30">Sin Imagen</span>
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-dark/60 backdrop-blur-md uppercase">
            {category}
          </Badge>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
            {name}
          </h3>
          <span className="text-primary font-bold text-lg">
            ${price}
          </span>
        </div>
        
        <p className="text-gray-400 text-sm line-clamp-2 mb-6">
          {description}
        </p>
        
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={() => onAdd(product)}
          className="group/btn"
        >
          <Plus size={18} className="group-hover/btn:rotate-90 transition-transform duration-300" />
          Añadir
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
