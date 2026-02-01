import type { BaseTransaction } from '@/types/receipt';

/**
 * Gas milestone thresholds in ETH
 * These are quietly celebratory markers of user activity
 */
export interface GasMilestone {
  id: string;
  threshold: number; // in ETH
  title: string;
  description: string;
  icon: string;
}

export const GAS_MILESTONES: GasMilestone[] = [
  {
    id: 'explorer',
    threshold: 0.001,
    title: 'Gas Explorer',
    description: 'First steps on Base',
    icon: '🔍',
  },
  {
    id: 'builder',
    threshold: 0.01,
    title: 'Active Builder',
    description: 'Making your mark onchain',
    icon: '🔨',
  },
  {
    id: 'veteran',
    threshold: 0.1,
    title: 'Base Veteran',
    description: 'Seasoned onchain activity',
    icon: '⭐',
  },
  {
    id: 'supporter',
    threshold: 0.5,
    title: 'Network Supporter',
    description: 'Powering the ecosystem',
    icon: '💎',
  },
  {
    id: 'champion',
    threshold: 1.0,
    title: 'Chain Champion',
    description: 'Committed to Base',
    icon: '🏆',
  },
  {
    id: 'legend',
    threshold: 5.0,
    title: 'Base Legend',
    description: 'Elite onchain presence',
    icon: '👑',
  },
];

/**
 * Calculate total gas spent across all transactions in ETH
 */
export function calculateTotalGasSpent(transactions: BaseTransaction[]): number {
  const totalGasWei = transactions.reduce((sum, tx) => {
    return sum + tx.gasUsed * tx.gasPrice;
  }, BigInt(0));

  return Number(totalGasWei) / 1e18;
}

/**
 * Get the highest milestone achieved based on total gas spent
 */
export function getAchievedMilestones(totalGasEth: number): GasMilestone[] {
  return GAS_MILESTONES.filter((milestone) => totalGasEth >= milestone.threshold);
}

/**
 * Get the next milestone to achieve
 */
export function getNextMilestone(totalGasEth: number): GasMilestone | null {
  const nextMilestone = GAS_MILESTONES.find((milestone) => totalGasEth < milestone.threshold);
  return nextMilestone || null;
}

/**
 * Calculate progress to next milestone (0-100)
 */
export function getProgressToNextMilestone(totalGasEth: number): number {
  const achievedMilestones = getAchievedMilestones(totalGasEth);
  const nextMilestone = getNextMilestone(totalGasEth);

  if (!nextMilestone) return 100;

  const previousThreshold =
    achievedMilestones.length > 0
      ? achievedMilestones[achievedMilestones.length - 1].threshold
      : 0;

  const progress =
    ((totalGasEth - previousThreshold) / (nextMilestone.threshold - previousThreshold)) * 100;

  return Math.min(Math.max(progress, 0), 100);
}

/**
 * Check if a new milestone was just reached
 * Uses localStorage to track which milestones have been shown
 */
export function checkNewMilestone(totalGasEth: number): GasMilestone | null {
  if (typeof window === 'undefined') return null;

  const achievedMilestones = getAchievedMilestones(totalGasEth);
  if (achievedMilestones.length === 0) return null;

  // Get the highest achieved milestone
  const latestMilestone = achievedMilestones[achievedMilestones.length - 1];

  // Check if we've already shown this milestone
  const storageKey = 'base-receipts-shown-milestones';
  const shownMilestones = getShownMilestones();

  if (!shownMilestones.includes(latestMilestone.id)) {
    // Mark as shown
    shownMilestones.push(latestMilestone.id);
    localStorage.setItem(storageKey, JSON.stringify(shownMilestones));
    return latestMilestone;
  }

  return null;
}

/**
 * Get list of milestone IDs that have been shown to the user
 */
export function getShownMilestones(): string[] {
  if (typeof window === 'undefined') return [];

  const storageKey = 'base-receipts-shown-milestones';
  const stored = localStorage.getItem(storageKey);

  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Format ETH value for display
 */
export function formatEthValue(value: number): string {
  if (value < 0.001) {
    return `${value.toFixed(6)} ETH`;
  } else if (value < 0.1) {
    return `${value.toFixed(4)} ETH`;
  } else {
    return `${value.toFixed(3)} ETH`;
  }
}

/**
 * Reset shown milestones (for testing or user request)
 */
export function resetShownMilestones(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('base-receipts-shown-milestones');
}
