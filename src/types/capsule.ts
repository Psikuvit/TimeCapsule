export interface TimeCapsule {
  id: string;
  message: string;
  unlockDate: Date;
  createdAt: Date;
  isUnlocked: boolean;
}

export interface CreateCapsuleData {
  message: string;
  unlockDate: string; // ISO string format
}

export interface CapsuleStatus {
  isUnlocked: boolean;
  daysUntilUnlock?: number;
  hoursUntilUnlock?: number;
  minutesUntilUnlock?: number;
} 