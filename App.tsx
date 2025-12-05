

import React, { useState, useMemo } from 'react';
import { Home, Users, PlusCircle, User as UserIcon, Gift, ExternalLink, Calendar, Share2, Search, ArrowLeft, DollarSign, LogOut, Cake, Heart, Baby, PartyPopper, Home as HomeIcon, Settings, Save, Trash2, CheckCircle, Circle, X, ShoppingBag, AlertCircle, Wallet, Landmark, CreditCard, RefreshCcw, Archive, ChevronRight, Lock, Unlock, Phone, UserPlus, Clock, Check, XCircle, Copy, Contact, Ban, MessageCircle, Target, Link as LinkIcon, PenTool, Loader2, MapPin, Star, PhoneCall, Mail, Filter, CalendarRange, Bell, Globe, UserX, ShoppingCart } from 'lucide-react';
import { WishlistItem, User, ContributionType, ViewState, Event, EventType, WishlistStatus, FriendRequest, GiftCircle, Vendor, Notification, NotificationType } from './types.ts';
import { MOCK_USERS, INITIAL_WISHLIST, MOCK_CURRENT_USER_ID, INITIAL_EVENTS, INITIAL_FRIEND_REQUESTS, INITIAL_CIRCLES, MOCK_VENDORS, INITIAL_NOTIFICATIONS, MOCK_SHOPPING_ITEMS } from './mockData.ts';
import { ContributionModal } from './components/ContributionModal.tsx';
import { WishDetailModal } from './components/WishDetailModal.tsx';
import { GiftAssistant } from './components/GiftAssistant.tsx';

// Helper for Currency
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};
const getCurrencySymbol = (code: string) => CURRENCY_SYMBOLS[code] || code;

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
      icon: <Users size={48} className="text-brand-500" />,
      title: "Gift Circles",
      description: "Create a Gift Circle with friends or family to pool money for big gifts like weddings or retirements."
    },
    {
      icon: <Search size={48} className="text-brand-500" />,
      title: "Event Planning",
      description: "Find local suppliers, venues, and organizers for your events directly in the app. Filter by rating and location."
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
  currencySymbol: string;
}

const CreateEventView: React.FC<CreateEventViewProps> = ({ onBack, onCreate, userItems, existingEvents, currencySymbol }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>(EventType.BIRTHDAY);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  
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
      { title, type, date, description, visibility },
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

          {/* Visibility Toggle */}
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Event Visibility</label>
             <div className="flex items-center space-x-6 p-1">
               <label className="flex items-center cursor-pointer">
                  <input type="radio" name="visibility" className="w-4 h-4 accent-brand-600" checked={visibility === 'PRIVATE'} onChange={() => setVisibility('PRIVATE')} />
                  <span className="ml-2 text-sm text-gray-700 flex items-center"><Lock size={14} className="mr-1"/> Private</span>
               </label>
               
               <label className="flex items-center cursor-pointer">
                  <input type="radio" name="visibility" className="w-4 h-4 accent-brand-600" checked={visibility === 'PUBLIC'} onChange={() => setVisibility('PUBLIC')} />
                  <span className="ml-2 text-sm text-gray-700 flex items-center"><Globe size={14} className="mr-1"/> Public</span>
               </label>
             </div>
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
                          <span className="text-xs text-gray-500">{currencySymbol}{item.price}</span>
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
                      <p className="text-xs text-gray-500">{currencySymbol}{item.price} • {item.description ? item.description : 'No desc'}</p>
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
                   placeholder={`Price (${currencySymbol})`}
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

// Add Friend Modal Component
interface AddFriendModalProps {
    onClose: () => void;
    onSend: (id: string) => void;
    myId: string;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ onClose, onSend, myId }) => {
    const [id, setId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!id.trim()) return;
        
        // Basic validation before passing up
        if (id === myId) {
            setError("You cannot add yourself.");
            return;
        }

        onSend(id.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">Add to Circle</h3>
                <p className="text-gray-500 text-sm mb-6">Enter your friend's GiftCircle ID to send them a request.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">GiftCircle ID</label>
                        <input 
                            value={id}
                            onChange={(e) => { setId(e.target.value); setError(''); }}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder="e.g. u2"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1"/> {error}</p>}
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
                    >
                        Send Request
                    </button>
                </form>
            </div>
        </div>
    );
};

// Create Gift Circle Modal
interface CreateCircleModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string, memberIds: string[]) => void;
  friends: User[];
}

const CreateCircleModal: React.FC<CreateCircleModalProps> = ({ onClose, onCreate, friends }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

    const toggleFriend = (id: string) => {
        const next = new Set(selectedFriends);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedFriends(next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onCreate(name, description, Array.from(selectedFriends));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                    <X size={24} />
                </button>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">Create Gift Circle</h3>
                <p className="text-gray-500 text-sm mb-4">Pool funds with friends for a special gift.</p>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                   <div className="space-y-4 overflow-y-auto pr-1 pb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Circle Name</label>
                            <input 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                placeholder="e.g. Dad's Birthday, Office Party"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                placeholder="What is this circle for?"
                                rows={2}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Add Members ({selectedFriends.size})</label>
                            <div className="space-y-2">
                                {friends.length > 0 ? friends.map(friend => {
                                    const isSelected = selectedFriends.has(friend.id);
                                    return (
                                        <div 
                                            key={friend.id}
                                            onClick={() => toggleFriend(friend.id)}
                                            className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                                                {isSelected && <Check size={12} className="text-white" />}
                                            </div>
                                            <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full mr-3" />
                                            <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{friend.name}</span>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-gray-400 text-sm italic">Add friends to your friend list first.</p>
                                )}
                            </div>
                        </div>
                   </div>

                   <button 
                        type="submit"
                        disabled={!name}
                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 mt-4 disabled:opacity-50"
                    >
                        Create Circle
                    </button>
                </form>
            </div>
        </div>
    );
};

// Event Invite Modal
interface EventInviteModalProps {
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  friends: User[];
  existingInviteeIds: string[];
}

const EventInviteModal: React.FC<EventInviteModalProps> = ({ onClose, onSave, friends, existingInviteeIds }) => {
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set(existingInviteeIds));

  const toggleFriend = (id: string) => {
    const next = new Set(selectedFriends);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedFriends(next);
  };

  const handleSave = () => {
    onSave(Array.from(selectedFriends));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
          <X size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Guests</h3>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">
          {friends.length > 0 ? friends.map(friend => {
            const isSelected = selectedFriends.has(friend.id);
            return (
              <div 
                key={friend.id}
                onClick={() => toggleFriend(friend.id)}
                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}
              >
                <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
                <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full mr-3" />
                <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{friend.name}</span>
              </div>
            );
          }) : (
            <div className="text-center py-8 text-gray-400">
              <p>You have no friends to invite.</p>
              <p className="text-xs mt-1">Add friends from the "Friends" tab.</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 mt-4"
        >
          Save Guest List ({selectedFriends.size})
        </button>
      </div>
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
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(INITIAL_FRIEND_REQUESTS);
  const [circles, setCircles] = useState<GiftCircle[]>(INITIAL_CIRCLES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [contributingItem, setContributingItem] = useState<WishlistItem | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  
  // New state for viewing details
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);
  const [showEventInviteModal, setShowEventInviteModal] = useState(false);
  
  // Wishlist Tab State
  const [wishlistTab, setWishlistTab] = useState<WishlistStatus>('ACTIVE');
  
  // Friend View Tab State
  const [friendsViewTab, setFriendsViewTab] = useState<'FRIENDS' | 'CIRCLES'>('FRIENDS');

  // Gift Flow State
  const [giftSearch, setGiftSearch] = useState('');
  const [selectedGiftFriend, setSelectedGiftFriend] = useState<string | null>(null);

  // Wallet State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Adding Item State
  const [addingItemToCircleId, setAddingItemToCircleId] = useState<string | null>(null);
  const [addItemMethod, setAddItemMethod] = useState<'LINK' | 'MANUAL'>('LINK');
  const [itemDraft, setItemDraft] = useState({ title: '', price: '', url: '', description: '', eventId: '' });
  const [isSimulatingFetch, setIsSimulatingFetch] = useState(false);

  // Vendor Search State
  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorPincode, setVendorPincode] = useState('');
  const [vendorMinRating, setVendorMinRating] = useState<number>(0);

  // Planning Tab State
  const [planningTab, setPlanningTab] = useState<'SUPPLIERS' | 'SHOPPING'>('SUPPLIERS');
  const [shoppingSearch, setShoppingSearch] = useState('');

  // New state for friend search
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  // Profile Tab State
  const [profileTab, setProfileTab] = useState<'PERSONAL' | 'BANK'>('PERSONAL');

  const getUser = (id: string) => {
    if (id === currentUserData.id) return currentUserData;
    return MOCK_USERS.find(u => u.id === id);
  };
  
  const me = currentUserData;
  const currencySymbol = getCurrencySymbol(me.settings.currency);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Computed data
  const friends = useMemo(() => 
    MOCK_USERS.filter(u => me.friends.includes(u.id)), 
  [me]);

  const filteredMyCircle = useMemo(() => {
    if (!friendSearchQuery) return friends;
    return friends.filter(f => f.name.toLowerCase().includes(friendSearchQuery.toLowerCase()));
  }, [friends, friendSearchQuery]);

  const filteredFriends = useMemo(() => {
    if (!giftSearch) return friends;
    return friends.filter(f => f.name.toLowerCase().includes(giftSearch.toLowerCase()));
  }, [friends, giftSearch]);

  const giftFriendItems = useMemo(() => {
    if (!selectedGiftFriend) return [];
    return wishlist.filter(w => w.userId === selectedGiftFriend && w.fundedAmount < w.price && w.status === 'ACTIVE' && !w.circleId);
  }, [selectedGiftFriend, wishlist]);

  const displayedWishlist = useMemo(() => {
    if (view === 'PROFILE' && selectedFriendId) {
      // When viewing a friend, only show Active items
      return wishlist.filter(w => w.userId === selectedFriendId && w.status === 'ACTIVE' && !w.circleId);
    }
    if (view === 'HOME') {
      // My wishlist supports tabs, exclude circle items from main list to avoid clutter
      return wishlist.filter(w => w.userId === me.id && w.status === wishlistTab && !w.circleId);
    }
    return [];
  }, [view, selectedFriendId, wishlist, me.id, wishlistTab]);

  const myActiveEvents = useMemo(() => {
    // 1. My own events
    const myEvents = events.filter(e => e.userId === me.id);
    
    // 2. Events I accepted invitations to
    const acceptedEvents = events.filter(e => me.acceptedEventIds && me.acceptedEventIds.includes(e.id));

    // 3. Events from Mutual Family members
    const familyEvents = events.filter(e => {
        const owner = getUser(e.userId);
        if (!owner) return false;
        
        // Logic: I marked them as family AND they marked me as family
        const iMarkedThem = me.familyMemberIds.includes(owner.id);
        const theyMarkedMe = owner.familyMemberIds.includes(me.id);
        
        return iMarkedThem && theyMarkedMe;
    });

    // Merge and deduplicate
    const combined = [...myEvents, ...acceptedEvents, ...familyEvents];
    const uniqueMap = new Map();
    combined.forEach(item => uniqueMap.set(item.id, item));
    const uniqueEvents = Array.from(uniqueMap.values());
    
    // Filter out hidden events
    const visibleEvents = uniqueEvents.filter(e => !me.hiddenEventIds?.includes(e.id));

    return visibleEvents;
  }, [events, me.id, me.acceptedEventIds, me.familyMemberIds, me.hiddenEventIds]);

  // NEW: Events for the friend profile view
  const friendActiveEvents = useMemo(() => {
    if (view === 'PROFILE' && selectedFriendId) {
        return events.filter(e => e.userId === selectedFriendId);
    }
    return [];
  }, [view, selectedFriendId, events]);

  // Derived Viewing Item
  const activeViewingItem = useMemo(() => {
    return wishlist.find(item => item.id === viewingItemId) || null;
  }, [wishlist, viewingItemId]);

  // Friend Request Lists
  const incomingRequests = useMemo(() => {
      return friendRequests.filter(req => req.toUserId === me.id && req.status === 'PENDING');
  }, [friendRequests, me.id]);

  const sentRequests = useMemo(() => {
      return friendRequests.filter(req => req.fromUserId === me.id && req.status === 'PENDING');
  }, [friendRequests, me.id]);

  // Filter Vendors
  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS.filter(v => {
      // Name/Type search
      const matchesSearch = !vendorSearchQuery || 
        v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) || 
        v.type.toLowerCase().includes(vendorSearchQuery.toLowerCase());
      
      // Pincode Search (startswith)
      const matchesPincode = !vendorPincode || v.pincode.startsWith(vendorPincode);
      
      // Rating Filter
      const matchesRating = v.rating >= vendorMinRating;

      return matchesSearch && matchesPincode && matchesRating;
    });
  }, [vendorSearchQuery, vendorPincode, vendorMinRating]);

  // Filter Shopping Items
  const filteredShoppingItems = useMemo(() => {
      if (!shoppingSearch) return MOCK_SHOPPING_ITEMS;
      const lowerQuery = shoppingSearch.toLowerCase();
      return MOCK_SHOPPING_ITEMS.filter(item => 
          item.title.toLowerCase().includes(lowerQuery) ||
          item.category.toLowerCase().includes(lowerQuery)
      );
  }, [shoppingSearch]);

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

  // NEW: Calculate Recent Transactions
  const recentTransactions = useMemo(() => {
    const myItems = wishlist.filter(w => w.userId === me.id);
    const txs: {
        id: string;
        amount: number;
        contributorId: string;
        timestamp: number;
        isAnonymous?: boolean;
        itemTitle: string;
    }[] = [];

    myItems.forEach(item => {
        item.contributions.forEach(c => {
            txs.push({
                id: c.id,
                amount: c.amount,
                contributorId: c.contributorId,
                timestamp: c.timestamp,
                isAnonymous: c.isAnonymous,
                itemTitle: item.title
            });
        });
    });
    
    return txs.sort((a, b) => b.timestamp - a.timestamp);
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
      dob: formData.get('dob') as string,
      email: formData.get('email') as string,
      sex: formData.get('sex') as any,
      phoneNumber: formData.get('phoneNumber') as string,
      avatar: `https://ui-avatars.com/api/?name=${formData.get('firstName')}+${formData.get('lastName')}&background=random`,
      friends: [],
      blockedUserIds: [],
      familyMemberIds: [],
      acceptedEventIds: [],
      hiddenEventIds: [],
      settings: { defaultGiftAmount: 20, maxGiftAmount: 200, currency: 'INR', autoAcceptContacts: false }
    };

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

  const handleContribute = (amount: number, type: ContributionType, isAnonymous: boolean, isAmountHidden: boolean) => {
    if (!contributingItem) return;

    const newContribution = {
      id: Date.now().toString(),
      contributorId: me.id,
      amount,
      type,
      timestamp: Date.now(),
      isAnonymous,
      isAmountHidden
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

  const handleFetchItemDetails = () => {
    if (!itemDraft.url) return;
    setIsSimulatingFetch(true);
    // Simulate API delay
    setTimeout(() => {
        setItemDraft(prev => ({
            ...prev,
            title: "Simulated Product Title",
            price: '249',
            description: "Automatically fetched description for the product link."
        }));
        setAddItemMethod('MANUAL'); // Switch to manual view to show filled details
        setIsSimulatingFetch(false);
    }, 1500);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: WishlistItem = {
      id: Date.now().toString(),
      userId: me.id,
      title: itemDraft.title,
      description: itemDraft.description || "No description provided",
      price: Number(itemDraft.price),
      fundedAmount: 0,
      imageUrl: `https://picsum.photos/seed/${Date.now()}/300/300`,
      productUrl: itemDraft.url,
      eventId: itemDraft.eventId || undefined,
      circleId: addingItemToCircleId || undefined, // Link to circle if adding from circle
      contributions: [],
      status: 'ACTIVE'
    };
    setWishlist([...wishlist, newItem]);
    
    // Reset Draft
    setItemDraft({ title: '', price: '', url: '', description: '', eventId: '' });
    setAddItemMethod('LINK');

    if (addingItemToCircleId) {
        setView('CIRCLE_DETAIL');
        setAddingItemToCircleId(null);
    } else {
        setView('HOME');
    }
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
          inviteeIds: [],
          status: 'ACTIVE',
          visibility: eventData.visibility || 'PRIVATE'
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

  const handleUpdateEventInvites = (selectedIds: string[]) => {
    if (!viewingEventId) return;
    setEvents(events.map(e => {
      if (e.id === viewingEventId) {
        return { ...e, inviteeIds: selectedIds };
      }
      return e;
    }));
  };

  const handleUpdateEventVisibility = (eventId: string, newVisibility: 'PUBLIC' | 'PRIVATE') => {
      setEvents(events.map(e => e.id === eventId ? { ...e, visibility: newVisibility } : e));
  };

  const handleCancelEvent = (eventId: string) => {
    if (window.confirm("Are you sure you want to cancel this event? This action cannot be undone and guests will be notified.")) {
       setEvents(events.map(e => e.id === eventId ? { ...e, status: 'CANCELLED' } : e));
    }
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
      dob: formData.get('dob') as string,
      email: formData.get('email') as string,
      sex: formData.get('sex') as 'Male' | 'Female' | 'Other',
      phoneNumber: formData.get('phoneNumber') as string,
    });
    alert('Profile saved!');
  };

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    setCurrentUserData({
      ...currentUserData,
      bankDetails: {
        accountName: formData.get('accountName') as string,
        accountNumber: formData.get('accountNumber') as string,
        bankName: formData.get('bankName') as string,
        ifscCode: formData.get('ifscCode') as string,
        panNumber: formData.get('panNumber') as string
      }
    });
    alert('Bank details saved!');
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
        currency: formData.get('currency') as string,
        autoAcceptContacts: formData.get('autoAcceptContacts') === 'on'
      }
    });
    setView('MY_PROFILE');
  };

  const handleSendFriendRequest = (id: string) => {
      const targetUser = MOCK_USERS.find(u => u.id === id);
      if (!targetUser) {
          alert("User not found!");
          return;
      }
      if (me.friends.includes(id)) {
          alert("Already friends!");
          return;
      }
      if (me.blockedUserIds.includes(id)) {
         alert("You have blocked this user. Unblock them to add.");
         return;
      }

      const existingRequest = friendRequests.find(
          req => (req.fromUserId === me.id && req.toUserId === id) || 
                 (req.fromUserId === id && req.toUserId === me.id)
      );

      if (existingRequest) {
          if (existingRequest.status === 'PENDING') {
              alert("A friend request is already pending.");
          } else {
             alert("Already connected or request processed.");
          }
          return;
      }

      const isAutoAccepted = targetUser.settings.autoAcceptContacts;

      const newRequest: FriendRequest = {
          id: `fr${Date.now()}`,
          fromUserId: me.id,
          toUserId: id,
          status: isAutoAccepted ? 'ACCEPTED' : 'PENDING',
          timestamp: Date.now()
      };

      setFriendRequests([...friendRequests, newRequest]);
      
      if (isAutoAccepted) {
          setCurrentUserData({
              ...me,
              friends: [...me.friends, id]
          });
          alert(`You are now friends with ${targetUser.name}! (Auto-accepted via contacts)`);
      } else {
          alert(`Request sent to ${targetUser.name}!`);
      }
      
      setShowAddFriendModal(false);
  };

  const handleAcceptFriendRequest = (requestId: string) => {
      const req = friendRequests.find(r => r.id === requestId);
      if (!req) return;

      setFriendRequests(friendRequests.map(r => r.id === requestId ? { ...r, status: 'ACCEPTED' } : r));

      setCurrentUserData({
          ...me,
          friends: [...me.friends, req.fromUserId]
      });
  };

  const handleRejectFriendRequest = (requestId: string) => {
      setFriendRequests(friendRequests.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));
  };

  const handleBlockUser = (id: string) => {
    if (window.confirm("Are you sure you want to block this user? They will be removed from your friends list and requests.")) {
       setCurrentUserData(prev => ({
           ...prev,
           friends: prev.friends.filter(fid => fid !== id),
           blockedUserIds: [...prev.blockedUserIds, id]
       }));
       setFriendRequests(prev => prev.filter(req => 
          !((req.fromUserId === me.id && req.toUserId === id) || (req.fromUserId === id && req.toUserId === me.id))
       ));
    }
  };

  const handleToggleFamily = (e: React.MouseEvent, friendId: string) => {
    e.stopPropagation();
    const isFamily = me.familyMemberIds.includes(friendId);
    let newFamilyIds;
    if (isFamily) {
        newFamilyIds = me.familyMemberIds.filter(id => id !== friendId);
    } else {
        newFamilyIds = [...me.familyMemberIds, friendId];
    }
    setCurrentUserData({ ...me, familyMemberIds: newFamilyIds });
  };

  const handleCreateCircle = (name: string, description: string, memberIds: string[]) => {
      const newCircle: GiftCircle = {
          id: `gc${Date.now()}`,
          name,
          description,
          adminId: me.id,
          memberIds: [...memberIds, me.id], // Include creator
          createdTimestamp: Date.now()
      };
      setCircles([...circles, newCircle]);
      setShowCreateCircleModal(false);
      setActiveCircleId(newCircle.id);
      setView('CIRCLE_DETAIL');
      setFriendsViewTab('CIRCLES'); // Switch tab so when they go back they see it
  };

  const handleAddCircleGoal = (circleId: string) => {
      setAddingItemToCircleId(circleId);
      setAddItemMethod('LINK'); // Default to link
      setView('ADD_ITEM');
  };

  const handleEventClick = (eventId: string) => {
      setViewingEventId(eventId);
      setView('EVENT_DETAIL');
  };

  const handleHideEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    if (window.confirm("Remove this event from your view?")) {
        setCurrentUserData({
            ...me,
            hiddenEventIds: [...(me.hiddenEventIds || []), eventId]
        });
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleNotificationAction = (notification: Notification, action: 'ACCEPT' | 'REJECT') => {
      if (notification.type === NotificationType.FRIEND_REQUEST && notification.relatedId) {
          if (action === 'ACCEPT') {
              handleAcceptFriendRequest(notification.relatedId);
          } else {
              handleRejectFriendRequest(notification.relatedId);
          }
      } else if (notification.type === NotificationType.EVENT_INVITE && notification.relatedId) {
          if (action === 'ACCEPT') {
             // Add to user's event board
             if (!me.acceptedEventIds.includes(notification.relatedId)) {
                setCurrentUserData({
                    ...me,
                    acceptedEventIds: [...(me.acceptedEventIds || []), notification.relatedId]
                });
             }
          }
      }

      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, actionStatus: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED', isRead: true } : n));
  };

  const renderNotifications = () => (
      <div className="px-4 pb-24">
         <div className="flex items-center mb-6">
            <button onClick={() => setView('HOME')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 ml-2">Notifications</h2>
         </div>

         {notifications.length > 0 ? (
             <div className="space-y-4">
                 {notifications.sort((a,b) => b.timestamp - a.timestamp).map(notification => {
                     let icon;
                     switch(notification.type) {
                         case NotificationType.MESSAGE: icon = <MessageCircle size={20} className="text-blue-500" />; break;
                         case NotificationType.FRIEND_REQUEST: icon = <UserPlus size={20} className="text-purple-500" />; break;
                         case NotificationType.EVENT_INVITE: icon = <Calendar size={20} className="text-orange-500" />; break;
                         default: icon = <Bell size={20} className="text-gray-500" />;
                     }
                     
                     return (
                         <div key={notification.id} className={`bg-white p-4 rounded-xl shadow-sm border ${notification.isRead ? 'border-gray-100' : 'border-brand-200 bg-brand-50/20'}`}>
                             <div className="flex items-start space-x-3">
                                 <div className={`p-2 rounded-full flex-shrink-0 ${notification.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                     {icon}
                                 </div>
                                 <div className="flex-1">
                                     <div className="flex justify-between items-start">
                                         <h4 className={`font-bold text-sm ${notification.isRead ? 'text-gray-900' : 'text-brand-900'}`}>{notification.title}</h4>
                                         <span className="text-[10px] text-gray-400">{new Date(notification.timestamp).toLocaleDateString()}</span>
                                     </div>
                                     <p className="text-sm text-gray-600 mt-1 mb-2">{notification.message}</p>
                                     
                                     {/* Action Buttons */}
                                     {notification.type === NotificationType.FRIEND_REQUEST && notification.actionStatus === 'PENDING' && (
                                         <div className="flex space-x-2 mt-2">
                                             <button 
                                                onClick={() => handleNotificationAction(notification, 'ACCEPT')}
                                                className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-700"
                                             >
                                                Accept Request
                                             </button>
                                             <button 
                                                onClick={() => handleNotificationAction(notification, 'REJECT')}
                                                className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200"
                                             >
                                                Decline
                                             </button>
                                         </div>
                                     )}

                                     {notification.type === NotificationType.EVENT_INVITE && notification.actionStatus === 'PENDING' && (
                                         <div className="flex space-x-2 mt-2">
                                             <button 
                                                onClick={() => handleNotificationAction(notification, 'ACCEPT')}
                                                className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600 flex items-center"
                                             >
                                                <Calendar size={12} className="mr-1" /> Add to Board
                                             </button>
                                             <button 
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200"
                                             >
                                                Dismiss
                                             </button>
                                         </div>
                                     )}

                                     {notification.actionStatus === 'ACCEPTED' && (
                                         <p className="text-xs text-green-600 font-bold mt-2 flex items-center"><Check size={12} className="mr-1" /> Accepted</p>
                                     )}
                                     
                                     {notification.actionStatus === 'REJECTED' && (
                                         <p className="text-xs text-red-500 font-medium mt-2">Declined</p>
                                     )}

                                     {notification.type === NotificationType.MESSAGE && !notification.isRead && (
                                         <button onClick={() => handleMarkAsRead(notification.id)} className="text-xs text-brand-600 font-bold mt-2">Mark as Read</button>
                                     )}
                                 </div>
                             </div>
                         </div>
                     );
                 })}
             </div>
         ) : (
             <div className="text-center py-12 text-gray-400">
                 <Bell size={48} className="mx-auto mb-4 opacity-20" />
                 <p>No notifications yet.</p>
             </div>
         )}
      </div>
  );

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
              <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
              <input name="dob" type="date" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
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
            <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
            <input name="phoneNumber" type="tel" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required placeholder="+1 555-000-0000" />
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
        <button 
           onClick={() => setView('NOTIFICATIONS')}
           className="relative p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            )}
        </button>
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
        <div className="w-full max-w-md flex justify-between">
            <button onClick={() => setView('HOME')} className={`flex flex-col items-center space-y-1 ${view === 'HOME' ? 'text-brand-600' : 'text-gray-400'}`}>
            <Home size={24} />
            <span className="text-xs">Home</span>
            </button>
            <button onClick={() => setView('FRIENDS')} className={`flex flex-col items-center space-y-1 ${view === 'FRIENDS' || view === 'CIRCLE_DETAIL' || (view === 'PROFILE' && selectedFriendId) || view === 'GIFT_FLOW' || view === 'FRIEND_REQUESTS' ? 'text-brand-600' : 'text-gray-400'}`}>
            <Users size={24} />
            <span className="text-xs">Friends</span>
            </button>
            <button onClick={() => setView('ADD_ITEM')} className="flex flex-col items-center space-y-1 -mt-6">
            <div className="bg-brand-600 text-white p-3 rounded-full shadow-lg shadow-brand-300 transform transition-transform hover:scale-105 active:scale-95">
                <PlusCircle size={28} />
            </div>
            <span className="text-xs font-medium text-gray-600">Add Wish</span>
            </button>
            <button onClick={() => setView('EVENT_PLANNING')} className={`flex flex-col items-center space-y-1 ${view === 'EVENT_PLANNING' ? 'text-brand-600' : 'text-gray-400'}`}>
            <CalendarRange size={24} />
            <span className="text-xs">Planning</span>
            </button>
            <button onClick={() => setView('MY_PROFILE')} className={`flex flex-col items-center space-y-1 ${view === 'MY_PROFILE' || view === 'SETTINGS' || view === 'WALLET' ? 'text-brand-600' : 'text-gray-400'}`}>
            <UserIcon size={24} />
            <span className="text-xs">Profile</span>
            </button>
        </div>
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
              <span className={isCancelled ? 'text-gray-500' : 'text-brand-600'}>{currencySymbol}{item.fundedAmount} raised</span>
              <span className="text-gray-500">Goal: {currencySymbol}{item.price}</span>
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

  const renderFriendRequestsView = () => (
      <div className="px-4 pb-24">
         <div className="flex items-center mb-6">
            <button onClick={() => setView('FRIENDS')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 ml-2">Friend Requests</h2>
         </div>
         
         {/* Incoming Requests */}
         <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                Incoming <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{incomingRequests.length}</span>
            </h3>
            {incomingRequests.length > 0 ? (
                <div className="space-y-3">
                    {incomingRequests.map(req => {
                        const user = MOCK_USERS.find(u => u.id === req.fromUserId);
                        if (!user) return null;
                        return (
                            <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">Wants to join your circle</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => handleAcceptFriendRequest(req.id)}
                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                        title="Accept"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button 
                                        onClick={() => handleRejectFriendRequest(req.id)}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                        title="Decline"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                    No incoming requests.
                </div>
            )}
         </div>

         {/* Sent Pending Requests */}
         <div className="mb-8">
             <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase opacity-70 tracking-wide">Pending Sent</h3>
             {sentRequests.length > 0 ? (
                 <div className="space-y-3">
                    {sentRequests.map(req => {
                        const user = MOCK_USERS.find(u => u.id === req.toUserId);
                        if (!user) return null;
                        return (
                            <div key={req.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between opacity-80">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">{user.name || `User ${user.id}`}</p>
                                        <p className="text-xs text-gray-400">Request Sent</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-orange-400 text-xs font-bold px-2 py-1 bg-orange-50 rounded-md">
                                    <Clock size={12} className="mr-1" /> Pending
                                </div>
                            </div>
                        );
                    })}
                 </div>
             ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                    No pending sent requests.
                </div>
             )}
         </div>
      </div>
  );

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
                      <div 
                        key={e.id} 
                        onClick={() => handleEventClick(e.id)}
                        className={`flex-shrink-0 w-64 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] ${e.status === 'CANCELLED' ? 'bg-gray-500' : 'bg-gradient-to-br from-brand-600 to-purple-600'}`}
                      >
                          {e.status === 'CANCELLED' && (
                              <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
                                  <span className="border-2 border-white px-3 py-1 text-xl font-bold transform -rotate-12 opacity-80">CANCELLED</span>
                              </div>
                          )}

                          {/* Hide/Remove Button - Only show for events not created by me */}
                          {e.userId !== me.id && (
                              <button 
                                onClick={(ev) => handleHideEvent(ev, e.id)}
                                className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition-colors z-20"
                              >
                                  <X size={14} />
                              </button>
                          )}
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            {getEventIcon(e.type)}
                          </div>
                          <div className="flex items-center space-x-2 text-purple-200 text-sm font-medium mb-2">
                             {getEventIcon(e.type)}
                             <span>{new Date(e.date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-xl mb-2 leading-tight">{e.title}</h3>
                          <p className="text-white/80 text-sm line-clamp-2">{e.description}</p>
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs font-medium text-white/90">
                              <span>Tap for details</span>
                              <ChevronRight size={14} className="ml-1" />
                          </div>
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

  const renderEventPlanning = () => {
    return (
        <div className="px-4 pb-24">
             <div className="flex items-center mb-6">
                 <button onClick={() => setView('HOME')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                 </button>
                 <h2 className="text-2xl font-bold text-gray-800 ml-2">Event Planning</h2>
             </div>

             {/* Tabs */}
             <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex mb-4">
                 <button 
                    onClick={() => setPlanningTab('SUPPLIERS')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${planningTab === 'SUPPLIERS' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Suppliers
                 </button>
                 <button 
                    onClick={() => setPlanningTab('SHOPPING')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${planningTab === 'SHOPPING' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Shopping
                 </button>
             </div>

             {planningTab === 'SUPPLIERS' ? (
                <div>
                     <div className="flex items-center space-x-2 mb-4">
                         <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                             <Search size={20} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-800 text-lg">Find Local Suppliers</h3>
                             <p className="text-xs text-gray-500">Search for organizers, venues & more</p>
                         </div>
                     </div>

                     {/* Filters Row */}
                     <div className="flex space-x-2 mb-3">
                        <div className="relative flex-1">
                            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input 
                                className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Pincode"
                                value={vendorPincode}
                                onChange={(e) => setVendorPincode(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Star className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select 
                                className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                value={vendorMinRating}
                                onChange={(e) => setVendorMinRating(Number(e.target.value))}
                            >
                                <option value={0}>Any Rating</option>
                                <option value={3}>3+ Stars</option>
                                <option value={4}>4+ Stars</option>
                                <option value={5}>5 Stars</option>
                            </select>
                            <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={12} />
                        </div>
                     </div>

                     {/* Search Input */}
                     <div className="relative mb-4">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                             className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm transition-all"
                             placeholder="Try 'Catering', 'Decor', 'Music'..."
                             value={vendorSearchQuery}
                             onChange={(e) => setVendorSearchQuery(e.target.value)}
                         />
                     </div>

                     {/* Category Filters/Chips */}
                     <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
                         {['All', 'Venue', 'Catering', 'Decor', 'Organizer'].map(cat => (
                             <button 
                                key={cat}
                                onClick={() => setVendorSearchQuery(cat === 'All' ? '' : cat)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                                    (cat === 'All' && !vendorSearchQuery) || vendorSearchQuery.includes(cat) 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                             >
                                 {cat}
                             </button>
                         ))}
                     </div>

                     {/* Results List */}
                     <div className="space-y-4">
                         {filteredVendors.length > 0 ? filteredVendors.map(vendor => (
                             <div key={vendor.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex space-x-4">
                                 <img src={vendor.imageUrl} alt={vendor.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-start">
                                         <h4 className="font-bold text-gray-900 truncate">{vendor.name}</h4>
                                         <div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700">
                                             <Star size={10} fill="currentColor" className="mr-1" />
                                             {vendor.rating}
                                         </div>
                                     </div>
                                     <p className="text-xs text-blue-600 font-medium mb-1">{vendor.type}</p>
                                     <div className="flex flex-col text-xs text-gray-500 mb-2">
                                         <div className="flex items-center mb-0.5">
                                             <MapPin size={12} className="mr-1" />
                                             <span className="truncate">{vendor.address}</span>
                                         </div>
                                         <span className="ml-4 text-gray-400">Pincode: {vendor.pincode} • {vendor.distance}</span>
                                     </div>
                                     <button className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 hover:bg-gray-800 transition-colors">
                                         <PhoneCall size={12} />
                                         <span>Contact</span>
                                     </button>
                                 </div>
                             </div>
                         )) : (
                             <div className="text-center py-8 text-gray-400">
                                 <p>No suppliers found matching your criteria.</p>
                                 {(vendorPincode || vendorMinRating > 0) && <p className="text-xs mt-1">Try clearing filters.</p>}
                             </div>
                         )}
                     </div>
                </div>
             ) : (
                <div className="animate-in fade-in slide-in-from-right duration-200">
                     <div className="flex items-center space-x-2 mb-4">
                         <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                             <ShoppingCart size={20} />
                         </div>
                         <div>
                             <h3 className="font-bold text-gray-800 text-lg">Shop Supplies</h3>
                             <p className="text-xs text-gray-500">Decor, gifts & party essentials</p>
                         </div>
                     </div>

                    <div className="relative mb-6">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                         <input 
                             className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none shadow-sm transition-all"
                             placeholder="Search products..."
                             value={shoppingSearch}
                             onChange={(e) => setShoppingSearch(e.target.value)}
                         />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {filteredShoppingItems.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="h-32 bg-gray-100 relative">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">
                                        ⭐ {item.rating}
                                    </div>
                                </div>
                                <div className="p-3 flex-1 flex flex-col">
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{item.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                                    <p className="text-[10px] text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                                    
                                    <div className="mt-auto flex justify-between items-center">
                                        <span className="font-bold text-purple-600">{currencySymbol}{item.price}</span>
                                        <button 
                                            onClick={() => alert(`Added ${item.title} to wishlist!`)}
                                            className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
                                            title="Add to Wishlist"
                                        >
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {filteredShoppingItems.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                             <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
                             <p>No products found.</p>
                        </div>
                    )}
                </div>
             )}
        </div>
    );
  };

  const renderEventDetail = () => {
     const event = events.find(e => e.id === viewingEventId);
     if (!event) return null;
     const linkedWishes = wishlist.filter(w => w.eventId === event.id && w.status === 'ACTIVE');
     const invitees = event.inviteeIds?.map(id => getUser(id)).filter(Boolean) || [];
     const isOwner = event.userId === me.id;
     const isCancelled = event.status === 'CANCELLED';

     return (
        <div className="px-4 pb-24">
             <div className="flex items-center mb-6">
                <button onClick={() => setView('HOME')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 ml-2">Event Details</h2>
             </div>

             {/* Event Header */}
             <div className={`bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden ${isCancelled ? 'grayscale opacity-90' : ''}`}>
                  {isCancelled && (
                    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none">
                        <span className="border-4 border-white px-6 py-2 text-3xl font-extrabold transform -rotate-12 tracking-widest opacity-80">CANCELLED</span>
                    </div>
                  )}
                  <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex items-center space-x-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                      {getEventIcon(event.type)}
                      <span>{event.type}</span>
                      <span className="mx-1 opacity-50">|</span>
                      {event.visibility === 'PUBLIC' ? <Globe size={12} className="mr-1"/> : <Lock size={12} className="mr-1"/>}
                      <span>{event.visibility === 'PUBLIC' ? 'Public' : 'Private'}</span>
                  </div>
                  <h1 className="text-3xl font-extrabold mb-2">{event.title}</h1>
                  <p className="text-purple-100 text-lg mb-4 flex items-center">
                      <Calendar size={18} className="mr-2" />
                      {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="opacity-90 leading-relaxed">{event.description}</p>
             </div>

             {/* Linked Wishes */}
             <div className="mb-8">
                 <h3 className="font-bold text-gray-800 mb-3 flex justify-between items-center">
                     <span>Linked Wishes</span>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{linkedWishes.length}</span>
                 </h3>
                 {linkedWishes.length > 0 ? (
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {linkedWishes.map(w => {
                            const isItemOwner = w.userId === me.id;
                            const remaining = w.price - w.fundedAmount;
                            return (
                                <div 
                                    key={w.id} 
                                    onClick={() => setViewingItemId(w.id)}
                                    className="flex-shrink-0 w-48 bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col cursor-pointer hover:border-brand-300 transition-all group"
                                >
                                    <div className="relative h-28 mb-2 overflow-hidden rounded-lg">
                                        <img src={w.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={w.title} />
                                    </div>
                                    <p className="font-bold text-sm text-gray-900 truncate mb-1">{w.title}</p>
                                    
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                                        <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((w.fundedAmount / w.price) * 100, 100)}%` }}></div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center text-xs mb-2">
                                        <span className="text-gray-500">{Math.round((w.fundedAmount / w.price) * 100)}%</span>
                                        <span className="font-bold text-brand-600">{currencySymbol}{remaining} left</span>
                                    </div>

                                    {!isItemOwner && w.fundedAmount < w.price ? (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setContributingItem(w); }}
                                            className="mt-auto w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
                                        >
                                            <DollarSign size={14} className="mr-1" /> Contribute
                                        </button>
                                    ) : (
                                        <div className="mt-auto w-full py-2 bg-gray-50 text-gray-400 rounded-lg text-xs font-bold text-center border border-gray-100">
                                            {isItemOwner ? 'Manage' : 'Fully Funded'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                 ) : (
                    <p className="text-sm text-gray-500 italic">No wishes linked to this event yet.</p>
                 )}
             </div>

             {/* Visibility Toggle for Owner */}
             {isOwner && !isCancelled && (
                 <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
                     <div className="flex flex-col">
                        <h3 className="font-bold text-gray-800 text-sm">Visibility</h3>
                        <p className="text-[10px] text-gray-400">{event.visibility === 'PUBLIC' ? 'Visible to everyone' : 'Only guests can see'}</p>
                     </div>
                     <div className="flex items-center space-x-4">
                       <label className="flex items-center cursor-pointer">
                          <input type="radio" name="eventVisibility" className="w-4 h-4 accent-brand-600" checked={event.visibility === 'PRIVATE'} onChange={() => handleUpdateEventVisibility(event.id, 'PRIVATE')} />
                          <span className="ml-1.5 text-xs font-medium text-gray-700">Private</span>
                       </label>
                       
                       <label className="flex items-center cursor-pointer">
                          <input type="radio" name="eventVisibility" className="w-4 h-4 accent-brand-600" checked={event.visibility === 'PUBLIC'} onChange={() => handleUpdateEventVisibility(event.id, 'PUBLIC')} />
                          <span className="ml-1.5 text-xs font-medium text-gray-700">Public</span>
                       </label>
                     </div>
                 </div>
             )}

            {/* Guest List Section */}
             <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Users size={18} className="mr-2 text-brand-500" /> Guest List
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{invitees.length}</span>
                  </h3>
                  {isOwner && !isCancelled && (
                    <button 
                      onClick={() => setShowEventInviteModal(true)}
                      className="text-brand-600 text-xs font-bold flex items-center bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100"
                    >
                      <UserPlus size={14} className="mr-1" /> Invite
                    </button>
                  )}
                </div>
                
                {invitees.length > 0 ? (
                  <div className="flex -space-x-3 overflow-x-auto pb-2 scrollbar-hide px-2">
                     {invitees.map(user => (
                       <img 
                          key={user!.id} 
                          src={user!.avatar} 
                          alt={user!.name} 
                          title={user!.name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
                       />
                     ))}
                     <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500 font-medium">
                       ...
                     </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No guests invited yet.</p>
                )}
             </div>

             {/* Cancel Event Button */}
             {isOwner && !isCancelled && (
               <div className="mt-8 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => handleCancelEvent(event.id)}
                    className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Cancel Event
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-2">Guests will be notified if you cancel.</p>
               </div>
             )}
        </div>
     );
  };

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
                                            <span className="font-medium text-brand-600 mr-2">{currencySymbol}{remaining} needed</span>
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

  const renderCircleDetail = () => {
    const circle = circles.find(c => c.id === activeCircleId);
    if (!circle) return null;

    const members = circle.memberIds.map(id => getUser(id)).filter(Boolean);
    const circleItems = wishlist.filter(w => w.circleId === circle.id && w.status === 'ACTIVE');
    const totalGoal = circleItems.reduce((acc, item) => acc + item.price, 0);
    const totalFunded = circleItems.reduce((acc, item) => acc + item.fundedAmount, 0);
    const progress = totalGoal > 0 ? (totalFunded / totalGoal) * 100 : 0;

    return (
        <div className="px-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => setView('FRIENDS')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <div className="ml-2">
                   <h2 className="text-xl font-bold text-gray-800">{circle.name}</h2>
                   <p className="text-xs text-gray-500">{circle.memberIds.length} members</p>
                </div>
            </div>

            {/* Circle Header Card */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl mb-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="opacity-80 text-sm mb-1">Total Pool Progress</p>
                        <h3 className="text-3xl font-bold">{currencySymbol}{totalFunded} <span className="text-lg opacity-70 font-normal">/ {currencySymbol}{totalGoal}</span></h3>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                        <Target size={24} />
                    </div>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                   <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs opacity-80">{circle.description || 'No description provided.'}</p>
            </div>

            {/* Members Section */}
            <div className="mb-8">
               <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-gray-800">Members</h3>
                   {/* In a real app, add member functionality here */}
                   <span className="text-xs text-brand-600 font-bold cursor-pointer">Invite +</span>
               </div>
               <div className="flex -space-x-2 overflow-x-auto pb-2 scrollbar-hide px-2">
                   {members.map(member => (
                       <img key={member!.id} src={member!.avatar} alt={member!.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" title={member!.name} />
                   ))}
               </div>
            </div>

            {/* Goals / Wishes Section */}
            <div>
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-800">Circle Goal</h3>
                   <button 
                      onClick={() => handleAddCircleGoal(circle.id)}
                      className="text-brand-600 text-xs font-bold flex items-center bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100"
                   >
                      <PlusCircle size={14} className="mr-1" /> Add Product
                   </button>
               </div>

               {circleItems.length > 0 ? (
                   <div className="space-y-4">
                       {circleItems.map(item => (
                           <div 
                                key={item.id}
                                onClick={() => setViewingItemId(item.id)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-brand-200 transition-colors"
                           >
                               <div className="flex items-center space-x-4 mb-3">
                                   <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                                   <div className="flex-1 min-w-0">
                                       <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                                       <p className="text-xs text-gray-500 mb-1">Added by {getUser(item.userId)?.firstName}</p>
                                       <div className="text-xs font-medium text-brand-600">{currencySymbol}{item.price - item.fundedAmount} needed</div>
                                   </div>
                               </div>
                               
                               <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                    <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((item.fundedAmount / item.price) * 100, 100)}%` }}></div>
                               </div>

                               <button 
                                  onClick={(e) => { e.stopPropagation(); setContributingItem(item); }}
                                  className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold flex items-center justify-center hover:bg-gray-800"
                               >
                                  <DollarSign size={14} className="mr-1" /> Contribute
                               </button>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       <p className="text-gray-500 text-sm mb-2">No product goal set yet.</p>
                       <button onClick={() => handleAddCircleGoal(circle.id)} className="text-brand-600 font-bold text-sm underline">Set a goal now</button>
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
        <h1 className="text-4xl font-extrabold mb-6">{currencySymbol}{walletBalance.available.toFixed(2)}</h1>
        
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
              <p className="text-lg font-bold text-gray-900">{currencySymbol}{walletBalance.locked.toFixed(2)}</p>
            </div>
         </div>
         <p className="text-xs text-gray-400 max-w-[120px] text-right">Restricted to specific product purchases.</p>
      </div>

      <h3 className="font-bold text-gray-800 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
         {recentTransactions.length > 0 ? recentTransactions.map(tx => {
             const contributor = getUser(tx.contributorId);
             const displayName = tx.isAnonymous ? "Anonymous" : (contributor?.name || "Unknown User");
             const date = new Date(tx.timestamp).toLocaleDateString();
             
             return (
                <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                       <div className="bg-green-100 p-2 rounded-full text-green-600">
                         <DollarSign size={18} />
                       </div>
                       <div>
                         <p className="font-bold text-gray-900">Contribution Received</p>
                         <p className="text-xs text-gray-500">From {displayName} • {date}</p>
                         <p className="text-[10px] text-gray-400 truncate max-w-[200px]">For: {tx.itemTitle}</p>
                       </div>
                    </div>
                    <span className="font-bold text-green-600">+{currencySymbol}{tx.amount}</span>
                 </div>
             );
         }) : (
            <div className="text-center text-gray-400 text-sm py-4">
                No recent transactions.
            </div>
         )}
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
                <span className="text-gray-400 mr-1">{currencySymbol}</span>
                {walletBalance.available.toFixed(2)}
              </div>
              <p className="text-xs text-gray-400">Funds will be transferred to your linked bank account ending in ****4242.</p>
            </div>

            <button 
              onClick={() => { alert(`Processing withdrawal of ${currencySymbol}${walletBalance.available}`); setShowWithdrawModal(false); }}
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

            {/* My ID Card - Moved from Friends View */}
            <div className="bg-gradient-to-r from-purple-100 to-brand-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-purple-200">
                <div>
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">My GiftCircle ID</p>
                    <p className="text-lg font-bold text-gray-900">{me.id}</p>
                </div>
                <button 
                    onClick={() => navigator.clipboard.writeText(me.id).then(() => alert("ID copied!"))}
                    className="p-2 bg-white rounded-lg text-gray-500 hover:text-brand-600 shadow-sm"
                >
                    <Copy size={20} />
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
                      <h3 className="text-2xl font-bold">{currencySymbol}{walletBalance.available.toFixed(2)}</h3>
                   </div>
                   <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                      <Wallet size={24} />
                   </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-gray-400">
                   <span className="bg-white/10 px-2 py-1 rounded mr-2">Locked: {currencySymbol}{walletBalance.locked}</span>
                   <span>Tap to withdraw</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex mb-6">
                <button 
                    onClick={() => setProfileTab('PERSONAL')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${profileTab === 'PERSONAL' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Personal
                </button>
                <button 
                    onClick={() => setProfileTab('BANK')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${profileTab === 'BANK' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Bank Details
                </button>
            </div>

            {profileTab === 'PERSONAL' ? (
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
                        
                        {/* Email */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input name="email" type="email" defaultValue={me.email} className="w-full pl-8 p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
                                <input name="dob" type="date" defaultValue={me.dob} className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" />
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
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input name="phoneNumber" type="tel" defaultValue={me.phoneNumber} className="w-full pl-8 p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" placeholder="+1 555-000-0000" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 flex justify-center items-center">
                        <Save size={18} className="mr-2" /> Save Changes
                    </button>
                </form>
            ) : (
                <form onSubmit={handleSaveBankDetails} className="space-y-6 animate-in fade-in slide-in-from-right duration-200">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                            <Landmark size={18} className="mr-2 text-brand-500" /> Bank Account Info
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Account Holder Name</label>
                                <input 
                                    name="accountName" 
                                    defaultValue={me.bankDetails?.accountName || ''} 
                                    placeholder="Name as per bank records"
                                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Account Number</label>
                                <input 
                                    name="accountNumber" 
                                    type="password"
                                    defaultValue={me.bankDetails?.accountNumber || ''} 
                                    placeholder="Enter account number"
                                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Bank Name</label>
                                    <input 
                                        name="bankName" 
                                        defaultValue={me.bankDetails?.bankName || ''} 
                                        placeholder="e.g. HDFC Bank"
                                        className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">IFSC Code</label>
                                    <input 
                                        name="ifscCode" 
                                        defaultValue={me.bankDetails?.ifscCode || ''} 
                                        placeholder="ABCD0123456"
                                        className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500 uppercase" 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">PAN Number</label>
                                <input 
                                    name="panNumber" 
                                    defaultValue={me.bankDetails?.panNumber || ''} 
                                    placeholder="ABCDE1234F"
                                    className="w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500 uppercase" 
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Required for tax purposes on withdrawals.</p>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 flex justify-center items-center">
                        <Save size={18} className="mr-2" /> Save Bank Details
                    </button>
                </form>
            )}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Contribution Amount ({currencySymbol})</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currencySymbol}</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Contribution Limit ({currencySymbol})</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currencySymbol}</span>
                    <input 
                        name="maxGiftAmount" 
                        type="number" 
                        defaultValue={me.settings.maxGiftAmount}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">We'll warn you if you try to exceed this amount.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select 
                    name="currency" 
                    defaultValue={me.settings.currency}
                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Display all prices in this currency.</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input 
                        name="autoAcceptContacts" 
                        type="checkbox" 
                        defaultChecked={me.settings.autoAcceptContacts}
                        className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300"
                    />
                    <div>
                        <span className="block text-sm font-bold text-gray-800">Auto-accept requests from contacts</span>
                        <span className="text-xs text-gray-500">Automatically accept friend requests if the sender is in your phone contacts.</span>
                    </div>
                </label>
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
             
            {renderEvents(myActiveEvents)}
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
          <div className="px-4 pb-20">
             <div className="bg-gradient-to-r from-brand-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg mb-6">
                <h2 className="text-2xl font-bold mb-2">Contribute to a Gift</h2>
                <p className="opacity-90">Surprise a friend by funding their wishes.</p>
            </div>

             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">Connections</h2>
                 <div className="flex space-x-2">
                    <button 
                        onClick={() => setView('FRIEND_REQUESTS')}
                        className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <UserIcon size={18} className="mr-1" />
                        Requests
                        {incomingRequests.length > 0 && (
                            <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{incomingRequests.length}</span>
                        )}
                    </button>
                    <button 
                        onClick={() => setShowAddFriendModal(true)}
                        className="bg-brand-600 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center space-x-1 hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-95"
                    >
                        <UserPlus size={18} />
                        <span>Add</span>
                    </button>
                 </div>
             </div>

             {/* Search Bar */}
             <div className="relative mb-6">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                     type="text"
                     placeholder="Search your circle..." 
                     className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-sm transition-all"
                     value={friendSearchQuery}
                     onChange={(e) => setFriendSearchQuery(e.target.value)}
                 />
             </div>

             {/* Tabs */}
             <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex mb-6">
                 <button 
                    onClick={() => setFriendsViewTab('FRIENDS')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${friendsViewTab === 'FRIENDS' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    My Circle ({friends.length})
                 </button>
                 <button 
                    onClick={() => setFriendsViewTab('CIRCLES')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${friendsViewTab === 'CIRCLES' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Gift Circles ({circles.length})
                 </button>
             </div>

             {friendsViewTab === 'FRIENDS' ? (
                <>
                    {/* Friends List */}
                    <div className="space-y-4">
                        {filteredMyCircle.length > 0 ? filteredMyCircle.map(friend => (
                        <div 
                            key={friend.id} 
                            onClick={() => { setSelectedFriendId(friend.id); setView('PROFILE'); }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover" />
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900">{friend.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {me.familyMemberIds.includes(friend.id) ? 'Family Member' : 'Friend'}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Family Toggle Button */}
                                <button 
                                    onClick={(e) => handleToggleFamily(e, friend.id)}
                                    className={`p-2 rounded-full transition-colors ${me.familyMemberIds.includes(friend.id) ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}
                                    title={me.familyMemberIds.includes(friend.id) ? "Remove from Family" : "Mark as Family"}
                                >
                                    <Heart size={20} fill={me.familyMemberIds.includes(friend.id) ? "currentColor" : "none"} />
                                </button>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleBlockUser(friend.id); }}
                                    className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                                    title="Block User"
                                >
                                    <Ban size={20} />
                                </button>
                                <div className="bg-gray-100 p-2 rounded-full text-gray-400">
                                    <ExternalLink size={20} />
                                </div>
                            </div>
                        </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Users size={32} className="mx-auto mb-2 opacity-30" />
                                <p className="text-sm">
                                    {friendSearchQuery ? `No friends match "${friendSearchQuery}"` : "Your circle is empty."}
                                </p>
                                {!friendSearchQuery && (
                                    <button onClick={() => setShowAddFriendModal(true)} className="text-brand-600 font-bold text-sm mt-2 hover:underline">Add someone now</button>
                                )}
                            </div>
                        )}
                    </div>
                </>
             ) : (
                /* Gift Circles List */
                <div className="space-y-4">
                    <button 
                        onClick={() => setShowCreateCircleModal(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center hover:border-brand-400 hover:text-brand-600 transition-colors bg-white mb-4"
                    >
                        <PlusCircle size={20} className="mr-2" /> Create New Circle
                    </button>

                    {circles.length > 0 ? circles.map(circle => (
                        <div 
                            key={circle.id}
                            onClick={() => { setActiveCircleId(circle.id); setView('CIRCLE_DETAIL'); }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-brand-200 transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{circle.name}</h3>
                                        <p className="text-xs text-gray-500">{circle.memberIds.length} members</p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(circle.createdTimestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 pl-12 line-clamp-1">{circle.description}</p>
                            
                            <div className="pl-12 flex -space-x-2">
                                {circle.memberIds.slice(0, 5).map(id => {
                                    const u = getUser(id);
                                    return u ? <img key={u.id} src={u.avatar} className="w-6 h-6 rounded-full border border-white" /> : null;
                                })}
                                {circle.memberIds.length > 5 && (
                                    <div className="w-6 h-6 rounded-full bg-gray-100 text-[10px] flex items-center justify-center border border-white font-medium">+{circle.memberIds.length - 5}</div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 text-gray-400">
                            <p>No gift circles yet.</p>
                        </div>
                    )}
                </div>
             )}
          </div>
        )}

        {view === 'FRIEND_REQUESTS' && renderFriendRequestsView()}

        {view === 'CIRCLE_DETAIL' && renderCircleDetail()}

        {view === 'EVENT_DETAIL' && renderEventDetail()}

        {view === 'EVENT_PLANNING' && renderEventPlanning()}
        
        {view === 'NOTIFICATIONS' && renderNotifications()}

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
             {renderEvents(friendActiveEvents)}
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
                <button onClick={() => {
                    if (addingItemToCircleId) {
                        setView('CIRCLE_DETAIL');
                        setAddingItemToCircleId(null);
                    } else {
                        setView('HOME');
                    }
                }} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 ml-2">
                    {addingItemToCircleId ? 'Add Circle Goal' : 'Add to Wishlist'}
                </h2>
            </div>
            
            <form onSubmit={handleAddItem} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                {addingItemToCircleId && (
                    <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg text-sm mb-2 flex items-center">
                        <Target size={16} className="mr-2" />
                        Adding goal to circle: <span className="font-bold ml-1">{circles.find(c => c.id === addingItemToCircleId)?.name}</span>
                    </div>
                )}

                {/* Entry Method Toggle */}
                <div className="bg-gray-100 p-1 rounded-xl flex mb-4">
                     <button 
                        type="button"
                        onClick={() => setAddItemMethod('LINK')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all ${addItemMethod === 'LINK' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
                     >
                        <LinkIcon size={16} />
                        <span>Link Auto-fill</span>
                     </button>
                     <button 
                        type="button"
                        onClick={() => setAddItemMethod('MANUAL')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-all ${addItemMethod === 'MANUAL' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
                     >
                        <PenTool size={16} />
                        <span>Manual Entry</span>
                     </button>
                </div>

                {addItemMethod === 'LINK' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left duration-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Link</label>
                            <input 
                                value={itemDraft.url}
                                onChange={e => setItemDraft({...itemDraft, url: e.target.value})}
                                type="url" 
                                placeholder="https://amazon.com/..." 
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                                autoFocus
                            />
                            <p className="text-xs text-gray-400 mt-1">Paste a link from Amazon or Flipkart</p>
                        </div>
                        
                        <div className="p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
                            Tip: We'll attempt to fetch the product name and price automatically.
                        </div>

                        <button 
                            type="button" 
                            onClick={handleFetchItemDetails}
                            disabled={!itemDraft.url || isSimulatingFetch}
                            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 flex justify-center items-center disabled:opacity-70"
                        >
                            {isSimulatingFetch ? <Loader2 className="animate-spin mr-2" /> : 'Fetch Details'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right duration-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input 
                                value={itemDraft.title}
                                onChange={e => setItemDraft({...itemDraft, title: e.target.value})}
                                type="text" 
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                                required 
                                placeholder="e.g. Sony Headphones"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price ({currencySymbol})</label>
                            <input 
                                value={itemDraft.price}
                                onChange={e => setItemDraft({...itemDraft, price: e.target.value})}
                                type="number" 
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                                required 
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea 
                                value={itemDraft.description}
                                onChange={e => setItemDraft({...itemDraft, description: e.target.value})}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                                rows={3}
                                placeholder="Add notes about size, color, etc."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Link (Optional)</label>
                            <input 
                                value={itemDraft.url}
                                onChange={e => setItemDraft({...itemDraft, url: e.target.value})}
                                type="url" 
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" 
                                placeholder="https://..."
                            />
                        </div>

                        {!addingItemToCircleId && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tag with Event (Optional)</label>
                                <select 
                                    value={itemDraft.eventId}
                                    onChange={e => setItemDraft({...itemDraft, eventId: e.target.value})}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500 text-gray-700"
                                >
                                    <option value="">-- No Event --</option>
                                    {myActiveEvents.map(event => (
                                        <option key={event.id} value={event.id}>{event.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200 mt-4">
                            {addingItemToCircleId ? 'Set Circle Goal' : 'Add Wish'}
                        </button>
                    </div>
                )}
            </form>
          </div>
        )}

        {view === 'CREATE_EVENT' && (
          <CreateEventView 
            onBack={() => setView('HOME')}
            onCreate={handleEventCreation}
            userItems={wishlist.filter(w => w.userId === me.id && w.status === 'ACTIVE')}
            existingEvents={events}
            currencySymbol={currencySymbol}
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

      {showAddFriendModal && (
          <AddFriendModal 
            onClose={() => setShowAddFriendModal(false)}
            onSend={handleSendFriendRequest}
            myId={me.id}
          />
      )}
      
      {showCreateCircleModal && (
          <CreateCircleModal
            onClose={() => setShowCreateCircleModal(false)}
            onCreate={handleCreateCircle}
            friends={friends}
          />
      )}

      {showEventInviteModal && viewingEventId && (
        <EventInviteModal 
          friends={friends}
          existingInviteeIds={events.find(e => e.id === viewingEventId)?.inviteeIds || []}
          onClose={() => setShowEventInviteModal(false)}
          onSave={handleUpdateEventInvites}
        />
      )}

      {contributingItem && (
        <ContributionModal 
          item={contributingItem}
          defaultAmount={me.settings.defaultGiftAmount}
          maxAmount={me.settings.maxGiftAmount}
          currencySymbol={currencySymbol}
          onClose={() => setContributingItem(null)} 
          onContribute={handleContribute} 
        />
      )}

      {activeViewingItem && (
        <WishDetailModal 
            item={activeViewingItem} 
            currencySymbol={currencySymbol}
            onClose={() => setViewingItemId(null)} 
        />
      )}
    </div>
  );
};

export default App;
