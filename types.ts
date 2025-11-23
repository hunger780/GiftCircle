
export enum ContributionType {
  LOCKED = 'LOCKED', // Only for the specific product
  FREE = 'FREE'     // User can use cash for anything
}

export enum EventType {
  BIRTHDAY = 'BIRTHDAY',
  WEDDING = 'WEDDING',
  HOUSEWARMING = 'HOUSEWARMING',
  BABY_SHOWER = 'BABY_SHOWER',
  OTHER = 'OTHER'
}

export type WishlistStatus = 'ACTIVE' | 'CANCELLED';

export interface Contribution {
  id: string;
  contributorId: string;
  amount: number;
  type: ContributionType;
  timestamp: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  fundedAmount: number;
  imageUrl: string;
  productUrl: string;
  eventId?: string; // Optional link to specific event
  contributions: Contribution[];
  status: WishlistStatus;
}

export interface Event {
  id: string;
  userId: string;
  title: string;
  date: string;
  description: string;
  type: EventType;
}

export interface UserSettings {
  defaultGiftAmount: number;
  maxGiftAmount: number;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed or display name
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  avatar: string;
  friends: string[]; // array of user IDs
  familyMemberIds: string[]; // array of GiftCircle IDs
  settings: UserSettings;
}

export type ViewState = 'LOGIN' | 'SIGNUP' | 'HOME' | 'FRIENDS' | 'ADD_ITEM' | 'PROFILE' | 'GIFT_FLOW' | 'CREATE_EVENT' | 'MY_PROFILE' | 'SETTINGS' | 'WALLET';
