import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Loader2 } from 'lucide-react';
import { getCategories, addCategory, deleteCategory } from '../../services/categories';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

const AdminCategories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await addCategory(newCatName);
      setNewCatName('');
      fetchData();
      showToast("Categoría añadida con éxito", "success");
    } catch (error) {
      showToast("Error al añadir la categoría", "error");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar esta categoría? Si hay productos usándola, podrían dejar de verse correctamente.")) {
      await deleteCategory(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-white">Categorías</h2>
        <p className="text-gray-500">Organización del menú</p>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="text-primary animate-spin" size={48} />
        </div>
      ) : (
        <div className="space-y-8">
          <form onSubmit={handleAddCategory} className="flex gap-4 max-w-md">
            <input 
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nombre de la categoría (ej. Vinos)"
              className="flex-1 bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none focus:border-primary/50 text-white font-medium"
            />
            <Button variant="primary" type="submit">
              <Plus size={20} />
              Añadir
            </Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-card/50 border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group hover:border-white/20 transition-all">
                <div>
                  <h4 className="font-bold text-lg">{cat.name}</h4>
                  <span className="text-xs text-gray-500 font-mono">/{cat.slug}</span>
                </div>
                <button 
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-2 bg-red-400/5 rounded-xl hover:bg-red-400/20 text-red-400/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
