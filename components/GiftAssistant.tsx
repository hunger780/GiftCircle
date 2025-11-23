import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Plus } from 'lucide-react';
import { getGiftSuggestions } from '../services/geminiService';

export const GiftAssistant: React.FC = () => {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState('');
  const [budget, setBudget] = useState('');
  const [suggestions, setSuggestions] = useState<{ title: string; description: string; estimatedPrice: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!name || !interests) return;
    setLoading(true);
    const results = await getGiftSuggestions(name, interests, budget || '50');
    setSuggestions(results);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="bg-gradient-to-br from-brand-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="text-yellow-300" />
          <h2 className="text-2xl font-bold">Gemini Gift Assistant</h2>
        </div>
        <p className="opacity-90">Stuck on what to buy? Let AI suggest the perfect gift based on interests.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Who is this for?</label>
          <input 
            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g., My friend John"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">What do they like?</label>
          <textarea 
            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
            placeholder="e.g., Hiking, Sci-Fi movies, Coffee"
            rows={3}
            value={interests}
            onChange={e => setInterests(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Approx $)</label>
          <input 
            type="number"
            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
            placeholder="50"
            value={budget}
            onChange={e => setBudget(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAskAI}
          disabled={loading || !name || !interests}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          <span>Generate Ideas</span>
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Suggested Gifts</h3>
          {suggestions.map((gift, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-900 text-lg">{gift.title}</h4>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">~${gift.estimatedPrice}</span>
              </div>
              <p className="text-gray-600 text-sm">{gift.description}</p>
              <button className="self-start mt-2 text-brand-600 text-sm font-semibold flex items-center hover:underline">
                <Plus size={16} className="mr-1" /> Add to Wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
