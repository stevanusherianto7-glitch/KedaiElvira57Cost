import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 100, className = "" }) => {
  // v1.0.3 - Absolute Path Fix
  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`} 
      style={{ width: size, height: size }}
    >
      <img 
        src="/logo-transparent.png" 
        alt="Elvera 57" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};
