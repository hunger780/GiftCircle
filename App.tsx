
import React, { useState, useMemo } from 'react';
import { Home, Users, PlusCircle, User as UserIcon, Gift, ExternalLink, Calendar, Share2, Search, ArrowLeft, DollarSign, LogOut, Cake, Heart, Baby, PartyPopper, Home as HomeIcon, Settings, Save, Trash2, CheckCircle, Circle, X, ShoppingBag, AlertCircle, Wallet, Landmark, CreditCard, RefreshCcw, Archive, ChevronRight, Lock, Unlock } from 'lucide-react';
import { WishlistItem, User, ContributionType, ViewState, Event, EventType, WishlistStatus } from './types.ts';
import { MOCK_USERS, INITIAL_WISHLIST, MOCK_CURRENT_USER_ID, INITIAL_EVENTS } from './constants.ts';
import { ContributionModal } from './components/ContributionModal.tsx';
import { WishDetailModal } from './components/WishDetailModal.tsx';

// Helper for Event Icons
const getEventIcon = (type: EventType) => {
  switch (type) {
    case EventType.BIRTHDAY: return <Cake size={20} />;
    case EventType.WEDDING: return <Heart size={20} />;
    case EventType.HOUSEWARMING: return <HomeIcon size={20} />;
    case EventType.BABY_SHOWER: return <Baby size={20} />;
    default: return <PartyPopper size={20} />;
  }
};

// --- Onboarding Component ---
interface OnboardingProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Gift size={48} className="text-brand-500" />,
      title: "Welcome to GiftCircle",
      description: "The social gifting platform that makes wishes come true. Add products from any store (Amazon, Flipkart) to your wishlist."
    },
    {
      icon: <div className="flex space-x-4 text-brand-500"><Lock size={32} /><Unlock size={32} /></div>,
      title: "Flexible Contributions",
      description: "Friends can contribute to your gifts. 'Locked' funds are for specific items, while 'Free' funds go to your wallet for you to use anywhere."
    },
    {
      icon: <Calendar size={48} className="text-brand-500" />,
      title: "Event Tagging",
      description: "Hosting a party? Create an event (Birthday, Wedding) and tag specific wishes to it so guests know exactly what to fund."
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center py-8 space-y-6 min-h-[300px]">
          <div className="bg-brand-50 p-6 rounded-full mb-2 animate-in zoom-in duration-500">
            {slides[step].icon}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">{slides[step].title}</h2>
          <p className="text-gray-500 leading-relaxed">{slides[step].description}</p>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            {slides.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-brand-600' : 'w-2 bg-gray-200'}`}
              />
            ))}
          </div>
          <button 
            onClick={handleNext}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-brand-700 transition-colors"
          >
            <span>{step === slides.length - 1 ? "Get Started" : "Next"}</span>
            {step !== slides.length - 1 && <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Separate Component for Create Event View to manage its complex state
interface CreateEventViewProps {
  onBack: () => void;
  onCreate: (eventData: Partial<Event>, selectedIds: string[], newItems: Partial<WishlistItem>[]) => void;
  userItems: WishlistItem[];
  existingEvents: Event[];
}

const CreateEventView: React.FC<CreateEventViewProps> = ({ onBack, onCreate, userItems, existingEvents }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>(EventType.BIRTHDAY);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  
  // State for selecting existing wishlist items
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [itemSearch, setItemSearch] = useState('');
  
  // State for adding NEW items during event creation
  const [newItems, setNewItems] = useState<Partial<WishlistItem>[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemDraft, setNewItemDraft] = useState({ title: '', price: '', url: '', description: '' });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddNewItem = () => {
    if (!newItemDraft.title || !newItemDraft.price) return;
    setNewItems([...newItems, {
      title: newItemDraft.title,
      price: Number(newItemDraft.price),
      productUrl: newItemDraft.url,
      description: newItemDraft.description
    }]);
    setNewItemDraft({ title: '', price: '', url: '', description: '' });
    setIsAddingNew(false);
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      { title, type, date, description },
      Array.from(selectedIds),
      newItems
    );
  };

  const filteredItems = userItems.filter(item => 
    item.title.toLowerCase().includes(itemSearch.toLowerCase())
  );

  return (
    <div className="px-4 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800 ml-2">Create New Event</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Event Details Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Event Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g., My 25th Birthday"
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
             <div className="grid grid-cols-2 gap-3">
                {[EventType.BIRTHDAY, EventType.WEDDING, EventType.HOUSEWARMING, EventType.BABY_SHOWER, EventType.OTHER].map(t => (
                  <div 
                    key={t}
                    onClick={() => setType(t)}
                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-2 transition-all ${type === t ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}
                  >
                    <span className={type === t ? 'text-brand-500' : 'text-gray-400'}>{getEventIcon(t)}</span>
                    <span className={`text-sm font-medium ${type === t ? 'text-gray-800' : 'text-gray-500'}`}>
                      {t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                ))}
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              value={date} onChange={e => setDate(e.target.value)}
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              rows={2}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What's the occasion?"
              className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* 2. Select Existing Wishes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
             <h3 className="font-bold text-gray-800">Link Existing Wishes</h3>
             <span className="text-xs text-gray-500">{selectedIds.size} selected</span>
          </div>
          
          {userItems.length > 0 ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  placeholder="Search your wishlist..."
                  className="w-full pl-10 p-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                {filteredItems.map(item => {
                  const isSelected = selectedIds.has(item.id);
                  const relatedEvent = item.eventId ? existingEvents.find(e => e.id === item.eventId) : null;
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => toggleSelection(item.id)}
                      className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-brand-200'}`}
                    >
                      <div className={`text-brand-500 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`}>
                         {isSelected ? <CheckCircle size={20} fill="currentColor" className="text-white" /> : <Circle size={20} />}
                      </div>
                       {!isSelected && <Circle size={20} className="text-gray-300 absolute" />}
                      
                      <div className="flex-1 ml-8">
                        <p className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{item.title}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">${item.price}</span>
                          {relatedEvent && (
                             <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center ${isSelected ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                               {isSelected ? 'Moving from ' : 'Linked to '} {relatedEvent.title}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredItems.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">No items match your search.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm italic">No items in your wishlist yet.</p>
          )}
        </div>

        {/* 3. Add New Wishes Inline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Add New Wishes</h3>
          
          {newItems.length > 0 && (
             <div className="space-y-2 mb-4">
               {newItems.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">${item.price} • {item.description ? item.description : 'No desc'}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveNewItem(idx)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                 </div>
               ))}
             </div>
          )}

          {isAddingNew ? (
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-brand-200">
               <input 
                 autoFocus
                 placeholder="Item Name"
                 className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-500"
                 value={newItemDraft.title}
                 onChange={e => setNewItemDraft({...newItemDraft, title: e.target.value})}
               />
               <div className="flex space-x-2">
                 <input 
                   type="number"
                   placeholder="Price ($)"
                   className="w-24 p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-500"
                   value={newItemDraft.price}
                   onChange={e => setNewItemDraft({...newItemDraft, price: e.target.value})}
                 />
                 <input 
                   placeholder="URL (Optional)"
                   className="flex-1 p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-500"
                   value={newItemDraft.url}
                   onChange={e => setNewItemDraft({...newItemDraft, url: e.target.value})}
                 />
               </div>
               <textarea 
                  placeholder="Description (Optional)"
                  rows={2}
                  className="w-full p-2 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-500 text-sm"
                  value={newItemDraft.description}
                  onChange={e => setNewItemDraft({...newItemDraft, description: e.target.value})}
               />
               <div className="flex space-x-2 pt-1">
                 <button type="button" onClick={handleAddNewItem} className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-bold">Add</button>
                 <button type="button" onClick={() => setIsAddingNew(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold">Cancel</button>
               </div>
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsAddingNew(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              <PlusCircle size={20} className="mr-2" /> Add Item to this Event
            </button>
          )}
        </div>

        <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200">
          Create Event with {selectedIds.size + newItems.length} Wishes
        </button>
      </form>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<ViewState>('HOME');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [currentUserData, setCurrentUserData] = useState<User>(() => {
     return MOCK_USERS.find(u => u.id === MOCK_CURRENT_USER_ID)!;
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [contributingItem, setContributingItem] = useState<WishlistItem | null>(null);
  
  // New state for viewing details
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  
  // Wishlist Tab State
  const [wishlistTab, setWishlistTab] = useState<WishlistStatus>('ACTIVE');

  // Gift Flow State
  const [giftSearch, setGiftSearch] = useState('');
  const [selectedGiftFriend, setSelectedGiftFriend] = useState<string | null>(null);

  // Wallet State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const getUser = (id: string) => {
    if (id === currentUserData.id) return currentUserData;
    return MOCK_USERS.find(u => u.id === id);
  };
  
  const me = currentUserData;

  // Computed data
  const friends = useMemo(() => 
    MOCK_USERS.filter(u => me.friends.includes(u.id)), 
  [me]);

  const filteredFriends = useMemo(() => {
    if (!giftSearch) return friends;
    return friends.filter(f => f.name.toLowerCase().includes(giftSearch.toLowerCase()));
  }, [friends, giftSearch]);

  const giftFriendItems = useMemo(() => {
    if (!selectedGiftFriend) return [];
    return wishlist.filter(w => w.userId === selectedGiftFriend && w.fundedAmount < w.price && w.status === 'ACTIVE');
  }, [selectedGiftFriend, wishlist]);

  const displayedWishlist = useMemo(() => {
    if (view === 'PROFILE' && selectedFriendId) {
      // When viewing a friend, only show Active items
      return wishlist.filter(w => w.userId === selectedFriendId && w.status === 'ACTIVE');
    }
    if (view === 'HOME') {
      // My wishlist supports tabs
      return wishlist.filter(w => w.userId === me.id && w.status === wishlistTab);
    }
    return [];
  }, [view, selectedFriendId, wishlist, me.id, wishlistTab]);

  const activeEvents = useMemo(() => {
     const targetUser = view === 'PROFILE' && selectedFriendId ? selectedFriendId : me.id;
     return events.filter(e => e.userId === targetUser);
  }, [view, selectedFriendId, me.id, events]);

  const myActiveEvents = useMemo(() => {
    return events.filter(e => e.userId === me.id);
  }, [events, me.id]);

  // Derived Viewing Item
  const activeViewingItem = useMemo(() => {
    return wishlist.find(item => item.id === viewingItemId) || null;
  }, [wishlist, viewingItemId]);

  // Calculate Wallet Balances
  const walletBalance = useMemo(() => {
    let available = 0;
    let locked = 0;

    // Iterate over ALL my items (active or cancelled) to count contributions
    const myItems = wishlist.filter(w => w.userId === me.id);
    
    myItems.forEach(item => {
        item.contributions.forEach(c => {
            if (c.type === ContributionType.FREE) {
                available += c.amount;
            } else {
                locked += c.amount;
            }
        });
    });

    return { available, locked };
  }, [wishlist, me.id]);


  // Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowOnboarding(true); // Show onboarding on login for demo
    setView('HOME');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newUser: User = {
      id: `u${Date.now()}`,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      age: Number(formData.get('age')),
      sex: formData.get('sex') as any,
      avatar: `https://ui-avatars.com/api/?name=${formData.get('firstName')}+${formData.get('lastName')}&background=random`,
      friends: [],
      familyMemberIds: [],
      settings: { defaultGiftAmount: 20, maxGiftAmount: 200 }
    };

    // In a real app, we would make an API call.
    // For this demo, we update local state.
    setCurrentUserData(newUser);
    setIsLoggedIn(true);
    setShowOnboarding(true);
    setView('HOME');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('HOME');
    setShowOnboarding(false);
  };

  const handleContribute = (amount: number, type: ContributionType) => {
    if (!contributingItem) return;

    const newContribution = {
      id: Date.now().toString(),
      contributorId: me.id,
      amount,
      type,
      timestamp: Date.now()
    };

    setWishlist(prev => prev.map(item => {
      if (item.id === contributingItem.id) {
        return {
          ...item,
          fundedAmount: item.fundedAmount + amount,
          contributions: [...item.contributions, newContribution]
        };
      }
      return item;
    }));
    setContributingItem(null);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      userId: me.id,
      title: formData.get('title') as string,
      description: "Manually added item description",
      price: Number(formData.get('price')),
      fundedAmount: 0,
      imageUrl: `https://picsum.photos/seed/${Date.now()}/300/300`,
      productUrl: formData.get('url') as string,
      eventId: (formData.get('eventId') as string) || undefined,
      contributions: [],
      status: 'ACTIVE'
    };
    setWishlist([...wishlist, newItem]);
    setView('HOME');
  };

  const handleCancelItem = (itemId: string) => {
      if (window.confirm('Are you sure you want to cancel this wish? Any "Locked" funds will remain locked to this item, but "Free" funds can be withdrawn.')) {
          setWishlist(prev => prev.map(item => {
              if (item.id === itemId) {
                  return { ...item, status: 'CANCELLED' };
              }
              return item;
          }));
      }
  };

  const handleEventCreation = (eventData: Partial<Event>, selectedIds: string[], newItems: Partial<WishlistItem>[]) => {
      const newEventId = `e${Date.now()}`;
      const newEvent: Event = {
          id: newEventId,
          userId: me.id,
          title: eventData.title!,
          type: eventData.type as EventType,
          date: eventData.date!,
          description: eventData.description || '',
      };

      setEvents([...events, newEvent]);

      // Update existing items with new event ID
      const updatedWishlist = wishlist.map(item => {
          if (selectedIds.includes(item.id)) {
              return { ...item, eventId: newEventId };
          }
          return item;
      });

      // Create new items linked to this event
      const createdItems: WishlistItem[] = newItems.map((item, idx) => ({
          id: `nw${Date.now()}-${idx}`,
          userId: me.id,
          title: item.title!,
          description: item.description || 'Event specific item',
          price: item.price || 0,
          fundedAmount: 0,
          imageUrl: `https://picsum.photos/seed/new${Date.now()}-${idx}/300/300`,
          productUrl: item.productUrl || '',
          eventId: newEventId,
          contributions: [],
          status: 'ACTIVE'
      }));

      setWishlist([...updatedWishlist, ...createdItems]);
      setView('HOME');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setCurrentUserData({
      ...currentUserData,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      age: Number(formData.get('age')),
      sex: formData.get('sex') as 'Male' | 'Female' | 'Other',
    });
    alert('Profile saved!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    setCurrentUserData({
      ...currentUserData,
      settings: {
        defaultGiftAmount: Number(formData.get('defaultGiftAmount')),
        maxGiftAmount: Number(formData.get('maxGiftAmount')),
      }
    });
    setView('MY_PROFILE');
  };

  const addFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const id = formData.get('familyId') as string;
    
    if (id && !currentUserData.familyMemberIds.includes(id)) {
        setCurrentUserData({
            ...currentUserData,
            familyMemberIds: [...currentUserData.familyMemberIds, id]
        });
        form.reset();
    }
  };

  const removeFamilyMember = (id: string) => {
      setCurrentUserData({
          ...currentUserData,
          familyMemberIds: currentUserData.familyMemberIds.filter(fid => fid !== id)
      });
  };

  // Render Components
  const renderLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
            <Gift size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">GiftCircle</h1>
          <p className="text-gray-500">Celebrate moments, together.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              defaultValue="alex@example.com"
              className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brand-500 focus:bg-white transition-all outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              defaultValue="password"
              className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brand-500 focus:bg-white transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            Sign In
          </button>
        </form>
        <p className="text-center mt-6 text-gray-400 text-sm">
          Don't have an account? <button onClick={() => setView('SIGNUP')} className="text-brand-600 font-bold cursor-pointer hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in slide-in-from-right duration-300">
        <button onClick={() => setView('LOGIN')} className="mb-4 text-gray-400 hover:text-brand-600 flex items-center text-sm font-bold">
          <ArrowLeft size={16} className="mr-1" /> Back to Login
        </button>
        
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm">Join the gifting revolution today.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
               <input name="firstName" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
               <input name="lastName" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Age</label>
              <input name="age" type="number" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Sex</label>
              <select name="sex" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input name="email" type="email" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
            <input name="password" type="password" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
          </div>

          <button 
            type="submit" 
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg mt-2"
          >
            Join GiftCircle
          </button>
        </form>
      </div>
    </div>
  );

  const renderHeader = () => (
    <header className="bg-white sticky top-0 z-10 border-b px-4 py-3 flex justify-between items-center shadow-sm">
      <h1 className="text-xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
        GiftCircle
      </h1>
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600 hidden sm:block">Hi, {me.firstName}</span>
          <img onClick={() => setView('MY_PROFILE')} src={me.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer" />
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );

  const renderNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-between items-end px-6 py-3">
        <button onClick={() => setView('HOME')} className={`flex flex-col items-center space-y-1 ${view === 'HOME' ? 'text-brand-600' : 'text-gray-400'}`}>
          <Home size={24} />
          <span className="text-xs">Home</span>
        </button>
        <button onClick={() => setView('FRIENDS')} className={`flex flex-col items-center space-y-1 ${view === 'FRIENDS' || (view === 'PROFILE' && selectedFriendId) ? 'text-brand-600' : 'text-gray-400'}`}>
          <Users size={24} />
          <span className="text-xs">Friends</span>
        </button>
        <button onClick={() => setView('ADD_ITEM')} className="flex flex-col items-center space-y-1 -mt-6">
          <div className="bg-brand-600 text-white p-3 rounded-full shadow-lg shadow-brand-300 transform transition-transform hover:scale-105 active:scale-95">
            <PlusCircle size={28} />
          </div>
          <span className="text-xs font-medium text-gray-600">Add Wish</span>
        </button>
        <button onClick={() => setView('GIFT_FLOW')} className={`flex flex-col items-center space-y-1 ${view === 'GIFT_FLOW' ? 'text-brand-600' : 'text-gray-400'}`}>
          <Gift size={24} />
          <span className="text-xs">Contribute</span>
        </button>
        <button onClick={() => setView('MY_PROFILE')} className={`flex flex-col items-center space-y-1 ${view === 'MY_PROFILE' || view === 'SETTINGS' || view === 'WALLET' ? 'text-brand-600' : 'text-gray-400'}`}>
          <UserIcon size={24} />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );

  const renderWishlistItem = (item: WishlistItem, isOwn: boolean) => {
    const progress = Math.min((item.fundedAmount / item.price) * 100, 100);
    const relatedEvent = item.eventId ? events.find(e => e.id === item.eventId) : null;
    const isCancelled = item.status === 'CANCELLED';

    return (
      <div 
        key={item.id} 
        onClick={() => setViewingItemId(item.id)}
        className={`bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col cursor-pointer transition-transform hover:scale-[1.01] ${isCancelled ? 'opacity-75 border-gray-200' : 'border-gray-100'}`}
      >
        <div className="relative h-48">
          <img src={item.imageUrl} alt={item.title} className={`w-full h-full object-cover ${isCancelled ? 'grayscale' : ''}`} />
          {relatedEvent && !isCancelled && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-brand-700 text-xs px-2 py-1 rounded-full flex items-center shadow-md font-bold">
              <span className="mr-1">{getEventIcon(relatedEvent.type)}</span>
              {relatedEvent.title}
            </div>
          )}
          {isCancelled && (
             <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <span className="bg-gray-800 text-white px-4 py-2 rounded-lg font-bold transform -rotate-12 text-lg shadow-lg border-2 border-white">CANCELLED</span>
             </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2">{item.title}</h3>
            <a 
                onClick={(e) => e.stopPropagation()} 
                href={item.productUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-400 hover:text-brand-600"
            >
              <ExternalLink size={18} />
            </a>
          </div>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
          
          <div className="mt-auto">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className={isCancelled ? 'text-gray-500' : 'text-brand-600'}>${item.fundedAmount} raised</span>
              <span className="text-gray-500">Goal: ${item.price}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div className={`h-2.5 rounded-full transition-all duration-500 ${isCancelled ? 'bg-gray-400' : 'bg-brand-500'}`} style={{ width: `${progress}%` }}></div>
            </div>

            {!isOwn && item.fundedAmount < item.price && !isCancelled && (
              <button 
                onClick={(e) => { e.stopPropagation(); setContributingItem(item); }}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex justify-center items-center space-x-2"
              >
                <Gift size={18} />
                <span>Contribute</span>
              </button>
            )}
            {isOwn && !isCancelled && (
               <div className="flex space-x-2">
                  <button onClick={(e) => e.stopPropagation()} className="flex-1 bg-gray-50 text-gray-600 border border-gray-200 py-3 rounded-xl font-semibold flex justify-center items-center space-x-2 hover:bg-gray-100">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCancelItem(item.id); }}
                    className="w-12 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                    title="Cancel Wish"
                  >
                     <X size={20} />
                  </button>
               </div>
            )}
            {isOwn && isCancelled && (
               <div className="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-500">
                  Product cancelled. Active funds moved to wallet.
               </div>
            )}
            {!isOwn && item.fundedAmount >= item.price && (
               <button disabled className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-semibold">
                 Fully Funded!
               </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEvents = (events: Event[]) => {
    return (
        <div className="mb-8">
            <div className="flex justify-between items-center px-4 mb-4">
               <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
               {view === 'HOME' && (
                 <button 
                   onClick={() => setView('CREATE_EVENT')}
                   className="text-brand-600 text-sm font-bold flex items-center hover:underline"
                 >
                   <PlusCircle size={16} className="mr-1" /> Create Event
                 </button>
               )}
            </div>
            
            {events.length > 0 ? (
              <div className="flex overflow-x-auto px-4 space-x-4 pb-4 scrollbar-hide">
                  {events.map(e => (
                      <div key={e.id} className="flex-shrink-0 w-64 bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            {getEventIcon(e.type)}
                          </div>
                          <div className="flex items-center space-x-2 text-purple-200 text-sm font-medium mb-2">
                             {getEventIcon(e.type)}
                             <span>{new Date(e.date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-xl mb-2 leading-tight">{e.title}</h3>
                          <p className="text-white/80 text-sm line-clamp-2">{e.description}</p>
                      </div>
                  ))}
              </div>
            ) : (
              <div className="px-4">
                 <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No upcoming events found.</p>
                 </div>
              </div>
            )}
        </div>
    )
  }

  const renderGiftFlow = () => {
    if (selectedGiftFriend) {
        const friend = getUser(selectedGiftFriend);
        return (
            <div className="px-4 animate-in fade-in slide-in-from-right duration-300">
                <button 
                    onClick={() => setSelectedGiftFriend(null)} 
                    className="flex items-center text-gray-600 mb-6 hover:text-brand-600"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Search
                </button>

                <div className="flex items-center space-x-4 mb-8">
                    <img src={friend?.avatar} alt={friend?.name} className="w-16 h-16 rounded-full border-2 border-brand-100" />
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Contribute to {friend?.firstName}</h2>
                        <p className="text-gray-500 text-sm">Select an item to contribute to</p>
                    </div>
                </div>

                {giftFriendItems.length > 0 ? (
                    <div className="space-y-4">
                        {giftFriendItems.map(item => {
                            const progress = Math.min((item.fundedAmount / item.price) * 100, 100);
                            const remaining = item.price - item.fundedAmount;
                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setViewingItemId(item.id)}
                                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <img src={item.imageUrl} alt={item.title} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                                        <div className="flex items-center text-xs text-gray-500 my-1">
                                            <span className="font-medium text-brand-600 mr-2">${remaining} needed</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[100px]">
                                                <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setContributingItem(item); }}
                                            className="mt-2 text-sm bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors w-full sm:w-auto flex justify-center items-center"
                                        >
                                            <DollarSign size={14} className="mr-1" /> Contribute
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Gift size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No active wishes</h3>
                        <p className="text-gray-500 mt-1">{friend?.firstName} hasn't added any wishes yet or all are funded.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="px-4">
            <div className="bg-gradient-to-r from-brand-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-2">Contribute to a Gift</h2>
                <p className="opacity-90">Surprise a friend by funding their wishes.</p>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text"
                    placeholder="Search friends..." 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-sm"
                    value={giftSearch}
                    onChange={(e) => setGiftSearch(e.target.value)}
                />
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide opacity-70 mb-2">Friends</h3>
                {filteredFriends.length > 0 ? filteredFriends.map(friend => (
                    <button 
                        key={friend.id}
                        onClick={() => setSelectedGiftFriend(friend.id)}
                        className="w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                    >
                        <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{friend.name}</h4>
                            <p className="text-xs text-gray-500">Tap to view wishes</p>
                        </div>
                        <div className="bg-brand-50 p-2 rounded-full text-brand-600">
                            <Gift size={20} />
                        </div>
                    </button>
                )) : (
                    <div className="text-center py-8 text-gray-400">
                        No friends found matching "{giftSearch}"
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderWallet = () => (
    <div className="px-4 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={() => setView('MY_PROFILE')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800 ml-2">My Wallet</h2>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl mb-6">
        <p className="text-gray-400 text-sm font-medium mb-1">Total Withdrawable Balance</p>
        <h1 className="text-4xl font-extrabold mb-6">${walletBalance.available.toFixed(2)}</h1>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowWithdrawModal(true)}
            disabled={walletBalance.available <= 0}
            className="flex-1 bg-white text-gray-900 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Landmark size={18} />
            <span>Withdraw</span>
          </button>
          <button className="flex-1 bg-white/10 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-white/20 backdrop-blur-sm">
             <RefreshCcw size={18} />
             <span>History</span>
          </button>
        </div>
      </div>

      {/* Locked Funds Info */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between mb-6">
         <div className="flex items-center space-x-3">
            <div className="bg-brand-50 p-3 rounded-full text-brand-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Locked Funds</p>
              <p className="text-lg font-bold text-gray-900">${walletBalance.locked.toFixed(2)}</p>
            </div>
         </div>
         <p className="text-xs text-gray-400 max-w-[120px] text-right">Restricted to specific product purchases.</p>
      </div>

      <h3 className="font-bold text-gray-800 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
         <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
            <div className="flex items-center space-x-3">
               <div className="bg-green-100 p-2 rounded-full text-green-600">
                 <DollarSign size={18} />
               </div>
               <div>
                 <p className="font-bold text-gray-900">Contribution Received</p>
                 <p className="text-xs text-gray-500">From Sarah Miller</p>
               </div>
            </div>
            <span className="font-bold text-green-600">+$50.00</span>
         </div>
         <div className="text-center text-gray-400 text-sm py-4">
            No more transactions.
         </div>
      </div>

      {/* Withdraw Modal Overlay */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900">Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Amount to withdraw</p>
              <div className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <span className="text-gray-400 mr-1">$</span>
                {walletBalance.available.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">Funds will be transferred to your linked bank account ending in ****4242.</p>
            </div>

            <button 
              onClick={() => { alert(`Processing withdrawal of $${walletBalance.available}`); setShowWithdrawModal(false); }}
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg mb-3"
            >
              Confirm Withdrawal
            </button>
            <button 
               onClick={() => setShowWithdrawModal(false)}
               className="w-full bg-gray-50 text-gray-700 py-4 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyProfile = () => {
    const familyMembers = me.familyMemberIds.map(id => getUser(id)).filter(Boolean);

    return (
        <div className="px-4 pb-24">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button onClick={() => setView('HOME')} className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-800">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                </div>
                
                <button 
                  onClick={() => setView('SETTINGS')}
                  className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
                  <Settings size={20} />
                </button>
            </div>

            {/* Wallet Entry Card */}
            <div 
              onClick={() => setView('WALLET')}
              className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg mb-6 cursor-pointer relative overflow-hidden group"
            >
                <div className="relative z-10 flex justify-between items-center">
                   <div>
                      <p className="text-gray-300 text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p>
                      <h3 className="text-2xl font-bold">${walletBalance.available.toFixed(2)}</h3>
                   </div>
                   <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                      <Wallet size={24} />
                   </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-400">
                   <span className="bg-white/10 px-2 py-1 rounded mr-2">Locked: ${walletBalance.locked}</span>
                   <span>Tap to withdraw</span>
                </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Header Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <img src={me.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-brand-100 mb-4" />
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
                            <input name="firstName" defaultValue={me.firstName} className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
                            <input name="lastName" defaultValue={me.lastName} className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" required />
                        </div>
                    </div>
                </div>

                {/* Details Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <UserIcon size={18} className="mr-2 text-brand-500" /> Personal Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Age</label>
                            <input name="age" type="number" defaultValue={me.age} className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Sex</label>
                            <select name="sex" defaultValue={me.sex} className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Family Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Users size={18} className="mr-2 text-brand-500" /> Family Members
                    </h3>
                    
                    <div className="space-y-3 mb-4">
                        {familyMembers.length > 0 ? familyMembers.map(member => (
                            <div key={member?.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <img src={member?.avatar} alt={member?.name} className="w-8 h-8 rounded-full" />
                                    <span className="font-medium text-sm text-gray-900">{member?.name}</span>
                                </div>
                                <button type="button" onClick={() => removeFamilyMember(member!.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-400 italic">No family members added.</p>
                        )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <input name="familyId" placeholder="Enter GiftCircle ID (e.g. u2)" className="flex-1 p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500 text-sm" />
                        <button type="button" onClick={addFamilyMember} className="bg-brand-100 text-brand-600 p-2 rounded-lg hover:bg-brand-200">
                            <PlusCircle size={20} />
                        </button>
                    </div>
                </div>

                <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 flex justify-center items-center">
                    <Save size={18} className="mr-2" /> Save Changes
                </button>
            </form>
        </div>
    );
  };

  const renderSettings = () => (
    <div className="px-4 pb-24">
        <div className="flex items-center mb-6">
            <button onClick={() => setView('MY_PROFILE')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 ml-2">Contribution Settings</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Contribution Amount ($)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        name="defaultGiftAmount" 
                        type="number" 
                        defaultValue={me.settings.defaultGiftAmount}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">This amount will be pre-filled when you contribute.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Contribution Limit ($)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        name="maxGiftAmount" 
                        type="number" 
                        defaultValue={me.settings.maxGiftAmount}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">We'll warn you if you try to exceed this amount.</p>
            </div>

            <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 mt-4">
                Update Settings
            </button>
        </form>
    </div>
  );

  if (!isLoggedIn) {
     if (view === 'SIGNUP') return renderSignup();
     return renderLogin();
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-screen-md mx-auto shadow-2xl">
      {renderHeader()}

      <main className="pb-24 pt-4">
        {view === 'HOME' && (
          <>
            {renderEvents(activeEvents)}
            <div className="px-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">My Wishlist</h2>
                <div className="bg-white border border-gray-200 rounded-lg p-1 flex space-x-1">
                  <button 
                    onClick={() => setWishlistTab('ACTIVE')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${wishlistTab === 'ACTIVE' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Active
                  </button>
                  <button 
                    onClick={() => setWishlistTab('CANCELLED')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${wishlistTab === 'CANCELLED' ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {displayedWishlist.map(item => renderWishlistItem(item, true))}
              </div>
              {displayedWishlist.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                      <p>No {wishlistTab.toLowerCase()} wishes found.</p>
                  </div>
              )}
            </div>
          </>
        )}

        {view === 'FRIENDS' && (
          <div className="px-4 space-y-4">
             <h2 className="text-lg font-bold text-gray-800 mb-4">My Circle</h2>
             {friends.map(friend => (
               <div 
                key={friend.id} 
                onClick={() => { setSelectedFriendId(friend.id); setView('PROFILE'); }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
               >
                 <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover" />
                 <div className="flex-1">
                   <h3 className="font-bold text-gray-900">{friend.name}</h3>
                   <p className="text-sm text-gray-500">3 upcoming events</p>
                 </div>
                 <div className="bg-gray-100 p-2 rounded-full text-gray-400">
                    <ExternalLink size={20} />
                 </div>
               </div>
             ))}
          </div>
        )}

        {view === 'PROFILE' && selectedFriendId && (
          <>
             <div className="px-4 mb-6">
                 <button onClick={() => setView('FRIENDS')} className="text-sm text-gray-500 mb-4 flex items-center hover:text-brand-600">
                     ← Back to friends
                 </button>
                 <div className="flex items-center space-x-4 mb-6">
                     <img src={getUser(selectedFriendId)?.avatar} className="w-20 h-20 rounded-full border-4 border-white shadow-md" alt="profile" />
                     <div>
                         <h2 className="text-2xl font-bold text-gray-900">{getUser(selectedFriendId)?.name}</h2>
                         <p className="text-gray-500">San Francisco, CA</p>
                     </div>
                 </div>
             </div>
             {renderEvents(activeEvents)}
             <div className="px-4">
                <h3 className="font-bold text-gray-800 mb-4">Their Wishlist</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {displayedWishlist.map(item => renderWishlistItem(item, false))}
                </div>
             </div>
          </>
        )}

        {view === 'ADD_ITEM' && (
          <div className="px-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => setView('HOME')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 ml-2">Add to Wishlist</h2>
            </div>
            
            <form onSubmit={handleAddItem} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Link</label>
                    <input name="url" type="url" placeholder="https://amazon.com/..." className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
                    <p className="text-xs text-gray-400 mt-1">Paste a link from Amazon or Flipkart</p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm mb-4">
                    Tip: In the live version, we'll auto-fill details from the link!
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input name="title" type="text" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input name="price" type="number" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag with Event (Optional)</label>
                    <select name="eventId" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500 text-gray-700">
                        <option value="">-- No Event --</option>
                        {myActiveEvents.map(event => (
                            <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                    </select>
                </div>

                 <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 mt-4">
                    Add Wish
                </button>
            </form>
          </div>
        )}

        {view === 'CREATE_EVENT' && (
          <CreateEventView 
            onBack={() => setView('HOME')}
            onCreate={handleEventCreation}
            userItems={wishlist.filter(w => w.userId === me.id && w.status === 'ACTIVE')}
            existingEvents={events}
          />
        )}

        {view === 'GIFT_FLOW' && renderGiftFlow()}
        
        {view === 'MY_PROFILE' && renderMyProfile()}
        
        {view === 'SETTINGS' && renderSettings()}

        {view === 'WALLET' && renderWallet()}

      </main>

      {renderNav()}

      {showOnboarding && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      {contributingItem && (
        <ContributionModal 
          item={contributingItem}
          defaultAmount={me.settings.defaultGiftAmount}
          maxAmount={me.settings.maxGiftAmount}
          onClose={() => setContributingItem(null)} 
          onContribute={handleContribute} 
        />
      )}

      {activeViewingItem && (
        <WishDetailModal 
            item={activeViewingItem} 
            onClose={() => setViewingItemId(null)} 
        />
      )}
    </div>
  );
};

export default App;
