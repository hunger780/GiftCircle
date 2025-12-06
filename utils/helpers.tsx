
import React from 'react';
import { EventType, User } from '../types.ts';
import { MOCK_USERS } from '../mockData.ts';
import { Cake, Heart, Home as HomeIcon, Baby, PartyPopper } from 'lucide-react';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

export const getCurrencySymbol = (code: string) => CURRENCY_SYMBOLS[code] || code;

export const getEventIcon = (type: EventType) => {
  switch (type) {
    case EventType.BIRTHDAY: return <Cake size={20} />;
    case EventType.WEDDING: return <Heart size={20} />;
    case EventType.HOUSEWARMING: return <HomeIcon size={20} />;
    case EventType.BABY_SHOWER: return <Baby size={20} />;
    default: return <PartyPopper size={20} />;
  }
};

export const getUser = (id: string, currentUser?: User): User | undefined => {
  if (currentUser && id === currentUser.id) return currentUser;
  return MOCK_USERS.find(u => u.id === id);
};
