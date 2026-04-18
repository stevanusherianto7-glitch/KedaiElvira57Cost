import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 100, className = "" }) => {
  // Mapping sizes to tailwind classes to avoid inline styles warning
  const sizeMap: Record<number, string> = {
    40: "w-10 h-10",
    48: "w-12 h-12",
    64: "w-16 h-16",
    100: "w-[100px] h-[100px]"
  };

  const sizeClass = sizeMap[size] || "";
  const dynamicStyle = !sizeMap[size] ? { '--logo-size': `${size}px` } as React.CSSProperties : {};
  const containerClass = sizeMap[size] ? sizeClass : "w-[var(--logo-size)] h-[var(--logo-size)]";

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${containerClass} ${className}`} 
      style={dynamicStyle}
    >
      <img 
        src="/logo-transparent.png" 
        alt="Elvera 57" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};
