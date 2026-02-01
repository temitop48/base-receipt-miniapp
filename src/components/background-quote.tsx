'use client';

import { useEffect, useState } from 'react';

// Anime-inspired quotes - calm, resolute, inspiring
// No copyrighted character dialogue - original philosophical quotes
const QUOTES = [
  "Every transaction tells a story",
  "Build your legacy, one block at a time",
  "The path forward is always onchain",
  "Small actions create lasting ripples",
  "Trust the process, embrace the journey",
  "Your onchain footprint defines tomorrow",
  "Patience and persistence shape the future",
  "Every step forward counts",
  "The blockchain never forgets your courage",
  "Persevere through the storm to find clarity",
] as const;

export function BackgroundQuote() {
  const [quote, setQuote] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Select a random quote on mount
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuote(randomQuote);
    
    // Fade in after a brief delay
    const fadeInTimer = setTimeout(() => setIsVisible(true), 800);

    return () => clearTimeout(fadeInTimer);
  }, []);

  // Hide on small screens to avoid clutter
  return (
    <div 
      className={`
        hidden lg:block
        fixed bottom-12 right-12 
        max-w-md
        pointer-events-none select-none
        transition-opacity duration-1000
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      aria-hidden="true"
    >
      <p className="
        text-3xl font-bold
        text-foreground/[0.04] dark:text-foreground/[0.06]
        leading-tight
        text-right
        animate-fade-in
      ">
        {quote}
      </p>
    </div>
  );
}
