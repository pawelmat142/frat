import React, { useEffect, useState } from 'react';

interface DrawItLogoProps {
  color?: string;
  size?: number;
  className?: string;
  showName?: boolean;
}

const Logo: React.FC<DrawItLogoProps> = ({
  color, 
  size = 80,
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
    <div className={`ml-4 flex items-center gap-2 ${className}`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        version="1.1" 
        width={size} 
        height={size} 
        style={{
          shapeRendering: "geometricPrecision", 
          textRendering: "geometricPrecision", 
          fillRule: "evenodd", 
          clipRule: "evenodd",
        }}
        viewBox="0 0 512 512"
      >
        <g>
          <path
              fill={logoColor} fillRule="evenodd" stroke="#cccccc" strokeWidth="0.5" strokeLinejoin="round"
              d="M263.48 82.3C266.41 85.1 271.86 100.92 273.17 105.44C271.33 108.02 261.04 109.85 257.6 111.05C250.48 113.53 243.81 115.81 236.62 118.52C224.21 123.2 216.17 126.16 213.34 140.55C211.24 151.28 218.56 159.6 224.78 167.28C234.07 178.74 243.06 190.55 251.81 202.37C265.7 221.15 280.55 239.63 294.96 257.95C306.25 272.29 317.37 287.64 328.96 301.95C340.21 315.83 350.27 331.64 362.17 345.52C367.92 352.22 373.29 359.54 378.43 366.67C381.53 370.97 386.25 374.97 388.7 379.78C391.45 385.16 391.96 392.71 393.34 398.58C394.46 403.37 397.68 410.09 396.74 414.93C393.71 414.91 386.11 409.83 383.28 408.1C377.91 404.81 370.94 402.64 366.17 398.56C358.47 391.96 352.91 380.29 346.01 372.89C341.6 368.15 337.51 362.14 333.62 356.76C326.69 347.22 319.01 338.2 312.03 328.79C310.29 326.45 307.97 324.57 306.16 322.28C297.65 311.52 289.16 299.5 280.61 288.18C265.15 267.72 248.87 247.96 233.37 227.4C221.62 211.81 210.26 197.21 198.15 181.76C194.75 177.43 190.86 171.35 184.92 170.2C184.13 170.05 183.39 170.46 182.6 170.21C180.65 169.6 179.24 168.85 176.98 169.3C172.14 170.27 164.46 174.78 164.6 180.73C164.68 183.94 165.97 188.13 163.64 190.99C157.51 198.5 150.28 204.72 144.18 212.21C132.33 226.75 122.59 243.06 114.8 259.52C111.16 267.23 108.24 275.18 105.18 283.11C104.25 285.52 103.52 290.74 101.23 291.82C98.43 288.87 97.28 277.74 96.93 273.77C95.45 257.32 101.73 235.13 107.6 219.55C112.78 205.83 120.96 185.09 130.01 173.77C134.39 168.28 138.67 161.9 143.58 156.45C163.43 134.35 187.96 114.93 214.93 102.17C225.31 97.26 236.06 92.26 246.67 88.08C252.01 85.98 258.13 84.74 263.48 82.3Z"
          />
        </g>
      </svg>
      {showName && (
        <span 
          className="font-comfortaa font-semibold"
          style={{ 
            color: logoColor,
            fontSize: `${size * .2}px`         }}
        >
          frat
        </span>
      )}
    </div>
  );
};

export default Logo;
