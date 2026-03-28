import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  gradient?: string;
  onClick?: () => void;
  hover?: boolean;
  rounded?: boolean;
}

/**
 * Full 3-layer glass card using the CodePen technique by wprod:
 * lg-filter  → backdrop blur + SVG lens distortion
 * lg-overlay → semi-transparent background
 * lg-specular → inset box-shadow specular highlight (top-left glass edge)
 */
export default function GlassCard({
  children,
  className = '',
  gradient,
  onClick,
  hover = false,
  rounded = false,
}: GlassCardProps) {
  return (
    <div
      className={`lg-container ${rounded ? 'lg-container--rounded' : ''} ${hover || onClick ? 'cursor-pointer hover:-translate-y-0.5 active:scale-[0.97]' : ''} ${className}`}
      style={{ transition: 'all 0.4s var(--lg-bounce)' }}
      onClick={onClick}
    >
      {/* Layer 1: blur + lens filter */}
      <div className="lg-filter" />

      {/* Layer 2: colour overlay */}
      <div className="lg-overlay" />

      {/* Layer 3: specular highlight — the "glass edge" */}
      <div className="lg-specular" />

      {/* Optional gradient tint */}
      {gradient && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-[inherit]`}
          style={{ zIndex: 2, opacity: 0.18 }}
        />
      )}

      {/* Content */}
      <div className="lg-content">{children}</div>
    </div>
  );
}
