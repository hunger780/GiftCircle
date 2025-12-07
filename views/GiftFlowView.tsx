
import React, { useState } from 'react';
import { User, WishlistItem } from '../types.ts';
import { ArrowLeft, Search, Gift } from 'lucide-react';
import { WishlistCard } from '../components/WishlistCard.tsx';

interface GiftFlowViewProps {
    onBack: () => void;
    friends: User[];
    wishlist: WishlistItem[];
    currencySymbol: string;
    onContribute: (item: WishlistItem, amount?: number) => void;
    onItemClick: (itemId: string) => void;
}

export const GiftFlowView: React.FC<GiftFlowViewProps> = ({ onBack, friends, wishlist, currencySymbol, onContribute, onItemClick }) => {
    const [step, setStep] = useState<'SELECT_FRIEND' | 'SELECT_ITEM'>('SELECT_FRIEND');
    const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    // Get items for selected friend that are active and not fully funded
    const friendItems = selectedFriendId
        ? wishlist.filter(w => w.userId === selectedFriendId && w.status === 'ACTIVE' && w.fundedAmount < w.price)
        : [];

    return (
        <div className="px-4 pb-24 h-screen flex flex-col">
            <div className="flex items-center mb-6 pt-4 flex-shrink-0">
                <button onClick={step === 'SELECT_FRIEND' ? onBack : () => setStep('SELECT_FRIEND')} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button>
                <h2 className="text-xl font-bold text-gray-800 ml-2">{step === 'SELECT_FRIEND' ? 'Send a Gift' : 'Select a Wish'}</h2>
            </div>

            {step === 'SELECT_FRIEND' ? (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                            placeholder="Search friend..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {filteredFriends.length > 0 ? filteredFriends.map(friend => (
                            <div
                                key={friend.id}
                                onClick={() => { setSelectedFriendId(friend.id); setStep('SELECT_ITEM'); }}
                                className="flex items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-all"
                            >
                                <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-100" />
                                <div>
                                    <h3 className="font-bold text-gray-900">{friend.name}</h3>
                                    <p className="text-xs text-gray-500">Tap to view wishlist</p>
                                </div>
                                <div className="ml-auto text-brand-500">
                                    <Gift size={20} />
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400">No friends found.</div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto min-h-0 pb-4">
                    {friendItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {friendItems.map(item => (
                                <WishlistCard
                                    key={item.id}
                                    item={item}
                                    isOwn={false}
                                    currencySymbol={currencySymbol}
                                    onClick={onItemClick}
                                    onContribute={onContribute}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <Gift size={48} className="mx-auto mb-3 text-gray-300" />
                            <h3 className="text-gray-900 font-bold mb-1">No active wishes</h3>
                            <p className="text-gray-500 text-sm">This friend doesn't have any unfunded wishes yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
