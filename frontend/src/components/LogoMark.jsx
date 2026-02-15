import React from 'react';
import logoImage from '../assets/logo-lv.webp';

const LogoMark = ({ className = 'h-6 w-6', decorative = true }) => {
  const alt = decorative ? '' : 'LinkVault logo';
  const logoClassName = `${className} rounded-full object-cover`;

  return (
    <img
      src={logoImage}
      alt={alt}
      aria-hidden={decorative}
      className={logoClassName}
      draggable="false"
    />
  );
};

export default LogoMark;
