
import React, { useMemo } from 'react';
import { GiftCircle, WishlistItem, User, ContributionType } from '../types.ts';
import { ArrowLeft, Users, PlusCircle, UserPlus, Trash2, Gift, Check, Clock } from 'lucide-react';
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
  onContribute: (item: WishlistItem) => void;
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
  currencySymbol
}) => {
  const circleItems = wishlist.filter(w => w.circleId === circle.id && w.status === 'ACTIVE');
  const isAdmin = circle.adminId === me.id || (circle as any).adminIds?.includes(me.id); // Handle legacy or new structure

  // Calculate stats
  const totalGoal = circleItems.reduce((sum, item) => sum + item.price, 0);
  const totalFunded = circleItems.reduce((sum, item) => sum + item.fundedAmount, 0);
  const progress = totalGoal > 0 ? (totalFunded / totalGoal) * 100 : 0;
  const costPerPerson = circle.memberIds.length > 0 ? (totalGoal / circle.memberIds.length) : 0;

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

      {/* Goals Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-lg">Circle Goals</h3>
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
                    isOwn={false} // Allow contributions even if user added it, as it's a group effort
                    currencySymbol={currencySymbol}
                    onClick={onItemClick}
                    onContribute={onContribute}
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
    </div>
  );
};
