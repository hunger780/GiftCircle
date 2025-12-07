
import React from 'react';
import { Event, WishlistItem, User, ViewState, WishlistStatus } from '../types.ts';
import { PlusCircle, X, ChevronRight, Calendar } from 'lucide-react';
import { WishlistCard } from '../components/WishlistCard.tsx';
import { getEventIcon } from '../utils/helpers.tsx';

interface HomeViewProps {
  events: Event[];
  wishlist: WishlistItem[];
  wishlistTab: WishlistStatus;
  setWishlistTab: (status: WishlistStatus) => void;
  setView: (view: ViewState) => void;
  handleEventClick: (eventId: string) => void;
  handleHideEvent: (e: React.MouseEvent, eventId: string) => void;
  handleContribute: (item: WishlistItem, amount?: number) => void;
  handleCancelItem: (itemId: string) => void;
  onItemClick: (itemId: string) => void;
  me: User;
  currencySymbol: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  events,
  wishlist,
  wishlistTab,
  setWishlistTab,
  setView,
  handleEventClick,
  handleHideEvent,
  handleContribute,
  handleCancelItem,
  onItemClick,
  me,
  currencySymbol
}) => {
  return (
    <>
      {/* Events Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center px-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800">Upcoming Events</h2>
          <button
            onClick={() => setView('CREATE_EVENT')}
            className="text-brand-600 text-sm font-bold flex items-center hover:underline"
          >
            <PlusCircle size={16} className="mr-1" /> Create Event
          </button>
        </div>

        {events.length > 0 ? (
          <div className="flex overflow-x-auto px-4 space-x-4 pb-4 scrollbar-hide">
            {events.map(e => (
              <div
                key={e.id}
                onClick={() => handleEventClick(e.id)}
                className={`flex-shrink-0 w-64 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] ${e.status === 'CANCELLED' ? 'bg-gray-500' : 'bg-gradient-to-br from-brand-600 to-purple-600'}`}
              >
                {e.status === 'CANCELLED' && (
                  <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none">
                    <span className="border-2 border-white px-3 py-1 text-xl font-bold transform -rotate-12 opacity-80">CANCELLED</span>
                  </div>
                )}

                {/* Hide/Remove Button */}
                {e.userId !== me.id && (
                  <button
                    onClick={(ev) => handleHideEvent(ev, e.id)}
                    className="absolute top-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white/80 hover:text-white transition-colors z-20"
                  >
                    <X size={14} />
                  </button>
                )}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  {getEventIcon(e.type)}
                </div>
                <div className="flex items-center space-x-2 text-purple-200 text-sm font-medium mb-2">
                  {getEventIcon(e.type)}
                  <span>{new Date(e.date).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-xl mb-2 leading-tight">{e.title}</h3>
                <p className="text-white/80 text-sm line-clamp-2">{e.description}</p>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs font-medium text-white/90">
                  <span>Tap for details</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4">
            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">No upcoming events found.</p>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Section */}
      <div className="px-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">My Wishlist</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex space-x-1">
            <button
              onClick={() => setWishlistTab('ACTIVE')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${wishlistTab === 'ACTIVE' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Active
            </button>
            <button
              onClick={() => setWishlistTab('CANCELLED')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${wishlistTab === 'CANCELLED' ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              Cancelled
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {wishlist.map(item => (
            <WishlistCard
              key={item.id}
              item={item}
              isOwn={true}
              currencySymbol={currencySymbol}
              relatedEvent={events.find(e => e.id === item.eventId)}
              onCancel={handleCancelItem}
              onContribute={handleContribute}
              onClick={onItemClick}
            />
          ))}
        </div>
        {wishlist.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No {wishlistTab.toLowerCase()} wishes found.</p>
          </div>
        )}
      </div>
    </>
  );
};
