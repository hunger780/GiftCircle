
import React, { useState } from 'react';
import { WishlistItem, Event } from '../types.ts';
import { ArrowLeft, Plus, Link as LinkIcon, Image, Tag } from 'lucide-react';
import { GiftAssistant } from '../components/GiftAssistant.tsx';

interface AddItemViewProps {
  onBack: () => void;
  onAdd: (item: WishlistItem) => void;
  circleName?: string;
  activeEvents: Event[];
  currencySymbol: string;
}

export const AddItemView: React.FC<AddItemViewProps> = ({ onBack, onAdd, circleName, activeEvents, currencySymbol }) => {
    const [mode, setMode] = useState<'MANUAL' | 'AI'>('MANUAL');
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [url, setUrl] = useState('');
    const [description, setDescription] = useState('');
    const [eventId, setEventId] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newItem: WishlistItem = {
            id: `w${Date.now()}`,
            userId: 'u1', // In real app, this comes from auth context
            title,
            description,
            price: Number(price),
            fundedAmount: 0,
            imageUrl: 'https://picsum.photos/seed/' + Date.now() + '/400/300',
            productUrl: url,
            eventId: eventId || undefined,
            contributions: [],
            status: 'ACTIVE'
        };
        onAdd(newItem);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
             <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center shadow-sm z-10">
                 <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><ArrowLeft size={24} /></button>
                 <h2 className="text-lg font-bold text-gray-800 ml-2">{circleName ? `Add to ${circleName}` : 'Add New Wish'}</h2>
             </div>

             <div className="p-4 flex justify-center space-x-4 mb-2">
                 <button 
                    onClick={() => setMode('MANUAL')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'MANUAL' ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'}`}
                 >
                    Manual Entry
                 </button>
                 <button 
                    onClick={() => setMode('AI')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center ${mode === 'AI' ? 'bg-gradient-to-r from-brand-500 to-purple-600 text-white shadow-md' : 'bg-white text-brand-600 border border-brand-100'}`}
                 >
                    Use Gemini AI ✨
                 </button>
             </div>

             {mode === 'AI' ? (
                 <GiftAssistant />
             ) : (
                 <form onSubmit={handleSubmit} className="p-4 space-y-5 max-w-lg mx-auto pb-24">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1.5">Product Name</label>
                             <div className="relative">
                                 <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                 <input 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                                    placeholder="e.g. Sony Headphones" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    required 
                                 />
                             </div>
                         </div>

                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1.5">Price ({currencySymbol})</label>
                             <input 
                                type="number" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono" 
                                placeholder="0.00" 
                                value={price} 
                                onChange={e => setPrice(e.target.value)} 
                                required 
                             />
                         </div>

                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1.5">Product URL</label>
                             <div className="relative">
                                 <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                 <input 
                                    type="url" 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                                    placeholder="https://..." 
                                    value={url} 
                                    onChange={e => setUrl(e.target.value)} 
                                 />
                             </div>
                         </div>
                         
                         <div>
                             <label className="block text-sm font-bold text-gray-700 mb-1.5">Description / Note</label>
                             <textarea 
                                rows={3} 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" 
                                placeholder="Size, color, or why you want it..." 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                             />
                         </div>

                         {!circleName && activeEvents.length > 0 && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Link to Event (Optional)</label>
                                <select 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    value={eventId}
                                    onChange={e => setEventId(e.target.value)}
                                >
                                    <option value="">None (General Wishlist)</option>
                                    {activeEvents.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.title}</option>
                                    ))}
                                </select>
                            </div>
                         )}

                         {/* Image Upload Placeholder */}
                         <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                             <Image size={32} className="mb-2" />
                             <span className="text-sm font-medium">Tap to upload image</span>
                         </div>
                     </div>

                     <button 
                        type="submit" 
                        className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 flex items-center justify-center space-x-2"
                     >
                        <Plus size={24} />
                        <span>Add to Wishlist</span>
                     </button>
                 </form>
             )}
        </div>
    );
};
