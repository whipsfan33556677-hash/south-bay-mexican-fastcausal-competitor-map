import React from 'react';

/**
 * Registry of official, true brand logo assets.
 * Uses official vector SVGs and authentic high-resolution brand assets.
 */
export const BRAND_LOGO_URLS: Record<string, string> = {
  'QDOBA': '/logos/qdoba.svg',
  'QDOBA Mexican Eats': '/logos/qdoba.svg',
  'Chipotle Mexican Grill': '/logos/chipotle.svg',
  'Taco Bell': '/logos/tacobell.svg',
  'Del Taco': '/logos/deltaco.svg',
  "Rubio's Coastal Grill": '/logos/rubios.svg',
  'Baja Fresh': '/logos/bajafresh.svg',
  'Cafe Rio Fresh Modern Mexican': '/logos/caferio.png',
  'sweetgreen': '/logos/sweetgreen.png',
  'Panda Express': '/logos/pandaexpress.svg',
  'Panera Bread': '/logos/Screenshot_2026-10-09_at_2.35.26_PM-removebg-preview.png',
  'CAVA': '/logos/cava.png',
  'HomeState': '/logos/homestate.png',
  'Plaza El Segundo': '/logos/plazaelsegundo_icon.png',
  'El Pollo Loco': '/logos/images (10).png',
};

export const getBrandLogoUrl = (brandName: string): string => {
  return BRAND_LOGO_URLS[brandName] || '/logos/qdoba.svg';
};

interface BrandLogoProps {
  brand: string;
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ brand, size = 32, className = 'w-full h-full' }) => {
  const url = getBrandLogoUrl(brand);
  const isCircular = brand === 'Panera Bread' || brand === 'QDOBA' || brand === 'QDOBA Mexican Eats';
  return (
    <img
      src={url}
      alt={`${brand} logo`}
      style={{ maxWidth: '100%', maxHeight: '100%' }}
      className={`select-none pointer-events-none ${
        isCircular ? 'object-cover w-full h-full scale-[1.04] rounded-full' : 'object-contain'
      } ${className}`}
      loading="eager"
    />
  );
};

// Export compatibility map for components referencing BrandLogos[brand]
export const BrandLogos: Record<string, (props: { className?: string; size?: number }) => React.ReactElement> = {
  'QDOBA': (props) => <BrandLogo brand="QDOBA" {...props} />,
  'QDOBA Mexican Eats': (props) => <BrandLogo brand="QDOBA Mexican Eats" {...props} />,
  'Chipotle Mexican Grill': (props) => <BrandLogo brand="Chipotle Mexican Grill" {...props} />,
  'Taco Bell': (props) => <BrandLogo brand="Taco Bell" {...props} />,
  'Del Taco': (props) => <BrandLogo brand="Del Taco" {...props} />,
  "Rubio's Coastal Grill": (props) => <BrandLogo brand="Rubio's Coastal Grill" {...props} />,
  'Baja Fresh': (props) => <BrandLogo brand="Baja Fresh" {...props} />,
  'Cafe Rio Fresh Modern Mexican': (props) => <BrandLogo brand="Cafe Rio Fresh Modern Mexican" {...props} />,
  'sweetgreen': (props) => <BrandLogo brand="sweetgreen" {...props} />,
  'Panda Express': (props) => <BrandLogo brand="Panda Express" {...props} />,
  'Panera Bread': (props) => <BrandLogo brand="Panera Bread" {...props} />,
  'CAVA': (props) => <BrandLogo brand="CAVA" {...props} />,
  'HomeState': (props) => <BrandLogo brand="HomeState" {...props} />,
  'Plaza El Segundo': (props) => <BrandLogo brand="Plaza El Segundo" {...props} />,
  'El Pollo Loco': (props) => <BrandLogo brand="El Pollo Loco" {...props} />,
};

export const getBrandLogo = (brandName: string) => {
  return BrandLogos[brandName] || BrandLogos['QDOBA'];
};
