/**
 * Header, Loading, Empty, Error – theme-aware (shadcn + dark/light)
 */

import { Link, useNavigate } from 'react-router-dom';
import { Zap, Settings, LogOut, Home, Users, Target, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserProfile } from '@/hooks';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const displayName = profile?.displayName?.trim() || user?.email?.split('@')[0] || 'Kullanıcı';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="site-container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Süper Lig Analytics
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Maç tahmin ve istatistik
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Anasayfa
            </Button>
          </Link>
          <Link to="/teams">
            <Button variant="ghost" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Takımlar
            </Button>
          </Link>
          <Link to="/predictions">
            <Button variant="ghost" size="sm" className="gap-2">
              <Target className="h-4 w-4" />
              Tahminler
            </Button>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1.5"
                  title="Profil menüsü"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                    {profile?.photoBase64 ? (
                      <img
                        src={profile.photoBase64}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="hidden min-w-0 max-w-[140px] text-left sm:block">
                    <p className="truncate text-sm font-medium text-foreground" title={displayName}>
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground" title={user.email ?? ''}>
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 py-16 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Button className="mt-6" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 text-destructive">
          Tekrar dene
        </Button>
      )}
    </div>
  );
}

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const badgeVariants = {
  success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  danger: 'bg-destructive/15 text-destructive',
  warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  info: 'bg-primary/15 text-primary',
};

export function Badge({ variant = 'info', children, size = 'md' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badgeVariants[variant],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      {children}
    </span>
  );
}

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  unit?: string;
}

export function StatsCard({ label, value, icon, trend, unit = '' }: StatsCardProps) {
  return (
    <Card className="text-center">
      {icon && <div className="mb-2 text-2xl text-primary">{icon}</div>}
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground sm:text-3xl">
        {value}
        {unit}
      </p>
      {trend !== undefined && (
        <p
          className={cn(
            'mt-2 text-xs',
            trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
          )}
        >
          {trend > 0 ? '+' : ''}
          {trend}% {trend > 0 ? '↑' : '↓'}
        </p>
      )}
    </Card>
  );
}

interface FormBarProps {
  form: string;
  title?: string;
}

export function FormBar({ form, title = 'Form' }: FormBarProps) {
  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">{title}</p>
      <div className="flex gap-1">
        {form.split('').map((char, i) => (
          <div
            key={i}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white',
              char === 'W' && 'bg-emerald-600',
              char === 'D' && 'bg-amber-500',
              char === 'L' && 'bg-destructive'
            )}
            title={char === 'W' ? 'Galibiyet' : char === 'D' ? 'Beraberlik' : 'Mağlubiyet'}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}

interface RatingBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function RatingBar({ label, value, max = 100, color = 'bg-primary' }: RatingBarProps) {
  const pct = (value / max) * 100;
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">{value.toFixed(0)}</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
