
import React from 'react';
import { WishlistItem, ContributionType } from '../types.ts';
import { MOCK_USERS } from '../constants.ts';
import { X, Lock, Unlock, User as UserIcon, Calendar, DollarSign, EyeOff, UserX } from 'lucide-react';

interface Props {
  item: WishlistItem;
  currencySymbol: string;
  onClose: () => void;
}

export const WishDetailModal: React.FC<Props> = ({ item, currencySymbol, onClose }) => {
  const getContributor = (id: string) => MOCK_USERS.find(u => u.id === id);

  // Sort contributions by timestamp descending
  const sortedContributions = [...item.contributions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image Area */}
        <div className="relative h-48 flex-shrink-0 group">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/50 transition-colors z-10"
            >
                <X size={20} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="font-bold text-xl leading-tight shadow-sm mb-1">{item.title}</h3>
                <p className="text-white/80 text-xs font-medium">{currencySymbol}{item.fundedAmount} raised of {currencySymbol}{item.price}</p>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                <div 
                    className="bg-brand-500 h-3 rounded-full transition-all duration-500 shadow-sm shadow-brand-200" 
                    style={{ width: `${Math.min((item.fundedAmount / item.price) * 100, 100)}%` }} 
                />
            </div>

            {/* Description */}
            <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-gray-700 text-sm leading-relaxed">{item.description || "No description provided."}</p>
            </div>

            {/* Contributors List */}
            <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Contributors History</span>
                    <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{item.contributions.length}</span>
                </h4>

                {sortedContributions.length > 0 ? (
                    <div className="space-y-3">
                        {sortedContributions.map((contribution, idx) => {
                            const user = getContributor(contribution.contributorId);
                            const date = new Date(contribution.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            
                            const displayName = contribution.isAnonymous ? "Anonymous User" : (user ? user.firstName : 'Unknown User');
                            const displayAvatar = contribution.isAnonymous ? null : user?.avatar;

                            return (
                                <div key={`${contribution.id}-${idx}`} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        {displayAvatar ? (
                                            <img src={displayAvatar} alt={displayName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-2 border-white shadow-sm">
                                                {contribution.isAnonymous ? <UserX size={20} /> : <UserIcon size={20} />}
                                            </div>
                                        )}
                                        <div>
                                            <p className={`font-bold text-sm ${contribution.isAnonymous ? 'text-gray-500 italic' : 'text-gray-900'}`}>{displayName}</p>
                                            <div className="flex items-center mt-0.5">
                                                <p className="text-[10px] text-gray-400 flex items-center bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                                    <Calendar size={10} className="mr-1" /> {date}
                                                </p>
                                                {contribution.type === ContributionType.LOCKED && (
                                                    <span className="ml-1.5 flex items-center text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                                                        <Lock size={8} className="mr-1" /> Locked
                                                    </span>
                                                )}
                                                {contribution.type === ContributionType.FREE && (
                                                    <span className="ml-1.5 flex items-center text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-100 font-medium">
                                                        <Unlock size={8} className="mr-1" /> Flexible
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-bold px-2 py-1 rounded-lg text-sm ${contribution.isAmountHidden ? 'text-gray-500 bg-gray-100' : 'text-brand-600 bg-brand-50'}`}>
                                        {contribution.isAmountHidden ? (
                                            <div className="flex items-center space-x-1">
                                                <EyeOff size={12} />
                                                <span>Secret</span>
                                            </div>
                                        ) : (
                                            `+${currencySymbol}${contribution.amount}`
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <div className="bg-white p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-sm text-gray-300">
                            <DollarSign size={24} />
                        </div>
                        <p className="text-gray-900 font-medium text-sm">No contributions yet</p>
                        <p className="text-xs text-gray-400 mt-1">Be the first to create a memory!</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
