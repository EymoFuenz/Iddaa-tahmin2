import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="site-container flex min-h-screen flex-col items-center justify-center bg-background py-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Zap className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Süper Lig Analytics</CardTitle>
              <CardDescription>Devam etmek için giriş yapın</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  clearAuthError();
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition',
                  !isRegister ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <LogIn className="h-4 w-4" />
                Giriş
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  clearAuthError();
                }}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition',
                  isRegister ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <UserPlus className="h-4 w-4" />
                Kayıt
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  E-posta
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Şifre
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                {isRegister && (
                  <p className="text-xs text-muted-foreground">En az 6 karakter</p>
                )}
              </div>

              {authError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <p className="text-sm text-destructive">{authError}</p>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full py-3">
                {submitting ? 'Bekleyin...' : isRegister ? 'Hesap oluştur' : 'Giriş yap'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Maç tahminleri ve istatistiklere erişmek için giriş yapın.
        </p>
      </div>
    </div>
  );
}
