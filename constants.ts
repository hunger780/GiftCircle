




import { User, WishlistItem, Event, EventType, FriendRequest, GiftCircle, Vendor, Notification, NotificationType } from './types.ts';

export const MOCK_CURRENT_USER_ID = 'u1';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    firstName: 'Alex',
    lastName: 'Johnson',
    name: 'Alex Johnson',
    age: 29,
    sex: 'Male',
    phoneNumber: '555-0101',
    avatar: 'https://picsum.photos/seed/u1/100/100',
    friends: ['u2', 'u3', 'u4'],
    blockedUserIds: [],
    familyMemberIds: ['u2'],
    acceptedEventIds: [],
    hiddenEventIds: [],
    settings: {
      defaultGiftAmount: 25,
      maxGiftAmount: 500,
      currency: 'INR',
      autoAcceptContacts: false
    }
  },
  {
    id: 'u2',
    firstName: 'Sarah',
    lastName: 'Miller',
    name: 'Sarah Miller',
    age: 28,
    sex: 'Female',
    phoneNumber: '555-0202',
    avatar: 'https://picsum.photos/seed/u2/100/100',
    friends: ['u1'],
    blockedUserIds: [],
    familyMemberIds: ['u1'],
    acceptedEventIds: [],
    hiddenEventIds: [],
    settings: {
      defaultGiftAmount: 20,
      maxGiftAmount: 200,
      currency: 'INR',
      autoAcceptContacts: true // Enabled for testing
    }
  },
  {
    id: 'u3',
    firstName: 'David',
    lastName: 'Chen',
    name: 'David Chen',
    age: 30,
    sex: 'Male',
    phoneNumber: '555-0303',
    avatar: 'https://picsum.photos/seed/u3/100/100',
    friends: ['u1'],
    blockedUserIds: [],
    familyMemberIds: [],
    acceptedEventIds: [],
    hiddenEventIds: [],
    settings: {
      defaultGiftAmount: 15,
      maxGiftAmount: 100,
      currency: 'INR',
      autoAcceptContacts: false
    }
  },
  {
    id: 'u4',
    firstName: 'Emily',
    lastName: 'Davis',
    name: 'Emily Davis',
    age: 27,
    sex: 'Female',
    phoneNumber: '555-0404',
    avatar: 'https://picsum.photos/seed/u4/100/100',
    friends: ['u1'],
    blockedUserIds: [],
    familyMemberIds: [],
    acceptedEventIds: [],
    hiddenEventIds: [],
    settings: {
      defaultGiftAmount: 30,
      maxGiftAmount: 1000,
      currency: 'INR',
      autoAcceptContacts: false
    }
  },
  {
    id: 'u5',
    firstName: 'Alice',
    lastName: 'Wonder',
    name: 'Alice Wonder',
    age: 26,
    sex: 'Female',
    phoneNumber: '555-0505',
    avatar: 'https://picsum.photos/seed/u5/100/100',
    friends: [],
    blockedUserIds: [],
    familyMemberIds: [],
    acceptedEventIds: [],
    hiddenEventIds: [],
    settings: {
      defaultGiftAmount: 20,
      maxGiftAmount: 100,
      currency: 'INR',
      autoAcceptContacts: false
    }
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    userId: 'u1',
    title: "Alex's 30th Birthday",
    date: '2024-11-15',
    description: "Turning the big 3-0! Join me for drinks.",
    type: EventType.BIRTHDAY,
    inviteeIds: ['u2', 'u3']
  },
  {
    id: 'e2',
    userId: 'u2',
    title: "Sarah's Housewarming",
    date: '2024-10-20',
    description: "Finally got my own place.",
    type: EventType.HOUSEWARMING,
    inviteeIds: ['u1']
  }
];

export const INITIAL_WISHLIST: WishlistItem[] = [
  {
    id: 'w1',
    userId: 'u1',
    title: 'Sony WH-1000XM5 Headphones',
    description: 'Noise cancelling headphones for work.',
    price: 350,
    fundedAmount: 120,
    imageUrl: 'https://picsum.photos/seed/tech1/300/300',
    productUrl: 'https://amazon.com',
    contributions: [
        { id: 'c1', contributorId: 'u2', amount: 100, type: 'LOCKED' as any, timestamp: Date.now(), isAnonymous: false, isAmountHidden: false },
        { id: 'c2', contributorId: 'u3', amount: 20, type: 'FREE' as any, timestamp: Date.now(), isAnonymous: false, isAmountHidden: false }
    ],
    eventId: 'e1',
    status: 'ACTIVE'
  },
  {
    id: 'w2',
    userId: 'u1',
    title: 'Espresso Machine',
    description: 'For that morning brew.',
    price: 600,
    fundedAmount: 0,
    imageUrl: 'https://picsum.photos/seed/coffee/300/300',
    productUrl: 'https://amazon.com',
    contributions: [],
    status: 'ACTIVE'
  },
  {
    id: 'w3',
    userId: 'u2',
    title: 'Le Creuset Dutch Oven',
    description: 'Red, 5.5 qt.',
    price: 420,
    fundedAmount: 350,
    imageUrl: 'https://picsum.photos/seed/pot/300/300',
    productUrl: 'https://amazon.com',
    contributions: [],
    eventId: 'e2',
    status: 'ACTIVE'
  },
  {
    id: 'w4',
    userId: 'u2',
    title: 'Plant Stand',
    description: 'Mid-century modern style.',
    price: 50,
    fundedAmount: 0,
    imageUrl: 'https://picsum.photos/seed/plant/300/300',
    productUrl: 'https://amazon.com',
    contributions: [],
    eventId: 'e2',
    status: 'ACTIVE'
  }
];

export const INITIAL_CIRCLES: GiftCircle[] = [
    {
        id: 'gc1',
        name: 'Dad\'s Retirement Gift',
        description: 'Collecting for a nice watch for Dad.',
        adminId: 'u1',
        memberIds: ['u1', 'u2', 'u3', 'u4'],
        createdTimestamp: Date.now() - 10000000
    }
];

export const INITIAL_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'fr1',
    fromUserId: 'u5',
    toUserId: 'u1',
    status: 'PENDING',
    timestamp: Date.now() - 86400000 // Yesterday
  }
];

export const MOCK_VENDORS: Vendor[] = [
    {
        id: 'v1',
        name: 'Royal Party Supplies',
        type: 'Supplier',
        rating: 4.8,
        reviews: 124,
        address: '123 Event Street, Downtown',
        pincode: '110001',
        imageUrl: 'https://picsum.photos/seed/party1/200/200',
        distance: '0.5 km'
    },
    {
        id: 'v2',
        name: 'Elegant Events Planning',
        type: 'Organizer',
        rating: 4.9,
        reviews: 89,
        address: '456 Celebration Ave',
        pincode: '110002',
        imageUrl: 'https://picsum.photos/seed/planner/200/200',
        distance: '1.2 km'
    },
    {
        id: 'v3',
        name: 'Tasty Bites Catering',
        type: 'Catering',
        rating: 4.6,
        reviews: 210,
        address: '78 Foodie Lane',
        pincode: '110001',
        imageUrl: 'https://picsum.photos/seed/food/200/200',
        distance: '2.5 km'
    },
    {
        id: 'v4',
        name: 'Balloon Magic',
        type: 'Decor',
        rating: 3.5,
        reviews: 56,
        address: '90 Pop Road',
        pincode: '110003',
        imageUrl: 'https://picsum.photos/seed/balloon/200/200',
        distance: '3.0 km'
    },
    {
        id: 'v5',
        name: 'Grand Banquet Hall',
        type: 'Venue',
        rating: 4.2,
        reviews: 340,
        address: '100 Main St',
        pincode: '110005',
        imageUrl: 'https://picsum.photos/seed/hall/200/200',
        distance: '0.8 km'
    }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: NotificationType.MESSAGE,
    title: 'Welcome to GiftCircle!',
    message: 'Thanks for joining. Start by creating your first wishlist.',
    timestamp: Date.now() - 172800000,
    isRead: true,
    actionStatus: 'VIEWED'
  },
  {
    id: 'n2',
    userId: 'u1',
    type: NotificationType.FRIEND_REQUEST,
    title: 'New Friend Request',
    message: 'Alice Wonder wants to connect with you.',
    relatedId: 'fr1', // Links to the friend request ID
    timestamp: Date.now() - 86400000,
    isRead: false,
    actionStatus: 'PENDING'
  },
  {
    id: 'n3',
    userId: 'u1',
    type: NotificationType.EVENT_INVITE,
    title: 'Event Invitation',
    message: 'Sarah invited you to "Sarah\'s Housewarming".',
    relatedId: 'e2', // Links to the event ID
    timestamp: Date.now() - 43200000,
    isRead: false,
    actionStatus: 'PENDING'
  }
];