
import React, { useState } from 'react';
import { WishlistItem, ContributionType } from '../types.ts';
import { X, Lock, Unlock, AlertCircle } from 'lucide-react';

interface Props {
  item: WishlistItem;
  defaultAmount: number;
  maxAmount: number;
  onClose: () => void;
  onContribute: (amount: number, type: ContributionType) => void;
}

export const ContributionModal: React.FC<Props> = ({ item, defaultAmount, maxAmount, onClose, onContribute }) => {
  const remaining = item.price - item.fundedAmount;
  // Initialize with default amount, but not more than remaining
  const initialAmount = Math.min(defaultAmount, remaining);
  
  const [amount, setAmount] = useState<number>(initialAmount);
  const [type, setType] = useState<ContributionType>(ContributionType.LOCKED);

  const isOverMax = amount > maxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOverMax) {
      onContribute(amount, type);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-brand-50">
          <h3 className="font-bold text-gray-800">Contribute to Gift</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <p className="font-medium text-gray-900 line-clamp-1">{item.title}</p>
              <p className="text-sm text-gray-500">${remaining} left to fund</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contribution Amount ($)
            </label>
            <input
              type="number"
              min="1"
              max={remaining}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={`w-full p-3 border rounded-xl focus:ring-2 outline-none text-lg ${isOverMax ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500'}`}
            />
            
            {isOverMax ? (
              <p className="text-red-500 text-xs mt-2 flex items-center">
                <AlertCircle size={14} className="mr-1"/>
                Exceeds your max limit of ${maxAmount}
              </p>
            ) : (
              <input 
                type="range" 
                min="1" 
                max={remaining} 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mt-2 accent-brand-600"
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Contribution Type</label>
            
            <div 
              onClick={() => setType(ContributionType.LOCKED)}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${type === ContributionType.LOCKED ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-200'}`}
            >
              <div className={`p-2 rounded-full mr-3 ${type === ContributionType.LOCKED ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                <Lock size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Locked Donation</p>
                <p className="text-xs text-gray-500">Funds can only be used for this specific item.</p>
              </div>
            </div>

            <div 
              onClick={() => setType(ContributionType.FREE)}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${type === ContributionType.FREE ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-200'}`}
            >
              <div className={`p-2 rounded-full mr-3 ${type === ContributionType.FREE ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                <Unlock size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Free Use Donation</p>
                <p className="text-xs text-gray-500">Recipient can unlock funds if they change their mind.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isOverMax}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Contribution (${amount})
          </button>
        </form>
      </div>
    </div>
  );
};