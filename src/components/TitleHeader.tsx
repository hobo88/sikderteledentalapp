import React from 'react';
import { cn } from '@/lib/utils';

interface TitleHeaderProps {
  theme?: 'light' | 'dark';
}

const TitleHeader: React.FC<TitleHeaderProps> = ({ theme = 'light' }) => {
  const themeClasses = {
    light: 'bg-gray-100 text-gray-800',
    dark: 'bg-gray-800 text-white',
  };

  return (
    <header className={cn(
      "py-4 px-6 text-center shadow-md w-full",
      themeClasses[theme]
    )}>
      <h1 className="text-xl md:text-2xl font-bold">
        Emergency Tele-Dental Service by Sikder Dental Clinic Since 2001
      </h1>
    </header>
  );
};

export default TitleHeader;