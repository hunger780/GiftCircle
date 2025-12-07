


import React, { useMemo, useState } from 'react';
import { GiftCircle, WishlistItem, User, ContributionType } from '../types.ts';
import { ArrowLeft, Users, PlusCircle, UserPlus, Trash2, Gift, Check, Clock, ShieldCheck, Shield } from 'lucide-react';
import { WishlistCard } from '../components/WishlistCard.tsx';
import { getUser } from '../utils/helpers.tsx';

interface CircleDetailViewProps {
    circle: GiftCircle;
    wishlist: WishlistItem[];
    me: User;
    onBack: () => void;
    onInvite: () => void;
    onAddGoal: () => void;
    onItemClick: (itemId: string) => void;
    onContribute: (item: WishlistItem, amount?: number) => void;
    onToggleAdmin: (memberId: string) => void;
    onCancelItem: (itemId: string) => void;
    currencySymbol: string;
}

export const CircleDetailView: React.FC<CircleDetailViewProps> = ({
    circle,
    wishlist,
    me,
    onBack,
    onInvite,
    onAddGoal,
    onItemClick,
    onContribute,
    onToggleAdmin,
    onCancelItem,
    currencySymbol
}) => {
    const circleItems = wishlist.filter(w => w.circleId === circle.id && w.status === 'ACTIVE');
    const isAdmin = circle.adminIds.includes(me.id);

    // Calculate stats
    const totalGoal = circleItems.reduce((sum, item) => sum + item.price, 0);
    const totalFunded = circleItems.reduce((sum, item) => sum + item.fundedAmount, 0);
    const progress = totalGoal > 0 ? (totalFunded / totalGoal) * 100 : 0;
    const costPerPerson = circle.memberIds.length > 0 ? (totalGoal / circle.memberIds.length) : 0;

    const [activeTab, setActiveTab] = useState<'GOALS' | 'MEMBERS' | 'HISTORY'>('GOALS');

    const contributionHistory = useMemo(() => {
        // Flatten all contributions from all active circle items
        const allContributions = circleItems.flatMap(item =>
            item.contributions.map(c => ({
                ...c,
                itemName: item.title,
                itemImage: item.imageUrl
            }))
        );
        // Sort by timestamp descending (newest first)
        return allContributions.sort((a, b) => b.timestamp - a.timestamp);
    }, [circleItems]);

    return (
        <div className="px-4 pb-24">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 ml-2">Circle Details</h2>
            </div>

            {/* Hero Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Users size={120} />
                </div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h1 className="text-2xl font-extrabold mb-1">{circle.name}</h1>
                        <p className="text-indigo-200 text-sm">{circle.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Contribute button - uses first active circle item to start contribution flow */}
                        <button
                            onClick={() => {
                                if (circleItems.length > 0) {
                                    onContribute(circleItems[0], Math.ceil(costPerPerson));
                                } else if (isAdmin) {
                                    onAddGoal();
                                }
                            }}
                            className="bg-white/20 hover:bg-white/30 py-2 px-4 rounded-lg backdrop-blur-sm transition-colors flex items-center font-semibold shadow-sm"
                            title={circleItems.length > 0 ? 'Contribute your share' : isAdmin ? 'Set a goal' : 'No goals to contribute to'}
                        >
                            <Gift size={18} className="mr-2" />
                            <span>{circleItems.length > 0 ? 'Contribute Share' : isAdmin ? 'Add Goal' : 'Contribute'}</span>
                        </button>

                        {isAdmin && (
                            <button
                                onClick={onInvite}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg backdrop-blur-sm transition-colors"
                                title="Invite Members"
                            >
                                <UserPlus size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-4 relative z-10">
                    <div className="flex justify-between text-sm font-medium mb-1 opacity-90">
                        <span>Pool Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-3">
                        <div
                            className="bg-white h-3 rounded-full shadow-sm transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-xl">{currencySymbol}{totalFunded} <span className="text-sm font-normal opacity-70">raised</span></span>
                        <span className="opacity-70 text-sm">Goal: {currencySymbol}{totalGoal}</span>
                    </div>
                    {totalGoal > 0 && (
                        <div className="mt-2 text-xs bg-indigo-800/40 inline-block px-2 py-1 rounded-md border border-indigo-400/30">
                            Approx. <span className="font-bold text-white">{currencySymbol}{Math.round(costPerPerson)}</span> per person
                        </div>
                    )}
                </div>

                <div className="flex -space-x-2 relative z-10 items-center">
                    {circle.memberIds.map((id, idx) => {
                        const u = getUser(id);
                        if (!u) return null;
                        return (
                            <img
                                key={`${id}-${idx}`}
                                src={u.avatar}
                                className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-indigo-800"
                                alt={u.name}
                                title={u.name}
                            />
                        );
                    })}
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-white/30 text-[10px] font-bold ml-2">
                        {circle.memberIds.length}
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('GOALS')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'GOALS' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <span className="flex items-center justify-center"><Gift size={16} className="mr-2" /> Goals</span>
                </button>
                <button
                    onClick={() => setActiveTab('MEMBERS')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'MEMBERS' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <span className="flex items-center justify-center"><Users size={16} className="mr-2" /> Members</span>
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'HISTORY' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                    <span className="flex items-center justify-center"><Clock size={16} className="mr-2" /> History</span>
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                {/* MEMBERS TAB */}
                {activeTab === 'MEMBERS' && (
                    <div className="mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                            {circle.memberIds.map(id => {
                                const u = getUser(id);
                                if (!u) return null;
                                const isMemberAdmin = circle.adminIds.includes(id);
                                const isMe = id === me.id;

                                return (
                                    <div key={id} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 flex items-center">
                                                    {u.name} {isMe && <span className="ml-1 text-gray-400 text-xs font-normal">(You)</span>}
                                                </p>
                                                {isMemberAdmin && (
                                                    <span className="text-[10px] text-blue-600 font-bold flex items-center bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                                        <ShieldCheck size={10} className="mr-1" /> Admin
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isAdmin && !isMe && (
                                            <button
                                                onClick={() => onToggleAdmin(id)}
                                                className={`p-2 rounded-full transition-colors ${isMemberAdmin ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title={isMemberAdmin ? "Remove Admin Access" : "Make Admin"}
                                            >
                                                {isMemberAdmin ? <ShieldCheck size={18} /> : <Shield size={18} />}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* GOALS TAB */}
                {activeTab === 'GOALS' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 text-lg">Goal Items</h3>
                            {isAdmin && (
                                <button
                                    onClick={onAddGoal}
                                    className="text-brand-600 text-sm font-bold flex items-center hover:underline"
                                >
                                    <PlusCircle size={16} className="mr-1" /> Add Goal
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {circleItems.length > 0 ? circleItems.map(item => (
                                <WishlistCard
                                    key={item.id}
                                    item={item}
                                    isOwn={false}
                                    isAdmin={isAdmin}
                                    currencySymbol={currencySymbol}
                                    onClick={onItemClick}
                                    onContribute={onContribute}
                                    onCancel={onCancelItem}
                                />
                            )) : (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                        <Gift size={32} />
                                    </div>
                                    <p className="text-gray-500 font-medium">No goals set yet.</p>
                                    {isAdmin && (
                                        <button onClick={onAddGoal} className="mt-2 text-brand-600 font-bold text-sm">
                                            Set a goal now
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'HISTORY' && (
                    <div>
                        {contributionHistory.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                                {contributionHistory.map((c, idx) => {
                                    const contributor = getUser(c.contributorId);
                                    if (!contributor) return null;
                                    const isMe = c.contributorId === me.id;

                                    // Handling Anonymity
                                    const displayName = c.isAnonymous ? 'Anonymous Member' : contributor.name;
                                    const displayAvatar = c.isAnonymous
                                        ? "https://ui-avatars.com/api/?name=Anonymous&background=random"
                                        : contributor.avatar;

                                    return (
                                        <div key={`${c.id}-${idx}`} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <img src={displayAvatar} alt="Avatar" className="w-10 h-10 rounded-full bg-gray-100" />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        {displayName} {isMe && !c.isAnonymous && <span className="text-gray-400 font-normal">(You)</span>}
                                                    </p>
                                                    <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] mr-2 text-gray-600 truncate max-w-[120px]">
                                                            for {c.itemName}
                                                        </span>
                                                        <span className="whitespace-nowrap">{new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    +{currencySymbol}{c.isAmountHidden ? '****' : c.amount}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                    <Clock size={32} />
                                </div>
                                <p className="text-gray-500 font-medium">No contributions yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};