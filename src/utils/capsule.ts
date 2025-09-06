import { TimeCapsule, CapsuleStatus, ApiCapsuleResponse, CreateCapsuleResponse } from '@/types/capsule';

// API-based capsule operations
export async function getMessageCount(): Promise<number> {
  try {
    const response = await fetch('/api/capsules', { cache: 'no-store' });
    if (!response.ok) return 0;
    const data: ApiCapsuleResponse = await response.json();
    return data.capsules.length;
  } catch {
    return 0;
  }
}

export async function isPaidUser(): Promise<boolean> {
  try {
    const response = await fetch('/api/session', { cache: 'no-store' });
    if (!response.ok) return false;
    const { user } = await response.json();
    return user?.isPremium || false;
  } catch {
    return false;
  }
}

export async function canCreateMessage(): Promise<boolean> {
  const messageCount = await getMessageCount();
  const isPaid = await isPaidUser();
  
  // If user is paid, they can create unlimited messages
  if (isPaid) return true;
  
  // If user is not paid, they can only create up to 10 messages
  return messageCount < 10;
}

export async function createCapsule(message: string, unlockDate: string): Promise<TimeCapsule | null> {
  try {
    const response = await fetch('/api/capsules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, deliveryDate: unlockDate }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('API Error:', error);
      
      // Show more specific error messages from validation
      if (error.details && Array.isArray(error.details)) {
        const validationErrors = error.details.map((detail: any) => detail.message).join(', ');
        throw new Error(`Validation failed: ${validationErrors}`);
      }
      
      throw new Error(error.error || 'Failed to create capsule');
    }
    
    const data: CreateCapsuleResponse = await response.json();
    return data.capsule;
  } catch (error) {
    console.error('Error creating capsule:', error);
    return null;
  }
}

export async function getAllCapsules(): Promise<TimeCapsule[]> {
  try {
    const response = await fetch('/api/capsules', { cache: 'no-store' });
    if (!response.ok) return [];
    
    const data: ApiCapsuleResponse = await response.json();
    return data.capsules.map(capsule => ({
      ...capsule,
      deliveryDate: new Date(capsule.deliveryDate),
      createdAt: new Date(capsule.createdAt),
      updatedAt: new Date(capsule.updatedAt),
      ...(capsule.deliveredAt && { deliveredAt: new Date(capsule.deliveredAt) }),
    }));
  } catch {
    return [];
  }
}

export function getCapsuleStatus(capsule: TimeCapsule): CapsuleStatus {
  const now = new Date();
  const deliveryDate = new Date(capsule.deliveryDate);
  const isUnlocked = now >= deliveryDate || capsule.isDelivered;
  
  if (isUnlocked) {
    return { isUnlocked: true };
  }
  
  const diffMs = deliveryDate.getTime() - now.getTime();
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

export async function deleteCapsule(capsuleId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/capsules?id=${encodeURIComponent(capsuleId)}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete capsule');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting capsule:', error);
    return false;
  }
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