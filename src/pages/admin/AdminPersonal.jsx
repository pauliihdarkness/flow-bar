import React, { useState, useEffect } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { getStaff } from '../../services/users';
import Badge from '../../components/ui/Badge';

const AdminPersonal = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getStaff();
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header>
        <h2 className="text-3xl font-black text-white">Personal</h2>
        <p className="text-gray-500">Gestión de accesos y roles</p>
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="text-primary animate-spin" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((s) => (
            <div key={s.id} className="bg-card/50 border border-white/5 p-6 rounded-3xl flex items-center gap-4 group hover:border-white/10 transition-all">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-xl text-primary">
                {s.email?.[0].toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">{s.email}</h4>
                <Badge variant={s.role === 'admin' ? 'primary' : 'secondary'} className="uppercase text-[10px] tracking-widest">
                  {s.role}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPersonal;
