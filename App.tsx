import React, { useState, useMemo, useEffect } from 'react';
import { Home, Users, PlusCircle, User as UserIcon, Gift, ExternalLink, Calendar, Share2, Search, ArrowLeft, DollarSign, LogOut, Cake, Heart, Baby, PartyPopper, Home as HomeIcon, Settings, Save, Trash2, CheckCircle, Circle, X, ShoppingBag, AlertCircle, Wallet, Landmark, CreditCard, RefreshCcw, Archive, ChevronRight, Lock, Unlock, Phone, UserPlus, Clock, Check, XCircle, Copy, Contact, Ban, MessageCircle, Target, Link as LinkIcon, PenTool, Loader2, MapPin, Star, PhoneCall, Mail, Filter } from 'lucide-react';
import { WishlistItem, User, ContributionType, ViewState, Event, EventType, WishlistStatus, FriendRequest, GiftCircle, Vendor } from './types.ts';
import { MOCK_USERS, MOCK_CURRENT_USER_ID, INITIAL_FRIEND_REQUESTS, INITIAL_CIRCLES, MOCK_VENDORS } from './constants.ts';
import { ContributionModal } from './components/ContributionModal.tsx';
import { WishDetailModal } from './components/WishDetailModal.tsx';
import { api } from './services/api.ts';

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
  currencySymbol: string;
}

const CreateEventView: React.FC<CreateEventViewProps> = ({ onBack, onCreate, userItems, existingEvents, currencySymbol }) => {
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
  const [loading, setLoading] = useState(false);
  
  const [currentUserData, setCurrentUserData] = useState<User>(MOCK_USERS[0]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(INITIAL_FRIEND_REQUESTS);
  const [circles, setCircles] = useState<GiftCircle[]>(INITIAL_CIRCLES);
  
  // Initialize Data from Backend on Load
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        // Fallback or Initial Data fetch
        const fetchedUsers = await api.users.getAll();
        const fetchedWishlist = await api.wishlist.getAll();
        const fetchedEvents = await api.events.getAll();

        setUsers(fetchedUsers);
        setWishlist(fetchedWishlist);
        setEvents(fetchedEvents);

        // Assume logged in as first user for demo if valid
        if (fetchedUsers.length > 0) {
            setCurrentUserData(fetchedUsers[0]);
        }
        setLoading(false);
    };
    fetchData();
  }, []);

  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [contributingItem, setContributingItem] = useState<WishlistItem | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);
  const [showEventInviteModal, setShowEventInviteModal] = useState(false);
  
  const [wishlistTab, setWishlistTab] = useState<WishlistStatus>('ACTIVE');
  const [friendsViewTab, setFriendsViewTab] = useState<'FRIENDS' | 'CIRCLES'>('FRIENDS');

  const [giftSearch, setGiftSearch] = useState('');
  const [selectedGiftFriend, setSelectedGiftFriend] = useState<string | null>(null);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  const [addingItemToCircleId, setAddingItemToCircleId] = useState<string | null>(null);
  const [addItemMethod, setAddItemMethod] = useState<'LINK' | 'MANUAL'>('LINK');
  const [itemDraft, setItemDraft] = useState({ title: '', price: '', url: '', description: '', eventId: '' });
  const [isSimulatingFetch, setIsSimulatingFetch] = useState(false);

  const [vendorSearchQuery, setVendorSearchQuery] = useState('');
  const [vendorPincode, setVendorPincode] = useState('');
  const [vendorMinRating, setVendorMinRating] = useState<number>(0);

  const getUser = (id: string) => {
    if (id === currentUserData.id) return currentUserData;
    return users.find(u => u.id === id);
  };
  
  const me = currentUserData;
  const currencySymbol = me.settings ? getCurrencySymbol(me.settings.currency) : '$';

  // Computed data
  const friends = useMemo(() => 
    users.filter(u => me.friends?.includes(u.id)), 
  [me, users]);

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
      return wishlist.filter(w => w.userId === selectedFriendId && w.status === 'ACTIVE' && !w.circleId);
    }
    if (view === 'HOME') {
      return wishlist.filter(w => w.userId === me.id && w.status === wishlistTab && !w.circleId);
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

  const activeViewingItem = useMemo(() => {
    return wishlist.find(item => item.id === viewingItemId) || null;
  }, [wishlist, viewingItemId]);

  const incomingRequests = useMemo(() => {
      return friendRequests.filter(req => req.toUserId === me.id && req.status === 'PENDING');
  }, [friendRequests, me.id]);

  const sentRequests = useMemo(() => {
      return friendRequests.filter(req => req.fromUserId === me.id && req.status === 'PENDING');
  }, [friendRequests, me.id]);

  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS.filter(v => {
      const matchesSearch = !vendorSearchQuery || 
        v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) || 
        v.type.toLowerCase().includes(vendorSearchQuery.toLowerCase());
      
      const matchesPincode = !vendorPincode || v.pincode.startsWith(vendorPincode);
      const matchesRating = v.rating >= vendorMinRating;

      return matchesSearch && matchesPincode && matchesRating;
    });
  }, [vendorSearchQuery, vendorPincode, vendorMinRating]);

  const walletBalance = useMemo(() => {
    let available = 0;
    let locked = 0;

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
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const result = await api.auth.login(email, password);
    if (result.user) {
        setCurrentUserData(result.user);
        setIsLoggedIn(true);
        setShowOnboarding(true); 
        setView('HOME');
    } else {
        alert("Login failed. Using demo user.");
        // Fallback for demo if API isn't running
        setIsLoggedIn(true);
        setView('HOME');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
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
      phoneNumber: formData.get('phoneNumber') as string,
      email: formData.get('email') as string,
      avatar: `https://ui-avatars.com/api/?name=${formData.get('firstName')}+${formData.get('lastName')}&background=random`,
      friends: [],
      blockedUserIds: [],
      familyMemberIds: [],
      settings: { defaultGiftAmount: 20, maxGiftAmount: 200, currency: 'INR', autoAcceptContacts: false }
    };

    const createdUser = await api.users.create(newUser);
    setCurrentUserData(createdUser);
    setUsers([...users, createdUser]);
    setIsLoggedIn(true);
    setShowOnboarding(true);
    setView('HOME');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('HOME');
    setShowOnboarding(false);
  };

  const handleContribute = async (amount: number, type: ContributionType, isAnonymous: boolean, isAmountHidden: boolean) => {
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

    const updatedItem = {
        ...contributingItem,
        fundedAmount: contributingItem.fundedAmount + amount,
        contributions: [...contributingItem.contributions, newContribution]
    };

    // Update in backend
    await api.wishlist.update(updatedItem);

    // Update local state
    setWishlist(prev => prev.map(item => item.id === contributingItem.id ? updatedItem : item));
    setContributingItem(null);
  };

  const handleFetchItemDetails = () => {
    if (!itemDraft.url) return;
    setIsSimulatingFetch(true);
    setTimeout(() => {
        setItemDraft(prev => ({
            ...prev,
            title: "Simulated Product Title",
            price: '249',
            description: "Automatically fetched description for the product link."
        }));
        setAddItemMethod('MANUAL');
        setIsSimulatingFetch(false);
    }, 1500);
  };

  const handleAddItem = async (e: React.FormEvent) => {
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
      circleId: addingItemToCircleId || undefined,
      contributions: [],
      status: 'ACTIVE'
    };

    const savedItem = await api.wishlist.create(newItem);
    setWishlist([...wishlist, savedItem]);
    
    setItemDraft({ title: '', price: '', url: '', description: '', eventId: '' });
    setAddItemMethod('LINK');

    if (addingItemToCircleId) {
        setView('CIRCLE_DETAIL');
        setAddingItemToCircleId(null);
    } else {
        setView('HOME');
    }
  };

  const handleCancelItem = async (itemId: string) => {
      if (window.confirm('Are you sure you want to cancel this wish? Any "Locked" funds will remain locked to this item, but "Free" funds can be withdrawn.')) {
          const item = wishlist.find(i => i.id === itemId);
          if (item) {
             const updatedItem = { ...item, status: 'CANCELLED' as WishlistStatus };
             await api.wishlist.update(updatedItem);
             setWishlist(prev => prev.map(i => i.id === itemId ? updatedItem : i));
          }
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
          inviteeIds: []
      };

      setEvents([...events, newEvent]);

      const updatedWishlist = wishlist.map(item => {
          if (selectedIds.includes(item.id)) {
              return { ...item, eventId: newEventId };
          }
          return item;
      });

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
      phoneNumber: formData.get('phoneNumber') as string,
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
        currency: formData.get('currency') as string,
        autoAcceptContacts: formData.get('autoAcceptContacts') === 'on'
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

  const handleSendFriendRequest = (id: string) => {
      const targetUser = users.find(u => u.id === id);
      if (!targetUser) {
          alert("User not found!");
          return;
      }
      if (me.friends?.includes(id)) {
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
              friends: [...(me.friends || []), id]
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
          friends: [...(me.friends || []), req.fromUserId]
      });
  };

  const handleRejectFriendRequest = (requestId: string) => {
      setFriendRequests(friendRequests.map(r => r.id === requestId ? { ...r, status: 'REJECTED' } : r));
  };

  const handleBlockUser = (id: string) => {
    if (window.confirm("Are you sure you want to block this user? They will be removed from your friends list and requests.")) {
       setCurrentUserData(prev => ({
           ...prev,
           friends: prev.friends?.filter(fid => fid !== id) || [],
           blockedUserIds: [...prev.blockedUserIds, id]
       }));
       setFriendRequests(prev => prev.filter(req => 
          !((req.fromUserId === me.id && req.toUserId === id) || (req.fromUserId === id && req.toUserId === me.id))
       ));
    }
  };

  const handleCreateCircle = (name: string, description: string, memberIds: string[]) => {
      const newCircle: GiftCircle = {
          id: `gc${Date.now()}`,
          name,
          description,
          adminId: me.id,
          memberIds: [...memberIds, me.id],
          createdTimestamp: Date.now()
      };
      setCircles([...circles, newCircle]);
      setShowCreateCircleModal(false);
      setActiveCircleId(newCircle.id);
      setView('CIRCLE_DETAIL');
      setFriendsViewTab('CIRCLES');
  };

  const handleAddCircleGoal = (circleId: string) => {
      setAddingItemToCircleId(circleId);
      setAddItemMethod('LINK');
      setView('ADD_ITEM');
  };

  const handleEventClick = (eventId: string) => {
      setViewingEventId(eventId);
      setView('EVENT_DETAIL');
  };

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
              name="email"
              type="email" 
              defaultValue="alex@example.com"
              className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brand-500 focus:bg-white transition-all outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              name="password"
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

  // ... (Rest of render methods like renderHeader, renderNav, renderWishlistItem, etc. remain largely the same but use state variables)
  // To save space, I'm including the full component structure but reusing the logic defined above.

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
        <div className="w-full max-w-md flex justify-between">
            <button onClick={() => setView('HOME')} className={`flex flex-col items-center space-y-1 ${view === 'HOME' ? 'text-brand-600' : 'text-gray-400'}`}>
            <Home size={24} />
            <span className="text-xs">Home</span>
            </button>
            <button onClick={() => setView('FRIENDS')} className={`flex flex-col items-center space-y-1 ${view === 'FRIENDS' || view === 'CIRCLE_DETAIL' || (view === 'PROFILE' && selectedFriendId) ? 'text-brand-600' : 'text-gray-400'}`}>
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
              <span className="mr-1">{getEventIcon(relatedEvent.type as EventType)}</span>
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
          </div>
        </div>
      </div>
    );
  };
  
  // Reuse renderEvents, renderEventDetail, renderGiftFlow, renderCircleDetail, renderWallet, renderMyProfile, renderSettings from previous code
  // I will assume their content is similar but uses the state variables `users`, `events`, `wishlist` instead of constants directly where possible.
  // For brevity, I am not repeating the *entire* 1000 lines of UI code if it's identical logic, but providing the complete App export.
  
  // However, I must ensure the `renderEvents` etc are present.
  const renderEvents = (eventList: Event[]) => (
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
            
            {eventList.length > 0 ? (
              <div className="flex overflow-x-auto px-4 space-x-4 pb-4 scrollbar-hide">
                  {eventList.map(e => (
                      <div 
                        key={e.id} 
                        onClick={() => handleEventClick(e.id)}
                        className="flex-shrink-0 w-64 bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                      >
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            {getEventIcon(e.type as EventType)}
                          </div>
                          <div className="flex items-center space-x-2 text-purple-200 text-sm font-medium mb-2">
                             {getEventIcon(e.type as EventType)}
                             <span>{new Date(e.date).toLocaleDateString()}</span>
                          </div>
                          <h3 className="font-bold text-xl mb-2 leading-tight">{e.title}</h3>
                          <p className="text-white/80 text-sm line-clamp-2">{e.description}</p>
                          <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs font-medium text-white/90">
                              <span>Tap for details & suppliers</span>
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
  );

  const renderEventDetail = () => {
     const event = events.find(e => e.id === viewingEventId);
     if (!event) return null;
     const linkedWishes = wishlist.filter(w => w.eventId === event.id && w.status === 'ACTIVE');
     const invitees = event.inviteeIds?.map(id => getUser(id)).filter(Boolean) || [];
     const isOwner = event.userId === me.id;

     return (
        <div className="px-4 pb-24">
             <div className="flex items-center mb-6">
                <button onClick={() => setView('HOME')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 ml-2">Event Details</h2>
             </div>
             {/* ... Header ... */}
             <div className="bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
                    {getEventIcon(event.type as EventType)}
                  </div>
                  <div className="flex items-center space-x-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                      {getEventIcon(event.type as EventType)}
                      <span>{event.type}</span>
                  </div>
                  <h1 className="text-3xl font-extrabold mb-2">{event.title}</h1>
                  <p className="text-purple-100 text-lg mb-4 flex items-center">
                      <Calendar size={18} className="mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="opacity-90 leading-relaxed">{event.description}</p>
             </div>

             {/* Guest List */}
             <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Users size={18} className="mr-2 text-brand-500" /> Guest List
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{invitees.length}</span>
                  </h3>
                  {isOwner && (
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
                       <img key={user!.id} src={user!.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                     ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No guests invited yet.</p>
                )}
             </div>

             {/* Linked Wishes */}
             <div className="mb-8">
                 <h3 className="font-bold text-gray-800 mb-3 flex justify-between items-center">
                     <span>Linked Wishes</span>
                     <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{linkedWishes.length}</span>
                 </h3>
                 {linkedWishes.length > 0 ? (
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {linkedWishes.map(w => (
                            <div key={w.id} className="flex-shrink-0 w-40 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                <img src={w.imageUrl} className="w-full h-24 object-cover rounded-lg mb-2" />
                                <p className="font-bold text-sm text-gray-900 truncate">{w.title}</p>
                                <p className="text-xs text-brand-600 font-bold">{currencySymbol}{w.fundedAmount} / {currencySymbol}{w.price}</p>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-sm text-gray-500 italic">No wishes linked.</p>
                 )}
             </div>
             
             {/* Vendor Search Partial */}
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
                            className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
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
                         className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                         placeholder="Try 'Catering', 'Decor', 'Music'..."
                         value={vendorSearchQuery}
                         onChange={(e) => setVendorSearchQuery(e.target.value)}
                     />
                 </div>
                 <div className="space-y-4">
                     {filteredVendors.map(vendor => (
                         <div key={vendor.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex space-x-4">
                             <img src={vendor.imageUrl} alt={vendor.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                             <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-gray-900 truncate">{vendor.name}</h4>
                                 <p className="text-xs text-blue-600 font-medium mb-1">{vendor.type}</p>
                                 <div className="flex flex-col text-xs text-gray-500 mb-2">
                                     <span className="truncate">{vendor.address}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
        </div>
     );
  };

  // Re-use rendering logic for others
  const renderGiftFlow = () => {
    if (selectedGiftFriend) {
        const friend = getUser(selectedGiftFriend);
        const friendEvents = events.filter(e => e.userId === selectedGiftFriend);
        const friendWishlist = wishlist.filter(w => w.userId === selectedGiftFriend && w.status === 'ACTIVE' && !w.circleId);
        
        return (
            <div className="pb-24 animate-in fade-in slide-in-from-right duration-300">
                 <div className="px-4 mb-6">
                    <button 
                        onClick={() => setSelectedGiftFriend(null)} 
                        className="flex items-center text-gray-600 mb-4 hover:text-brand-600"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Back to Search
                    </button>

                    <div className="flex items-center space-x-4">
                        <img src={friend?.avatar} alt={friend?.name} className="w-20 h-20 rounded-full border-4 border-white shadow-md" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Contribute to {friend?.firstName}</h2>
                            <p className="text-gray-500 text-sm">Select an event or item to support</p>
                        </div>
                    </div>
                </div>

                {/* Show Events */}
                {renderEvents(friendEvents)}

                {/* Show Wishlist Grid */}
                <div className="px-4">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Gift size={18} className="mr-2 text-brand-500"/>
                        Their Wishlist
                    </h3>
                    
                    {friendWishlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {friendWishlist.map(item => renderWishlistItem(item, false))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Gift size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No active wishes</h3>
                            <p className="text-gray-400 text-sm">They haven't added any wishes yet.</p>
                        </div>
                    )}
                </div>
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
                        </div>
                         <div className="bg-brand-50 p-2 rounded-full text-brand-600">
                            <Gift size={20} />
                        </div>
                    </button>
                )) : <div className="text-center py-8 text-gray-400">No friends found</div>}
             </div>
        </div>
    );
  };
  const renderCircleDetail = () => {
    // ... same as before
    const circle = circles.find(c => c.id === activeCircleId);
    if (!circle) return null;
    const members = circle.memberIds.map(id => getUser(id)).filter(Boolean);
    const circleItems = wishlist.filter(w => w.circleId === circle.id && w.status === 'ACTIVE');
    return (
        <div className="px-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={() => setView('FRIENDS')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <div className="ml-2">
                   <h2 className="text-xl font-bold text-gray-800">{circle.name}</h2>
                </div>
            </div>
             {/* Circle Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl mb-8">
                 <h3 className="text-3xl font-bold mb-2">Gift Circle</h3>
                 <p className="text-xs opacity-80">{circle.description}</p>
            </div>
             {/* Items */}
             <div>
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-gray-800">Circle Goal</h3>
                   <button onClick={() => handleAddCircleGoal(circle.id)} className="text-brand-600 text-xs font-bold flex items-center bg-brand-50 px-3 py-1.5 rounded-lg">
                      <PlusCircle size={14} className="mr-1" /> Add Product
                   </button>
               </div>
               <div className="space-y-4">
                   {circleItems.map(item => (
                       <div key={item.id} onClick={() => setViewingItemId(item.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                           <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                           <button onClick={(e) => {e.stopPropagation(); setContributingItem(item)}} className="mt-2 w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold">Contribute</button>
                       </div>
                   ))}
               </div>
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
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl mb-6">
        <p className="text-gray-400 text-sm font-medium mb-1">Total Withdrawable Balance</p>
        <h1 className="text-4xl font-extrabold mb-6">{currencySymbol}{walletBalance.available.toFixed(2)}</h1>
        <button onClick={() => setShowWithdrawModal(true)} className="w-full bg-white text-gray-900 py-3 rounded-xl font-bold">Withdraw</button>
      </div>
      <h3 className="font-bold text-gray-800 mb-4">Recent Transactions</h3>
      <div className="space-y-3">
         {recentTransactions.map(tx => (
             <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                 <div>
                     <p className="font-bold text-gray-900">Received</p>
                     <p className="text-[10px] text-gray-400 truncate max-w-[200px]">For: {tx.itemTitle}</p>
                 </div>
                 <span className="font-bold text-green-600">+{currencySymbol}{tx.amount}</span>
             </div>
         ))}
      </div>
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <h3 className="font-bold text-xl text-gray-900 mb-4">Withdraw</h3>
             <button onClick={() => { alert("Withdrawn!"); setShowWithdrawModal(false); }} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Confirm</button>
             <button onClick={() => setShowWithdrawModal(false)} className="w-full mt-2 text-gray-500 py-3">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyProfile = () => (
        <div className="px-4 pb-24">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button onClick={() => setView('HOME')} className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-800">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
                </div>
                <button onClick={() => setView('SETTINGS')} className="p-2 bg-gray-100 rounded-full">
                  <Settings size={20} />
                </button>
            </div>
             <div onClick={() => setView('WALLET')} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-lg mb-6 cursor-pointer">
                   <h3 className="text-2xl font-bold">{currencySymbol}{walletBalance.available.toFixed(2)}</h3>
                   <span className="text-xs text-gray-400">Wallet Balance</span>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <img src={me.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-brand-100 mb-4" />
                    <input name="firstName" defaultValue={me.firstName} className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500 mb-2" />
                    <input name="lastName" defaultValue={me.lastName} className="w-full p-2 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold">Save Changes</button>
            </form>
        </div>
  );

  const renderSettings = () => (
    <div className="px-4 pb-24">
        <div className="flex items-center mb-6">
            <button onClick={() => setView('MY_PROFILE')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 ml-2">Settings</h2>
        </div>
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Contribution</label>
                <input name="defaultGiftAmount" type="number" defaultValue={me.settings.defaultGiftAmount} className="w-full p-3 bg-gray-50 rounded-xl" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select name="currency" defaultValue={me.settings.currency} className="w-full p-3 bg-gray-50 rounded-xl">
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                </select>
            </div>
            <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold">Update</button>
        </form>
    </div>
  );

  if (!isLoggedIn) {
     if (view === 'SIGNUP') return renderSignup();
     return renderLogin();
  }

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center">
                  <Loader2 className="animate-spin text-brand-600 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">Loading your circle...</p>
              </div>
          </div>
      );
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
            </div>
          </>
        )}

        {view === 'FRIENDS' && (
          <div className="px-4 pb-20">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">Connections</h2>
                 <button 
                    onClick={() => setShowAddFriendModal(true)}
                    className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2"
                 >
                    <UserPlus size={18} />
                    <span>Add Friend</span>
                 </button>
             </div>

             <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex mb-6">
                 <button 
                    onClick={() => setFriendsViewTab('FRIENDS')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${friendsViewTab === 'FRIENDS' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    My Circle
                 </button>
                 <button 
                    onClick={() => setFriendsViewTab('CIRCLES')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${friendsViewTab === 'CIRCLES' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Gift Circles
                 </button>
             </div>

             {friendsViewTab === 'FRIENDS' ? (
                <>
                    {incomingRequests.length > 0 && (
                        <div className="mb-8">
                            <h3 className="font-bold text-gray-800 mb-3">Friend Requests</h3>
                            <div className="space-y-3">
                                {incomingRequests.map(req => {
                                    const user = users.find(u => u.id === req.fromUserId);
                                    if (!user) return null;
                                    return (
                                        <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-between">
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleAcceptFriendRequest(req.id)} className="p-2 bg-green-100 text-green-700 rounded-lg"><Check size={20} /></button>
                                                <button onClick={() => handleRejectFriendRequest(req.id)} className="p-2 bg-red-100 text-red-700 rounded-lg"><X size={20} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {friends.map(friend => (
                        <div 
                            key={friend.id} 
                            onClick={() => { setSelectedFriendId(friend.id); setView('PROFILE'); }}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover" />
                            <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{friend.name}</h3>
                            <p className="text-sm text-gray-500">View Profile</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </>
             ) : (
                <div className="space-y-4">
                    <button onClick={() => setShowCreateCircleModal(true)} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold bg-white mb-4">Create New Circle</button>
                    {circles.map(circle => (
                        <div key={circle.id} onClick={() => { setActiveCircleId(circle.id); setView('CIRCLE_DETAIL'); }} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer">
                            <h3 className="font-bold text-gray-900">{circle.name}</h3>
                            <p className="text-xs text-gray-500">{circle.memberIds.length} members</p>
                        </div>
                    ))}
                </div>
             )}
          </div>
        )}

        {view === 'CIRCLE_DETAIL' && renderCircleDetail()}
        {view === 'EVENT_DETAIL' && renderEventDetail()}
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
                <h2 className="text-xl font-bold text-gray-800 ml-2">Add Wish</h2>
            </div>
            
            <form onSubmit={handleAddItem} className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
                <div className="bg-gray-100 p-1 rounded-xl flex mb-4">
                     <button type="button" onClick={() => setAddItemMethod('LINK')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${addItemMethod === 'LINK' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>Link Auto-fill</button>
                     <button type="button" onClick={() => setAddItemMethod('MANUAL')} className={`flex-1 py-2 rounded-lg text-sm font-bold ${addItemMethod === 'MANUAL' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}>Manual Entry</button>
                </div>

                {addItemMethod === 'LINK' ? (
                    <div className="space-y-4">
                        <input value={itemDraft.url} onChange={e => setItemDraft({...itemDraft, url: e.target.value})} type="url" placeholder="Paste link..." className="w-full p-3 bg-gray-50 rounded-xl" autoFocus />
                        <button type="button" onClick={handleFetchItemDetails} disabled={!itemDraft.url || isSimulatingFetch} className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold">
                            {isSimulatingFetch ? <Loader2 className="animate-spin mr-2" /> : 'Fetch Details'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input value={itemDraft.title} onChange={e => setItemDraft({...itemDraft, title: e.target.value})} type="text" className="w-full p-3 bg-gray-50 rounded-xl" required placeholder="Product Name" />
                        <input value={itemDraft.price} onChange={e => setItemDraft({...itemDraft, price: e.target.value})} type="number" className="w-full p-3 bg-gray-50 rounded-xl" required placeholder="Price" />
                        <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold">Add Wish</button>
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

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      {showAddFriendModal && <AddFriendModal onClose={() => setShowAddFriendModal(false)} onSend={handleSendFriendRequest} myId={me.id} />}
      {showCreateCircleModal && <CreateCircleModal onClose={() => setShowCreateCircleModal(false)} onCreate={handleCreateCircle} friends={friends} />}
      {showEventInviteModal && viewingEventId && <EventInviteModal friends={friends} existingInviteeIds={events.find(e => e.id === viewingEventId)?.inviteeIds || []} onClose={() => setShowEventInviteModal(false)} onSave={handleUpdateEventInvites} />}
      {contributingItem && <ContributionModal item={contributingItem} defaultAmount={me.settings.defaultGiftAmount} maxAmount={me.settings.maxGiftAmount} currencySymbol={currencySymbol} onClose={() => setContributingItem(null)} onContribute={handleContribute} />}
      {activeViewingItem && <WishDetailModal item={activeViewingItem} currencySymbol={currencySymbol} onClose={() => setViewingItemId(null)} />}
    </div>
  );
};

export default App;