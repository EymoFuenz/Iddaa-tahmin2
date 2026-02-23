/**
 * Login / Register Page
 * Giriş yapmadan uygulama kullanılamaz.
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Zap, LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch {
      // authError set in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-xl p-4 mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Süper Lig Analytics</h1>
            <p className="text-gray-400 text-sm mt-1">Devam etmek için giriş yapın</p>
          </div>

          <div className="flex rounded-lg bg-gray-700/50 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                clearAuthError();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
                !isRegister ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              Giriş
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                clearAuthError();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition ${
                isRegister ? 'bg-sky-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Kayıt
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="ornek@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              {isRegister && (
                <p className="text-xs text-gray-500 mt-1">En az 6 karakter</p>
              )}
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full justify-center py-3"
            >
              {submitting ? 'Bekleyin...' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}
            </button>
          </form>
        </div>
        <p className="text-center text-gray-500 text-sm mt-4">
          Maç tahminleri ve istatistiklere erişmek için giriş yapın.
        </p>
      </div>
    </div>
  );
}
