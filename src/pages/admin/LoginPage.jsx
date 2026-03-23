import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { loginUser } from '../../services/auth';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      navigate('/admin');
    } catch (err) {
      setError('Credenciales inválidas. Por favor intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card/50 backdrop-blur-2xl border border-white/5 p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-10">
          <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Acceso Staff</h1>
          <p className="text-gray-400">Panel de Control Flow Bar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-white font-medium"
              placeholder="admin@flowbar.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-white font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <Button 
            variant="primary" 
            fullWidth 
            disabled={loading}
            className="py-4 text-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              'Ingresar'
            )}
          </Button>
        </form>

        <p className="text-center mt-10 text-gray-600 text-sm">
          Flow Bar © 2026 • Advanced Digital Ordering
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
