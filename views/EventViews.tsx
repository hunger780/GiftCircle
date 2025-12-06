
import React, { useState } from 'react';
import { Event, WishlistItem, EventType, User, Vendor, ShoppingItem } from '../types.ts';
import { ArrowLeft, Lock, Globe, Search, Circle, CheckCircle, Trash2, PlusCircle, Calendar, Users, UserPlus, MapPin, Star, PhoneCall, ShoppingCart, ShoppingBag } from 'lucide-react';
import { getEventIcon, getUser } from '../utils/helpers.tsx';
import { MOCK_VENDORS, MOCK_SHOPPING_ITEMS } from '../mockData.ts';

// --- Create Event View ---
interface CreateEventViewProps {
  onBack: () => void;
  onCreate: (eventData: Partial<Event>, selectedIds: string[], newItems: Partial<WishlistItem>[]) => void;
  userItems: WishlistItem[];
  existingEvents: Event[];
  currencySymbol: string;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({ onBack, onCreate, userItems, existingEvents, currencySymbol }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>(EventType.BIRTHDAY);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [itemSearch, setItemSearch] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ title, type, date, description, visibility }, Array.from(selectedIds), newItems);
  };

  const filteredItems = userItems.filter(item => item.title.toLowerCase().includes(itemSearch.toLowerCase()));

  return (
    <div className="px-4 pb-24">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold text-gray-800 ml-2">Create New Event</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-bold text-gray-800 border-b pb-2">Event Details</h3>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label><input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required /></div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
             <div className="grid grid-cols-2 gap-3">
                {[EventType.BIRTHDAY, EventType.WEDDING, EventType.HOUSEWARMING, EventType.BABY_SHOWER, EventType.OTHER].map(t => (
                  <div key={t} onClick={() => setType(t)} className={`p-3 rounded-xl border-2 cursor-pointer flex items-center space-x-2 transition-all ${type === t ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}>
                    <span className={type === t ? 'text-brand-500' : 'text-gray-400'}>{getEventIcon(t)}</span>
                    <span className={`text-sm font-medium ${type === t ? 'text-gray-800' : 'text-gray-500'}`}>{t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</span>
                  </div>
                ))}
             </div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" /></div>
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Event Visibility</label>
             <div className="flex items-center space-x-6 p-1">
               <label className="flex items-center cursor-pointer"><input type="radio" className="w-4 h-4 accent-brand-600" checked={visibility === 'PRIVATE'} onChange={() => setVisibility('PRIVATE')} /><span className="ml-2 text-sm text-gray-700 flex items-center"><Lock size={14} className="mr-1"/> Private</span></label>
               <label className="flex items-center cursor-pointer"><input type="radio" className="w-4 h-4 accent-brand-600" checked={visibility === 'PUBLIC'} onChange={() => setVisibility('PUBLIC')} /><span className="ml-2 text-sm text-gray-700 flex items-center"><Globe size={14} className="mr-1"/> Public</span></label>
             </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2"><h3 className="font-bold text-gray-800">Link Existing Wishes</h3><span className="text-xs text-gray-500">{selectedIds.size} selected</span></div>
          {userItems.length > 0 ? (
            <>
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="w-full pl-10 p-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={itemSearch} onChange={e => setItemSearch(e.target.value)} /></div>
              <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                {filteredItems.map(item => {
                  const isSelected = selectedIds.has(item.id);
                  const relatedEvent = item.eventId ? existingEvents.find(e => e.id === item.eventId) : null;
                  return (
                    <div key={item.id} onClick={() => toggleSelection(item.id)} className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}>
                      <div className={`text-brand-500 transition-transform ${isSelected ? 'scale-100' : 'scale-0'}`}>{isSelected ? <CheckCircle size={20} fill="currentColor" className="text-white" /> : <Circle size={20} />}</div>
                      {!isSelected && <Circle size={20} className="text-gray-300 absolute" />}
                      <div className="flex-1 ml-8"><p className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{item.title}</p><div className="flex justify-between items-center mt-1"><span className="text-xs text-gray-500">{currencySymbol}{item.price}</span>{relatedEvent && <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center ${isSelected ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>{isSelected ? 'Moving from ' : 'Linked to '} {relatedEvent.title}</span>}</div></div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : <p className="text-gray-500 text-sm italic">No items in your wishlist yet.</p>}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Add New Wishes</h3>
          {newItems.length > 0 && (
             <div className="space-y-2 mb-4">
               {newItems.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><div><p className="text-sm font-bold text-gray-900">{item.title}</p><p className="text-xs text-gray-500">{currencySymbol}{item.price}</p></div><button type="button" onClick={() => setNewItems(newItems.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></div>
               ))}
             </div>
          )}
          {isAddingNew ? (
            <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-brand-200">
               <input autoFocus placeholder="Item Name" className="w-full p-2 rounded-lg border border-gray-200" value={newItemDraft.title} onChange={e => setNewItemDraft({...newItemDraft, title: e.target.value})} />
               <div className="flex space-x-2"><input type="number" placeholder="Price" className="w-24 p-2 rounded-lg border border-gray-200" value={newItemDraft.price} onChange={e => setNewItemDraft({...newItemDraft, price: e.target.value})} /><input placeholder="URL" className="flex-1 p-2 rounded-lg border border-gray-200" value={newItemDraft.url} onChange={e => setNewItemDraft({...newItemDraft, url: e.target.value})} /></div>
               <div className="flex space-x-2 pt-1"><button type="button" onClick={handleAddNewItem} className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-sm font-bold">Add</button><button type="button" onClick={() => setIsAddingNew(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold">Cancel</button></div>
            </div>
          ) : <button type="button" onClick={() => setIsAddingNew(true)} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium flex items-center justify-center hover:border-brand-400 hover:text-brand-600"><PlusCircle size={20} className="mr-2" /> Add Item to this Event</button>}
        </div>
        <button type="submit" className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-200">Create Event with {selectedIds.size + newItems.length} Wishes</button>
      </form>
    </div>
  );
};

// --- Event Detail View ---
interface EventDetailViewProps {
  event: Event;
  wishlist: WishlistItem[];
  onBack: () => void;
  me: User;
  onUpdateVisibility: (eventId: string, v: 'PUBLIC' | 'PRIVATE') => void;
  onCancelEvent: (eventId: string) => void;
  onInvite: () => void;
  onItemClick: (id: string) => void;
  onContribute: (item: WishlistItem) => void;
  currencySymbol: string;
}

export const EventDetailView: React.FC<EventDetailViewProps> = ({ event, wishlist, onBack, me, onUpdateVisibility, onCancelEvent, onInvite, onItemClick, onContribute, currencySymbol }) => {
     const linkedWishes = wishlist.filter(w => w.eventId === event.id && w.status === 'ACTIVE');
     const invitees = event.inviteeIds?.map(id => getUser(id)).filter(Boolean) || [];
     const isOwner = event.userId === me.id;
     const isCancelled = event.status === 'CANCELLED';

     return (
        <div className="px-4 pb-24">
             <div className="flex items-center mb-6"><button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button><h2 className="text-xl font-bold text-gray-800 ml-2">Event Details</h2></div>
             <div className={`bg-gradient-to-br from-brand-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden ${isCancelled ? 'grayscale opacity-90' : ''}`}>
                  {isCancelled && <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center pointer-events-none"><span className="border-4 border-white px-6 py-2 text-3xl font-extrabold transform -rotate-12 tracking-widest opacity-80">CANCELLED</span></div>}
                  <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">{getEventIcon(event.type)}</div>
                  <div className="flex items-center space-x-2 mb-2 bg-white/20 w-fit px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">{getEventIcon(event.type)}<span>{event.type}</span><span className="mx-1 opacity-50">|</span>{event.visibility === 'PUBLIC' ? <Globe size={12} className="mr-1"/> : <Lock size={12} className="mr-1"/>}<span>{event.visibility === 'PUBLIC' ? 'Public' : 'Private'}</span></div>
                  <h1 className="text-3xl font-extrabold mb-2">{event.title}</h1>
                  <p className="text-purple-100 text-lg mb-4 flex items-center"><Calendar size={18} className="mr-2" />{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="opacity-90 leading-relaxed">{event.description}</p>
             </div>

             <div className="mb-8">
                 <h3 className="font-bold text-gray-800 mb-3 flex justify-between items-center"><span>Linked Wishes</span><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{linkedWishes.length}</span></h3>
                 {linkedWishes.length > 0 ? (
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {linkedWishes.map(w => {
                            const isItemOwner = w.userId === me.id;
                            const remaining = w.price - w.fundedAmount;
                            return (
                                <div key={w.id} onClick={() => onItemClick(w.id)} className="flex-shrink-0 w-48 bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col cursor-pointer hover:border-brand-300 transition-all group">
                                    <div className="relative h-28 mb-2 overflow-hidden rounded-lg"><img src={w.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={w.title} /></div>
                                    <p className="font-bold text-sm text-gray-900 truncate mb-1">{w.title}</p>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2"><div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min((w.fundedAmount / w.price) * 100, 100)}%` }}></div></div>
                                    <div className="flex justify-between items-center text-xs mb-2"><span className="text-gray-500">{Math.round((w.fundedAmount / w.price) * 100)}%</span><span className="font-bold text-brand-600">{currencySymbol}{remaining} left</span></div>
                                    {!isItemOwner && w.fundedAmount < w.price ? (
                                        <button onClick={(e) => { e.stopPropagation(); onContribute(w); }} className="mt-auto w-full bg-gray-900 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm">Contribute</button>
                                    ) : <div className="mt-auto w-full py-2 bg-gray-50 text-gray-400 rounded-lg text-xs font-bold text-center border border-gray-100">{isItemOwner ? 'Manage' : 'Fully Funded'}</div>}
                                </div>
                            );
                        })}
                    </div>
                 ) : <p className="text-sm text-gray-500 italic">No wishes linked to this event yet.</p>}
             </div>

             {isOwner && !isCancelled && (
                 <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
                     <div className="flex flex-col"><h3 className="font-bold text-gray-800 text-sm">Visibility</h3><p className="text-[10px] text-gray-400">{event.visibility === 'PUBLIC' ? 'Visible to everyone' : 'Only guests can see'}</p></div>
                     <div className="flex items-center space-x-4">
                       <label className="flex items-center cursor-pointer"><input type="radio" className="w-4 h-4 accent-brand-600" checked={event.visibility === 'PRIVATE'} onChange={() => onUpdateVisibility(event.id, 'PRIVATE')} /><span className="ml-1.5 text-xs font-medium text-gray-700">Private</span></label>
                       <label className="flex items-center cursor-pointer"><input type="radio" className="w-4 h-4 accent-brand-600" checked={event.visibility === 'PUBLIC'} onChange={() => onUpdateVisibility(event.id, 'PUBLIC')} /><span className="ml-1.5 text-xs font-medium text-gray-700">Public</span></label>
                     </div>
                 </div>
             )}

             <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-800 flex items-center"><Users size={18} className="mr-2 text-brand-500" /> Guest List<span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{invitees.length}</span></h3>{isOwner && !isCancelled && <button onClick={onInvite} className="text-brand-600 text-xs font-bold flex items-center bg-brand-50 px-3 py-1.5 rounded-lg hover:bg-brand-100"><UserPlus size={14} className="mr-1" /> Invite</button>}</div>
                {invitees.length > 0 ? <div className="flex -space-x-3 overflow-x-auto pb-2 scrollbar-hide px-2">{invitees.map(user => <img key={user!.id} src={user!.avatar} alt={user!.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />)}</div> : <p className="text-sm text-gray-400 italic">No guests invited yet.</p>}
             </div>

             {isOwner && !isCancelled && <div className="mt-8 pt-6 border-t border-gray-200"><button onClick={() => onCancelEvent(event.id)} className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold flex items-center justify-center hover:bg-red-100 transition-colors"><Trash2 size={20} className="mr-2" /> Cancel Event</button></div>}
        </div>
     );
};

// --- Event Planning View ---
interface EventPlanningViewProps {
  onBack: () => void;
  currencySymbol: string;
}

export const EventPlanningView: React.FC<EventPlanningViewProps> = ({ onBack, currencySymbol }) => {
    const [planningTab, setPlanningTab] = useState<'SUPPLIERS' | 'SHOPPING'>('SUPPLIERS');
    const [vendorSearchQuery, setVendorSearchQuery] = useState('');
    const [vendorPincode, setVendorPincode] = useState('');
    const [vendorMinRating, setVendorMinRating] = useState<number>(0);
    const [shoppingSearch, setShoppingSearch] = useState('');

    const filteredVendors = MOCK_VENDORS.filter(v => {
        const matchesSearch = !vendorSearchQuery || v.name.toLowerCase().includes(vendorSearchQuery.toLowerCase()) || v.type.toLowerCase().includes(vendorSearchQuery.toLowerCase());
        const matchesPincode = !vendorPincode || v.pincode.startsWith(vendorPincode);
        return matchesSearch && matchesPincode && v.rating >= vendorMinRating;
    });

    const filteredShoppingItems = !shoppingSearch ? MOCK_SHOPPING_ITEMS : MOCK_SHOPPING_ITEMS.filter(item => item.title.toLowerCase().includes(shoppingSearch.toLowerCase()) || item.category.toLowerCase().includes(shoppingSearch.toLowerCase()));

    return (
        <div className="px-4 pb-24">
             <div className="flex items-center mb-6"><button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button><h2 className="text-2xl font-bold text-gray-800 ml-2">Event Planning</h2></div>
             <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex mb-4">
                 <button onClick={() => setPlanningTab('SUPPLIERS')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${planningTab === 'SUPPLIERS' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}>Suppliers</button>
                 <button onClick={() => setPlanningTab('SHOPPING')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${planningTab === 'SHOPPING' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}>Shopping</button>
             </div>

             {planningTab === 'SUPPLIERS' ? (
                <div>
                     <div className="flex items-center space-x-2 mb-4"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Search size={20} /></div><div><h3 className="font-bold text-gray-800 text-lg">Find Local Suppliers</h3><p className="text-xs text-gray-500">Search for organizers, venues & more</p></div></div>
                     <div className="flex space-x-2 mb-3"><div className="relative flex-1"><MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><input className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Pincode" value={vendorPincode} onChange={(e) => setVendorPincode(e.target.value)} /></div><div className="relative"><Star className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} /><select className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" value={vendorMinRating} onChange={(e) => setVendorMinRating(Number(e.target.value))}><option value={0}>Any Rating</option><option value={3}>3+ Stars</option><option value={4}>4+ Stars</option><option value={5}>5 Stars</option></select></div></div>
                     <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" placeholder="Try 'Catering'..." value={vendorSearchQuery} onChange={(e) => setVendorSearchQuery(e.target.value)} /></div>
                     <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">{['All', 'Venue', 'Catering', 'Decor', 'Organizer'].map(cat => <button key={cat} onClick={() => setVendorSearchQuery(cat === 'All' ? '' : cat)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${ (cat === 'All' && !vendorSearchQuery) || vendorSearchQuery.includes(cat) ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50' }`}>{cat}</button>)}</div>
                     <div className="space-y-4">{filteredVendors.length > 0 ? filteredVendors.map(vendor => (<div key={vendor.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex space-x-4"><img src={vendor.imageUrl} alt={vendor.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" /><div className="flex-1 min-w-0"><div className="flex justify-between items-start"><h4 className="font-bold text-gray-900 truncate">{vendor.name}</h4><div className="flex items-center bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-700"><Star size={10} fill="currentColor" className="mr-1" />{vendor.rating}</div></div><p className="text-xs text-blue-600 font-medium mb-1">{vendor.type}</p><div className="flex flex-col text-xs text-gray-500 mb-2"><div className="flex items-center mb-0.5"><MapPin size={12} className="mr-1" /><span className="truncate">{vendor.address}</span></div><span className="ml-4 text-gray-400">{vendor.pincode} • {vendor.distance}</span></div><button className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 hover:bg-gray-800"><PhoneCall size={12} /><span>Contact</span></button></div></div>)) : <div className="text-center py-8 text-gray-400"><p>No suppliers found.</p></div>}</div>
                </div>
             ) : (
                <div className="animate-in fade-in slide-in-from-right duration-200">
                     <div className="flex items-center space-x-2 mb-4"><div className="bg-purple-100 p-2 rounded-lg text-purple-600"><ShoppingCart size={20} /></div><div><h3 className="font-bold text-gray-800 text-lg">Shop Supplies</h3><p className="text-xs text-gray-500">Decor, gifts & party essentials</p></div></div>
                    <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none shadow-sm transition-all" placeholder="Search products..." value={shoppingSearch} onChange={(e) => setShoppingSearch(e.target.value)} /></div>
                    <div className="grid grid-cols-2 gap-4">{filteredShoppingItems.map(item => (<div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"><div className="h-32 bg-gray-100 relative"><img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /><div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold shadow-sm">⭐ {item.rating}</div></div><div className="p-3 flex-1 flex flex-col"><h4 className="font-bold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{item.title}</h4><p className="text-xs text-gray-500 mb-2">{item.category}</p><div className="mt-auto flex justify-between items-center"><span className="font-bold text-purple-600">{currencySymbol}{item.price}</span><button onClick={() => alert(`Added ${item.title} to wishlist!`)} className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-700" title="Add to Wishlist"><PlusCircle size={16} /></button></div></div></div>))}</div>
                    {filteredShoppingItems.length === 0 && <div className="text-center py-10 text-gray-400"><ShoppingBag size={48} className="mx-auto mb-2 opacity-20" /><p>No products found.</p></div>}
                </div>
             )}
        </div>
    );
};
