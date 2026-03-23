import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { addProduct } from '../../services/products';
import { getCategories, addCategory } from '../../services/categories';
import { useToast } from '../../context/ToastContext';

const CSVImporter = ({ onComplete, onClose }) => {
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Por favor selecciona un archivo CSV válido.');
      setFile(null);
    }
  };

  const processImport = async () => {
    if (!file) return;
    setImporting(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        setProgress({ current: 0, total: data.length });

        try {
          // 1. Obtener categorías actuales para evitar duplicados
          const existingCats = await getCategories();
          const catMap = {}; // name -> slug
          existingCats.forEach(c => catMap[c.name.toLowerCase()] = c.slug);

          for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const { nombre, precio, categoria, descripcion, imagen } = row;

            if (!nombre || !precio || !categoria) {
              console.warn(`Fila ${i + 1} incompleta, saltando...`);
              continue;
            }

            // 2. Gestionar Categoría
            let catSlug = catMap[categoria.toLowerCase()];
            if (!catSlug) {
              // Crear categoría si no existe
              const newCatId = await addCategory(categoria);
              catSlug = categoria.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
              catMap[categoria.toLowerCase()] = catSlug;
            }

            // 3. Crear Producto
            await addProduct({
              name: nombre,
              price: parseFloat(precio),
              category: catSlug,
              description: descripcion || '',
              image: imagen || ''
            });

            setProgress(prev => ({ ...prev, current: i + 1 }));
          }

          showToast('Importación completada con éxito.', 'success');
          onComplete();
          onClose();
        } catch (err) {
          console.error(err);
          setError('Hubo un error durante la importación. Revisa el formato del archivo.');
        } finally {
          setImporting(false);
        }
      },
      error: (err) => {
        setError('Error al leer el archivo CSV.');
        setImporting(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
      <div className="bg-card w-full max-w-lg rounded-[2.5rem] border border-white/10 p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Importar Menú</h2>
          <p className="text-gray-400 font-medium text-sm px-6">
            Carga tus productos masivamente usando un archivo CSV.
          </p>
        </div>

        {!importing ? (
          <div className="space-y-6">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all group"
            >
              <Upload className="text-gray-500 group-hover:text-primary mb-4 transition-colors" size={40} />
              <p className="text-white font-bold">{file ? file.name : 'Click para subir CSV'}</p>
              <p className="text-gray-500 text-sm mt-1">nombre, precio, categoria, descripcion, imagen</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".csv"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-400/10 border border-red-400/20 text-red-400 p-4 rounded-2xl text-sm font-medium">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
              <Button 
                variant="primary" 
                fullWidth 
                disabled={!file} 
                onClick={processImport}
              >
                Comenzar Carga
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <Loader2 className="text-primary animate-spin w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center font-black text-white">
                {Math.round((progress.current / progress.total) * 100)}%
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-xl mb-1">Cargando productos...</p>
              <p className="text-gray-500 font-medium">Procesando {progress.current} de {progress.total}</p>
            </div>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                const csvContent = "nombre,precio,categoria,descripcion,imagen\nFernet Branca,4500,Tragos,Fernet con Coca en vaso largo,https://ejemplo.com/fernet.jpg";
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', 'plantilla_flow_bar.csv');
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="text-primary text-sm font-bold hover:underline"
            >
              Descargar plantilla de ejemplo
            </a>
        </div>
      </div>
    </div>
  );
};

export default CSVImporter;
