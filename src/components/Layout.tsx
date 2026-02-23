/**
 * Header Component
 */

import { Zap, Settings } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      <div className="container py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-lg p-2">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">⚽ Süper Lig Analytics</h1>
            <p className="text-xs text-gray-400">Maç Tahmin & İstatistik Platformu</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-gray-300 hover:text-white transition">Anasayfa</a>
          <a href="/teams" className="text-gray-300 hover:text-white transition">Takımlar</a>
          <a href="/predictions" className="text-gray-300 hover:text-white transition">Tahminler</a>
          <a href="/statistics" className="text-gray-300 hover:text-white transition">İstatistikler</a>
        </nav>

        <button className="btn btn-secondary btn-sm">
          <Settings className="w-4 h-4" />
          Ayarlar
        </button>
      </div>
    </header>
  );
}

/**
 * Loading Spinner
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-1 bg-gray-900 rounded-full"></div>
      </div>
    </div>
  );
}

/**
 * Empty State
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 mb-6">{description}</p>}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Error Message
 */
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4">
      <p className="text-red-400 text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-red-300 hover:text-red-200 text-sm font-medium">
          Tekrar Dene
        </button>
      )}
    </div>
  );
}

/**
 * Badge Component
 */
interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

export function Badge({ variant = 'info', children, size = 'md' }: BadgeProps) {
  const variants = {
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return <span className={`badge ${variants[variant]} ${sizes[size]}`}>{children}</span>;
}

/**
 * Card Component
 */
interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Card({ className = '', children, onClick }: CardProps) {
  return (
    <div 
      className={`card ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Stats Card
 */
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
      {icon && <div className="text-2xl mb-2 text-sky-400">{icon}</div>}
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">
        {value}{unit}
      </p>
      {trend !== undefined && (
        <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}% {trend > 0 ? '↑' : '↓'}
        </p>
      )}
    </Card>
  );
}

/**
 * Form Bar Component
 */
interface FormBarProps {
  form: string;
  title?: string;
}

export function FormBar({ form, title = 'Form' }: FormBarProps) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">{title}</p>
      <div className="flex gap-1">
        {form.split('').map((char, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${
              char === 'W'
                ? 'bg-green-600'
                : char === 'D'
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            title={char === 'W' ? 'Win' : char === 'D' ? 'Draw' : 'Loss'}
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Rating Bar
 */
interface RatingBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function RatingBar({ label, value, max = 100, color = 'bg-sky-500' }: RatingBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm text-gray-300">{label}</p>
        <p className="text-sm font-bold text-white">{value.toFixed(0)}</p>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
