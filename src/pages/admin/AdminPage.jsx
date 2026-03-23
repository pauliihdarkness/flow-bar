import React from 'react';
import { 
  Package, 
  Users, 
  LogOut, 
  Tag,
  LayoutDashboard,
  History,
  Landmark
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../services/auth';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Ventas y Operaciones',
      items: [
        { id: 'dashboard', label: 'Panel Control', icon: LayoutDashboard, path: 'dashboard' },
        { id: 'shifts', label: 'Control de Caja', icon: Landmark, path: 'shifts' },
        { id: 'history', label: 'Historial', icon: History, path: 'history' },
      ]
    },
    {
      title: 'Configuración Menú',
      items: [
        { id: 'products', label: 'Productos', icon: Package, path: 'products' },
        { id: 'categories', label: 'Categorías', icon: Tag, path: 'categories' },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'personal', label: 'Personal', icon: Users, path: 'personal' },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-dark text-white">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 border-r border-white/5 bg-card/30 flex flex-col p-4 fixed h-full z-40">
        <div className="flex items-center gap-3 px-2 mb-10 md:mb-12">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black">F</div>
          <span className="hidden md:inline font-black text-xl tracking-tight">Flow <span className="text-primary italic">Bar</span></span>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-2">
              <h4 className="hidden md:block text-[10px] uppercase font-black tracking-widest text-gray-600 px-4 mb-3">
                {section.title}
              </h4>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `
                      w-full flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl transition-all duration-300
                      ${isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                        : 'text-gray-500 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={22} className={isActive ? 'animate-pulse' : ''} />
                        <span className="hidden md:inline font-bold text-sm">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center md:justify-start gap-3 p-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-bold mt-auto"
        >
          <LogOut size={22} />
          <span className="hidden md:inline">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-12 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPage;
