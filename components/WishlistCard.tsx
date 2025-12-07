


import React from 'react';
import { WishlistItem, Event } from '../types.ts';
import { ExternalLink, Gift, Share2, X } from 'lucide-react';
import { getEventIcon } from '../utils/helpers.tsx';

interface WishlistCardProps {
  item: WishlistItem;
  isOwn: boolean;
  isAdmin?: boolean;
  currencySymbol: string;
  relatedEvent?: Event;
  onContribute?: (item: WishlistItem) => void;
  onCancel?: (itemId: string) => void;
  onClick: (itemId: string) => void;
}

export const WishlistCard: React.FC<WishlistCardProps> = ({ 
  item, 
  isOwn,
  isAdmin,
  currencySymbol, 
  relatedEvent, 
  onContribute, 
  onCancel,
  onClick
}) => {
  const progress = Math.min((item.fundedAmount / item.price) * 100, 100);
  const isCancelled = item.status === 'CANCELLED';

  // Can manage if own item or admin of circle
  const canManage = isOwn || isAdmin;
  // Can contribute if it's not cancelled and (not own OR isAdmin because admins can chip in too)
  const canContribute = !isCancelled && onContribute && item.fundedAmount < item.price && (!isOwn || isAdmin);

  return (
    <div 
      onClick={() => onClick(item.id)}
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

          {canContribute && (
            <button 
              onClick={(e) => { e.stopPropagation(); onContribute(item); }}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors flex justify-center items-center space-x-2 mb-2"
            >
              <Gift size={18} />
              <span>Contribute</span>
            </button>
          )}
          
          {canManage && !isCancelled && (
             <div className="flex space-x-2">
                <button onClick={(e) => e.stopPropagation()} className="flex-1 bg-gray-50 text-gray-600 border border-gray-200 py-3 rounded-xl font-semibold flex justify-center items-center space-x-2 hover:bg-gray-100">
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
                {onCancel && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onCancel(item.id); }}
                        className="w-12 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Cancel Wish"
                    >
                        <X size={20} />
                    </button>
                )}
             </div>
          )}

          {canManage && isCancelled && (
             <div className="p-3 bg-gray-50 rounded-lg text-center text-xs text-gray-500">
                Product cancelled. Active funds moved to wallet.
             </div>
          )}
          {!canManage && item.fundedAmount >= item.price && (
             <button disabled className="w-full bg-green-100 text-green-700 py-3 rounded-xl font-semibold">
               Fully Funded!
             </button>
          )}
        </div>
      </div>
    </div>
  );
};