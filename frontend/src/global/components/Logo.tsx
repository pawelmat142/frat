import React, { useEffect, useState } from 'react';

interface DrawItLogoProps {
  color?: string;
  size?: number;
  className?: string;
  showName?: boolean;
}

const Logo: React.FC<DrawItLogoProps> = ({ 
  color, 
  size = 56, 
  className = "",
  showName = false
}) => {
  const [themeColor, setThemeColor] = useState('#4f46e5');

  useEffect(() => {
    const readPrimaryColor = () => {
      const value = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
      if (value) setThemeColor(value);
    };

    readPrimaryColor();

    const observer = new MutationObserver(readPrimaryColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const logoColor = color || themeColor;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        version="1.1" 
        width={size} 
        height={size} 
        style={{
          shapeRendering: "geometricPrecision", 
          textRendering: "geometricPrecision", 
          fillRule: "evenodd", 
          clipRule: "evenodd"
        }}
        viewBox="0 0 512 512"
      >
        <g>
          <path 
            fill={logoColor}
            d="M 118.5,27.5 C 149.583,57.0814 180.249,87.248 210.5,118C 241.167,118.333 271.833,118.667 302.5,119C 363.014,179.347 423.347,239.847 483.5,300.5C 452.839,301.667 422.172,301.833 391.5,301C 361.667,271.167 331.833,241.333 302,211.5C 301.5,241.498 301.333,271.498 301.5,301.5C 271.498,301.333 241.498,301.5 211.5,302C 241.333,331.833 271.167,361.667 301,391.5C 301.833,422.172 301.667,452.839 300.5,483.5C 239.847,423.347 179.347,363.014 119,302.5C 118.667,271.833 118.333,241.167 118,210.5C 87.6529,180.32 57.4862,149.986 27.5,119.5C 57.826,118.5 88.1593,118.167 118.5,118.5C 118.5,88.1667 118.5,57.8333 118.5,27.5 Z"
          />
        </g>
      </svg>
      {showName && (
        <span 
          className="font-comfortaa font-semibold"
          style={{ 
            color: logoColor,
            fontSize: `${size * .7}px`         }}
        >
          frat
        </span>
      )}
    </div>
  );
};

export default Logo;
