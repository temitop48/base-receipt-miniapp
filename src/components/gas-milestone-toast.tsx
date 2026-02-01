'use client';

import { useEffect, useState } from 'react';
import type { GasMilestone } from '@/lib/gas-milestones';

interface GasMilestoneToastProps {
  milestone: GasMilestone | null;
  onDismiss: () => void;
}

export function GasMilestoneToast({ milestone, onDismiss }: GasMilestoneToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (milestone) {
      // Small delay before showing to ensure smooth entrance
      const showTimeout = setTimeout(() => setIsVisible(true), 300);
      
      // Auto-dismiss after 5 seconds
      const dismissTimeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300); // Wait for fade-out animation
      }, 5000);

      return () => {
        clearTimeout(showTimeout);
        clearTimeout(dismissTimeout);
      };
    }
  }, [milestone, onDismiss]);

  if (!milestone) return null;

  return (
    <div
      className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/90 dark:to-blue-900/90 border-2 border-blue-200 dark:border-blue-700/50 rounded-xl shadow-lg backdrop-blur-xl mx-4 sm:mx-0 min-w-[280px] sm:min-w-[320px]">
        <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
          {/* Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 text-xl sm:text-2xl">
            {milestone.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-100 mb-0.5">
                  {milestone.title}
                </h3>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
                  {milestone.description}
                </p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onDismiss, 300);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors p-1 -mr-1"
                aria-label="Dismiss"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Subtle achievement indicator */}
            <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700/50">
              <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-semibold">
                Gas milestone reached
              </p>
            </div>
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-400/20 to-blue-500/20 dark:from-blue-600/20 dark:to-blue-700/20 rounded-xl blur-xl" />
      </div>
    </div>
  );
}
