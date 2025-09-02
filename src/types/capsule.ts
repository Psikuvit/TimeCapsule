export interface TimeCapsule {
  id: string;
  userId: string;
  message: string;
  deliveryDate: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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

export interface ApiCapsuleResponse {
  capsules: TimeCapsule[];
}

export interface CreateCapsuleResponse {
  capsule: TimeCapsule;
} 