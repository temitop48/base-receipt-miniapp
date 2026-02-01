'use client';

import { useState, useEffect } from 'react';
import { Snowflake, Flower, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export type SeasonalTheme = 'default' | 'winter' | 'spring';

export function SeasonalThemeToggle() {
  const [season, setSeason] = useState<SeasonalTheme>('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved seasonal theme
    const savedSeason = localStorage.getItem('seasonal-theme') as SeasonalTheme;
    if (savedSeason && ['default', 'winter', 'spring'].includes(savedSeason)) {
      setSeason(savedSeason);
      applySeason(savedSeason);
    }
  }, []);

  const applySeason = (newSeason: SeasonalTheme) => {
    // Remove all seasonal classes
    document.documentElement.classList.remove('winter', 'spring');
    
    // Apply new season if not default
    if (newSeason !== 'default') {
      document.documentElement.classList.add(newSeason);
    }
  };

  const cycleSeason = () => {
    const seasons: SeasonalTheme[] = ['default', 'winter', 'spring'];
    const currentIndex = seasons.indexOf(season);
    const nextSeason = seasons[(currentIndex + 1) % seasons.length];
    
    setSeason(nextSeason);
    applySeason(nextSeason);
    localStorage.setItem('seasonal-theme', nextSeason);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="w-10 h-10 rounded-full border-2"
        disabled
      >
        <Sparkles className="h-4 w-4" />
      </Button>
    );
  }

  const getIcon = () => {
    switch (season) {
      case 'winter':
        return <Snowflake className="h-4 w-4 text-blue-400 transition-transform" />;
      case 'spring':
        return <Flower className="h-4 w-4 text-blue-500 transition-transform" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary transition-transform" />;
    }
  };

  const getLabel = () => {
    switch (season) {
      case 'winter':
        return 'Winter theme';
      case 'spring':
        return 'Spring theme';
      default:
        return 'Default theme';
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleSeason}
      className="w-10 h-10 rounded-full border-2 transition-all hover:scale-110 hover:rotate-12"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </Button>
  );
}
