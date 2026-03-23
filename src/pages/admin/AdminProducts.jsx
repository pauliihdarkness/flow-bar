import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, FileSpreadsheet, Loader2 } from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../../services/products';
import ProductForm from '../../components/products/ProductForm';
import CSVImporter from '../../components/admin/CSVImporter';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

const AdminProducts = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCSVImporter, setShowCSVImporter] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      fetchData();
      showToast(editingProduct ? "Producto actualizado" : "Producto añadido", "success");
    } catch (error) {
      showToast("Error al guardar el producto", "error");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
      await deleteProduct(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white">Productos</h2>
          <p className="text-gray-500">Gestión de stock e inventario</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowCSVImporter(true)}>
            <FileSpreadsheet size={20} />
            <span className="hidden sm:inline">Importar CSV</span>
          </Button>
          <Button variant="primary" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
            <Plus size={20} />
            <span className="hidden sm:inline">Nuevo Producto</span>
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="text-primary animate-spin" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-card/50 border border-white/5 p-6 rounded-3xl group hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center text-gray-600 flex-shrink-0">
                  {p.image ? (
                    <img 
                      src={p.image} 
                      className="w-full h-full object-cover" 
                      alt={p.name} 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <Package size={24} className={`${p.image ? 'hidden' : 'block'} opacity-20`} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingProduct(p); setShowForm(true); }}
                    className="p-2 bg-white/5 rounded-xl hover:bg-white/20 text-gray-400 hover:text-white transition-all outline-none"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(p.id)}
                    className="p-2 bg-red-400/5 rounded-xl hover:bg-red-400/20 text-red-400/60 hover:text-red-400 transition-all outline-none"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-lg mb-1">{p.name}</h4>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="primary">${p.price}</Badge>
                <Badge variant="gray" className="uppercase">{p.category}</Badge>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {showCSVImporter && (
        <CSVImporter 
          onComplete={() => fetchData()}
          onClose={() => setShowCSVImporter(false)}
        />
      )}

      {showForm && (
        <ProductForm 
          product={editingProduct}
          onSubmit={handleProductSubmit}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
};

export default AdminProducts;
