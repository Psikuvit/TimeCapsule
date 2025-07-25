import { TimeCapsule, CapsuleStatus } from '@/types/capsule';

const STORAGE_KEY = 'timecapsules';

export function createCapsule(message: string, unlockDate: string): TimeCapsule {
  const capsule: TimeCapsule = {
    id: generateId(),
    message,
    unlockDate: new Date(unlockDate),
    createdAt: new Date(),
    isUnlocked: false,
  };
  
  return capsule;
}

export function saveCapsule(capsule: TimeCapsule): void {
  const capsules = getAllCapsules();
  capsules.push(capsule);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(capsules));
}

export function getAllCapsules(): TimeCapsule[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const capsules = JSON.parse(stored) as TimeCapsule[];
    return capsules.map((capsule: TimeCapsule) => ({
      ...capsule,
      unlockDate: new Date(capsule.unlockDate),
      createdAt: new Date(capsule.createdAt),
    }));
  } catch {
    return [];
  }
}

export function getCapsuleStatus(capsule: TimeCapsule): CapsuleStatus {
  const now = new Date();
  const unlockDate = new Date(capsule.unlockDate);
  const isUnlocked = now >= unlockDate;
  
  if (isUnlocked) {
    return { isUnlocked: true };
  }
  
  const diffMs = unlockDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    isUnlocked: false,
    daysUntilUnlock: diffDays,
    hoursUntilUnlock: diffHours,
    minutesUntilUnlock: diffMinutes,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function formatTimeRemaining(status: CapsuleStatus): string {
  if (status.isUnlocked) return 'Unlocked!';
  
  const parts = [];
  if (status.daysUntilUnlock && status.daysUntilUnlock > 0) {
    parts.push(`${status.daysUntilUnlock} day${status.daysUntilUnlock !== 1 ? 's' : ''}`);
  }
  if (status.hoursUntilUnlock && status.hoursUntilUnlock > 0) {
    parts.push(`${status.hoursUntilUnlock} hour${status.hoursUntilUnlock !== 1 ? 's' : ''}`);
  }
  if (status.minutesUntilUnlock && status.minutesUntilUnlock > 0) {
    parts.push(`${status.minutesUntilUnlock} minute${status.minutesUntilUnlock !== 1 ? 's' : ''}`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Less than a minute';
}

export function deleteCapsule(capsuleId: string): void {
  const capsules = getAllCapsules();
  const filteredCapsules = capsules.filter(capsule => capsule.id !== capsuleId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCapsules));
} 