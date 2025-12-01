

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
  isAnonymous?: boolean;
  isAmountHidden?: boolean;
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
  circleId?: string; // Optional link to a gift circle
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
  inviteeIds: string[];
}

export interface GiftCircle {
  id: string;
  name: string;
  description: string;
  adminId: string;
  memberIds: string[];
  createdTimestamp: number;
}

export interface UserSettings {
  defaultGiftAmount: number;
  maxGiftAmount: number;
  currency: string;
  autoAcceptContacts: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed or display name
  age?: number;
  sex?: 'Male' | 'Female' | 'Other';
  phoneNumber?: string;
  avatar: string;
  friends: string[]; // array of user IDs
  blockedUserIds: string[]; // array of blocked user IDs
  familyMemberIds: string[]; // array of GiftCircle IDs
  settings: UserSettings;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: number;
}

export interface Vendor {
  id: string;
  name: string;
  type: string; // 'Organizer', 'Supplier', 'Venue'
  rating: number;
  reviews: number;
  address: string;
  pincode: string;
  imageUrl: string;
  distance: string;
}

export type ViewState = 'LOGIN' | 'SIGNUP' | 'HOME' | 'FRIENDS' | 'ADD_ITEM' | 'PROFILE' | 'GIFT_FLOW' | 'CREATE_EVENT' | 'MY_PROFILE' | 'SETTINGS' | 'WALLET' | 'CIRCLE_DETAIL' | 'EVENT_DETAIL' | 'EVENT_PLANNING' | 'FRIEND_REQUESTS';
