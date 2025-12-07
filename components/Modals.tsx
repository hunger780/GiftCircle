


import React, { useState } from 'react';
import { Gift, Lock, Unlock, Users, Search, ChevronRight, X, XCircle, Check, Shield, ShieldCheck } from 'lucide-react';
import { User } from '../types.ts';

// --- Onboarding ---
interface OnboardingProps {
  onClose: () => void;
}
export const OnboardingModal: React.FC<OnboardingProps> = ({ onClose }) => {
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

// --- Add Friend ---
interface AddFriendModalProps {
    onClose: () => void;
    onSend: (id: string) => void;
    myId: string;
}
export const AddFriendModal: React.FC<AddFriendModalProps> = ({ onClose, onSend, myId }) => {
    const [id, setId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!id.trim()) return;
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
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder="e.g. u2"
                            autoFocus
                        />
                        {error && <p className="text-red-500 text-xs mt-2 flex items-center"><XCircle size={12} className="mr-1"/> {error}</p>}
                    </div>
                    <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200">
                        Send Request
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Create Circle ---
interface CreateCircleModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string, memberIds: string[], adminIds: string[]) => void;
  friends: User[];
}
export const CreateCircleModal: React.FC<CreateCircleModalProps> = ({ onClose, onCreate, friends }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
    const [adminFriends, setAdminFriends] = useState<Set<string>>(new Set());

    const toggleFriend = (id: string) => {
        const next = new Set(selectedFriends);
        if (next.has(id)) {
            next.delete(id);
            // Also remove from admins if deselected
            if (adminFriends.has(id)) {
                const nextAdmins = new Set(adminFriends);
                nextAdmins.delete(id);
                setAdminFriends(nextAdmins);
            }
        } else {
            next.add(id);
        }
        setSelectedFriends(next);
    };

    const toggleAdmin = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!selectedFriends.has(id)) return; // Should be selected first

        const next = new Set(adminFriends);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setAdminFriends(next);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onCreate(name, description, Array.from(selectedFriends), Array.from(adminFriends));
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
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Add Members ({selectedFriends.size})</label>
                                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Tap shield to make Admin</span>
                            </div>
                            <div className="space-y-2">
                                {friends.length > 0 ? friends.map(friend => {
                                    const isSelected = selectedFriends.has(friend.id);
                                    const isAdmin = adminFriends.has(friend.id);
                                    return (
                                        <div 
                                            key={friend.id}
                                            onClick={() => toggleFriend(friend.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-500' : 'border-gray-300'}`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                                <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full mr-3" />
                                                <div className="flex flex-col">
                                                    <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{friend.name}</span>
                                                    {isAdmin && <span className="text-[10px] text-blue-600 font-bold">Admin</span>}
                                                </div>
                                            </div>
                                            
                                            {isSelected && (
                                                <button 
                                                    onClick={(e) => toggleAdmin(e, friend.id)}
                                                    className={`p-2 rounded-full transition-colors ${isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400 hover:bg-gray-300'}`}
                                                    title={isAdmin ? "Remove Admin" : "Make Admin"}
                                                >
                                                    {isAdmin ? <ShieldCheck size={18} /> : <Shield size={18} />}
                                                </button>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <p className="text-gray-400 text-sm italic">Add friends to your friend list first.</p>
                                )}
                            </div>
                        </div>
                   </div>
                   <button type="submit" disabled={!name} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 mt-4 disabled:opacity-50">
                        Create Circle
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Invite Modal (Reused for Events and Circles) ---
interface InviteModalProps {
  title: string;
  onClose: () => void;
  onSave: (selectedIds: string[]) => void;
  friends: User[];
  existingIds: string[];
}
export const InviteModal: React.FC<InviteModalProps> = ({ title, onClose, onSave, friends, existingIds }) => {
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set(existingIds));

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
        <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
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
        <button onClick={handleSave} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 mt-4">
          Save List ({selectedFriends.size})
        </button>
      </div>
    </div>
  );
};