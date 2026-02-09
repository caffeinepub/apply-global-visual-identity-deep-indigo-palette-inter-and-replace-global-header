import React, { useState } from 'react';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = 'h-8' }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`flex items-center justify-center font-semibold text-primary ${className}`}>
        First-Y
      </div>
    );
  }

  return (
    <img
      src="/assets/Variação do nome completo-1.png"
      alt="First-Y logo"
      className={className}
      onError={() => setImageError(true)}
    />
  );
}
