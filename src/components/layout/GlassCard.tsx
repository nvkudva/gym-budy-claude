import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', gradient, onClick, hover = false }: GlassCardProps) {
  return (
    <div
      className={`relative glass overflow-hidden ${hover ? 'glass-hover cursor-pointer' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {gradient && (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-100 rounded-2xl`} />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
