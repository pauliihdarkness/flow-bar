import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Loader2 } from 'lucide-react';
import { getCategories } from '../../services/categories';
import Button from '../ui/Button';

const ProductForm = ({ product, onSubmit, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [formData, setFormData] = useState(product || {
    name: '',
    price: 0,
    category: 'tragos',
    image: '',
    description: ''
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        if (!product && data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0].slug }));
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'price' ? parseFloat(value) : value 
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <div className="bg-card w-full max-w-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Nombre</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Precio (ARS)</label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Categoría</label>
            {loadingCats ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-3 px-4">
                <Loader2 size={16} className="animate-spin" />
                Cargando categorías...
              </div>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug} className="bg-dark">{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">URL Imagen</label>
            <input
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/50 text-white resize-none"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="secondary" fullWidth onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button variant="primary" fullWidth type="submit">
              <Save size={18} />
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
